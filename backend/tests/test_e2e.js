/**
 * End-to-End Automated Integration Test Suite for CodeOpt
 * Tests Frontend (Port 7072) and Backend (Port 7071) API endpoints,
 * compiler execution, MongoDB persistence, and optimization passes.
 */

async function runTests() {
  console.log('=== [CodeOpt E2E Integration Test Suite] ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Verify Frontend Server on Port 8082
  await test('Frontend Dev Server responds on http://127.0.0.1:8082', async () => {
    const res = await fetch('http://127.0.0.1:8082/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('CodeOpt') && !text.includes('root')) {
      throw new Error('Frontend HTML response invalid');
    }
  });

  // 2. Verify Backend Server & Health Check on Port 8081
  await test('Backend Health check responds with MongoDB connected on Port 8081', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || data.database !== 'connected') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
    }
  });

  // 3. User Registration
  const testEmail = `researcher_${Date.now()}@codeopt.edu`;
  let authToken = '';

  await test('Auth: User Registration (/api/auth/register)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admira Tester',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error(data.message || 'Registration failed');
    authToken = data.token;
  });

  // 4. User Login
  await test('Auth: User Login (/api/auth/login)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error(data.message || 'Login failed');
    authToken = data.token;
  });

  // 5. Auth Me
  await test('Auth: Get Current Profile (/api/auth/me)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success || data.user.email !== testEmail.toLowerCase()) {
      throw new Error(data.message || 'Could not fetch profile');
    }
  });

  // 6. Project Management: Create Project
  let createdProjectId = '';
  await test('Projects: Create Project (/api/projects)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Benchmarking Pass Suite',
        description: 'Testing Constant Folding, CSE, and DCE'
      })
    });
    const data = await res.json();
    if (!data.success || !data.project._id) throw new Error(data.message || 'Failed to create project');
    createdProjectId = data.project._id;
  });

  // 7. Compiler: Full Pipeline Execution & Optimization
  const academicSample = `
    int x = 10 * 20;
    int y = x + 0;
    int z = y * 1;
    int unused = 500;
    if (false) {
        int a = 100;
    }
    print(z);
  `;

  let compileOutput = null;
  await test('Compiler: Full Pipeline Compilation (/api/compiler/compile)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/compiler/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        sourceCode: academicSample,
        projectId: createdProjectId,
        projectName: 'Benchmarking Pass Suite',
        saveHistory: true
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Compiler failed: ${JSON.stringify(data.errors)}`);
    compileOutput = data;

    // Verify all major pipeline artifacts
    if (!data.tokens || data.tokens.length === 0) throw new Error('Missing tokens');
    if (!data.ast || !data.ast.children) throw new Error('Missing AST');
    if (!data.symbolTable || data.symbolTable.length === 0) throw new Error('Missing Symbol Table');
    if (!data.irBefore || data.irBefore.length === 0) throw new Error('Missing Initial IR');
    if (!data.basicBlocks || data.basicBlocks.length === 0) throw new Error('Missing Basic Blocks');
    if (!data.cfg || !data.cfg.nodes) throw new Error('Missing CFG');
    if (!data.optimizationPasses || data.optimizationPasses.length === 0) throw new Error('Missing Optimization Passes');
    if (!data.irAfter) throw new Error('Missing Optimized IR');
    if (!data.optimizedCode) throw new Error('Missing Generated Code');

    // Verify optimization statistics
    const stats = data.statistics;
    if (stats.instructionsRemoved <= 0) throw new Error('No instructions removed');
    if (stats.instructionReductionPercentage <= 0) throw new Error('0% reduction reported');
    if (stats.totalTransformations <= 0) throw new Error('No transformations recorded');
  });

  // 8. History: Retrieve History
  await test('History: Get Optimization Runs (/api/history)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/history', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success || data.history.length === 0) throw new Error('No history recorded');
  });

  // 9. Dashboard Statistics
  await test('Stats: Dashboard Aggregates (/api/stats/dashboard)', async () => {
    const res = await fetch('http://127.0.0.1:8081/api/stats/dashboard', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.stats) throw new Error('Failed to retrieve stats');
    if (data.stats.totalProjects < 1) throw new Error('Project count incorrect');
    if (data.stats.totalCompilations < 1) throw new Error('Compilation count incorrect');
  });

  // 10. Project Duplication & Deletion
  await test('Projects: Duplicate & Delete (/api/projects/:id)', async () => {
    const dupRes = await fetch(`http://127.0.0.1:7071/api/projects/${createdProjectId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const dupData = await dupRes.json();
    if (!dupData.success) throw new Error('Duplicate failed');

    const delRes = await fetch(`http://127.0.0.1:7071/api/projects/${dupData.project._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const delData = await delRes.json();
    if (!delData.success) throw new Error('Delete failed');
  });

  console.log(`\n========================================`);
  console.log(`Tests Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
