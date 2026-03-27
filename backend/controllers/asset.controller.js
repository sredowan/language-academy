const Asset = require('../models/Asset');

exports.getAssets = async (req, res) => {
  try {
    const where = { branch_id: req.branchId };
    const assets = await Asset.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      branch_id: req.branchId
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({ 
      where: { id: req.params.id, branch_id: req.branchId } 
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    
    await asset.update(req.body);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({ 
      where: { id: req.params.id, branch_id: req.branchId } 
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    
    await asset.destroy();
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
