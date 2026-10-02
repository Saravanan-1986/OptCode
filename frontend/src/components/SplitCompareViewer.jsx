import React, { useState } from 'react';
import { Columns, Code, FileText, ArrowRight } from 'lucide-react';

export default function SplitCompareViewer({ originalCode, optimizedCode, irBefore = [], irAfter = [] }) {
  const [mode, setMode] = useState('ir'); // 'ir' or 'source'

  const origIrLines = irBefore.map(i => i.instruction || i);
  const optIrLines = irAfter.map(i => i.instruction || i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* View Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '8px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Columns size={18} color="var(--primary-blue)" />
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            Side-by-Side Comparison
          </span>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
          <button
            onClick={() => setMode('ir')}
            style={{
              background: mode === 'ir' ? '#ffffff' : 'transparent',
              color: mode === 'ir' ? 'var(--primary-blue)' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: mode === 'ir' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Three-Address IR Comparison
          </button>
          <button
            onClick={() => setMode('source')}
            style={{
              background: mode === 'source' ? '#ffffff' : 'transparent',
              color: mode === 'source' ? 'var(--primary-blue)' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: mode === 'source' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            C-Like Source Code Comparison
          </button>
        </div>
      </div>

      {/* Split Comparison Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: '440px' }}>
        
        {/* LEFT: Original */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#fef2f2',
            padding: '10px 18px',
            borderBottom: '1px solid #fee2e2',
            fontWeight: 800,
            fontSize: '13px',
            color: '#b91c1c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Original {mode === 'ir' ? 'IR (TAC)' : 'Source Program'}</span>
            <span style={{ fontSize: '11px', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
              {mode === 'ir' ? `${origIrLines.length} instructions` : 'Pre-Optimization'}
            </span>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '22px' }}>
            {mode === 'ir' ? (
              origIrLines.map((line, idx) => {
                const isRemoved = !optIrLines.includes(line);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '2px 6px',
                      background: isRemoved ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: isRemoved ? '#b91c1c' : '#1e293b',
                      textDecoration: isRemoved ? 'line-through' : 'none',
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <span style={{ color: '#94a3b8', width: '24px', textAlign: 'right' }}>{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                );
              })
            ) : (
              <pre style={{ margin: 0, color: '#334155', fontFamily: 'inherit' }}>
                {originalCode}
              </pre>
            )}
          </div>
        </div>

        {/* RIGHT: Optimized */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#ecfdf5',
            padding: '10px 18px',
            borderBottom: '1px solid #d1fae5',
            fontWeight: 800,
            fontSize: '13px',
            color: '#047857',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Optimized {mode === 'ir' ? 'IR (TAC)' : 'Generated Code'}</span>
            <span style={{ fontSize: '11px', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>
              {mode === 'ir' ? `${optIrLines.length} instructions` : 'Post-Optimization'}
            </span>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '22px' }}>
            {mode === 'ir' ? (
              optIrLines.map((line, idx) => {
                const isNew = !origIrLines.includes(line);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '2px 6px',
                      background: isNew ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      color: isNew ? '#047857' : '#1e293b',
                      fontWeight: isNew ? 700 : 400,
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <span style={{ color: '#94a3b8', width: '24px', textAlign: 'right' }}>{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                );
              })
            ) : (
              <pre style={{ margin: 0, color: '#047857', fontWeight: 500, fontFamily: 'inherit' }}>
                {optimizedCode || '// No optimized code generated yet'}
              </pre>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
