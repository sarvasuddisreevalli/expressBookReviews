// Public Book Review API routes. Also includes Task 11 Axios async clients.
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js'); // Keep the dataset from your fork unchanged.
const { isValid, users, hashPassword } = require('./auth_users.js');

const publicUsers = express.Router();

// Task 7: register a new user.
publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  const { salt, passwordHash } = hashPassword(password);
  users.push({ username, salt, passwordHash });
  return res.status(201).json({ message: 'User successfully registered. Now you can login' });
});

// Task 2: retrieve all books.
publicUsers.get('/', (req, res) => res.status(200).json(books));

// Task 3: find a book by its ISBN (the dataset uses IDs like '1').
publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ message: 'Book not found' });
});

const findBooks = (field, text) => Object.fromEntries(
  Object.entries(books).filter(([, book]) =>
    String(book[field]).toLowerCase().includes(text.toLowerCase()))
);

// Task 4: find books by author.
publicUsers.get('/author/:author', (req, res) => {
  const matches = findBooks('author', req.params.author);
  return Object.keys(matches).length
    ? res.status(200).json(matches)
    : res.status(404).json({ message: 'No books found for this author' });
});

// Task 5: find books by title.
publicUsers.get('/title/:title', (req, res) => {
  const matches = findBooks('title', req.params.title);
  return Object.keys(matches).length
    ? res.status(200).json(matches)
    : res.status(404).json({ message: 'No books found for this title' });
});

// Task 6: retrieve book reviews (can be {} before any reviews are added).
publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book.reviews || {})
    : res.status(404).json({ message: 'Book not found' });
});

// Task 11: asynchronous Axios client functions. Call these FROM A CLIENT,
// not inside their own routes, to avoid recursively calling the server.
const API_BASE = process.env.API_BASE || 'http://localhost:5000';

async function getAllBooksAsync() {
  const response = await axios.get(`${API_BASE}/`);
  return response.data;
}

function getBooksByISBNAsync(isbn) {
  return axios.get(`${API_BASE}/isbn/${encodeURIComponent(isbn)}`)
    .then(response => response.data);
}

async function getBooksByAuthorAsync(author) {
  const response = await axios.get(`${API_BASE}/author/${encodeURIComponent(author)}`);
  return response.data;
}

function getBooksByTitleAsync(title) {
  return axios.get(`${API_BASE}/title/${encodeURIComponent(title)}`)
    .then(response => response.data);
}

module.exports.general = publicUsers;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBooksByISBNAsync = getBooksByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
