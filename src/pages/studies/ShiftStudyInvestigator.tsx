import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import Layout from '../../components/Layout';

interface Participant {
  id: string;
  email: string;
  full_name: string;
  participant_id: string;
  role: string;
  specialty: string;
  residency_year: string;
  shift_type: string;
  created_at: string;
}

interface TimepointRecord {
  id: string;
  participant_id: string;
  timepoint: string;
  answers: Record<string, unknown> | null;
  completed: boolean;
  completed_at: string | null;
}

const TIMEPOINTS = ['baseline', 'pre_shift_1', 'post_shift_1', 'pre_shift_2', 'post_shift_2', 'pre_shift_3', 'post_shift_3'];

const TIMEPOINT_LABELS: Record<string, string> = {
  baseline: 'Baseline',
  pre_shift_1: 'Pre-1',
  post_shift_1: 'Post-1',
  pre_shift_2: 'Pre-2',
  post_shift_2: 'Post-2',
  pre_shift_3: 'Pre-3',
  post_shift_3: 'Post-3',
};

export default function ShiftStudyInvestigator() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [timepoints, setTimepoints] = useState<TimepointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, unknown> | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('shift_study_participant');
    if (!stored) {
      navigate('/active-research/cognitive-shifts/login');
      return;
    }
    const p = JSON.parse(stored);
    if (p.role !== 'investigator') {
      navigate('/active-research/cognitive-shifts/dashboard');
      return;
    }
    setCurrentUser(p);

    if (!supabaseConfigured) { setLoading(false); return; }

    (async () => {
      const [participantsRes, timepointsRes] = await Promise.all([
        supabase
          .from('shift_study_participants')
          .select('id,email,full_name,participant_id,role,specialty,residency_year,shift_type,created_at')
          .order('created_at', { ascending: true })
          .limit(500),
        supabase
          .from('shift_study_timepoints')
          .select('id,participant_id,timepoint,completed,completed_at')
          .limit(5000),
      ]);

      if (participantsRes.data) setParticipants(participantsRes.data as Participant[]);
      if (timepointsRes.data) setTimepoints(timepointsRes.data as TimepointRecord[]);
      setLoading(false);
    })();
  }, [navigate]);

  const getTimepointForParticipant = (participantId: string, tp: string): TimepointRecord | undefined => {
    return timepoints.find(t => t.participant_id === participantId && t.timepoint === tp);
  };

  const completedBaselineCount = participants.filter(p =>
    timepoints.some(t => t.participant_id === p.id && t.timepoint === 'baseline' && t.completed)
  ).length;

  const totalCompleted = timepoints.filter(t => t.completed).length;
  const totalPossible = participants.length * TIMEPOINTS.length;
  const avgCompletionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  const handleExpandParticipant = async (participantId: string) => {
    if (expandedId === participantId) {
      setExpandedId(null);
      setExpandedAnswers(null);
      return;
    }
    setExpandedId(participantId);
    setLoadingAnswers(true);

    const { data } = await supabase
      .from('shift_study_timepoints')
      .select('id,timepoint,answers,completed,completed_at')
      .eq('participant_id', participantId)
      .limit(20);

    const answersMap: Record<string, unknown> = {};
    if (data) {
      for (const row of data) {
        answersMap[row.timepoint] = {
          completed: row.completed,
          completed_at: row.completed_at,
          answers: row.answers,
        };
      }
    }
    setExpandedAnswers(answersMap);
    setLoadingAnswers(false);
  };

  const exportCSV = () => {
    // Build CSV with participant info + timepoint completion
    const headers = [
      'Participant ID', 'Full Name', 'Email', 'Specialty', 'Shift Type', 'Residency Year', 'Registered',
      ...TIMEPOINTS.map(tp => `${TIMEPOINT_LABELS[tp]} Status`),
      ...TIMEPOINTS.map(tp => `${TIMEPOINT_LABELS[tp]} Date`),
    ];

    const rows = participants.map(p => {
      const tpStatuses = TIMEPOINTS.map(tp => {
        const rec = getTimepointForParticipant(p.id, tp);
        if (!rec) return 'Not Started';
        return rec.completed ? 'Completed' : 'In Progress';
      });
      const tpDates = TIMEPOINTS.map(tp => {
        const rec = getTimepointForParticipant(p.id, tp);
        return rec?.completed_at ? new Date(rec.completed_at).toLocaleDateString('en-GB') : '';
      });
      return [
        p.participant_id,
        p.full_name,
        p.email,
        p.specialty,
        p.shift_type,
        p.residency_year,
        new Date(p.created_at).toLocaleDateString('en-GB'),
        ...tpStatuses,
        ...tpDates,
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shift_study_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!currentUser) return null;

  const dotStyle = (status: 'completed' | 'in_progress' | 'not_started'): React.CSSProperties => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-block',
    background: status === 'completed' ? '#22c55e' : status === 'in_progress' ? '#eab308' : '#d1d5db',
  });

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 26, marginBottom: 4 }}>
                Investigator Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', margin: 0 }}>
                Cognitive Effects of Shift Work Study
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={exportCSV}
                style={{
                  padding: '8px 18px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Export CSV
              </button>
              <button
                onClick={() => navigate('/active-research/cognitive-shifts/settings')}
                style={{
                  padding: '8px 18px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Study Settings
              </button>
              <button
                onClick={() => navigate('/active-research/cognitive-shifts/dashboard')}
                style={{
                  padding: '8px 18px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                My Dashboard
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Loading data...
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Total Participants', value: participants.length },
                  { label: 'Completed Baseline', value: completedBaselineCount },
                  { label: 'Avg Completion', value: `${avgCompletionRate}%` },
                  { label: 'Total Assessments', value: `${totalCompleted} / ${totalPossible}` },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: '#fff',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    padding: '20px 22px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', margin: '0 0 4px' }}>
                      {stat.label}
                    </p>
                    <p style={{ color: 'var(--text)', fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-serif)', margin: 0 }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={dotStyle('completed')} /> Completed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={dotStyle('in_progress')} /> In Progress
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={dotStyle('not_started')} /> Not Started
                </span>
              </div>

              {/* Participants Table */}
              <div style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-muted)' }}>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Name</th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>ID</th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Specialty</th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Shift</th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Year</th>
                        <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>Registered</th>
                        {TIMEPOINTS.map(tp => (
                          <th key={tp} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>
                            {TIMEPOINT_LABELS[tp]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map(p => {
                        const isExpanded = expandedId === p.id;
                        return (
                          <tr key={p.id} style={{ cursor: 'pointer' }}>
                            <td
                              colSpan={6 + TIMEPOINTS.length}
                              style={{ padding: 0 }}
                            >
                              {/* Main row content */}
                              <div
                                onClick={() => handleExpandParticipant(p.id)}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: `repeat(6, auto) repeat(${TIMEPOINTS.length}, 1fr)`,
                                  alignItems: 'center',
                                  borderBottom: '1px solid var(--border)',
                                  background: isExpanded ? 'var(--accent-light)' : 'transparent',
                                  transition: 'background 0.15s',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                                  {p.full_name}
                                </div>
                                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>
                                  {p.participant_id}
                                </div>
                                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text)' }}>
                                  {p.specialty}
                                </div>
                                <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                                  {p.shift_type}
                                </div>
                                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text)' }}>
                                  {p.residency_year}
                                </div>
                                <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                                  {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </div>
                                {TIMEPOINTS.map(tp => {
                                  const rec = getTimepointForParticipant(p.id, tp);
                                  const status: 'completed' | 'in_progress' | 'not_started' = rec
                                    ? rec.completed ? 'completed' : 'in_progress'
                                    : 'not_started';
                                  return (
                                    <div key={tp} style={{ padding: '10px 8px', textAlign: 'center' }}>
                                      <span style={dotStyle(status)} />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Expanded detail */}
                              {isExpanded && (
                                <div style={{
                                  padding: '16px 20px',
                                  background: '#fafbfc',
                                  borderBottom: '1px solid var(--border)',
                                }}>
                                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>
                                    <strong>Email:</strong> {p.email}
                                  </p>
                                  {loadingAnswers ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading answers...</p>
                                  ) : expandedAnswers ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                                      {TIMEPOINTS.map(tp => {
                                        const tpData = expandedAnswers[tp] as { completed?: boolean; completed_at?: string; answers?: Record<string, unknown> } | undefined;
                                        const answerCount = tpData?.answers ? Object.keys(tpData.answers).length : 0;
                                        return (
                                          <div key={tp} style={{
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid var(--border)',
                                            background: '#fff',
                                            fontSize: 13,
                                            fontFamily: 'var(--font-sans)',
                                          }}>
                                            <strong style={{ color: 'var(--text)' }}>{TIMEPOINT_LABELS[tp]}</strong>
                                            <br />
                                            <span style={{ color: 'var(--text-muted)' }}>
                                              {tpData
                                                ? `${tpData.completed ? 'Done' : 'In progress'} (${answerCount} answers)`
                                                : 'Not started'}
                                            </span>
                                            {tpData?.completed_at && (
                                              <>
                                                <br />
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                  {new Date(tpData.completed_at).toLocaleDateString('en-GB')}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {participants.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                    No participants registered yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
