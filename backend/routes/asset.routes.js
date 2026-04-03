const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { protect } = require('../middleware/auth.middleware');
const { injectBranchFilter } = require('../middleware/branch.middleware');

router.use(protect);
router.use(injectBranchFilter);

router.get('/stats', assetController.getAssetStats);
router.get('/', assetController.getAssets);
router.post('/', assetController.createAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
