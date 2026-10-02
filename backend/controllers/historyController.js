const CompilationHistory = require('../models/CompilationHistory');

exports.getHistory = async (req, res, next) => {
  try {
    const history = await CompilationHistory.find({ userId: req.user._id })
      .select('-fullResult.ast.children -fullResult.parseTree') // lightweight summary
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

exports.getHistoryById = async (req, res, next) => {
  try {
    const item = await CompilationHistory.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const item = await CompilationHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }
    res.json({ success: true, message: 'History record deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await CompilationHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'All compilation history cleared.' });
  } catch (err) {
    next(err);
  }
};
