import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import Layout from '../../components/Layout';

interface Participant {
  id: string;
  email: string;
  full_name: string;
  participant_id: string;
  role: 'participant' | 'investigator';
  status: string;
  gender: string;
  specialty: string;
  residency_year: string;
  shift_type: string;
}

interface Timepoint {
  id: string;
  participant_id: string;
  timepoint: string;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

const TIMEPOINTS = [
  { key: 'baseline', label: 'Baseline Assessment', description: 'Initial assessment before any shift' },
  { key: 'pre_shift_1', label: 'Pre-Shift 1', description: 'Before first shift cycle' },
  { key: 'post_shift_1', label: 'Post-Shift 1', description: 'After first shift cycle' },
  { key: 'pre_shift_2', label: 'Pre-Shift 2', description: 'Before second shift cycle' },
  { key: 'post_shift_2', label: 'Post-Shift 2', description: 'After second shift cycle' },
  { key: 'pre_shift_3', label: 'Pre-Shift 3', description: 'Before third shift cycle' },
  { key: 'post_shift_3', label: 'Post-Shift 3', description: 'After third shift cycle' },
];

function getTimepointStatus(
  key: string,
  timepointData: Timepoint[],
): 'completed' | 'in_progress' | 'not_started' {
  const tp = timepointData.find(t => t.timepoint === key);
  if (!tp) return 'not_started';
  if (tp.completed) return 'completed';
  return 'in_progress';
}

function isTimepointLocked(key: string, timepointData: Timepoint[]): boolean {
  const baselineStatus = getTimepointStatus('baseline', timepointData);

  if (key === 'baseline') return false;

  // All non-baseline require baseline completed
  if (baselineStatus !== 'completed') return true;

  // pre_shift_N requires nothing beyond baseline
  if (key.startsWith('pre_shift_')) return false;

  // post_shift_N requires corresponding pre_shift_N completed
  if (key.startsWith('post_shift_')) {
    const cycleNum = key.replace('post_shift_', '');
    const preStatus = getTimepointStatus(`pre_shift_${cycleNum}`, timepointData);
    return preStatus !== 'completed';
  }

  return false;
}

export default function ShiftStudyDashboard() {
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [timepointData, setTimepointData] = useState<Timepoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('shift_study_participant');
    if (!stored) {
      navigate('/active-research/cognitive-shifts/login');
      return;
    }
    const p = JSON.parse(stored) as Participant;
    setParticipant(p);

    if (!supabaseConfigured) { setLoading(false); return; }

    (async () => {
      const { data } = await supabase
        .from('shift_study_timepoints')
        .select('id,participant_id,timepoint,completed,started_at,completed_at')
        .eq('participant_id', p.id)
        .limit(20);

      if (data) setTimepointData(data as Timepoint[]);
      setLoading(false);
    })();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('shift_study_participant');
    navigate('/active-research/cognitive-shifts/login');
  };

  if (!participant) return null;

  const completedCount = timepointData.filter(t => t.completed).length;
  const progressPct = Math.round((completedCount / TIMEPOINTS.length) * 100);

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    completed: { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
    in_progress: { bg: '#fefce8', text: '#a16207', dot: '#eab308' },
    not_started: { bg: 'var(--bg-muted)', text: 'var(--text-muted)', dot: '#d1d5db' },
    locked: { bg: '#f9fafb', text: '#9ca3af', dot: '#e5e7eb' },
  };

  const statusLabel: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In Progress',
    not_started: 'Not Started',
    locked: 'Locked',
  };

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 26, marginBottom: 4 }}>
                Welcome, {participant.full_name}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', margin: 0 }}>
                Participant ID: <strong>{participant.participant_id}</strong> &middot; {participant.specialty} &middot; {participant.residency_year}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {participant.role === 'investigator' && (
                <Link
                  to="/active-research/cognitive-shifts/investigator"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--accent-light)',
                    color: 'var(--primary)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Investigator Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid var(--border)',
            padding: '24px 28px',
            marginBottom: 28,
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 18, margin: 0 }}>
                Study Progress
              </h3>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-sans)' }}>
                {completedCount} / {TIMEPOINTS.length} completed
              </span>
            </div>
            <div style={{ background: 'var(--bg-muted)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: 8,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Timepoint Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Loading assessments...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {TIMEPOINTS.map(tp => {
                const locked = isTimepointLocked(tp.key, timepointData);
                const status = locked ? 'locked' : getTimepointStatus(tp.key, timepointData);
                const colors = statusColors[status];
                const tpRecord = timepointData.find(t => t.timepoint === tp.key);

                return (
                  <div
                    key={tp.key}
                    style={{
                      background: '#fff',
                      borderRadius: 14,
                      border: `1px solid ${status === 'completed' ? '#bbf7d0' : 'var(--border)'}`,
                      padding: '22px 20px',
                      opacity: locked ? 0.55 : 1,
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: colors.dot, flexShrink: 0,
                      }} />
                      <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 16, margin: 0 }}>
                        {tp.label}
                      </h4>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', margin: '0 0 12px', lineHeight: 1.4 }}>
                      {tp.description}
                    </p>

                    <div style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: colors.bg,
                      color: colors.text,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: 'var(--font-sans)',
                      marginBottom: 12,
                    }}>
                      {statusLabel[status]}
                    </div>

                    {tpRecord?.completed_at && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)', margin: '0 0 12px' }}>
                        Completed: {new Date(tpRecord.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}

                    {!locked && status !== 'completed' && (
                      <button
                        onClick={() => navigate(`/active-research/cognitive-shifts/assessment/${tp.key}`)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '9px 0',
                          fontSize: 14,
                          borderRadius: 8,
                          marginTop: 4,
                        }}
                      >
                        {status === 'in_progress' ? 'Continue Assessment' : 'Start Assessment'}
                      </button>
                    )}

                    {status === 'completed' && (
                      <div style={{
                        textAlign: 'center',
                        padding: '9px 0',
                        fontSize: 14,
                        color: '#15803d',
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Assessment Complete
                      </div>
                    )}

                    {locked && (
                      <div style={{
                        textAlign: 'center',
                        padding: '9px 0',
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        Complete previous assessment first
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
