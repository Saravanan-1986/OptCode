import React, { useState } from 'react';
import { 
  ChevronRight
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('pipeline');

  const topics = [
    { id: 'pipeline', label: '1. Compiler Pipeline Overview' },
    { id: 'lexing', label: '2. Lexical Analysis (Scanning)' },
    { id: 'parsing', label: '3. Syntax Analysis & AST' },
    { id: 'semantics', label: '4. Semantic Analysis & Symbols' },
    { id: 'ir', label: '5. Intermediate Representation (TAC)' },
    { id: 'blocks', label: '6. Basic Blocks & Control Flow Graph' },
    { id: 'optimizations', label: '7. Optimization Techniques' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', minHeight: '800px' }}>
      
      {/* Left Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)' }}>
            Compiler Handbook
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Academic Design Reference
          </span>
        </div>

        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeSection === t.id ? 'var(--primary-blue-light)' : 'transparent',
              color: activeSection === t.id ? 'var(--primary-blue)' : 'var(--text-main)',
              fontWeight: activeSection === t.id ? 800 : 600,
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{t.label}</span>
            {activeSection === t.id && <ChevronRight size={16} />}
          </button>
        ))}
      </div>

      {/* Right Content Section */}
      <div className="card-base" style={{ padding: '36px', overflowY: 'auto' }}>
        
        {/* SECTION 1: PIPELINE */}
        {activeSection === 'pipeline' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '8px' }}>
              Compiler Pipeline Architecture
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '24px', marginBottom: '24px' }}>
              A compiler translates a high-level source language into efficient target code through systematic front-end analysis, intermediate representation generation, and machine-independent code optimization.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '26px'
            }}>
              <strong style={{ color: 'var(--primary-blue)' }}>Source Code</strong> (C-Like Language)<br/>
              ↓ <strong>Lexical Analyzer</strong> (Scanner: extracts tokens with lines/columns)<br/>
              ↓ <strong>Syntax Analyzer</strong> (Parser: recursive descent validation)<br/>
              ↓ <strong>Abstract Syntax Tree</strong> (AST: structural node graph)<br/>
              ↓ <strong>Semantic Analyzer</strong> (Type checking & Scoped Symbol Table)<br/>
              ↓ <strong>Intermediate Code Generator</strong> (Three-Address Code - TAC)<br/>
              ↓ <strong>Basic Block Partitioner & CFG Builder</strong> (Control Flow Graph)<br/>
              ↓ <strong>Optimization Engine</strong> (Multi-pass mathematical & dead-code elimination)<br/>
              ↓ <strong>Code Generator</strong> (Optimized executable C-like program)
            </div>
          </div>
        )}

        {/* SECTION 2: LEXING */}
        {activeSection === 'lexing' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Lexical Analysis (Scanning)
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '24px', marginBottom: '16px' }}>
              The lexical analyzer converts an input stream of raw source characters into meaningful atomic units called <strong>Tokens</strong>.
            </p>
            <h4 style={{ fontWeight: 800, margin: '16px 0 8px', color: 'var(--text-heading)' }}>Token Categories in CodeOpt:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '13.5px', lineHeight: '24px', color: '#334155' }}>
              <li><strong>Keywords:</strong> Reserved words (<code>int</code>, <code>float</code>, <code>bool</code>, <code>if</code>, <code>else</code>, <code>while</code>, <code>for</code>, <code>print</code>, <code>return</code>).</li>
              <li><strong>Identifiers:</strong> User-defined names for variables and loops matching <code>[a-zA-Z_][a-zA-Z0-9_]*</code>.</li>
              <li><strong>Literals:</strong> Constant integers, floating-point numbers, and booleans (<code>true</code>, <code>false</code>).</li>
              <li><strong>Operators:</strong> Arithmetic (<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>%</code>), Relational (<code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, <code>==</code>, <code>!=</code>), Logical (<code>&&</code>, <code>||</code>, <code>!</code>), and Assignment (<code>=</code>, <code>+=</code>, <code>-=</code>, <code>*=</code>, <code>/=</code>).</li>
              <li><strong>Delimiters:</strong> Parentheses <code>()</code>, braces <code>{}</code>, semicolons <code>;</code>, and commas <code>,</code>.</li>
            </ul>
          </div>
        )}

        {/* SECTION 3: PARSING & AST */}
        {activeSection === 'parsing' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Syntax Analysis & Abstract Syntax Trees (AST)
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '24px', marginBottom: '16px' }}>
              Syntax analysis validates the grammatical structure of the token sequence against language grammar rules using a deterministic <strong>Recursive Descent Parser</strong>.
            </p>
            <h4 style={{ fontWeight: 800, margin: '16px 0 8px', color: 'var(--text-heading)' }}>What is an Abstract Syntax Tree (AST)?</h4>
            <p style={{ color: 'var(--text-main)', fontSize: '13.5px', lineHeight: '24px', marginBottom: '14px' }}>
              An AST is a condensed, hierarchical representation of source code that abstracts away punctuation (semicolons, parentheses, braces) while strictly preserving operator precedence, nested scopes, and control flow hierarchies.
            </p>
          </div>
        )}

        {/* SECTION 4: SEMANTICS & SYMBOLS */}
        {activeSection === 'semantics' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Semantic Analysis & Symbol Table
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '24px', marginBottom: '16px' }}>
              Semantic analysis enforces context-sensitive grammar constraints that cannot be expressed in context-free grammars alone:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '13.5px', lineHeight: '24px', color: '#334155' }}>
              <li><strong>Declaration before Use:</strong> Flags undefined variable usages (e.g., <code>x = y + 10;</code> where <code>y</code> was never declared).</li>
              <li><strong>Scope Isolation & Duplicate Prevention:</strong> Ensures duplicate declarations in the same lexical block are rejected while supporting nested variable shadowing.</li>
              <li><strong>Static Type Checking:</strong> Verifies type compatibility between operands and assignments (e.g. disallowing <code>int x = true;</code>).</li>
            </ul>
          </div>
        )}

        {/* SECTION 5: TAC IR */}
        {activeSection === 'ir' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Intermediate Representation: Three-Address Code (TAC)
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '24px', marginBottom: '16px' }}>
              Three-Address Code (TAC) is a linearized, machine-independent intermediate language where every instruction contains at most one operator and at most three memory addresses (operands/results).
            </p>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              // High Level:<br/>
              x = a + b * c;<br/><br/>
              // Three-Address Code:<br/>
              t1 = b * c<br/>
              t2 = a + t1<br/>
              x = t2
            </div>
          </div>
        )}

        {/* SECTION 6: BASIC BLOCKS & CFG */}
        {activeSection === 'blocks' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Basic Blocks and Control Flow Graph (CFG)
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '24px', marginBottom: '16px' }}>
              A <strong>Basic Block</strong> is a maximal straight-line sequence of instructions that has only one entry point (the first instruction) and one exit point (the last instruction), with no internal branches or jump targets.
            </p>
            <h4 style={{ fontWeight: 800, margin: '16px 0 8px', color: 'var(--text-heading)' }}>Leader Algorithm:</h4>
            <ol style={{ paddingLeft: '20px', fontSize: '13.5px', lineHeight: '24px', color: '#334155' }}>
              <li>The first TAC instruction is a leader.</li>
              <li>Any instruction targeted by a conditional or unconditional branch (a label) is a leader.</li>
              <li>Any instruction immediately following a jump or branch is a leader.</li>
            </ol>
          </div>
        )}

        {/* SECTION 7: OPTIMIZATION TECHNIQUES */}
        {activeSection === 'optimizations' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '16px' }}>
              Supported Optimization Passes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>1. Constant Folding</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Evaluates operations involving literal constants at compile time rather than delaying calculation to runtime (e.g., <code>10 * 20 → 200</code>).
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>2. Constant Propagation</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Tracks known constant assignments to variables and propagates their values forward into subsequent expressions (e.g. <code>x = 10; y = x + 5 → y = 10 + 5</code>).
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>3. Algebraic Simplification</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Replaces expressions with algebraically equivalent simpler forms: <code>x + 0 → x</code>, <code>x * 1 → x</code>, <code>x * 0 → 0</code>, <code>x - x → 0</code>, <code>x && true → x</code>.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>4. Copy Propagation</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  After an assignment <code>x = y</code>, replaces uses of <code>x</code> with <code>y</code> as long as neither variable is modified.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>5. Common Subexpression Elimination (CSE)</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Identifies repeated calculations of the exact same operands (e.g. <code>a = x * y; b = x * y</code>) and avoids recomputation by reusing the temporary variable.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>6. Strength Reduction</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Replaces computationally expensive arithmetic operations with cheaper alternatives (e.g. <code>x * 2 → x + x</code>).
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>7. Dead Code Elimination (DCE)</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Removes variable assignments and expressions whose results are never read or output throughout the lifetime of the program.
                </p>
              </div>

              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--primary-blue)' }}>8. Unreachable Code Elimination</strong>
                <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  Removes blocks guarded by conditions evaluating statically to false (e.g. <code>if (false)</code>) and instructions occurring after unconditional jumps.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
