const Project = require('../models/Project');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, sourceCode } = req.body;
    const project = await Project.create({
      userId: req.user._id,
      name: name || 'Optimization Demo',
      description: description || 'Academic compiler optimization experiment',
      sourceCode: sourceCode || `int x = 10 * 20;\nint y = x + 0;\nint z = y * 1;\n\nint unused = 500;\n\nif (false) {\n    int a = 100;\n}\n\nprint(z);`
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, sourceCode, latestCompilation } = req.body;
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (sourceCode !== undefined) project.sourceCode = sourceCode;
    if (latestCompilation !== undefined) project.latestCompilation = latestCompilation;

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.duplicateProject = async (req, res, next) => {
  try {
    const original = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original project not found.' });
    }

    const duplicated = await Project.create({
      userId: req.user._id,
      name: `${original.name} (Copy)`,
      description: original.description,
      sourceCode: original.sourceCode,
      languageVersion: original.languageVersion
    });

    res.status(201).json({ success: true, project: duplicated });
  } catch (err) {
    next(err);
  }
};
