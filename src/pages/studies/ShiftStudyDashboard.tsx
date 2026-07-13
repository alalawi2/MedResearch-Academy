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
  { key: 'baseline', label: 'Baseline Assessment', description: 'All questionnaires (Demographics, STOP-BANG, rMEQ, WHO-5, PHQ-9, GAD-7, PSS, CBI) — ~20 min' },
  { key: 'pre_shift_1', label: 'Pre-Shift', description: 'Cognitive assessment via TestMyBrain — ~15 min' },
  { key: 'post_shift_1', label: 'Post-Shift', description: 'Nap/sleep questions + NASA-TLX workload survey — ~10 min' },
  { key: 'pre_shift_2', label: 'Pre-Shift', description: 'Cognitive assessment via TestMyBrain — ~15 min' },
  { key: 'post_shift_2', label: 'Post-Shift', description: 'Nap/sleep questions + NASA-TLX workload survey — ~10 min' },
  { key: 'pre_shift_3', label: 'Pre-Shift', description: 'Cognitive assessment via TestMyBrain — ~15 min' },
  { key: 'post_shift_3', label: 'Post-Shift', description: 'Nap/sleep questions + NASA-TLX workload survey — ~10 min' },
];

const CYCLES = [
  { num: 1, pre: 'pre_shift_1', post: 'post_shift_1' },
  { num: 2, pre: 'pre_shift_2', post: 'post_shift_2' },
  { num: 3, pre: 'pre_shift_3', post: 'post_shift_3' },
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

// Must match TIMEPOINT_PREREQS in api/shift-study-auth.ts
const PREREQS: Record<string, string | null> = {
  baseline: null,
  pre_shift_1: 'baseline',
  post_shift_1: 'pre_shift_1',
  pre_shift_2: 'post_shift_1',
  post_shift_2: 'pre_shift_2',
  pre_shift_3: 'post_shift_2',
  post_shift_3: 'pre_shift_3',
};

function isTimepointLocked(key: string, timepointData: Timepoint[]): boolean {
  const prereq = PREREQS[key];
  if (!prereq) return false;
  return getTimepointStatus(prereq, timepointData) !== 'completed';
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

    (async () => {
      const r = await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_my_timepoints', participant_id: p.id }),
      });
      if (r.ok) {
        const result = await r.json();
        if (result.timepoints) setTimepointData(result.timepoints as Timepoint[]);
      }
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

          {/* Assessment Steps */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Loading assessments...
            </div>
          ) : (
            <>
              {/* Step 1: Baseline */}
              {(() => {
                const tp = TIMEPOINTS[0];
                const locked = isTimepointLocked(tp.key, timepointData);
                const status = locked ? 'locked' : getTimepointStatus(tp.key, timepointData);
                const colors = statusColors[status];
                const tpRecord = timepointData.find(t => t.timepoint === tp.key);
                return (
                  <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${status === 'completed' ? '#bbf7d0' : 'var(--border)'}`, padding: '22px 20px', marginBottom: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Step 1</span>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.dot }} />
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 18, margin: '8px 0 6px' }}>{tp.label}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', margin: '0 0 12px', lineHeight: 1.4 }}>{tp.description}</p>
                    <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: colors.bg, color: colors.text, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)', marginBottom: 10 }}>{statusLabel[status]}</div>
                    {tpRecord?.completed_at && <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)', margin: '0 0 10px' }}>Completed: {new Date(tpRecord.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    {!locked && status !== 'completed' && <button onClick={() => navigate(`/active-research/cognitive-shifts/assessment/${tp.key}`)} className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 14, borderRadius: 8 }}>{status === 'in_progress' ? 'Continue' : 'Start Baseline'}</button>}
                    {status === 'completed' && <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 14, color: '#15803d', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Complete</div>}
                  </div>
                );
              })()}

              {/* Shift Cycles */}
              {CYCLES.map(cycle => {
                const preTP = TIMEPOINTS.find(t => t.key === cycle.pre)!;
                const postTP = TIMEPOINTS.find(t => t.key === cycle.post)!;
                const preLocked = isTimepointLocked(cycle.pre, timepointData);
                const postLocked = isTimepointLocked(cycle.post, timepointData);
                const preStatus = preLocked ? 'locked' : getTimepointStatus(cycle.pre, timepointData);
                const postStatus = postLocked ? 'locked' : getTimepointStatus(cycle.post, timepointData);
                const preColors = statusColors[preStatus];
                const postColors = statusColors[postStatus];
                const preRecord = timepointData.find(t => t.timepoint === cycle.pre);
                const postRecord = timepointData.find(t => t.timepoint === cycle.post);
                const cycleLocked = preLocked;

                return (
                  <div key={cycle.num} style={{ marginBottom: 28, opacity: cycleLocked ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 16, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--border)' }}>
                      Shift Cycle {cycle.num}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {/* Step 2: Pre-Shift */}
                      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${preStatus === 'completed' ? '#bbf7d0' : 'var(--border)'}`, padding: '18px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Step 2</span>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: preColors.dot }} />
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '6px 0 4px' }}>{preTP.label}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)', margin: '0 0 10px', lineHeight: 1.4 }}>{preTP.description}</p>
                        <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: preColors.bg, color: preColors.text, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', marginBottom: 8 }}>{statusLabel[preStatus]}</div>
                        {preRecord?.completed_at && <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)', margin: '0 0 8px' }}>{new Date(preRecord.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                        {!preLocked && preStatus !== 'completed' && <button onClick={() => navigate(`/active-research/cognitive-shifts/assessment/${cycle.pre}`)} className="btn btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13, borderRadius: 7 }}>{preStatus === 'in_progress' ? 'Continue' : 'Start'}</button>}
                        {preStatus === 'completed' && <div style={{ textAlign: 'center', fontSize: 13, color: '#15803d', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Done</div>}
                      </div>

                      {/* Step 3: Shift (info only) */}
                      <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px dashed var(--border)', padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)', marginBottom: 8 }}>Step 3</span>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>{participant.shift_type === '24-hour on-call' ? '\u{1F3E5}' : '\u{1F319}'}</div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '4px 0' }}>On-Call Shift</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)', margin: 0 }}>{participant.shift_type || 'Complete your shift'}</p>
                      </div>

                      {/* Step 4: Post-Shift */}
                      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${postStatus === 'completed' ? '#bbf7d0' : 'var(--border)'}`, padding: '18px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ background: '#15803d', color: '#fff', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Step 4</span>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: postColors.dot }} />
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '6px 0 4px' }}>{postTP.label}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)', margin: '0 0 10px', lineHeight: 1.4 }}>{postTP.description}</p>
                        <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: postColors.bg, color: postColors.text, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)', marginBottom: 8 }}>{statusLabel[postStatus]}</div>
                        {postRecord?.completed_at && <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-sans)', margin: '0 0 8px' }}>{new Date(postRecord.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                        {!postLocked && postStatus !== 'completed' && <button onClick={() => navigate(`/active-research/cognitive-shifts/assessment/${cycle.post}`)} className="btn btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13, borderRadius: 7 }}>{postStatus === 'in_progress' ? 'Continue' : 'Start'}</button>}
                        {postStatus === 'completed' && <div style={{ textAlign: 'center', fontSize: 13, color: '#15803d', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>Done</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
