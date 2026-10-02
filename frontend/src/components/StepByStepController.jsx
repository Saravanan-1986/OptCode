import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

const STAGES = [
  {
    step: 1,
    name: 'Lexical Analysis',
    tab: 'tokens',
    desc: 'Converts raw source characters into meaningful lexical tokens (keywords, identifiers, numbers, operators).'
  },
  {
    step: 2,
    name: 'Syntax Parsing',
    tab: 'parsetree',
    desc: 'Validates grammar using recursive descent, ensuring correct language rules and structural syntax.'
  },
  {
    step: 3,
    name: 'AST Construction',
    tab: 'ast',
    desc: 'Builds the Abstract Syntax Tree representing the hierarchical programmatic structure of expressions and control statements.'
  },
  {
    step: 4,
    name: 'Semantic Analysis',
    tab: 'semantic',
    desc: 'Validates scopes, variable declarations, detects undefined variables, type mismatches, and constructs the Symbol Table.'
  },
  {
    step: 5,
    name: 'IR Generation',
    tab: 'ir',
    desc: 'Generates linear Three-Address Code (TAC) with temporaries (t1, t2...) and decomposes control flow into Basic Blocks.'
  },
  {
    step: 6,
    name: 'Optimization Passes',
    tab: 'optimization',
    desc: 'Applies Constant Folding, Constant Propagation, Algebraic Simplification, CSE, Strength Reduction, and Dead Code Elimination.'
  },
  {
    step: 7,
    name: 'Code Generation',
    tab: 'codegen',
    desc: 'Reconstructs clean, optimized C-like source code and produces comparative academic compiler metrics.'
  }
];

export default function StepByStepController({ currentStage, onSelectStage, onRunAll }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStage < 7) {
          onSelectStage(currentStage + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStage, onSelectStage]);

  const activeStageObj = STAGES[currentStage - 1] || STAGES[0];

  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid var(--primary-blue-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      boxShadow: '0 4px 16px rgba(29, 100, 242, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Stepper Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--primary-blue)',
            color: '#ffffff',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12px'
          }}>
            {activeStageObj.step}
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-heading)' }}>
              Step {activeStageObj.step} of 7: {activeStageObj.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
              Academic Pipeline Tour
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onSelectStage(Math.max(1, currentStage - 1))}
            disabled={currentStage <= 1}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '13px', opacity: currentStage <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-outline-blue"
            style={{ padding: '6px 14px', fontSize: '13px' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => onSelectStage(Math.min(7, currentStage + 1))}
            disabled={currentStage >= 7}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px', opacity: currentStage >= 7 ? 0.5 : 1 }}
          >
            <span>Next Stage</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Progress Dots / Steps */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {STAGES.map((s) => {
          const isPassed = s.step < currentStage;
          const isCurrent = s.step === currentStage;

          return (
            <button
              key={s.step}
              onClick={() => onSelectStage(s.step)}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: isCurrent ? 'var(--primary-blue)' : (isPassed ? '#93c5fd' : '#e2e8f0'),
                transition: 'all 0.2s ease'
              }}
              title={`Step ${s.step}: ${s.name}`}
            />
          );
        })}
      </div>

      {/* Explanation Subtext */}
      <div style={{
        fontSize: '12.5px',
        color: 'var(--text-muted)',
        background: 'var(--bg-hover)',
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Sparkles size={16} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
        <span>{activeStageObj.desc}</span>
      </div>
    </div>
  );
}
