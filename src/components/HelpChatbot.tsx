import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

interface FaqEntry {
  keywords: string[];
  question: string;
  answer: string;
  audience: 'all' | 'resident' | 'staff';
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    keywords: ['study', 'about', 'research', 'purpose', 'what is'],
    question: 'About the study',
    answer:
      'This study investigates the association between healthcare workers\u2019 burnout and biophysical parameters using WHOOP wearable devices. It is approved by MREC #3190 and conducted at SQUH, Royal Hospital, and AFH.',
    audience: 'all',
  },
  {
    keywords: ['cbi', 'burnout', 'copenhagen'],
    question: 'What is CBI?',
    answer:
      'The Copenhagen Burnout Inventory (CBI) measures 3 types of burnout: Personal (6 items), Work-related (7 items), and Patient-related (9 items). Scores \u226550/100 on any subscale indicate burnout.',
    audience: 'all',
  },
  {
    keywords: ['phq', 'phq9', 'depression', 'self-harm', 'mood'],
    question: 'What is PHQ-9?',
    answer:
      'The PHQ-9 screens for depression severity. Total score 0\u201327. If you score \u226515 or endorse question 9 (thoughts of self-harm), please reach out to your program director or call 1444.',
    audience: 'all',
  },
  {
    keywords: ['gad', 'gad7', 'anxiety'],
    question: 'What is GAD-7?',
    answer: 'The GAD-7 measures anxiety severity. Total score 0\u201321.',
    audience: 'all',
  },
  {
    keywords: ['isi', 'insomnia', 'sleep disturbance'],
    question: 'What is ISI?',
    answer: 'The Insomnia Severity Index measures sleep disturbance. Total score 0\u201328.',
    audience: 'all',
  },
  {
    keywords: ['checkin', 'check-in', 'weekly', 'hours', 'stress'],
    question: 'Weekly check-in help',
    answer:
      'Complete a brief 6-question check-in every week about your hours, on-call shifts, sleep, and stress. Takes under 2 minutes.',
    audience: 'resident',
  },
  {
    keywords: ['event', 'log', 'logging', 'clinical', 'academic', 'personal'],
    question: 'How to log events',
    answer:
      'Log significant events (clinical, academic, personal, program) as they happen. This helps researchers understand context behind your biophysical data.',
    audience: 'resident',
  },
  {
    keywords: ['questionnaire', 'fill', 'how to', 'survey', 'form'],
    question: 'How to fill questionnaires',
    answer:
      'Go to your Dashboard \u2192 Questionnaires. Select the questionnaire you need to complete (CBI, PHQ-9, GAD-7, or ISI) and answer all items. Your responses are saved automatically when you submit.',
    audience: 'resident',
  },
  {
    keywords: ['whoop', 'wearable', 'band', 'heart rate', 'hrv', 'strain', 'recovery'],
    question: 'About WHOOP',
    answer:
      'Your WHOOP band automatically collects biophysical data (heart rate, sleep, recovery, strain). Data is pulled daily at 3 AM.',
    audience: 'all',
  },
  {
    keywords: ['privacy', 'data', 'confidential', 'anonymous', 'pseudonym', 'revoke'],
    question: 'Privacy & data',
    answer:
      'Your data is pseudonymized (you\u2019re identified by a study ID like RES-002, not your name). Only authorized researchers can access identifiable information. You can revoke WHOOP access anytime.',
    audience: 'all',
  },
  {
    keywords: ['contact', 'email', 'help', 'team', 'researcher', 'pi'],
    question: 'Contact research team',
    answer:
      'For questions about the study, contact Dr. Mohamed Al Rawahi (mrawahi@squ.edu.om) or Dr. Abdullah Al Alawi (dr.abdullahalalawi@gmail.com).',
    audience: 'all',
  },
  {
    keywords: ['import', 'upload', 'excel', 'csv', 'bulk'],
    question: 'How to import data',
    answer:
      'Go to Dashboard \u2192 Import Data. Upload an Excel/CSV file with columns: Participant ID, Date, and questionnaire item responses.',
    audience: 'staff',
  },
  {
    keywords: ['export', 'download', 'csv', 'table'],
    question: 'How to export data',
    answer: 'Go to Dashboard \u2192 Export Data. Select the table you want to download as CSV.',
    audience: 'staff',
  },
  {
    keywords: ['review', 'queue', 'check', 'verify'],
    question: 'Review queue',
    answer:
      'The Review Queue shows submissions that need verification. Click on any entry to review individual responses and flag or approve them.',
    audience: 'staff',
  },
  {
    keywords: ['send', 'link', 'invite', 'enrollment'],
    question: 'How to send links',
    answer:
      'Go to Dashboard \u2192 Send Links to generate and send enrollment or questionnaire links to participants via email.',
    audience: 'staff',
  },
  {
    keywords: ['instrument', 'instruments', 'measures'],
    question: 'About instruments',
    answer:
      'The study uses four validated instruments: CBI (burnout, 22 items), PHQ-9 (depression, 9 items), GAD-7 (anxiety, 7 items), and ISI (insomnia, 7 items). All are self-reported and completed monthly.',
    audience: 'staff',
  },
];

/* ------------------------------------------------------------------ */
/*  Quick-action button sets                                           */
/* ------------------------------------------------------------------ */

const RESIDENT_QUICK_ACTIONS = [
  'How to fill questionnaires',
  'What is CBI?',
  'Weekly check-in help',
  'How to log events',
  'Contact research team',
  'About the study',
];

const STAFF_QUICK_ACTIONS = [
  'Review queue',
  'How to import data',
  'How to send links',
  'How to export data',
  'About instruments',
];

/* ------------------------------------------------------------------ */
/*  Chat message type                                                  */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HelpChatbot() {
  const { isResident, residentProfile, staff } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine audience
  const isResidentUser = isResident || !!residentProfile;
  const isStaffUser = !!staff;

  // Don't show on public pages (neither resident nor staff logged in)
  const showWidget = isResidentUser || isStaffUser;

  const quickActions = isResidentUser ? RESIDENT_QUICK_ACTIONS : STAFF_QUICK_ACTIONS;

  const relevantFaq = useMemo(
    () =>
      FAQ_ENTRIES.filter(
        (f) =>
          f.audience === 'all' ||
          (isResidentUser && f.audience === 'resident') ||
          (isStaffUser && f.audience === 'staff'),
      ),
    [isResidentUser, isStaffUser],
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function findAnswer(query: string): string {
    const q = query.toLowerCase().trim();

    // Exact question match
    const exact = relevantFaq.find((f) => f.question.toLowerCase() === q);
    if (exact) return exact.answer;

    // Keyword match — score each entry
    let bestScore = 0;
    let bestEntry: FaqEntry | null = null;

    for (const entry of relevantFaq) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.toLowerCase())) {
          score += kw.length; // longer keyword matches = higher confidence
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }

    if (bestEntry && bestScore >= 2) {
      return bestEntry.answer;
    }

    return 'I couldn\u2019t find an answer to that. Try one of the quick-action buttons above, or contact the research team at dr.abdullahalalawi@gmail.com for help.';
  }

  function handleQuickAction(label: string) {
    const answer = findAnswer(label);
    setMessages((prev) => [...prev, { role: 'user', text: label }, { role: 'bot', text: answer }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const answer = findAnswer(trimmed);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'bot', text: answer }]);
    setInput('');
  }

  if (!showWidget) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open help"
          style={{
            position: 'fixed',
            bottom: isResidentUser ? 72 : 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 9998,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ?
        </button>
      )}

      {/* ── Chat Panel ── */}
      <div
        style={{
          position: 'fixed',
          bottom: isResidentUser ? 72 : 24,
          right: 20,
          width: 360,
          maxWidth: 'calc(100vw - 40px)',
          height: 480,
          maxHeight: 'calc(100vh - 100px)',
          background: '#fff',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'transform 0.25s ease, opacity 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Help Center</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Quick answers to common questions</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close help"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: 30,
              height: 30,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &#10005;
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
          }}
        >
          {/* Quick actions */}
          {messages.length === 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                Quick Actions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {quickActions.map((label) => (
                  <button
                    key={label}
                    onClick={() => handleQuickAction(label)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: '#f9fafb',
                      color: 'var(--primary)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.15s, border-color 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions (compact) when conversation started */}
          {messages.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {quickActions.map((label) => (
                  <button
                    key={label}
                    onClick={() => handleQuickAction(label)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: '#f9fafb',
                      color: 'var(--text-muted)',
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Welcome message */}
          {messages.length === 0 && (
            <div
              style={{
                background: '#f0f9ff',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 13,
                color: '#1e40af',
                lineHeight: 1.6,
              }}
            >
              Hello! I can help you with common questions about the study, questionnaires, WHOOP, and
              more. Tap a quick action or type your question below.
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginTop: 8,
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--primary)' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : '#1f2937',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'bot' ? 4 : 12,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 14px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
