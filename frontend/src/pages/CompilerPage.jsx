import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  Layers, 
  Cpu, 
  Save, 
  RotateCcw, 
  FolderOpen, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  GitBranch,
  Columns,
  Table,
  FileCode,
  BarChart3,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { compilerService, projectService } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import AstVisualizer from '../components/AstVisualizer';
import TreeGraphVisualizer from '../components/TreeGraphVisualizer';
import CfgVisualizer from '../components/CfgVisualizer';
import OptimizationPassViewer from '../components/OptimizationPassViewer';
import SplitCompareViewer from '../components/SplitCompareViewer';
import StepByStepController from '../components/StepByStepController';

// Pre-packaged academic example programs
const SAMPLE_PROGRAMS = {
  combined: {
    name: 'Combined Optimization Demo',
    code: `// Academic Compiler Optimization Benchmark
int x = 10 * 20;
int y = x + 0;
int z = y * 1;

int unused = 500;

if (false) {
    int dead_branch = 999;
}

print(z);`
  },
  folding: {
    name: 'Constant Folding Demo',
    code: `// Constant Folding: Expressions evaluated at compile time
int a = 100 * 2;
int b = 45 + 55;
float pi_approx = 22.0 / 7.0;
bool check = 10 > 5 && true;
print(a);`
  },
  propagation: {
    name: 'Constant Propagation Demo',
    code: `// Constant Propagation: Known values forwarded to usages
int speed = 60;
int time = 2;
int distance = speed * time;
int margin = 5;
int total = distance + margin;
print(total);`
  },
  algebraic: {
    name: 'Algebraic Simplification Demo',
    code: `// Algebraic Simplification: Mathematical identity rules
int val = 42;
int a = val + 0;
int b = val - 0;
int c = val * 1;
int d = val * 0;
int e = val / 1;
print(a);`
  },
  cse: {
    name: 'Common Subexpression Elimination',
    code: `// Common Subexpression Elimination (CSE)
int x = 5;
int y = 8;
int expr1 = x * y;
int expr2 = x * y;
int total = expr1 + expr2;
print(total);`
  },
  dead_code: {
    name: 'Dead Code Elimination',
    code: `// Dead Code Elimination: Unused assignments eliminated
int live_var = 100;
int discarded_calc = 99 * 88;
int unused_buffer = 1024;
print(live_var);`
  },
  strength: {
    name: 'Strength Reduction Demo',
    code: `// Strength Reduction: Expensive ops replaced with cheaper additions
int count = 15;
int doubled = count * 2;
int multiplied = 2 * count;
print(doubled);`
  },
  loops: {
    name: 'Loop & CFG Optimization Demo',
    code: `// Control Flow Graph & Loops
int sum = 0;
for (int i = 0; i < 5; i = i + 1) {
    sum = sum + i;
}
print(sum);`
  }
};

export default function CompilerPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('Optimization Demo');
  const [projectId, setProjectId] = useState(null);
  const [sourceCode, setSourceCode] = useState(SAMPLE_PROGRAMS.combined.code);
  const [activeTab, setActiveTab] = useState('tokens');
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompiling, setIsCompiling] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Compiler results state
  const [compileResult, setCompileResult] = useState(null);
  const [compileError, setCompileError] = useState(null);

  // Check if project passed via route state
  useEffect(() => {
    if (location.state?.project) {
      const p = location.state.project;
      setProjectId(p._id);
      setProjectName(p.name);
      setSourceCode(p.sourceCode);
    }
  }, [location.state]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile();
  }, []);

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileError(null);

    try {
      const res = await compilerService.compile(sourceCode, projectId, projectName, !!user);
      setCompileResult(res);

      if (!res.success && res.errors?.length > 0) {
        setCompileError(res.errors[0]);
      } else {
        setCompileError(null);
      }
    } catch (err) {
      setCompileError({
        message: err.response?.data?.message || err.message || 'Internal compiler error',
        line: 1,
        column: 1
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSaveProject = async () => {
    if (!user) {
      alert('Please log in to save your compiler projects to the cloud database.');
      return;
    }

    try {
      if (projectId) {
        await projectService.update(projectId, {
          name: projectName,
          sourceCode
        });
      } else {
        const created = await projectService.create({
          name: projectName,
          sourceCode
        });
        if (created.project) {
          setProjectId(created.project._id);
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save project: ' + err.message);
    }
  };

  const handleSelectStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    const stepTabMap = {
      1: 'tokens',
      2: 'parsetree',
      3: 'ast',
      4: 'semantic',
      5: 'ir',
      6: 'optimization',
      7: 'codegen'
    };
    if (stepTabMap[stepNumber]) {
      setActiveTab(stepTabMap[stepNumber]);
    }
  };

  const handleLoadSample = (key) => {
    if (SAMPLE_PROGRAMS[key]) {
      setSourceCode(SAMPLE_PROGRAMS[key].code);
      setProjectName(SAMPLE_PROGRAMS[key].name);
      setTimeout(handleCompile, 50);
    }
  };

  const handleCopyOptimizedCode = () => {
    if (compileResult?.optimizedCode) {
      navigator.clipboard.writeText(compileResult.optimizedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const tabs = [
    { id: 'tokens', label: 'Tokens', count: compileResult?.tokens?.length },
    { id: 'parsetree', label: 'Parse Tree' },
    { id: 'ast', label: 'AST', count: compileResult?.astNodeCount },
    { id: 'semantic', label: 'Semantic Analysis' },
    { id: 'symboltable', label: 'Symbol Table', count: compileResult?.symbolTable?.length },
    { id: 'ir', label: 'IR (TAC)', count: compileResult?.irBefore?.length },
    { id: 'basicblocks', label: 'Basic Blocks', count: compileResult?.basicBlocks?.length },
    { id: 'cfg', label: 'CFG' },
    { id: 'optimization', label: 'Optimization Passes', count: compileResult?.optimizationPasses?.length },
    { id: 'optir', label: 'Optimized IR', count: compileResult?.irAfter?.length },
    { id: 'codegen', label: 'Generated Code' },
    { id: 'compare', label: 'Split Compare' },
    { id: 'statistics', label: 'Final Report' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '850px' }}>
      
      {/* Top Studio Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: '#ffffff',
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Project Name and Preset selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={20} color="var(--primary-blue)" />
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Title"
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--text-heading)',
                border: '1px solid transparent',
                borderRadius: '8px',
                padding: '4px 8px',
                outline: 'none',
                maxWidth: '240px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Sample:</span>
            <select
              onChange={(e) => handleLoadSample(e.target.value)}
              defaultValue="combined"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-hover)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-heading)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="combined">Combined Academic Demo</option>
              <option value="folding">Constant Folding Demo</option>
              <option value="propagation">Constant Propagation Demo</option>
              <option value="algebraic">Algebraic Simplification Demo</option>
              <option value="cse">Common Subexpression Elimination</option>
              <option value="dead_code">Dead Code Elimination</option>
              <option value="strength">Strength Reduction Demo</option>
              <option value="loops">Loop & CFG Optimization</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <button
            onClick={() => setStepMode(!stepMode)}
            className={stepMode ? 'btn-primary' : 'btn-outline-blue'}
            style={{ fontSize: '13px' }}
          >
            <Sparkles size={16} />
            <span>{stepMode ? 'Exit Tour' : 'Step Through Compiler'}</span>
          </button>

          <button
            onClick={handleSaveProject}
            className="btn-secondary"
            style={{ fontSize: '13px' }}
          >
            <Save size={16} color={saveSuccess ? '#10b981' : undefined} />
            <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={() => setSourceCode(SAMPLE_PROGRAMS.combined.code)}
            className="btn-secondary"
            title="Reset to default code"
            style={{ padding: '8px 12px' }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="btn-primary"
            style={{ fontSize: '14px', minWidth: '150px' }}
          >
            <Play size={16} />
            <span>{isCompiling ? 'Compiling...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Controller (Active when Step Mode is toggled) */}
      {stepMode && (
        <StepByStepController
          currentStage={currentStep}
          onSelectStage={handleSelectStep}
          onRunAll={handleCompile}
        />
      )}

      {/* Compiler Main Split Area: Code Editor (Left) & Pipeline Output (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr', gap: '22px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Source Code Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CodeEditor
            value={sourceCode}
            onChange={setSourceCode}
            errorLine={compileError?.line}
            errorColumn={compileError?.column}
            errorMessage={compileError?.message}
          />
        </div>

        {/* RIGHT COLUMN: Pipeline Tabs & Result View */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          
          {/* Pipeline Navigation Tabs Bar */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-hover)',
            borderBottom: '1px solid var(--border-light)',
            overflowX: 'auto',
            padding: '6px 8px 0 8px',
            gap: '4px'
          }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? 'var(--primary-blue)' : 'var(--text-muted)',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: isActive ? '2.5px solid var(--primary-blue)' : '2.5px solid transparent',
                    borderRadius: '8px 8px 0 0',
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span style={{
                      fontSize: '10.5px',
                      background: isActive ? 'var(--primary-blue-light)' : '#e2e8f0',
                      color: isActive ? 'var(--primary-blue)' : '#64748b',
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display Area */}
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto', minHeight: '520px' }}>
            
            {/* Error Banner if current compile failed */}
            {compileError && (
              <div style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                marginBottom: '16px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>
                    {compileError.type || 'Compilation Diagnostic'}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '2px' }}>
                    {compileError.message}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Location: Line {compileError.line}, Column {compileError.column}
                    {compileError.expected && ` | Expected: ${compileError.expected} | Actual: ${compileError.actual}`}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: TOKENS */}
            {activeTab === 'tokens' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                    Lexical Tokens Table
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Total Tokens: {compileResult?.tokens?.length || 0}
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Lexeme</th>
                        <th style={{ padding: '8px 12px' }}>Token Type</th>
                        <th style={{ padding: '8px 12px' }}>Line</th>
                        <th style={{ padding: '8px 12px' }}>Column</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compileResult?.tokens?.map((tok) => (
                        <tr key={tok.index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{tok.index}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0f172a' }}>{tok.lexeme}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: tok.type.includes('KEYWORD') ? '#dbeafe' : (tok.type.includes('LITERAL') || tok.type === 'INTEGER' ? '#dcfce7' : '#f1f5f9'),
                              color: tok.type.includes('KEYWORD') ? '#1e40af' : (tok.type.includes('LITERAL') || tok.type === 'INTEGER' ? '#166534' : '#475569'),
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {tok.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{tok.line}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{tok.column}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PARSE TREE */}
            {activeTab === 'parsetree' && (
              <TreeGraphVisualizer
                title="Concrete Syntax Tree (Parse Tree)"
                treeData={compileResult?.parseTree}
                rawJson={compileResult?.parseTree}
              />
            )}

            {/* TAB 3: AST */}
            {activeTab === 'ast' && (
              <TreeGraphVisualizer
                title="Abstract Syntax Tree (AST)"
                treeData={compileResult?.ast}
                count={compileResult?.astNodeCount}
                rawJson={compileResult?.ast}
              />
            )}

            {/* TAB 4: SEMANTIC ANALYSIS */}
            {activeTab === 'semantic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                  Semantic Analysis Diagnostics
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div className="card-base" style={{ padding: '16px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>Type Safety</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
                      {compileResult?.semanticAnalysis?.errors?.length === 0 ? 'Verified ✓' : 'Errors Found'}
                    </div>
                  </div>

                  <div className="card-base" style={{ padding: '16px', background: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>Scope Depth</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
                      {compileResult?.semanticAnalysis?.scopeCount || 1} Scopes
                    </div>
                  </div>

                  <div className="card-base" style={{ padding: '16px', background: '#fefce8', borderColor: '#fef08a' }}>
                    <div style={{ fontSize: '12px', color: '#a16207', fontWeight: 600 }}>Warnings</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#854d0e', marginTop: '4px' }}>
                      {compileResult?.semanticAnalysis?.warnings?.length || 0} Notices
                    </div>
                  </div>
                </div>

                {compileResult?.semanticAnalysis?.warnings?.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#854d0e', marginBottom: '8px' }}>
                      Semantic Notices & Dead Variables:
                    </h5>
                    {compileResult.semanticAnalysis.warnings.map((w, idx) => (
                      <div key={idx} style={{
                        background: '#fefce8',
                        border: '1px solid #fef08a',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#713f12',
                        marginBottom: '6px'
                      }}>
                        <strong>Line {w.line}:</strong> {w.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SYMBOL TABLE */}
            {activeTab === 'symboltable' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                    Scoped Symbol Table
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {compileResult?.symbolTable?.length || 0} Symbols
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px' }}>Name</th>
                        <th style={{ padding: '8px 12px' }}>Type</th>
                        <th style={{ padding: '8px 12px' }}>Scope</th>
                        <th style={{ padding: '8px 12px' }}>Initial Value</th>
                        <th style={{ padding: '8px 12px' }}>Line</th>
                        <th style={{ padding: '8px 12px' }}>Used?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compileResult?.symbolTable?.map((sym, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-heading)' }}>{sym.name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                              {sym.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{sym.scope}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{sym.initialValue}</td>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>L{sym.line}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ color: sym.isUsed ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                              {sym.isUsed ? 'Yes' : 'Unreferenced'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: IR (THREE-ADDRESS CODE) */}
            {activeTab === 'ir' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                    Generated Three-Address Code (TAC)
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {compileResult?.irBefore?.length || 0} TAC Instructions
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px', width: '50px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Instruction</th>
                        <th style={{ padding: '8px 12px' }}>Op</th>
                        <th style={{ padding: '8px 12px' }}>Arg1</th>
                        <th style={{ padding: '8px 12px' }}>Arg2</th>
                        <th style={{ padding: '8px 12px' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compileResult?.irBefore?.map((instr) => (
                        <tr key={instr.index} style={{ borderBottom: '1px solid #f1f5f9', fontFamily: 'var(--font-mono)' }}>
                          <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{instr.index}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>{instr.instruction}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--primary-blue)' }}>{instr.op}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{instr.arg1}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{instr.arg2}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{instr.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: BASIC BLOCKS */}
            {activeTab === 'basicblocks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                  Partitioned Basic Blocks
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {compileResult?.basicBlocks?.map((block) => (
                    <div key={block.id} style={{
                      background: '#ffffff',
                      border: '1.5px solid #3b82f6',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{
                        background: 'var(--primary-blue-light)',
                        padding: '8px 14px',
                        borderBottom: '1px solid #bfdbfe',
                        fontWeight: 800,
                        fontSize: '13px',
                        color: 'var(--primary-blue)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>Block {block.id}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>
                          {block.instructions.length} instrs
                        </span>
                      </div>
                      <div style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                        {block.instructions.map((inst, idx) => (
                          <div key={idx} style={{ padding: '3px 0' }}>{inst}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: CFG */}
            {activeTab === 'cfg' && (
              <CfgVisualizer
                basicBlocks={compileResult?.basicBlocks}
                cfgData={compileResult?.cfg}
              />
            )}

            {/* TAB 9: OPTIMIZATION PASSES */}
            {activeTab === 'optimization' && (
              <OptimizationPassViewer
                passes={compileResult?.optimizationPasses}
                initialIr={compileResult?.irBefore}
                finalIr={compileResult?.irAfter}
              />
            )}

            {/* TAB 10: OPTIMIZED IR */}
            {activeTab === 'optir' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                    Final Optimized Three-Address Code
                  </h4>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                    {compileResult?.irAfter?.length || 0} Instructions
                  </span>
                </div>

                <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px', width: '50px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>Instruction</th>
                        <th style={{ padding: '8px 12px' }}>Op</th>
                        <th style={{ padding: '8px 12px' }}>Arg1</th>
                        <th style={{ padding: '8px 12px' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compileResult?.irAfter?.map((instr) => (
                        <tr key={instr.index} style={{ borderBottom: '1px solid #f1f5f9', fontFamily: 'var(--font-mono)' }}>
                          <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{instr.index}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#047857' }}>{instr.instruction}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--primary-blue)' }}>{instr.op}</td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{instr.arg1}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{instr.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 11: GENERATED CODE */}
            {activeTab === 'codegen' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '14px' }}>
                    Generated Optimized C-Like Source Code
                  </h4>
                  <button
                    onClick={handleCopyOptimizedCode}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre style={{
                  background: '#1e2430',
                  color: '#4ade80',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13.5px',
                  lineHeight: '24px',
                  overflowX: 'auto',
                  border: '1px solid #334155'
                }}>
                  {compileResult?.optimizedCode || '// Click "Run Pipeline" to generate optimized code.'}
                </pre>
              </div>
            )}

            {/* TAB 12: SPLIT COMPARE */}
            {activeTab === 'compare' && (
              <SplitCompareViewer
                originalCode={sourceCode}
                optimizedCode={compileResult?.optimizedCode}
                irBefore={compileResult?.irBefore}
                irAfter={compileResult?.irAfter}
              />
            )}

            {/* TAB 13: OPTIMIZATION STATISTICS & FINAL REPORT */}
            {activeTab === 'statistics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '15px' }}>
                  Compiler Optimization Final Report
                </h4>

                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                  <div className="card-base" style={{ padding: '16px', background: '#f8fafc' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>IR Before</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      {compileResult?.statistics?.irBeforeCount || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Instructions</div>
                  </div>

                  <div className="card-base" style={{ padding: '16px', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>IR After</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
                      {compileResult?.statistics?.irAfterCount || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669' }}>Instructions</div>
                  </div>

                  <div className="card-base" style={{ padding: '16px', background: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600 }}>Instruction Reduction</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>
                      {compileResult?.statistics?.instructionReductionPercentage || 0}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#2563eb' }}>
                      {compileResult?.statistics?.instructionsRemoved || 0} Removed
                    </div>
                  </div>

                  <div className="card-base" style={{ padding: '16px', background: '#faf5ff', borderColor: '#e9d5ff' }}>
                    <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 600 }}>Transformations</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#6b21a8', marginTop: '4px' }}>
                      {compileResult?.statistics?.totalTransformations || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9333ea' }}>Across 8 passes</div>
                  </div>
                </div>

                {/* Technique Breakdown */}
                <div className="card-base" style={{ padding: '20px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '14px' }}>
                    Transformations Applied per Optimization Technique
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.entries(compileResult?.statistics?.techniqueBreakdown || {}).map(([key, count]) => {
                      const labels = {
                        constantFolding: 'Constant Folding',
                        constantPropagation: 'Constant Propagation',
                        algebraicSimplification: 'Algebraic Simplification',
                        copyPropagation: 'Copy Propagation',
                        commonSubexpressionElimination: 'Common Subexpression Elimination',
                        strengthReduction: 'Strength Reduction',
                        deadCodeElimination: 'Dead Code Elimination',
                        unreachableCodeElimination: 'Unreachable Code Elimination'
                      };
                      return (
                        <div key={key} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: count > 0 ? 'var(--bg-hover)' : '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: count > 0 ? 'var(--text-heading)' : '#94a3b8' }}>
                            {labels[key] || key}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            background: count > 0 ? 'var(--primary-blue)' : '#e2e8f0',
                            color: count > 0 ? '#ffffff' : '#64748b',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Academic Optimization Evaluation Note */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  lineHeight: '20px'
                }}>
                  <strong style={{ color: 'var(--text-heading)' }}>Academic Note for Evaluation:</strong>
                  {" "}Instruction reduction percentages quantify the reduction in Intermediate Representation (Three-Address Code) instruction count. As required by standard compiler design principles, this metric does not equate to a 1:1 runtime speedup percentage due to memory hierarchies, hardware branch predictors, and cache behavior.
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
