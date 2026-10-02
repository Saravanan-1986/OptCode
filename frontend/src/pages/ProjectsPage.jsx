import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Terminal, 
  Copy, 
  Trash2, 
  Clock, 
  Search, 
  Code2,
  FileText
} from 'lucide-react';
import { projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (err) {
      console.warn('Failed to load projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await projectService.create({
        name: newProjectName,
        description: newProjectDesc
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
        fetchProjects();
        navigate('/compiler', { state: { project: res.project } });
      }
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectService.delete(id);
      fetchProjects();
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    await projectService.duplicate(id);
    fetchProjects();
  };

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>
            Optimization Projects
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Manage, duplicate, and load your academic compiler optimization codebases.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        maxWidth: '420px',
        gap: '10px'
      }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Filter projects by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="card-base" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FolderKanban size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>No projects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', marginBottom: '20px' }}>
            Get started by creating your first compiler optimization project.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus size={16} />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((proj) => (
            <div
              key={proj._id}
              className="card-base"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                minHeight: '190px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onClick={() => navigate('/compiler', { state: { project: proj } })}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--primary-blue-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-blue)'
                    }}>
                      <Code2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {proj.name}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {proj.languageVersion || 'C-Like v1.0'}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '18px' }}>
                  {proj.description || 'Academic compiler optimization experiment'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '12px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => handleDuplicate(proj._id, e)}
                    className="header-icon-btn"
                    title="Duplicate Project"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(proj._id, e)}
                    className="header-icon-btn"
                    title="Delete Project"
                    style={{ width: '32px', height: '32px', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => navigate('/compiler', { state: { project: proj } })}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Terminal size={14} />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Create New Optimization Project
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Set up a new C-like source file to test and benchmark optimization passes.
            </p>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Constant Folding Demo"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Benchmarking DCE and Algebraic simplification"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
