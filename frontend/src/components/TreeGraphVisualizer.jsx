import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Code, 
  Maximize2, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

const NODE_THEMES = {
  Program: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8', badgeBg: '#dbeafe', badgeText: '#1e40af' },
  VarDecl: { bg: '#ecfdf5', border: '#10b981', text: '#047857', badgeBg: '#d1fae5', badgeText: '#065f46' },
  Assignment: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', badgeBg: '#fef3c7', badgeText: '#92400e' },
  BinaryExpression: { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', badgeBg: '#f3e8ff', badgeText: '#6b21a8' },
  UnaryExpression: { bg: '#fdf4ff', border: '#d946ef', text: '#a21caf', badgeBg: '#fae8ff', badgeText: '#86198f' },
  Literal: { bg: '#fff7ed', border: '#f97316', text: '#c2410c', badgeBg: '#ffedd5', badgeText: '#9a3412' },
  Identifier: { bg: '#f8fafc', border: '#64748b', text: '#334155', badgeBg: '#e2e8f0', badgeText: '#1e293b' },
  IfStatement: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', badgeBg: '#fee2e2', badgeText: '#991b1b' },
  Condition: { bg: '#fef2f2', border: '#f87171', text: '#dc2626', badgeBg: '#fee2e2', badgeText: '#991b1b' },
  ThenBranch: { bg: '#ecfdf5', border: '#34d399', text: '#059669', badgeBg: '#d1fae5', badgeText: '#065f46' },
  ElseBranch: { bg: '#fff1f2', border: '#fb7185', text: '#e11d48', badgeBg: '#ffe4e6', badgeText: '#9f1239' },
  WhileStatement: { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490', badgeBg: '#cffafe', badgeText: '#155e75' },
  ForStatement: { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e', badgeBg: '#ccfbf1', badgeText: '#115e59' },
  Block: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', badgeBg: '#e2e8f0', badgeText: '#334155' },
  PrintStatement: { bg: '#eef2ff', border: '#6366f1', text: '#4338ca', badgeBg: '#e0e7ff', badgeText: '#3730a3' },
  Default: { bg: '#ffffff', border: '#cbd5e1', text: '#334155', badgeBg: '#f1f5f9', badgeText: '#475569' }
};

function TreeNodeCard({ node, isRoot = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const theme = NODE_THEMES[node.type] || NODE_THEMES.Default;
  const children = node.children || [];
  const hasChildren = children.length > 0;

  const nodeLabel = node.label || node.name || (node.value !== undefined ? String(node.value) : node.type);

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      margin: '0 12px'
    }}>
      {/* Node Box */}
      <div 
        onClick={() => hasChildren && setCollapsed(!collapsed)}
        style={{
          background: theme.bg,
          border: `2px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '8px 14px',
          minWidth: '120px',
          maxWidth: '220px',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          cursor: hasChildren ? 'pointer' : 'default',
          position: 'relative',
          zIndex: 2,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        onMouseEnter={(e) => hasChildren && (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => hasChildren && (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {/* Node Type Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: theme.badgeBg,
            color: theme.badgeText,
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {node.type || 'Node'}
          </span>
          {node.line && (
            <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              L{node.line}
            </span>
          )}
        </div>

        {/* Node Label / Value */}
        <div style={{
          fontSize: '12.5px',
          fontWeight: 700,
          color: '#0f172a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {nodeLabel}
        </div>

        {/* Child count & toggle indicator */}
        {hasChildren && (
          <div style={{
            marginTop: '4px',
            fontSize: '10px',
            fontWeight: 700,
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}>
            <span>{collapsed ? `+${children.length} hidden` : `${children.length} branches`}</span>
          </div>
        )}
      </div>

      {/* Children branches and connecting tree lines */}
      {hasChildren && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Vertical line coming out of parent node */}
          <div style={{ width: '2px', height: '20px', background: '#94a3b8' }} />

          {/* Children container with connecting crossbar */}
          <div style={{
            display: 'flex',
            position: 'relative',
            justifyContent: 'center',
            paddingTop: '16px'
          }}>
            {/* Horizontal connector line across all children */}
            {children.length > 1 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50px',
                right: '50px',
                height: '2px',
                background: '#94a3b8'
              }} />
            )}

            {children.map((child, idx) => (
              <div key={child.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Vertical line going into this child */}
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  width: '2px',
                  height: '16px',
                  background: '#94a3b8'
                }} />

                <TreeNodeCard node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeGraphVisualizer({ title, treeData, count, rawJson }) {
  const [zoom, setZoom] = useState(1);
  const [showJson, setShowJson] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('pre')) return;
    setIsPanning(true);
    setStartPos({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleReset = () => {
    setZoom(1);
    setPanPos({ x: 0, y: 0 });
  };

  if (!treeData || (!treeData.type && !treeData.name)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No {title || 'tree'} data available. Run the compiler to construct this stage.
      </div>
    );
  }

  // Ensure root node has standard keys
  const normalizedRoot = {
    ...treeData,
    type: treeData.type || treeData.name || 'Root',
    label: treeData.label || treeData.name || treeData.type || 'Program'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      
      {/* Top Controls Toolbar */}
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
          <Layers size={18} color="var(--primary-blue)" />
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)' }}>
            {title || 'Visual Tree Diagram'}
          </span>
          {count !== undefined && (
            <span style={{ fontSize: '11px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
              {count} Nodes
            </span>
          )}
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            (Drag canvas to pan • Click any node to collapse/expand)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="btn-secondary" style={{ padding: '6px 10px' }} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '42px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(Math.min(2.0, zoom + 0.1))} className="btn-secondary" style={{ padding: '6px 10px' }} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '6px 10px' }} title="Reset View">
            <RotateCcw size={16} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 4px' }} />

          <button
            onClick={() => setShowJson(!showJson)}
            className={showJson ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '12.5px' }}
          >
            <Code size={15} />
            <span>{showJson ? 'Tree Diagram' : 'Raw JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main Tree Canvas Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          flex: 1,
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '520px',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {showJson ? (
          <div style={{ padding: '20px', height: '100%', overflow: 'auto', cursor: 'default' }}>
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              color: '#1e293b',
              background: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              lineHeight: '20px'
            }}>
              {JSON.stringify(rawJson || treeData, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{
            transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoom})`,
            transformOrigin: 'top center',
            transition: isPanning ? 'none' : 'transform 0.1s ease',
            padding: '40px 60px',
            display: 'flex',
            justifyContent: 'center',
            minWidth: '100%'
          }}>
            <TreeNodeCard node={normalizedRoot} isRoot={true} />
          </div>
        )}
      </div>

    </div>
  );
}
