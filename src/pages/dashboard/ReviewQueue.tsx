import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { scoreCBI, scorePHQ9, scoreGAD7 } from '../../lib/scoring';
import type { InstrumentId } from '../../lib/instruments';
import { INSTRUMENTS } from '../../lib/instruments';

type ReviewStatus = 'pending' | 'flagged' | 'verified';

interface QueueItem {
  id: string;
  instrument: InstrumentId;
  participantId: string;
  residentId: string;
  submittedAt: string;
  reviewStatus: ReviewStatus;
  scoreSummary: string;
  q9Value: number | null; // PHQ-9 q9 for suicidal ideation check
}

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: '#f59e0b',
  flagged: '#dc2626',
  verified: '#16a34a',
};

const TH_STYLE: React.CSSProperties = {
  padding: '12px 16px', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const TD_STYLE: React.CSSProperties = { padding: '12px 16px' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildCBISummary(items: Record<string, number>): string {
  const result = scoreCBI(items);
  return `P:${Math.round(result.personal.score)}/W:${Math.round(result.work.score)}/Pt:${Math.round(result.patient.score)}`;
}

function buildPHQ9Summary(items: Record<string, number>): string {
  const result = scorePHQ9(items);
  return `${result.total}/${result.severity}`;
}

function buildGAD7Summary(items: Record<string, number>): string {
  const result = scoreGAD7(items);
  return `${result.total}/${result.severity}`;
}


export default function ReviewQueue() {
  const { studyRoles } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
  const [filterInstrument, setFilterInstrument] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const studyId = studyRoles[0]?.study_id;

  useEffect(() => {
    if (!studyId) return;
    loadAll();
  }, [studyId]);

  async function loadAll() {
    setLoading(true);

    const [cbiRes, phq9Res, gad7Res] = await Promise.all([
      supabase
        .from('cbi_responses')
        .select('id, resident_id, items, review_status, created_at, burnout_participants!inner(study_participant_id)')
        .eq('burnout_participants.study_id', studyId)
        .limit(500),
      supabase
        .from('phq9_responses')
        .select('id, resident_id, items, review_status, created_at, burnout_participants!inner(study_participant_id)')
        .eq('burnout_participants.study_id', studyId)
        .limit(500),
      supabase
        .from('gad7_responses')
        .select('id, resident_id, items, review_status, created_at, burnout_participants!inner(study_participant_id)')
        .eq('burnout_participants.study_id', studyId)
        .limit(500),
    ]);

    const combined: QueueItem[] = [];

    for (const row of cbiRes.data ?? []) {
      const p = (row as any).burnout_participants;
      combined.push({
        id: row.id,
        instrument: 'cbi',
        participantId: p?.study_participant_id ?? '—',
        residentId: row.resident_id,
        submittedAt: row.created_at,
        reviewStatus: (row.review_status ?? 'pending') as ReviewStatus,
        scoreSummary: buildCBISummary(row.items ?? {}),
        q9Value: null,
      });
    }

    for (const row of phq9Res.data ?? []) {
      const p = (row as any).burnout_participants;
      const itms = row.items ?? {};
      combined.push({
        id: row.id,
        instrument: 'phq9',
        participantId: p?.study_participant_id ?? '—',
        residentId: row.resident_id,
        submittedAt: row.created_at,
        reviewStatus: (row.review_status ?? 'pending') as ReviewStatus,
        scoreSummary: buildPHQ9Summary(itms),
        q9Value: itms.phq9_q9 ?? null,
      });
    }

    for (const row of gad7Res.data ?? []) {
      const p = (row as any).burnout_participants;
      combined.push({
        id: row.id,
        instrument: 'gad7',
        participantId: p?.study_participant_id ?? '—',
        residentId: row.resident_id,
        submittedAt: row.created_at,
        reviewStatus: (row.review_status ?? 'pending') as ReviewStatus,
        scoreSummary: buildGAD7Summary(row.items ?? {}),
        q9Value: null,
      });
    }

    // Sort oldest pending first
    combined.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    setItems(combined);
    setLoading(false);
  }

  // Counts per tab
  const pendingCount = items.filter(i => i.reviewStatus === 'pending').length;
  const flaggedCount = items.filter(i => i.reviewStatus === 'flagged').length;
  const verifiedCount = items.filter(i => i.reviewStatus === 'verified').length;

  // Suicidal ideation alert
  const suicidalItems = items.filter(i => i.instrument === 'phq9' && i.q9Value != null && i.q9Value >= 1);

  // Filtered list
  const filtered = items.filter(i => {
    if (i.reviewStatus !== activeTab) return false;
    if (filterInstrument && i.instrument !== filterInstrument) return false;
    if (dateFrom && i.submittedAt < dateFrom) return false;
    if (dateTo && i.submittedAt > dateTo + 'T23:59:59') return false;
    return true;
  });

  const tabStyle = (tab: ReviewStatus, active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderBottom: active ? `3px solid var(--primary)` : '3px solid transparent',
    background: 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-sans)',
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 4 }}>
          Review Queue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Review and verify submitted questionnaire responses
        </p>
      </div>

      {/* Suicidal ideation alert */}
      {suicidalItems.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '2px solid #dc2626', borderRadius: 10,
          padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>!!</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, marginBottom: 2 }}>
              Suicidal Ideation Alert
            </div>
            <div style={{ fontSize: 13, color: '#991b1b' }}>
              {suicidalItems.length} PHQ-9 response{suicidalItems.length > 1 ? 's' : ''} with item 9 (self-harm thoughts) scored {'>='} 1.{' '}
              <button
                onClick={() => { setActiveTab('pending'); setFilterInstrument('phq9'); }}
                style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 13, padding: 0, fontFamily: 'var(--font-sans)' }}
              >
                View flagged responses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <button onClick={() => setActiveTab('pending')} style={tabStyle('pending', activeTab === 'pending')}>
          Pending ({pendingCount})
        </button>
        <button onClick={() => setActiveTab('flagged')} style={tabStyle('flagged', activeTab === 'flagged')}>
          Flagged ({flaggedCount})
        </button>
        <button onClick={() => setActiveTab('verified')} style={tabStyle('verified', activeTab === 'verified')}>
          Verified ({verifiedCount})
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={filterInstrument}
          onChange={e => setFilterInstrument(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'white', fontFamily: 'var(--font-sans)' }}
        >
          <option value="">All Instruments</option>
          <option value="cbi">CBI</option>
          <option value="phq9">PHQ-9</option>
          <option value="gad7">GAD-7</option>
          <option value="who5">WHO-5</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          placeholder="From"
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-sans)' }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          placeholder="To"
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-sans)' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading responses...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            No {activeTab} responses{filterInstrument ? ` for ${INSTRUMENTS[filterInstrument as InstrumentId]?.name ?? filterInstrument}` : ''}.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={TH_STYLE}>Participant ID</th>
                <th style={TH_STYLE}>Instrument</th>
                <th style={TH_STYLE}>Submitted</th>
                <th style={TH_STYLE}>Score Summary</th>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={`${item.instrument}-${item.id}`}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'white' : 'var(--bg-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ ...TD_STYLE, fontWeight: 600, fontFamily: 'monospace' }}>{item.participantId}</td>
                  <td style={TD_STYLE}>
                    <span style={{ fontWeight: 600 }}>{INSTRUMENTS[item.instrument].name}</span>
                  </td>
                  <td style={TD_STYLE}>{formatDate(item.submittedAt)}</td>
                  <td style={TD_STYLE}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.scoreSummary}</span>
                    {item.q9Value != null && item.q9Value >= 1 && (
                      <span style={{
                        marginLeft: 8, padding: '2px 6px', borderRadius: 4,
                        background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700,
                      }}>
                        Q9 ALERT
                      </span>
                    )}
                  </td>
                  <td style={TD_STYLE}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                      background: `${STATUS_COLORS[item.reviewStatus]}18`,
                      color: STATUS_COLORS[item.reviewStatus],
                    }}>
                      {item.reviewStatus}
                    </span>
                  </td>
                  <td style={TD_STYLE}>
                    <Link
                      to={`/dashboard/review/${item.instrument}/${item.id}`}
                      style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
