// Login and authenticated review endpoints.
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const books = require('./booksdb.js');

const registeredUsers = express.Router();
const users = []; // Coursework example: in-memory users, reset on server restart.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me';

function isValid(username) {
  return users.some(user => user.username === username);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, passwordHash: crypto.scryptSync(password, salt, 64).toString('hex') };
}

function authenticatedUser(username, password) {
  const user = users.find(user => user.username === username);
  if (!user || typeof password !== 'string') return false;
  const actual = crypto.scryptSync(password, user.salt, 64);
  const expected = Buffer.from(user.passwordHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// Task 8: log in and save JWT in the user's session.
registeredUsers.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: 'User successfully logged in' });
});

// Task 9: add or modify your review for a book.
registeredUsers.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body?.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review text is required' });
  }
  book.reviews ||= {};
  book.reviews[req.user.username] = review;
  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: book.reviews
  });
});

// Task 10: delete only the logged-in user's review.
registeredUsers.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!book.reviews || !(req.user.username in book.reviews)) {
    return res.status(404).json({ message: 'You have no review to delete for this book' });
  }
  delete book.reviews[req.user.username];
  return res.status(200).json({ message: 'Review deleted successfully', reviews: book.reviews });
});

module.exports.authenticated = registeredUsers;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.hashPassword = hashPassword;
module.exports.authenticatedUser = authenticatedUser;
