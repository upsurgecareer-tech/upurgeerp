const { LibraryBook, BookIssue } = require('../models');
const { Op } = require('sequelize');

// Books
exports.createBook = async (req, res) => {
  try {
    const { isbn, title, author, publisher, category, quantity, rack_number, price, purchase_date } = req.body;
    const book = await LibraryBook.create({
      branch_id: req.user.branch_id,
      isbn, title, author, publisher, category,
      quantity, available_quantity: quantity,
      rack_number, price, purchase_date
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const books = await LibraryBook.findAll({ where, order: [['title', 'ASC']] });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    await LibraryBook.update(req.body, {
      where: { id, branch_id: req.user.branch_id }
    });
    res.json({ message: 'Book updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Book Issues
exports.issueBook = async (req, res) => {
  try {
    const { book_id, student_id, issue_date, due_date } = req.body;
    
    const book = await LibraryBook.findOne({
      where: { id: book_id, branch_id: req.user.branch_id }
    });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    if (book.available_quantity < 1) {
      return res.status(400).json({ error: 'Book not available for issue' });
    }
    
    // Check if student already has this book
    const existingIssue = await BookIssue.findOne({
      where: {
        book_id,
        student_id,
        status: 'Issued',
        branch_id: req.user.branch_id
      }
    });
    
    if (existingIssue) {
      return res.status(400).json({ error: 'Student already has this book issued' });
    }
    
    const issue = await BookIssue.create({
      branch_id: req.user.branch_id,
      book_id,
      student_id,
      issue_date: issue_date || new Date(),
      due_date,
      status: 'Issued',
      issued_by: req.user.id
    });
    
    await book.update({
      available_quantity: book.available_quantity - 1,
      status: book.available_quantity - 1 === 0 ? 'Issued' : 'Available'
    });
    
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_date, remarks } = req.body;
    
    const issue = await BookIssue.findOne({
      where: { id, branch_id: req.user.branch_id, status: 'Issued' }
    });
    
    if (!issue) {
      return res.status(404).json({ error: 'Active book issue not found' });
    }
    
    const actualReturnDate = return_date ? new Date(return_date) : new Date();
    const dueDate = new Date(issue.due_date);
    
    // Calculate fine (Rs. 5 per day after due date)
    let fineAmount = 0;
    if (actualReturnDate > dueDate) {
      const daysLate = Math.ceil((actualReturnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 5;
    }
    
    await issue.update({
      return_date: actualReturnDate,
      fine_amount: fineAmount,
      status: 'Returned'
    });
    
    const book = await LibraryBook.findOne({ where: { id: issue.book_id, branch_id: req.user.branch_id } });
    if (book) {
      await book.update({
        available_quantity: book.available_quantity + 1,
        status: 'Available'
      });
    }
    
    res.json({
      message: 'Book returned successfully',
      fineAmount,
      issue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookIssues = async (req, res) => {
  try {
    const { student_id, status } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (student_id) where.student_id = student_id;
    if (status) where.status = status;
    
    const issues = await BookIssue.findAll({
      where,
      include: [{ model: LibraryBook, as: 'book' }],
      order: [['issue_date', 'DESC']]
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const issues = await BookIssue.findAll({
      where: {
        branch_id: req.user.branch_id,
        status: 'Issued',
        due_date: { [Op.lt]: new Date() }
      },
      include: [{ model: LibraryBook, as: 'book' }]
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
