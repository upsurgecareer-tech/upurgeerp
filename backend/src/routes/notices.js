const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createNoticeSchema } = require('../validators/schemas');

router.use(authenticate);

router.post('/', validate(createNoticeSchema), noticeController.createNotice);
router.get('/', noticeController.getNotices);
router.get('/active', noticeController.getActiveNotices);
router.get('/:id', noticeController.getNoticeById);
router.put('/:id', noticeController.updateNotice);
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
