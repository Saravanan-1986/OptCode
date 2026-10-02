const { spawn } = require('child_process');
const path = require('path');

class CompilerService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.scriptPath = path.resolve(__dirname, '../../compiler/main.py');
    this.cwd = path.resolve(__dirname, '../../');
  }

  async runCompiler(sourceCode, action = 'compile') {
    return new Promise((resolve, reject) => {
      const child = spawn(this.pythonPath, [this.scriptPath, '--action', action], {
        cwd: this.cwd,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString('utf-8');
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString('utf-8');
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to spawn Python compiler: ${err.message}`));
      });

      child.on('close', (code) => {
        if (code !== 0 && !stdout.trim()) {
          return reject(new Error(`Compiler engine failed with code ${code}: ${stderr || 'Unknown error'}`));
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (parseErr) {
          console.error('Failed to parse compiler output:', stdout, stderr);
          reject(new Error(`Failed to parse compiler JSON output: ${parseErr.message}. Output was: ${stdout.slice(0, 200)}`));
        }
      });

      // Write source code to stdin and close stdin
      child.stdin.write(sourceCode || '');
      child.stdin.end();

      // Set safety timeout of 15 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Compilation timed out after 15 seconds.'));
      }, 15000);
    });
  }
}

module.exports = new CompilerService();
