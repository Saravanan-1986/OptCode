import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, GitBranch, ArrowDown } from 'lucide-react';

export default function CfgVisualizer({ basicBlocks = [], cfgData = { nodes: [], edges: [] } }) {
  const [zoom, setZoom] = useState(1);

  if (!basicBlocks || basicBlocks.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No Basic Blocks or CFG generated yet. Run compilation to partition Three-Address Code into basic blocks.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <GitBranch size={18} color="var(--primary-blue)" />
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            Control Flow Graph (CFG) & Basic Blocks
          </span>
          <span style={{ fontSize: '12px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
            {basicBlocks.length} Blocks
          </span>
          <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
            {cfgData.edges?.length || 0} Directed Edges
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setZoom(Math.max(0.6, zoom - 0.1))} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '42px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(Math.min(1.8, zoom + 0.1))} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(1)} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* CFG Canvas */}
      <div style={{
        flex: 1,
        background: '#f8fafc',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '30px',
        overflow: 'auto',
        minHeight: '480px'
      }}>
        <div style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {basicBlocks.map((block, idx) => {
            const outgoingEdges = cfgData.edges?.filter(e => e.from === block.id) || [];

            return (
              <div key={block.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '480px' }}>
                {/* Block Card */}
                <div style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '2px solid #3b82f6',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                  overflow: 'hidden'
                }}>
                  {/* Block Header */}
                  <div style={{
                    background: 'linear-gradient(90deg, #1d64f2 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}>
                    <span>Basic Block {block.id}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                      {block.instructions.length} instrs
                    </span>
                  </div>

                  {/* Block Instructions */}
                  <div style={{ padding: '14px 18px', background: '#ffffff' }}>
                    {block.instructions.map((inst, i) => (
                      <div
                        key={i}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px',
                          color: '#1e293b',
                          padding: '4px 0',
                          borderBottom: i < block.instructions.length - 1 ? '1px dashed #f1f5f9' : 'none'
                        }}
                      >
                        <span style={{ color: '#94a3b8', marginRight: '10px', fontSize: '11px' }}>{i + 1}</span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>

                  {/* Block Connectors (Predecessors & Successors) */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '6px 16px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#64748b'
                  }}>
                    <div>
                      <strong>Preds:</strong> {block.predecessors?.length ? block.predecessors.join(', ') : 'Entry'}
                    </div>
                    <div>
                      <strong>Succs:</strong> {block.successors?.length ? block.successors.join(', ') : 'Exit'}
                    </div>
                  </div>
                </div>

                {/* Outgoing Edge Indicators */}
                {outgoingEdges.length > 0 && (
                  <div style={{ display: 'flex', gap: '20px', margin: '8px 0', alignItems: 'center' }}>
                    {outgoingEdges.map((edge, edgeIdx) => {
                      const isTrue = edge.label === 'true';
                      const isFalse = edge.label === 'false';
                      const color = isTrue ? '#16a34a' : (isFalse ? '#dc2626' : '#2563eb');
                      const bg = isTrue ? '#dcfce7' : (isFalse ? '#fee2e2' : '#e0ecfe');

                      return (
                        <div key={edgeIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color,
                            background: bg,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            border: `1px solid ${color}`
                          }}>
                            {edge.label} → {edge.to}
                          </span>
                          <ArrowDown size={18} color={color} style={{ marginTop: '2px' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
