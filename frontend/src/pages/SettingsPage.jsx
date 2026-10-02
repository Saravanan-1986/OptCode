import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Server, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Save, 
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import axios from 'axios';

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || 'Admira');
  const [role, setRole] = useState(user?.role || 'Compiler Researcher');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/health');
        setBackendHealth(res.data);
      } catch (err) {
        setBackendHealth({ status: 'offline', database: 'disconnected' });
      }
    };
    checkHealth();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authService.updateProfile({ name, avatar });
      if (res.success) {
        updateUserProfile(res.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>
      
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)' }}>
          System & Account Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
          Configure compiler parameters, inspect database services, and manage your researcher profile.
        </p>
      </div>

      {/* Account Settings Card */}
      <div className="card-base" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary-blue)" />
          <span>Researcher Profile</span>
        </h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d64f2 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(29, 100, 242, 0.25)'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-heading)' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
                Research Role / Academic Affiliation
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
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
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>
              Avatar URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
            >
              <Save size={16} />
              <span>{savedSuccess ? 'Profile Saved!' : (isSaving ? 'Saving...' : 'Save Changes')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Services and Infrastructure Card */}
      <div className="card-base" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--primary-blue)" />
          <span>Services & Compiler Infrastructure</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Database size={16} color="#059669" />
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-heading)' }}>MongoDB Server</span>
            </div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
              {backendHealth?.database === 'connected' ? 'Connected (127.0.0.1:27017)' : 'Pending'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Compass inspection ready
            </div>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Server size={16} color="var(--primary-blue)" />
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-heading)' }}>Node.js / Express</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 700 }}>
              Port 8081 (Active)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              REST API & JWT Security
            </div>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={16} color="#9333ea" />
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-heading)' }}>Python Engine</span>
            </div>
            <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: 700 }}>
              Python 3.13 (Connected)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              8 Optimization Passes
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
