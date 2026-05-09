import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Simple types                                                       */
/* ------------------------------------------------------------------ */

interface WhoopData {
  avg_recovery_score: number | null;
  avg_hrv_rmssd_ms: number | null;
  avg_resting_hr_bpm: number | null;
  avg_total_sleep_min: number | null;
  avg_daily_strain: number | null;
  avg_sleep_efficiency_pct: number | null;
  avg_spo2_pct: number | null;
  avg_respiratory_rate_bpm: number | null;
  avg_skin_temp_c: number | null;
  days_with_data: number | null;
  pct_recorded: number | null;
  pulled_at: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ResidentDashboard() {
  const { residentProfile } = useAuth();
  const [status, setStatus] = useState('Initializing...');
  const [whoop, setWhoop] = useState<WhoopData | null>(null);
  const [whoopError, setWhoopError] = useState<string | null>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!residentProfile) {
      setStatus('Waiting for profile...');
      return;
    }
    setStatus(`Profile loaded: ${residentProfile.study_participant_id}`);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentProfile]);

  async function loadData() {
    if (!residentProfile) return;
    const rid = residentProfile.id;
    const log: string[] = [];

    // Check session
    const { data: sess } = await supabase.auth.getSession();
    if (!sess?.session) {
      setStatus('ERROR: No active auth session');
      setLoaded(true);
      return;
    }
    log.push('Session OK');

    // WHOOP
    const { data: wData, error: wErr } = await supabase
      .from('whoop_pulls')
      .select('avg_recovery_score, avg_hrv_rmssd_ms, avg_resting_hr_bpm, avg_total_sleep_min, avg_daily_strain, avg_sleep_efficiency_pct, avg_spo2_pct, avg_respiratory_rate_bpm, avg_skin_temp_c, days_with_data, pct_recorded, pulled_at')
      .eq('resident_id', rid)
      .order('pulled_at', { ascending: false })
      .limit(1);

    if (wErr) {
      setWhoopError(wErr.message);
      log.push(`WHOOP error: ${wErr.message}`);
    } else if (wData && wData.length > 0) {
      setWhoop(wData[0] as WhoopData);
      log.push(`WHOOP: ${wData.length} row(s)`);
    } else {
      log.push('WHOOP: 0 rows (empty)');
    }

    // Block assessments count
    const { count: baCount, error: baErr } = await supabase
      .from('block_assessments')
      .select('id', { count: 'exact', head: true })
      .eq('resident_id', rid);
    if (baErr) log.push(`Assessments error: ${baErr.message}`);
    else { setAssessmentCount(baCount ?? 0); log.push(`Assessments: ${baCount ?? 0}`); }

    // Weekly checkins count
    const { count: wcCount, error: wcErr } = await supabase
      .from('weekly_checkins')
      .select('id', { count: 'exact', head: true })
      .eq('resident_id', rid);
    if (wcErr) log.push(`Checkins error: ${wcErr.message}`);
    else { setCheckinCount(wcCount ?? 0); log.push(`Checkins: ${wcCount ?? 0}`); }

    // Event count
    const { count: evCount, error: evErr } = await supabase
      .from('event_logs')
      .select('id', { count: 'exact', head: true })
      .eq('resident_id', rid);
    if (evErr) log.push(`Events error: ${evErr.message}`);
    else { setEventCount(evCount ?? 0); log.push(`Events: ${evCount ?? 0}`); }

    setStatus(log.join(' | '));
    setLoaded(true);
  }

  const name = residentProfile?.full_name?.split(' ')[0] || 'Resident';
  const pid = residentProfile?.study_participant_id || '---';

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  function fmtMin(min: number | null): string {
    if (min == null) return '--';
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}m`;
  }

  function fmtNum(v: number | null, d = 1, suffix = ''): string {
    if (v == null) return '--';
    return v.toFixed(d) + suffix;
  }

  function recoveryColor(v: number): string {
    if (v >= 67) return '#16a34a';
    if (v >= 34) return '#f59e0b';
    return '#ef4444';
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 4px' }}>

      {/* ── Debug Banner (always visible) ── */}
      <div style={{
        padding: '10px 14px', borderRadius: 10, marginBottom: 16,
        background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 11, color: '#0369a1',
        wordBreak: 'break-all',
      }}>
        {status}
      </div>

      {/* ── Welcome ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          Welcome, {name}
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
            background: '#0f172a', color: '#fff',
          }}>{pid}</span>
          <Link to="/resident/set-password" style={{
            fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 99,
            background: '#dbeafe', color: '#1d4ed8', textDecoration: 'none',
          }}>Set Password</Link>
        </div>
      </div>

      {/* ── Guide ── */}
      <div style={{
        padding: '14px 16px', borderRadius: 12, marginBottom: 20,
        background: '#eff6ff', border: '1px solid #bfdbfe',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>What to do each week</div>
        <div style={{ fontSize: 12, color: '#1e3a5a', lineHeight: 1.8 }}>
          1. <strong>Wear WHOOP 24/7</strong> — data pulls automatically at 3 AM<br />
          2. <strong>Weekly check-in</strong> — 2 min, hours/calls/sleep/stress<br />
          3. <strong>Log events</strong> — clinical, academic, personal events<br />
          4. <strong>Block assessment</strong> — opens week 3 of each rotation
        </div>
      </div>

      {/* ── Action Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        <Link to="/resident/questionnaire" style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 12px',
          textDecoration: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>&#128203;</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Block Assessment</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{assessmentCount}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>completed</div>
        </Link>
        <Link to="/resident/checkin" style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 12px',
          textDecoration: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>&#9989;</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Weekly Check-in</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{checkinCount}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>submitted</div>
        </Link>
        <Link to="/resident/events" style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 12px',
          textDecoration: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>&#128197;</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Event Log</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed' }}>{eventCount}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>logged</div>
        </Link>
      </div>

      {/* ── WHOOP Biometrics ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>WHOOP Biometrics</h2>
          {whoop && <span style={{ fontSize: 11, color: '#94a3b8' }}>Updated: {new Date(whoop.pulled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
        </div>

        {whoopError ? (
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
            WHOOP Error: {whoopError}
          </div>
        ) : whoop ? (
          <>
            {/* Top 3 rings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, textAlign: 'center' }}>
              <div>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 6px',
                  border: `4px solid ${whoop.avg_recovery_score != null ? recoveryColor(whoop.avg_recovery_score) : '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: whoop.avg_recovery_score != null ? recoveryColor(whoop.avg_recovery_score) : '#94a3b8' }}>
                    {whoop.avg_recovery_score != null ? `${Math.round(whoop.avg_recovery_score)}%` : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Recovery</div>
              </div>
              <div>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 6px',
                  border: '4px solid #0d9488',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#0d9488' }}>
                    {whoop.avg_hrv_rmssd_ms != null ? Math.round(whoop.avg_hrv_rmssd_ms) : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>HRV (ms)</div>
              </div>
              <div>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 6px',
                  border: '4px solid #6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>
                    {whoop.avg_daily_strain != null ? whoop.avg_daily_strain.toFixed(1) : '--'}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Strain</div>
              </div>
            </div>

            {/* Insight text */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
              {whoop.avg_recovery_score != null && (
                whoop.avg_recovery_score >= 67
                  ? 'Your recovery is in the green — your body is well rested and ready for strain.'
                  : whoop.avg_recovery_score >= 34
                  ? 'Recovery is moderate — balance workload and prioritize sleep.'
                  : 'Recovery is low — your body needs rest. Consider lighter activity.'
              )}
              {whoop.avg_total_sleep_min != null && (
                whoop.avg_total_sleep_min >= 420
                  ? ` Averaging ${fmtMin(whoop.avg_total_sleep_min)} sleep — meeting 7h target.`
                  : ` Averaging ${fmtMin(whoop.avg_total_sleep_min)} sleep — below 7h recommended.`
              )}
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Resting HR', fmtNum(whoop.avg_resting_hr_bpm, 0, ' bpm')],
                ['Sleep', fmtMin(whoop.avg_total_sleep_min)],
                ['Sleep Efficiency', fmtNum(whoop.avg_sleep_efficiency_pct, 0, '%')],
                ['SpO2', fmtNum(whoop.avg_spo2_pct, 1, '%')],
                ['Respiratory Rate', fmtNum(whoop.avg_respiratory_rate_bpm, 1, ' br/min')],
                ['Skin Temp', fmtNum(whoop.avg_skin_temp_c, 1, ' °C')],
                ['Days with Data', `${whoop.days_with_data ?? 0} / 28`],
                ['Recorded', `${whoop.pct_recorded ?? 0}%`],
              ].map(([label, val]) => (
                <div key={label as string} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{val}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>&#9201;</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>Awaiting WHOOP Data</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              Data is pulled automatically every night at 3 AM.<br />
              Make sure your WHOOP is worn and charged.
            </div>
          </div>
        )}
      </div>

      {/* ── Study Progress ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Your Progress</h2>
        {[
          { label: 'Demographics', done: !!residentProfile?.demographics_completed },
          { label: 'Baseline Assessment', done: !!residentProfile?.baseline_completed },
          { label: 'WHOOP Connected', done: !!whoop },
          { label: 'Check-ins Completed', done: checkinCount > 0, detail: `${checkinCount} submitted` },
          { label: 'Events Logged', done: eventCount > 0, detail: `${eventCount} logged` },
          { label: 'Block Assessments', done: assessmentCount > 1, detail: `${assessmentCount} completed` },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
            borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: item.done ? '#dcfce7' : '#f1f5f9',
              color: item.done ? '#16a34a' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>
              {item.done ? '\u2713' : (i + 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
              {item.detail && <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.detail}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ── About Study ── */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>About This Study</h2>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: '0 0 12px' }}>
          This study investigates the association between healthcare workers' burnout and
          biophysical parameters using WHOOP wearable devices. Multi-center cohort study
          at SQUH, Royal Hospital, and Armed Forces Hospital.
        </p>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
          <strong>Ethics:</strong> MREC #3190 (SQU) + Royal Hospital<br />
          <strong>Privacy:</strong> You are identified by study ID only ({pid})<br />
          <strong>Contact:</strong> <a href="mailto:mrawahi@squ.edu.om" style={{ color: '#0d9488' }}>mrawahi@squ.edu.om</a>
        </div>
      </div>
    </div>
  );
}
