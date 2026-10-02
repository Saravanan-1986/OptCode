import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Terminal, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Zap, 
  Cpu, 
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <nav style={{
        padding: '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon-box">
            <Code2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)' }}>CodeOpt</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '72px 48px 60px',
        textAlign: 'center',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--primary-blue-light)',
          color: 'var(--primary-blue)',
          padding: '6px 16px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '13px'
        }}>
          <Sparkles size={16} />
          <span>Academic Compiler Design & Optimization Platform</span>
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          color: 'var(--text-heading)',
          letterSpacing: '-1px',
          lineHeight: '1.2'
        }}>
          Understand What Your Compiler Is Doing.
        </h1>

        <p style={{
          fontSize: '17px',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          lineHeight: '28px'
        }}>
          Analyze source code, inspect intermediate representations, and visualize compiler optimization passes step-by-step. Real algorithms, zero fake data.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}>
            <Terminal size={18} />
            <span>Create Account & Start</span>
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 24px', fontSize: '15px', textDecoration: 'none' }}>
            <span>Sign In</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 3 Core Highlight Cards */}
      <section style={{ padding: '0 48px 60px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Every Stage Visualized
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '20px' }}>
              Inspect Tokens, Parse Tree, interactive AST graph, Symbol Table, Three-Address Code, Basic Blocks, and Control Flow Graphs.
            </p>
          </div>

          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              8 Modular Optimization Passes
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '20px' }}>
              Constant Folding, Constant Propagation, Algebraic Simplification, Copy Propagation, CSE, Strength Reduction, and Dead Code Elimination.
            </p>
          </div>

          <div className="card-base" style={{ padding: '24px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Step-Through Execution
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '20px' }}>
              Interactive guided tour walking students and faculty through each phase with detailed explanations and split-screen before/after comparisons.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-light)',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div>CodeOpt Compiler Optimization Engine</div>
        <div>C-Like Language Subset • Python 3 Engine • Node/MongoDB API</div>
      </footer>
    </div>
  );
}
