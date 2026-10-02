const Project = require('../models/Project');
const CompilationHistory = require('../models/CompilationHistory');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [projectCount, compilationCount, historyRecords] = await Promise.all([
      Project.countDocuments({ userId }),
      CompilationHistory.countDocuments({ userId }),
      CompilationHistory.find({ userId }).select('optimizationsCount reductionPercentage createdAt projectName').sort({ createdAt: -1 }).limit(100)
    ]);

    let totalOptimizations = 0;
    let totalReduction = 0;
    let reductionCount = 0;

    for (const record of historyRecords) {
      totalOptimizations += (record.optimizationsCount || 0);
      if (record.reductionPercentage !== undefined && record.reductionPercentage !== null) {
        totalReduction += record.reductionPercentage;
        reductionCount++;
      }
    }

    const averageReduction = reductionCount > 0 ? (totalReduction / reductionCount).toFixed(1) : 0;

    // Activity distribution for the last 7 days / weekly chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const dayNum = d.getDate();
      
      const count = historyRecords.filter(r => {
        const rDate = new Date(r.createdAt);
        return rDate.toDateString() === d.toDateString();
      }).length;

      weeklyData.push({
        day: dayName,
        date: dayNum,
        compilations: count,
        // Height factor for custom chart
        height: Math.min(100, count > 0 ? 20 + count * 20 : 10)
      });
    }

    // Recent 5 projects
    const recentProjects = await Project.find({ userId }).sort({ updatedAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalProjects: projectCount,
        totalCompilations: compilationCount,
        totalOptimizations,
        averageReductionPercentage: parseFloat(averageReduction),
        metricNote: "Percentage reflects instruction reduction between initial and optimized Three-Address Code, not runtime execution speedup.",
        weeklyActivity: weeklyData,
        recentProjects,
        recentActivity: historyRecords.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
};
