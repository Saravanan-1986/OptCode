import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Lightbulb, 
  HelpCircle, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  Clock,
  Layers,
  FileCode,
  TrendingDown,
  Plus,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { statsService, projectService, historyService } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes, histRes] = await Promise.all([
          statsService.getDashboardStats().catch(() => ({ success: false })),
          projectService.getAll().catch(() => ({ success: false })),
          historyService.getAll().catch(() => ({ success: false }))
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (projRes.success) setProjects(projRes.projects || []);
        if (histRes.success) setRecentRuns(histRes.history?.slice(0, 5) || []);
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real date generation for the current week
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = [];
  for (let i = 3; i >= -3; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    calendarDays.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      isToday: d.toDateString() === today.toDateString()
    });
  }

  const currentMonthYear = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Greeting Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>
            Good morning, {user?.name || 'Researcher'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Analyze, optimize, and inspect your intermediate compiler representations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/settings')}
            className="btn-outline-blue"
          >
            Account settings
          </button>
          <button 
            onClick={() => navigate('/compiler')}
            className="btn-primary"
          >
            <Terminal size={17} />
            <span>Open Compiler</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column + Right Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '28px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Action Cards (3 cards matching reference aesthetic) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            {/* Card 1: Rich Blue */}
            <div 
              onClick={() => navigate('/compiler')}
              style={{
                background: 'linear-gradient(145deg, #1d64f2 0%, #2563eb 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                cursor: 'pointer',
                boxShadow: '0 10px 20px -5px rgba(29, 100, 242, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '170px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Compiler Studio</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>8 optimization passes</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Lightbulb size={28} color="#ffffff" />
                </div>
              </div>
            </div>

            {/* Card 2: Turquoise / Cyan Gradient with Circular Percentage */}
            <div 
              onClick={() => navigate('/history')}
              style={{
                background: 'linear-gradient(145deg, #0ea5e9 0%, #14b8a6 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                cursor: 'pointer',
                boxShadow: '0 10px 20px -5px rgba(20, 184, 166, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '170px',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Average Reduction</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>
                  {stats?.totalCompilations ? `${stats.totalCompilations} runs recorded` : 'No runs yet'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px',
                  color: '#ffffff'
                }}>
                  {stats?.averageReductionPercentage !== undefined ? `${stats.averageReductionPercentage}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Card 3: Soft Purple / Lavender */}
            <div 
              onClick={() => navigate('/documentation')}
              style={{
                background: 'linear-gradient(145deg, #818cf8 0%, #a78bfa 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 18px',
                cursor: 'pointer',
                boxShadow: '0 10px 20px -5px rgba(129, 140, 248, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '170px',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Compiler Guide</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>AST, TAC & CFG reference</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <HelpCircle size={28} color="#ffffff" />
                </div>
              </div>
            </div>

          </div>

          {/* Active Projects List (Dynamic from MongoDB) */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                  My Projects
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {projects.length} saved projects in database
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => navigate('/projects')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  See all projects
                </button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '30px 16px',
                background: 'var(--bg-hover)',
                borderRadius: 'var(--radius-md)'
              }}>
                <FolderPlus size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
                  No projects created yet
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '14px' }}>
                  Create your first compiler project or launch the studio to test code.
                </p>
                <button
                  onClick={() => navigate('/projects')}
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <Plus size={15} />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    onClick={() => navigate('/compiler', { state: { project: p } })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-hover)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'var(--primary-blue-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-blue)'
                      }}>
                        <FileCode size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {p.languageVersion || 'C-Like v1.0'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                      <ArrowRight size={15} color="var(--primary-blue)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Bar Chart (Dynamic from MongoDB) */}
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>
                Weekly Compilation Activity
              </h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-blue)', background: 'var(--primary-blue-light)', padding: '3px 9px', borderRadius: '6px' }}>
                {currentMonthYear}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '22px', padding: '0 10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>8+</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {(stats?.weeklyActivity || [
                { day: 'Sun', compilations: 0, height: 10 },
                { day: 'Mon', compilations: 0, height: 10 },
                { day: 'Tue', compilations: 0, height: 10 },
                { day: 'Wed', compilations: 0, height: 10 },
                { day: 'Thu', compilations: 0, height: 10 },
                { day: 'Fri', compilations: 0, height: 10 },
                { day: 'Sat', compilations: 0, height: 10 }
              ]).map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '14px',
                    height: '100%',
                    background: '#e0ecfe',
                    borderRadius: '10px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(10, Math.min(100, item.compilations * 25))}%`,
                      background: item.compilations > 0 ? 'var(--primary-blue)' : '#cbd5e1',
                      borderRadius: '10px',
                      transition: 'height 0.4s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Calendar Widget (Current Real Dates) */}
          <div className="card-base" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '18px' }}>
              {currentMonthYear}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '8px' }}>
              {calendarDays.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{c.day}</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: c.isToday ? 800 : 500,
                    background: c.isToday ? 'var(--primary-blue)' : 'transparent',
                    color: c.isToday ? '#ffffff' : 'var(--text-main)',
                    boxShadow: c.isToday ? '0 2px 8px rgba(29, 100, 242, 0.3)' : 'none'
                  }}>
                    {c.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Compilation Runs (Dynamic from MongoDB) */}
          <div className="card-base" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
                Recent Compilations
              </h3>
              <button
                onClick={() => navigate('/history')}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                View History
              </button>
            </div>

            {recentRuns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                <Clock size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>No compilations yet</div>
                <div style={{ fontSize: '12px', marginTop: '2px' }}>
                  Compile code in the studio to populate history.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentRuns.map((run, idx) => (
                  <div key={run._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: 'var(--text-heading)',
                        flexShrink: 0
                      }}>
                        #{recentRuns.length - idx}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-heading)' }}>
                          {run.projectName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {run.optimizationsCount} opts • {run.reductionPercentage}% reduction
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
