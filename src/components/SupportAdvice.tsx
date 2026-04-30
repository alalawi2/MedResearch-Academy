/**
 * SupportAdvice — displays OMSB Counselling and Guidance Section resources
 * when assessment scores indicate concerning levels.
 */

interface SupportAdviceProps {
  who5Percent: number | null;
  cbiPersonal: number | null;
  cbiWork: number | null;
  cbiPatient: number | null;
  phq9Total: number | null;
  phq9Q9: number;
  gad7Total: number | null;
  isiTotal?: number | null;
}

export default function SupportAdvice({
  who5Percent,
  cbiPersonal,
  cbiWork,
  cbiPatient,
  phq9Total,
  phq9Q9,
  gad7Total,
  isiTotal,
}: SupportAdviceProps) {
  const concerns: string[] = [];

  if (phq9Q9 >= 1) {
    concerns.push('Some of your responses suggest you may be going through a difficult time.');
  }
  if (phq9Total != null && phq9Total >= 10) {
    concerns.push('Your mood screening suggests you may benefit from speaking with a counsellor.');
  }
  if (gad7Total != null && gad7Total >= 10) {
    concerns.push('Your anxiety screening suggests you may benefit from additional support.');
  }
  if (cbiPersonal != null && cbiPersonal >= 50) {
    concerns.push('Your personal burnout score is elevated. This is common among residents and support is available.');
  }
  if (cbiWork != null && cbiWork >= 50) {
    concerns.push('Your work-related burnout score is elevated.');
  }
  if (cbiPatient != null && cbiPatient >= 50) {
    concerns.push('Your patient-related burnout score is elevated.');
  }
  if (who5Percent != null && who5Percent <= 50) {
    concerns.push('Your wellbeing score suggests you may benefit from some support.');
  }
  if (isiTotal != null && isiTotal >= 15) {
    concerns.push('Your insomnia score suggests clinical insomnia. Sleep support may be helpful.');
  }

  if (concerns.length === 0) return null;

  return (
    <div style={{
      margin: '24px 0',
      borderRadius: 16,
      overflow: 'hidden',
      border: '2px solid #0f766e',
    }}>
      <div style={{
        background: '#0f766e',
        padding: '16px 20px',
        color: 'white',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Support Available for You
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Based on your responses, you may benefit from speaking with someone. All services are confidential.
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px' }}>
        <div style={{ marginBottom: 20 }}>
          {concerns.map((msg, i) => (
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
                background: '#0f766e',
              }} />
              {msg}
            </div>
          ))}
        </div>

        <div style={{
          background: '#f8fafc',
          borderRadius: 12,
          padding: '20px',
        }}>
          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 15, marginBottom: 12 }}>
            OMSB Counselling and Guidance Section
          </div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
            <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
              The OMSB Trainee Affairs Department offers confidential counselling services to all residents.
              You can self-refer or ask your Program Director to arrange a referral.
            </p>

            <div style={{ marginBottom: 12 }}>
              <strong>How to access:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#6b7280' }}>
                <li>Self-referral: Contact the Counselling Section directly</li>
                <li>Program referral: Speak with your Program Director or Educational Supervisor</li>
              </ul>
            </div>

            <div style={{ marginBottom: 12 }}>
              <strong>Contact:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#6b7280' }}>
                <li>Email: <a href="mailto:counselling@omsb.org" style={{ color: '#0f766e', fontWeight: 600 }}>counselling@omsb.org</a></li>
                <li>Trainee Affairs: <a href="mailto:traineeaffairs@omsb.org" style={{ color: '#0f766e', fontWeight: 600 }}>traineeaffairs@omsb.org</a></li>
              </ul>
            </div>

            <div>
              <strong>What to expect:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, color: '#6b7280' }}>
                <li>Confidential assessment and personalised support plan</li>
                <li>No impact on your training record unless you choose to disclose</li>
                <li>Referral to specialist services if needed</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f0fdf4',
          borderRadius: 8,
          fontSize: 13,
          color: '#166534',
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
