import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { books } from './data/books.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { logTelemetry } from './middleware/telemetry.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(sanitizeInputs);

const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors,
    timestamp: new Date().toISOString()
  });
};

// GET all books with search and empty state
app.get('/api/v1/books', logTelemetry('FETCH_ALL_BOOKS'), (req, res) => {
  const { search } = req.query;
  let result = [...books];

  if (search) {
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (result.length === 0) {
    return sendResponse(res, 200, true, 'No data found', []);
  }

  return sendResponse(res, 200, true, 'Books retrieved successfully', result);
});

// POST new book with validation
app.post(
  '/api/v1/books',
  logTelemetry('CREATE_BOOK'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('isbn').trim().notEmpty().withMessage('ISBN is required'),
    body('category').trim().notEmpty().withMessage('Category is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(
        res,
        400,
        false,
        'Invalid Inputs: Please correct offending fields',
        null,
        errors.array().map((err) => ({ field: err.path, message: err.msg }))
      );
    }

    const { title, author, isbn, category } = req.body;
    const newBook = {
      id: String(Date.now()),
      title,
      author,
      isbn,
      category,
      available: true
    };

    books.push(newBook);
    return sendResponse(res, 201, true, 'Book added successfully', newBook);
  }
);

// DELETE book
app.delete('/api/v1/books/:id', logTelemetry('DELETE_BOOK'), (req, res) => {
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return sendResponse(res, 404, false, 'Book not found');
  }

  books.splice(index, 1);
  return sendResponse(res, 200, true, 'Book deleted successfully');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});