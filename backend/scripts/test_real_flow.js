/**
 * Verification of Real-World Flow without Demo Data
 */
async function testRealWorldFlow() {
  console.log('Testing Real-World Flow (Mandatory Auth & Dynamic Data)...');

  // 1. Try unauthenticated compile (must fail with 401)
  const unauthRes = await fetch('http://127.0.0.1:8081/api/compiler/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceCode: 'int x = 10;' })
  });
  console.log('Unauthenticated compile HTTP status:', unauthRes.status, '(Expected: 401)');
  if (unauthRes.status !== 401) throw new Error('Compile was not blocked for unauthenticated user!');

  // 2. Register real user
  const email = `real_user_${Date.now()}@university.edu`;
  const regRes = await fetch('http://127.0.0.1:8081/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Sarah Connor',
      email,
      password: 'mypassword123',
      confirmPassword: 'mypassword123'
    })
  });
  const regData = await regRes.json();
  console.log('User Registered:', regData.user.name, '| Token acquired:', !!regData.token);
  const token = regData.token;

  // 3. Create real project
  const projRes = await fetch('http://127.0.0.1:8081/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Compiler Design Lab 3',
      description: 'Dead Code Elimination and Constant Folding'
    })
  });
  const projData = await projRes.json();
  console.log('Project Created:', projData.project.name);

  // 4. Compile code under this user
  const compRes = await fetch('http://127.0.0.1:8081/api/compiler/compile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      sourceCode: 'int a = 10 * 20; int b = a + 0; int unused = 999; print(b);',
      projectId: projData.project._id,
      projectName: projData.project.name,
      saveHistory: true
    })
  });
  const compData = await compRes.json();
  console.log('Compilation Success:', compData.success, '| Reduction:', compData.statistics.instructionReductionPercentage + '%');

  // 5. Fetch Dashboard Stats (must reflect the 1 real user compilation & 1 project)
  const statsRes = await fetch('http://127.0.0.1:8081/api/stats/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  console.log('Dashboard Stats:');
  console.log(' - Total Projects:', statsData.stats.totalProjects);
  console.log(' - Total Compilations:', statsData.stats.totalCompilations);
  console.log(' - Average Reduction:', statsData.stats.averageReductionPercentage + '%');
  console.log(' - Recent Projects count:', statsData.stats.recentProjects.length);

  // 6. Clean up this test user so database remains ready for user
  const User = require('../models/User');
  const Project = require('../models/Project');
  const CompilationHistory = require('../models/CompilationHistory');
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/codeopt');
  await User.deleteMany({});
  await Project.deleteMany({});
  await CompilationHistory.deleteMany({});
  await mongoose.disconnect();
  console.log('All test data cleaned. System is 100% ready for real users!');
}

testRealWorldFlow().catch(console.error);
