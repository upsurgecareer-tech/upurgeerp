const express = require('express');
const router = express.Router();
const coursePackageController = require('../controllers/coursePackageController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, coursePackageController.createCoursePackage);
router.get('/', authenticate, coursePackageController.getCoursePackages);
router.get('/:id', authenticate, coursePackageController.getCoursePackageById);
router.put('/:id', authenticate, coursePackageController.updateCoursePackage);
router.delete('/:id', authenticate, coursePackageController.deleteCoursePackage);

module.exports = router;
