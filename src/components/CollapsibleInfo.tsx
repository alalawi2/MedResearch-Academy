import { useState, useRef, useEffect } from 'react';

interface CollapsibleInfoProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
}

export default function CollapsibleInfo({ title, children, defaultOpen = false, icon }: CollapsibleInfoProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, open]);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--primary)',
          fontFamily: 'inherit',
        }}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span style={{ flex: 1 }}>{title}</span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          &#9660;
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? contentHeight : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: '0 16px 16px',
            fontSize: 13,
            lineHeight: 1.7,
            color: '#374151',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
