/**
 * SupportAdvice — displays OMSB-aligned wellbeing support resources
 * when assessment scores indicate concerning levels.
 * Shown after Part 4 (GAD-7) submission in both Baseline and Block assessments.
 *
 * Follows OMSB Trainee Affairs → Counselling and Guidance Section pathway.
 * Does NOT diagnose — provides supportive guidance and resources.
 */

interface SupportAdviceProps {
  who5Percent: number | null;
  cbiPersonal: number | null;
  cbiWork: number | null;
  cbiPatient: number | null;
  phq9Total: number | null;
  phq9Q9: number; // suicidal ideation item
  gad7Total: number | null;
}

export default function SupportAdvice({
  who5Percent,
  cbiPersonal,
  cbiWork,
  cbiPatient,
  phq9Total,
  phq9Q9,
  gad7Total,
}: SupportAdviceProps) {
  const concerns: Array<{ level: 'urgent' | 'moderate' | 'mild'; message: string }> = [];

  // Urgent: suicidal ideation
  if (phq9Q9 >= 1) {
    concerns.push({
      level: 'urgent',
      message: 'You indicated thoughts of self-harm or that you would be better off dead. Please reach out for support — you are not alone.',
    });
  }

  // Urgent: severe depression or anxiety
  if (phq9Total != null && phq9Total >= 20) {
    concerns.push({ level: 'urgent', message: 'Your depression screening score suggests severe symptoms.' });
  }
  if (gad7Total != null && gad7Total >= 15) {
    concerns.push({ level: 'urgent', message: 'Your anxiety screening score suggests severe symptoms.' });
  }

  // Moderate: moderate depression/anxiety, high burnout, poor wellbeing
  if (phq9Total != null && phq9Total >= 10 && phq9Total < 20) {
    concerns.push({ level: 'moderate', message: 'Your depression screening indicates moderate symptoms that may benefit from support.' });
  }
  if (gad7Total != null && gad7Total >= 10 && gad7Total < 15) {
    concerns.push({ level: 'moderate', message: 'Your anxiety screening indicates moderate symptoms that may benefit from support.' });
  }
  if (cbiPersonal != null && cbiPersonal >= 50) {
    concerns.push({ level: 'moderate', message: 'Your personal burnout score is in the burnout range. This is common among residents and treatable with the right support.' });
  }
  if (cbiWork != null && cbiWork >= 50) {
    concerns.push({ level: 'moderate', message: 'Your work-related burnout score is elevated. You are not alone — many residents experience this.' });
  }
  if (cbiPatient != null && cbiPatient >= 50) {
    concerns.push({ level: 'moderate', message: 'Your patient-related burnout score is elevated.' });
  }
  if (who5Percent != null && who5Percent <= 28) {
    concerns.push({ level: 'moderate', message: 'Your wellbeing score is low, suggesting you may be going through a difficult time.' });
  }

  // Mild: borderline scores
  if (who5Percent != null && who5Percent > 28 && who5Percent <= 50) {
    concerns.push({ level: 'mild', message: 'Your wellbeing score suggests you may benefit from some additional support.' });
  }

  // No concerns — don't show anything
  if (concerns.length === 0) return null;

  const hasUrgent = concerns.some(c => c.level === 'urgent');
  const hasModerate = concerns.some(c => c.level === 'moderate');

  return (
    <div style={{
      margin: '24px 0',
      borderRadius: 16,
      overflow: 'hidden',
      border: hasUrgent ? '2px solid #dc2626' : hasModerate ? '2px solid #f59e0b' : '2px solid #3b82f6',
    }}>
      {/* Header */}
      <div style={{
        background: hasUrgent ? '#dc2626' : hasModerate ? '#f59e0b' : '#3b82f6',
        padding: '16px 20px',
        color: 'white',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          {hasUrgent ? 'Important: Support Available for You' : 'Wellbeing Support Resources'}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Your responses suggest you may benefit from speaking with someone. This is completely confidential.
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px' }}>
        {/* Concern messages */}
        <div style={{ marginBottom: 20 }}>
          {concerns.map((c, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              padding: '10px 0',
              borderBottom: i < concerns.length - 1 ? '1px solid #f3f4f6' : 'none',
              fontSize: 14,
              color: '#374151',
              lineHeight: 1.6,
            }}>
              <span style={{
                flexShrink: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                marginTop: 7,
                background: c.level === 'urgent' ? '#dc2626' : c.level === 'moderate' ? '#f59e0b' : '#3b82f6',
              }} />
              {c.message}
            </div>
          ))}
        </div>

        {/* Urgent: immediate resources */}
        {hasUrgent && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
          }}>
            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 15, marginBottom: 8 }}>
              If you are in immediate distress:
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#991b1b', fontSize: 14, lineHeight: 2 }}>
              <li><strong>Oman Mental Health Helpline:</strong> 1444 (24/7, confidential)</li>
              <li><strong>Emergency:</strong> 9999</li>
              <li>Go to the nearest Emergency Department</li>
            </ul>
          </div>
        )}

        {/* OMSB Support Pathway */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 12,
          padding: '20px',
          marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 15, marginBottom: 12 }}>
            OMSB Support Services
          </div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Counselling and Guidance Section</strong><br />
              <span style={{ color: '#6b7280' }}>
                OMSB Trainee Affairs Department offers confidential counselling services to all residents.
                You can self-refer or ask your Program Director to arrange a referral.
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>How to access:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#6b7280' }}>
                <li>Self-referral: Contact Trainee Affairs directly</li>
                <li>Program referral: Speak with your Program Director or Educational Supervisor</li>
                <li>Email: <a href="mailto:traineeaffairs@omsb.org" style={{ color: '#0f766e' }}>traineeaffairs@omsb.org</a></li>
              </ul>
            </div>
            <div>
              <strong>What to expect:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#6b7280' }}>
                <li>Confidential assessment and support plan</li>
                <li>No impact on your training record unless you choose to disclose</li>
                <li>Referral to specialist services if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional resources */}
        <div style={{
          background: '#f0fdf4',
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ fontWeight: 700, color: '#166534', fontSize: 15, marginBottom: 12 }}>
            Additional Resources
          </div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Oman Mental Health Helpline:</strong> 1444 (free, confidential, 24/7)</li>
              <li><strong>SQUH Psychiatry Outpatient Clinic:</strong> Available for resident self-referral</li>
              <li><strong>Royal Hospital Psychiatry:</strong> Walk-in and referral services</li>
              <li><strong>Your Educational Supervisor:</strong> Can provide mentorship and guidance</li>
            </ul>
          </div>
        </div>

        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#eff6ff',
          borderRadius: 8,
          fontSize: 13,
          color: '#1e40af',
          lineHeight: 1.6,
        }}>
          <strong>Remember:</strong> Burnout and stress are common among residents and are not a sign of weakness.
          Seeking support is a sign of strength and self-awareness. Your responses in this study are confidential
          and will not be shared with your training program without your consent.
        </div>
      </div>
    </div>
  );
}
