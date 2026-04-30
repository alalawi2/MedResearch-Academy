import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { INSTRUMENTS } from '../../lib/instruments';
import type { InstrumentId } from '../../lib/instruments';

interface Participant {
  id: string;
  study_participant_id: string;
  full_name: string;
  email: string;
  primary_site: string | null;
  pgy_level: number | null;
}

interface CompletionRecord {
  resident_id: string;
  instrument: InstrumentId;
}

const LINK_URL = 'https://www.medresearch-academy.om/resident/login';

export default function SendLinks() {
  const { studyRoles } = useAuth();
  const studyId = studyRoles[0]?.study_id ?? '';

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [instruments, setInstruments] = useState<Set<InstrumentId>>(new Set(['who5', 'cbi', 'phq9', 'gad7']));
  const [completions, setCompletions] = useState<Map<string, Set<InstrumentId>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, [studyId]);

  async function loadData() {
    setLoading(true);

    // Fetch participants
    const { data: parts } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id, full_name, email, primary_site, pgy_level')
      .eq('status', 'active')
      .limit(500);

    if (parts) setParticipants(parts);

    // Check completions for current month
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

    const completionMap = new Map<string, Set<InstrumentId>>();

    const tables: { table: string; key: InstrumentId }[] = [
      { table: 'cbi_responses', key: 'cbi' },
      { table: 'phq9_responses', key: 'phq9' },
      { table: 'gad7_responses', key: 'gad7' },
    ];

    for (const { table, key } of tables) {
      const { data } = await supabase
        .from(table)
        .select('resident_id')
        .gte('response_date', monthStart)
        .lt('response_date', monthEnd)
        .limit(1000);

      if (data) {
        data.forEach((row: any) => {
          if (!completionMap.has(row.resident_id)) {
            completionMap.set(row.resident_id, new Set());
          }
          completionMap.get(row.resident_id)!.add(key);
        });
      }
    }

    setCompletions(completionMap);
    setLoading(false);
  }

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === participants.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(participants.map(p => p.id)));
    }
  }, [selected.size, participants]);

  const toggleInstrument = useCallback((id: InstrumentId) => {
    setInstruments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedInstrumentNames = Array.from(instruments).map(i => INSTRUMENTS[i].name).join(', ');

  const message = `Dear Resident,\n\nPlease complete the following questionnaires for this month: ${selectedInstrumentNames}.\n\nLogin here: ${LINK_URL}\n\nThank you for your participation in the Resident Burnout & Wellbeing Study.\n\n— MedResearch Academy`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(LINK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const completedCount = (residentId: string) => {
    const set = completions.get(residentId);
    return set ? set.size : 0;
  };

  const hasCompleted = (residentId: string, inst: InstrumentId) => {
    return completions.get(residentId)?.has(inst) ?? false;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>Loading...</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Fetching participants and completion data</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 8 }}>
        Send Questionnaire Links
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
        Share the questionnaire portal link with residents. Track who has completed this month's assessments.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left: Participant list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 15 }}>
              Active Participants ({participants.length})
            </h3>
            <button
              onClick={toggleAll}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)',
              }}
            >
              {selected.size === participants.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ width: 40, padding: '10px 12px' }}></th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>Participant</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>Site</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>CBI</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>PHQ-9</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>GAD-7</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selected.has(p.id) ? 'rgba(0,102,68,0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 500 }}>{p.full_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.study_participant_id} {p.pgy_level ? `· PGY-${p.pgy_level}` : ''}</div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {p.primary_site || '—'}
                    </td>
                    {(['cbi', 'phq9', 'gad7'] as InstrumentId[]).map(inst => (
                      <td key={inst} style={{ textAlign: 'center', padding: '8px' }}>
                        {hasCompleted(p.id, inst) ? (
                          <span style={{ color: '#166534', fontWeight: 700, fontSize: 14 }}>Done</span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: 12 }}>Pending</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Compose panel */}
        <div style={{ position: 'sticky', top: 32 }}>
          {/* Instrument selection */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)', marginBottom: 16 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 14, marginBottom: 12 }}>
              Instruments to Include
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(Object.values(INSTRUMENTS)).map(inst => (
                <label
                  key={inst.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}
                >
                  <input
                    type="checkbox"
                    checked={instruments.has(inst.id)}
                    onChange={() => toggleInstrument(inst.id)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 500 }}>{inst.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({inst.itemCount} items)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Share link */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)', marginBottom: 16 }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 14, marginBottom: 12 }}>
              Questionnaire Portal Link
            </h4>
            <div style={{
              padding: '10px 14px', borderRadius: 8, background: 'var(--bg-muted)', fontSize: 12,
              wordBreak: 'break-all', color: 'var(--primary)', fontWeight: 500, marginBottom: 12,
            }}>
              {LINK_URL}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={copyLink}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 16px', fontSize: 13, justifyContent: 'center' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  flex: 1, padding: '10px 16px', fontSize: 13, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Message preview */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 14, marginBottom: 12 }}>
              Message Preview
            </h4>
            <div style={{
              padding: '14px 16px', borderRadius: 8, background: 'var(--bg-muted)',
              fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)', whiteSpace: 'pre-wrap',
            }}>
              {message}
            </div>
          </div>

          {selected.size > 0 && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(0,102,68,0.06)', border: '1px solid rgba(0,102,68,0.15)',
              fontSize: 13, color: 'var(--primary)', fontWeight: 500, textAlign: 'center',
            }}>
              {selected.size} resident{selected.size > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
