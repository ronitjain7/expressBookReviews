const express = require('express');
const books = require('./booksdb');
const authenticated = express.Router();
const users = [];

function isValid(username) {
  return !users.some(user => user.username === username);
}

authenticated.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  if (!users.some(user => user.username === username && user.password === password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  req.session.regenerate(error => {
    if (error) return next(error);
    req.session.username = username;
    req.session.save(error => {
      if (error) return next(error);
      return res.json({ message: 'Login successful' });
    });
  });
});

authenticated.use('/auth/review/:isbn', (req, res, next) => {
  const { isbn } = req.params;
  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.locals.reviews = books[isbn].reviews;
  return next();
});

authenticated.put('/auth/review/:isbn', (req, res) => {
  const review = req.body?.review ?? req.query.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'Review text is required' });
  }
  const { reviews } = res.locals;
  Object.defineProperty(reviews, req.session.username, {
    value: review, enumerable: true, configurable: true, writable: true
  });
  return res.json({ message: 'Review added or updated successfully', reviews });
});

authenticated.delete('/auth/review/:isbn', (req, res) => {
  const { reviews } = res.locals;
  const { username } = req.session;
  if (!Object.hasOwn(reviews, username)) {
    return res.status(404).json({ message: 'Review not found' });
  }
  delete reviews[username];
  return res.json({ message: 'Review deleted successfully', reviews });
});

module.exports = { authenticated, isValid, users };
