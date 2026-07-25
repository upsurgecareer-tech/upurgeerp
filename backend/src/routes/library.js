const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Books
router.post('/books', libraryController.createBook);
router.get('/books', libraryController.getBooks);
router.patch('/books/:id', libraryController.updateBook);

// Book Issues
router.post('/issues', libraryController.issueBook);
router.patch('/issues/:id/return', libraryController.returnBook);
router.get('/issues', libraryController.getBookIssues);
router.get('/issues/overdue', libraryController.getOverdueBooks);

module.exports = router;
