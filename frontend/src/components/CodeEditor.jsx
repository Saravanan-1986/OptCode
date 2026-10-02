import React, { useRef, useEffect } from 'react';

export default function CodeEditor({ value, onChange, errorLine, errorColumn, errorMessage }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = (value || '').split('\n');
  const lineCount = lines.length;

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '420px',
      background: '#1e2430',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid #334155',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Editor Header Bar */}
      <div style={{
        background: '#181d26',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #293548'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginLeft: '10px' }}>
            program.copt
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          C-Like Language • UTF-8
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Line numbers column */}
        <div
          ref={lineNumbersRef}
          style={{
            width: '48px',
            background: '#181d26',
            color: '#64748b',
            padding: '16px 0',
            textAlign: 'right',
            userSelect: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '22px',
            overflow: 'hidden'
          }}
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const isError = errorLine === lineNum;
            return (
              <div
                key={i}
                style={{
                  paddingRight: '12px',
                  color: isError ? '#f87171' : '#475569',
                  background: isError ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  fontWeight: isError ? 700 : 400
                }}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          style={{
            flex: 1,
            background: 'transparent',
            color: '#f8fafc',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13.5px',
            lineHeight: '22px',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflowX: 'auto',
            tabSize: 4
          }}
        />
      </div>

      {/* Error Bar at Bottom of Editor if compilation error occurs */}
      {errorMessage && (
        <div style={{
          background: '#451a1a',
          color: '#fca5a5',
          borderTop: '1px solid #7f1d1d',
          padding: '10px 16px',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>
            <strong style={{ color: '#ef4444' }}>Line {errorLine}, Col {errorColumn}:</strong> {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
