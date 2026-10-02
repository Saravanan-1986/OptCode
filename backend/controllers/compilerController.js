const compilerService = require('../services/compilerService');
const CompilationHistory = require('../models/CompilationHistory');
const Project = require('../models/Project');

exports.compile = async (req, res, next) => {
  try {
    const { sourceCode, projectId, projectName, saveHistory = true } = req.body;

    if (!sourceCode && sourceCode !== '') {
      return res.status(400).json({ success: false, message: 'Source code is required.' });
    }

    const compileResult = await compilerService.runCompiler(sourceCode, 'compile');

    // If user is authenticated and compilation was processed, store in history
    if (req.user && saveHistory) {
      try {
        const stats = compileResult.statistics || {};
        const historyDoc = await CompilationHistory.create({
          userId: req.user._id,
          projectId: projectId || null,
          projectName: projectName || 'Optimization Demo',
          sourceCode,
          tokensCount: stats.tokenCount || (compileResult.tokens ? compileResult.tokens.length : 0),
          astNodeCount: stats.astNodeCount || 0,
          irBeforeCount: stats.irBeforeCount || 0,
          irAfterCount: stats.irAfterCount || 0,
          instructionsRemoved: stats.instructionsRemoved || 0,
          reductionPercentage: stats.instructionReductionPercentage || 0,
          optimizationsCount: stats.totalTransformations || 0,
          fullResult: compileResult
        });

        // Also update project's latestCompilation if projectId is provided
        if (projectId) {
          await Project.findByIdAndUpdate(projectId, {
            sourceCode,
            latestCompilation: {
              historyId: historyDoc._id,
              statistics: stats,
              updatedAt: new Date()
            }
          });
        }

        compileResult.historyId = historyDoc._id;
      } catch (histErr) {
        console.warn('Warning: Could not save compilation history:', histErr.message);
      }
    }

    res.json(compileResult);
  } catch (err) {
    next(err);
  }
};
