import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Cpu, 
  Layers,
  Info
} from 'lucide-react';

export default function OptimizationPassViewer({ passes = [], initialIr = [], finalIr = [] }) {
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);

  if (!passes || passes.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No optimization passes recorded. Run optimization to inspect multi-pass pipeline transformations.
      </div>
    );
  }

  const currentPass = passes[selectedPassIndex] || passes[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Pass Selector Stepper / Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {passes.map((p, idx) => {
          const isSelected = selectedPassIndex === idx;
          const hasChanges = p.changed;

          return (
            <button
              key={idx}
              onClick={() => setSelectedPassIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--primary-blue)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                border: `1.5px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border-light)'}`,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 10px rgba(29, 100, 242, 0.25)' : 'none'
              }}
            >
              <span>Pass {idx + 1}: {p.passName}</span>
              {hasChanges ? (
                <span style={{
                  fontSize: '11px',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#ecfdf5',
                  color: isSelected ? '#ffffff' : '#059669',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {p.transformationsCount} Δ
                </span>
              ) : (
                <span style={{ fontSize: '11px', opacity: 0.6 }}>0 Δ</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Pass View: Split Before -> Transformations -> After */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '16px', flex: 1, minHeight: '440px' }}>
        
        {/* LEFT: Before IR */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-light)',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--text-heading)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>IR Before Pass {currentPass.passNumber}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {currentPass.irBefore?.length || 0} instructions
            </span>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
            {currentPass.irBefore?.map((instr, i) => (
              <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#94a3b8', width: '24px', textAlign: 'right' }}>{i + 1}</span>
                <span style={{ color: '#1e293b' }}>{instr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Transformations applied in this pass */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: 'var(--primary-blue-light)',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-light)',
            fontWeight: 800,
            fontSize: '13px',
            color: 'var(--primary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              <span>Applied Transformations ({currentPass.transformationsCount})</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Iteration {currentPass.iteration}</span>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentPass.transformations && currentPass.transformations.length > 0 ? (
              currentPass.transformations.map((t, i) => (
                <div key={i} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {t.technique}
                    </span>
                    {t.line && (
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        Line {t.line}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12.5px', marginTop: '4px' }}>
                    <span style={{ color: '#ef4444', textDecoration: t.optimized === '[Removed]' ? 'line-through' : 'none' }}>
                      {t.original}
                    </span>
                    <ArrowRight size={14} color="#64748b" />
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {t.optimized}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', lineHeight: '16px', display: 'flex', gap: '6px' }}>
                    <Info size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{t.explanation}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No transformations were required for this pass (IR already in optimal form for this rule).
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: After IR */}
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-light)',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--text-heading)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>IR After Pass {currentPass.passNumber}</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              {currentPass.irAfter?.length || 0} instructions
            </span>
          </div>

          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
            {currentPass.irAfter?.map((instr, i) => (
              <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#94a3b8', width: '24px', textAlign: 'right' }}>{i + 1}</span>
                <span style={{ color: '#1e293b' }}>{instr}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
