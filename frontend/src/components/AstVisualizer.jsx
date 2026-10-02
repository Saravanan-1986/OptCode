import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Code, 
  Network,
  Maximize2
} from 'lucide-react';

// Color map for AST node types
const NODE_COLORS = {
  Program: { bg: '#e0ecfe', border: '#1d64f2', text: '#1d4ed8' },
  VarDecl: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
  Assignment: { bg: '#fef3c7', border: '#d97706', text: '#b45309' },
  BinaryExpression: { bg: '#f3e8ff', border: '#9333ea', text: '#7e22ce' },
  UnaryExpression: { bg: '#fae8ff', border: '#c026d3', text: '#a21caf' },
  Literal: { bg: '#ffedd5', border: '#ea580c', text: '#c2410c' },
  Identifier: { bg: '#e2e8f0', border: '#64748b', text: '#334155' },
  IfStatement: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
  WhileStatement: { bg: '#cffafe', border: '#0891b2', text: '#0e7490' },
  ForStatement: { bg: '#ccfbf1', border: '#0d9488', text: '#0f766e' },
  Block: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569' },
  PrintStatement: { bg: '#e0e7ff', border: '#4f46e5', text: '#3730a3' },
  Default: { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' }
};

function ASTTreeNode({ node, level = 0 }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const colors = NODE_COLORS[node.type] || NODE_COLORS.Default;

  return (
    <div style={{ marginLeft: level === 0 ? 0 : '24px', marginTop: '8px' }}>
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '10px',
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          color: colors.text,
          fontSize: '13px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          cursor: hasChildren ? 'pointer' : 'default',
          transition: 'all 0.15s ease'
        }}
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </span>
        )}

        <span style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {node.type}
        </span>

        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {node.label || node.name || (node.value !== undefined ? String(node.value) : '')}
        </span>

        {node.line && (
          <span style={{ fontSize: '10.5px', opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
            L{node.line}
          </span>
        )}
      </div>

      {hasChildren && !collapsed && (
        <div style={{
          borderLeft: `2px dashed ${colors.border}`,
          marginLeft: '14px',
          paddingLeft: '6px'
        }}>
          {node.children.map((child, idx) => (
            <ASTTreeNode key={child.id || idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AstVisualizer({ astData, nodeCount }) {
  const [zoom, setZoom] = useState(1);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!astData || !astData.type) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No AST data available. Run compilation first to construct the Abstract Syntax Tree.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Visualizer Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            Abstract Syntax Tree (AST)
          </span>
          <span style={{ fontSize: '12px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
            {nodeCount || 0} Total Nodes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom controls */}
          <button
            onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '42px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(1.8, zoom + 0.1))}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>

          <div style={{ width: '1px', height: '22px', background: 'var(--border-light)', margin: '0 4px' }} />

          {/* Toggle Raw JSON */}
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className={showRawJson ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <Code size={15} />
            <span>{showRawJson ? 'Visual Tree' : 'Raw JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main AST Content Window */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        overflow: 'auto',
        minHeight: '480px'
      }}>
        {showRawJson ? (
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#0f172a',
            background: '#f8fafc',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto',
            lineHeight: '20px'
          }}>
            {JSON.stringify(astData, null, 2)}
          </pre>
        ) : (
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease',
            display: 'inline-block',
            minWidth: '100%'
          }}>
            <ASTTreeNode node={astData} />
          </div>
        )}
      </div>
    </div>
  );
}
