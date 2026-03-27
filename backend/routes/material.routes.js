const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/batch/:batch_id', materialController.getMaterialsByBatch);
router.post('/', materialController.createMaterial);
router.delete('/:id', materialController.deleteMaterial);
router.post('/share', materialController.shareToBatch);

module.exports = router;
