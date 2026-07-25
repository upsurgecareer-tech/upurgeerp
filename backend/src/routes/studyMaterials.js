const express = require('express');
const router = express.Router();
const studyMaterialController = require('../controllers/studyMaterialController');
const { authenticate } = require('../middlewares/authenticate');

router.post('/', authenticate, studyMaterialController.uploadMaterial);
router.get('/', authenticate, studyMaterialController.getMaterials);
router.get('/:id', authenticate, studyMaterialController.getMaterialById);
router.put('/:id', authenticate, studyMaterialController.updateMaterial);
router.delete('/:id', authenticate, studyMaterialController.deleteMaterial);

module.exports = router;
