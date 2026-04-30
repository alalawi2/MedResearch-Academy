import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { INSTRUMENTS, WHO5_ITEMS, CBI_ITEMS, PHQ9_ITEMS, GAD7_ITEMS, ISI_ITEMS } from '../../lib/instruments';
import { scoreWHO5, scoreCBI, scorePHQ9, scoreGAD7, scoreISI } from '../../lib/scoring';
import type { InstrumentId } from '../../lib/instruments';
import type { Responses } from '../../lib/scoring';

interface ParsedRow {
  participantId: string;
  date: string;
  items: Record<string, number>;
  residentId?: string;
  error?: string;
  valid: boolean;
}

type Step = 'upload' | 'instrument' | 'preview' | 'inserting' | 'done';

const TABLE_MAP: Record<InstrumentId, string> = {
  who5: 'block_assessments',
  cbi: 'cbi_responses',
  phq9: 'phq9_responses',
  gad7: 'gad7_responses',
  isi: 'isi_responses',
};

function getItemKeys(instrument: InstrumentId): string[] {
  switch (instrument) {
    case 'who5': return WHO5_ITEMS.map(i => i.id);
    case 'cbi': return CBI_ITEMS.map(i => i.id);
    case 'phq9': return PHQ9_ITEMS.map(i => i.id);
    case 'gad7': return GAD7_ITEMS.map(i => i.id);
    case 'isi': return ISI_ITEMS.map(i => i.id);
  }
}

function getValueRange(instrument: InstrumentId): [number, number] {
  switch (instrument) {
    case 'who5': return [0, 5];
    case 'cbi': return [0, 100];
    case 'phq9': return [0, 3];
    case 'gad7': return [0, 3];
    case 'isi': return [0, 4];
  }
}

function computeScores(instrument: InstrumentId, responses: Responses) {
  switch (instrument) {
    case 'who5': {
      const r = scoreWHO5(responses);
      return { total_score: r.total, percent: r.percent, poor_wellbeing: r.poorWellbeing };
    }
    case 'cbi': {
      const r = scoreCBI(responses);
      return { personal_score: r.personal.score, work_score: r.work.score, patient_score: r.patient.score, any_burnout: r.anyBurnout };
    }
    case 'phq9': {
      const r = scorePHQ9(responses);
      return { total_score: r.total, severity: r.severity, suicidal_ideation_flag: r.suicidalIdeationFlag };
    }
    case 'gad7': {
      const r = scoreGAD7(responses);
      return { total_score: r.total, severity: r.severity };
    }
    case 'isi': {
      const r = scoreISI(responses);
      return { total_score: r.total, severity: r.severity };
    }
  }
}

export default function BulkImport() {
  const { studyRoles } = useAuth();
  const studyId = studyRoles[0]?.study_id ?? '';

  const [step, setStep] = useState<Step>('upload');
  const [instrument, setInstrument] = useState<InstrumentId>('cbi');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState<{ inserted: number; skipped: { id: string; reason: string }[] }>({ inserted: 0, skipped: [] });

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setParseError('');

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (json.length < 2) {
        setParseError('File must have a header row and at least one data row.');
        return;
      }

      // Skip header row, parse data rows
      const dataRows = json.slice(1).filter((r: any[]) => r.length > 0 && r[0]);
      const parsed: ParsedRow[] = dataRows.map((row: any[]) => {
        const participantId = String(row[0]).trim();
        const rawDate = row[1];
        let date = '';

        if (typeof rawDate === 'number') {
          // Excel serial date
          const d = XLSX.SSF.parse_date_code(rawDate);
          date = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        } else if (rawDate) {
          date = String(rawDate).trim();
        }

        const items: Record<string, number> = {};
        // Remaining columns are item responses
        for (let i = 2; i < row.length; i++) {
          const val = Number(row[i]);
          if (!isNaN(val)) {
            items[`q${i - 1}`] = val;
          }
        }

        return { participantId, date, items, valid: true };
      });

      setRows(parsed);
      setStep('instrument');
    } catch (err: any) {
      setParseError(`Failed to parse file: ${err.message}. Make sure the 'xlsx' package is installed (npm i xlsx).`);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const validateRows = useCallback(async () => {
    const itemKeys = getItemKeys(instrument);
    const [minVal, maxVal] = getValueRange(instrument);

    // Fetch all participant IDs for lookup
    const { data: participants } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id')
      .limit(500);

    const pMap = new Map<string, string>();
    participants?.forEach((p: any) => pMap.set(p.study_participant_id, p.id));

    const validated = rows.map((row) => {
      const residentId = pMap.get(row.participantId);
      if (!residentId) {
        return { ...row, valid: false, error: `Participant "${row.participantId}" not found` };
      }

      if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
        return { ...row, valid: false, residentId, error: `Invalid date "${row.date}" — expected YYYY-MM-DD` };
      }

      // Map generic q1, q2... to instrument-specific keys
      const mappedItems: Record<string, number> = {};
      for (let i = 0; i < itemKeys.length; i++) {
        const raw = row.items[`q${i + 1}`];
        if (raw == null || isNaN(raw)) {
          return { ...row, valid: false, residentId, error: `Missing value for item ${i + 1} (${itemKeys[i]})` };
        }
        if (raw < minVal || raw > maxVal) {
          return { ...row, valid: false, residentId, error: `Item ${i + 1} value ${raw} out of range [${minVal}-${maxVal}]` };
        }
        mappedItems[itemKeys[i]] = raw;
      }

      return { ...row, items: mappedItems, valid: true, residentId };
    });

    setRows(validated);
    setStep('preview');
  }, [rows, instrument]);

  const doInsert = useCallback(async () => {
    const validRows = rows.filter(r => r.valid && r.residentId);
    setProgress({ done: 0, total: validRows.length });
    setStep('inserting');

    const table = TABLE_MAP[instrument];
    let inserted = 0;
    const skipped: { id: string; reason: string }[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const scores = computeScores(instrument, row.items);

      const { error } = await supabase
        .from(table)
        .insert({
          study_id: studyId,
          resident_id: row.residentId,
          response_date: row.date,
          items: row.items,
          ...scores,
          review_status: 'pending',
        });

      if (error) {
        skipped.push({ id: row.participantId, reason: error.message });
      } else {
        inserted++;
      }

      setProgress({ done: i + 1, total: validRows.length });
    }

    // Add skipped invalid rows
    rows.filter(r => !r.valid).forEach(r => {
      skipped.push({ id: r.participantId, reason: r.error || 'Validation failed' });
    });

    setSummary({ inserted, skipped });
    setStep('done');
  }, [rows, instrument, studyId]);

  const reset = () => {
    setStep('upload');
    setRows([]);
    setFileName('');
    setParseError('');
    setProgress({ done: 0, total: 0 });
    setSummary({ inserted: 0, skipped: [] });
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>
        Bulk Import
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
        Upload an Excel or CSV file to import questionnaire responses in bulk.
      </p>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {(['upload', 'instrument', 'preview', 'inserting', 'done'] as Step[]).map((s, idx) => {
          const labels = ['Upload File', 'Select Instrument', 'Preview & Validate', 'Importing', 'Summary'];
          const stepNum = (['upload', 'instrument', 'preview', 'inserting', 'done'] as Step[]).indexOf(step);
          const isActive = idx <= stepNum;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: isActive ? 'var(--primary)' : 'var(--bg-muted)',
                color: isActive ? 'white' : 'var(--text-muted)',
              }}>
                {idx + 1}
              </div>
              <span style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>
                {labels[idx]}
              </span>
              {idx < 4 && <span style={{ color: 'var(--border)', margin: '0 4px' }}>—</span>}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '60px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(0,102,68,0.04)' : 'white',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
              Drop your .xlsx or .csv file here
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              or click to browse
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv,.xls"
              onChange={onFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {parseError && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13 }}>
              {parseError}
            </div>
          )}

          <div style={{ marginTop: 24, padding: '20px', borderRadius: 12, background: 'white', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 15, marginBottom: 12 }}>Expected Format</h3>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Column A</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Column B</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Column C, D, E...</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}>Participant ID</td>
                  <td style={{ padding: '6px 8px' }}>Date (YYYY-MM-DD)</td>
                  <td style={{ padding: '6px 8px' }}>Item responses (q1, q2, q3...)</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>e.g. RES-001</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>e.g. 2026-04-15</td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>e.g. 3, 2, 4, 1...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 2: Select instrument */}
      {step === 'instrument' && (
        <div>
          <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>File loaded</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--primary)' }}>{fileName} — {rows.length} rows found</div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 16 }}>Select Instrument Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {(Object.values(INSTRUMENTS)).map(inst => (
              <button
                key={inst.id}
                onClick={() => setInstrument(inst.id)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  border: `2px solid ${instrument === inst.id ? 'var(--primary)' : 'var(--border)'}`,
                  background: instrument === inst.id ? 'rgba(0,102,68,0.04)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{inst.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inst.fullName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{inst.itemCount} items</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button onClick={() => setStep('upload')} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 13 }}>
              Back
            </button>
            <button onClick={validateRows} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Validate & Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: '12px 20px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <span style={{ fontWeight: 700, color: '#166534' }}>{validCount}</span>
              <span style={{ fontSize: 13, color: '#166534', marginLeft: 6 }}>valid rows</span>
            </div>
            {invalidCount > 0 && (
              <div style={{ padding: '12px 20px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
                <span style={{ fontWeight: 700, color: '#991b1b' }}>{invalidCount}</span>
                <span style={{ fontSize: 13, color: '#991b1b', marginLeft: 6 }}>errors</span>
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'auto', maxHeight: 400 }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, background: 'white' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Participant</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Items</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: row.valid ? 'rgba(0,128,0,0.03)' : 'rgba(200,0,0,0.04)',
                    }}
                  >
                    <td style={{ padding: '8px 12px' }}>
                      {row.valid ? (
                        <span style={{ color: '#166534', fontWeight: 700 }}>OK</span>
                      ) : (
                        <span style={{ color: '#991b1b', fontWeight: 700 }}>ERR</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.participantId}</td>
                    <td style={{ padding: '8px 12px' }}>{row.date}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                      {Object.keys(row.items).length} values
                    </td>
                    <td style={{ padding: '8px 12px', color: row.valid ? 'var(--text-muted)' : '#991b1b', fontSize: 11 }}>
                      {row.error || 'Ready to import'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button onClick={() => setStep('instrument')} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 13 }}>
              Back
            </button>
            <button
              onClick={doInsert}
              disabled={validCount === 0}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: 13, opacity: validCount === 0 ? 0.5 : 1 }}
            >
              Import {validCount} Valid Rows
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Inserting */}
      {step === 'inserting' && (
        <div style={{ background: 'white', borderRadius: 14, padding: 40, border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>Importing...</div>
          <div style={{ maxWidth: 400, margin: '0 auto', marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-muted)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  height: '100%',
                  borderRadius: 8,
                  width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {progress.done} / {progress.total} rows processed
          </div>
        </div>
      )}

      {/* Step 5: Done */}
      {step === 'done' && (
        <div>
          <div style={{ background: 'white', borderRadius: 14, padding: 32, border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>Import Complete</div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
              <div style={{ padding: '12px 20px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: '#166534' }}>{summary.inserted}</div>
                <div style={{ fontSize: 12, color: '#166534' }}>inserted</div>
              </div>
              <div style={{ padding: '12px 20px', borderRadius: 10, background: summary.skipped.length > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${summary.skipped.length > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                <div style={{ fontWeight: 700, fontSize: 24, color: summary.skipped.length > 0 ? '#991b1b' : '#166534' }}>{summary.skipped.length}</div>
                <div style={{ fontSize: 12, color: summary.skipped.length > 0 ? '#991b1b' : '#166534' }}>skipped</div>
              </div>
            </div>

            {summary.skipped.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 13, color: 'var(--primary)', marginBottom: 8 }}>Skipped Rows</h4>
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {summary.skipped.map((s, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)', color: '#991b1b' }}>
                      <strong>{s.id}</strong>: {s.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={reset} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
