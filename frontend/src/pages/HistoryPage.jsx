import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Terminal, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Columns, 
  CheckCircle,
  FileCode,
  Zap,
  TrendingDown
} from 'lucide-react';
import { historyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SplitCompareViewer from '../components/SplitCompareViewer';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);
  const [compareRunA, setCompareRunA] = useState(null);
  const [compareRunB, setCompareRunB] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await historyService.getAll();
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this history record?')) {
      await historyService.delete(id);
      fetchHistory();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all compilation history?')) {
      await historyService.clear();
      fetchHistory();
    }
  };

  const handleOpenInCompiler = (record) => {
    navigate('/compiler', {
      state: {
        project: {
          _id: record.projectId,
          name: record.projectName,
          sourceCode: record.sourceCode
        }
      }
    });
  };

  const handleTriggerCompare = (run) => {
    if (!compareRunA) {
      setCompareRunA(run);
    } else if (compareRunA._id === run._id) {
      setCompareRunA(null);
    } else {
      setCompareRunB(run);
      setShowCompareModal(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>
            Compilation & Optimization History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Inspect past optimization runs, instruction reduction rates, and compare pipeline runs side-by-side.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-secondary"
            style={{ color: '#ef4444', fontSize: '13px' }}
          >
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {compareRunA && !showCompareModal && (
        <div style={{
          background: 'var(--primary-blue-light)',
          border: '1.5px solid var(--primary-blue-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 700 }}>
            Run Selected: "{compareRunA.projectName}". Select a second run to compare side-by-side.
          </span>
          <button onClick={() => setCompareRunA(null)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* History Items List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="card-base" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <HistoryIcon size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>No compilation history yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', marginBottom: '20px' }}>
            Run the compiler from the studio to automatically generate history records.
          </p>
          <button onClick={() => navigate('/compiler')} className="btn-primary">
            <Terminal size={16} />
            <span>Open Compiler</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map((record, idx) => {
            const runNumber = history.length - idx;
            const isRunA = compareRunA?._id === record._id;

            return (
              <div
                key={record._id}
                className="card-base"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  border: isRunA ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                  background: isRunA ? 'var(--primary-blue-light)' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Left Run Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: 'var(--text-heading)'
                  }}>
                    <span>#{runNumber}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>
                      {record.projectName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <Clock size={13} />
                      <span>{new Date(record.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Center Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flex: 1, justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Original IR</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                      {record.irBeforeCount} instrs
                    </div>
                  </div>

                  <ArrowRight size={18} color="#94a3b8" />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Optimized IR</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                      {record.irAfterCount} instrs
                    </div>
                  </div>

                  <div style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingDown size={15} />
                    <span>{record.reductionPercentage}% Reduction</span>
                  </div>

                  <div style={{
                    background: 'var(--primary-blue-light)',
                    color: 'var(--primary-blue)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '12.5px'
                  }}>
                    {record.optimizationsCount} Optimizations
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleTriggerCompare(record)}
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12.5px' }}
                  >
                    <Columns size={15} />
                    <span>{isRunA ? 'Selected' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenInCompiler(record)}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12.5px' }}
                  >
                    <Terminal size={15} />
                    <span>Restore & Open</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(record._id, e)}
                    className="header-icon-btn"
                    title="Delete Run"
                    style={{ width: '34px', height: '34px', color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareRunA && compareRunB && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '1100px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Run Comparison: {compareRunA.projectName} vs {compareRunB.projectName}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Compare source code and intermediate representation side-by-side
                </span>
              </div>
              <button
                onClick={() => { setShowCompareModal(false); setCompareRunA(null); setCompareRunB(null); }}
                className="btn-secondary"
              >
                Close Comparison
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Run A */}
                <div className="card-base" style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: 'var(--primary-blue)' }}>
                    Run 1: {compareRunA.projectName} ({new Date(compareRunA.createdAt).toLocaleDateString()})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    IR: {compareRunA.irBeforeCount} → {compareRunA.irAfterCount} ({compareRunA.reductionPercentage}% reduction)
                  </div>
                  <pre style={{
                    background: '#1e2430',
                    color: '#f8fafc',
                    padding: '14px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    maxHeight: '340px',
                    overflow: 'auto'
                  }}>
                    {compareRunA.sourceCode}
                  </pre>
                </div>

                {/* Run B */}
                <div className="card-base" style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#059669' }}>
                    Run 2: {compareRunB.projectName} ({new Date(compareRunB.createdAt).toLocaleDateString()})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    IR: {compareRunB.irBeforeCount} → {compareRunB.irAfterCount} ({compareRunB.reductionPercentage}% reduction)
                  </div>
                  <pre style={{
                    background: '#1e2430',
                    color: '#f8fafc',
                    padding: '14px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    maxHeight: '340px',
                    overflow: 'auto'
                  }}>
                    {compareRunB.sourceCode}
                  </pre>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
