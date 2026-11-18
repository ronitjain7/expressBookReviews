const express = require('express');
const books = require('./booksdb');
const { isValid, users } = require('./auth_users');
const general = express.Router();

general.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }
  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

async function getAllBooks() {
  return books;
}

async function getBookByISBN(isbn) {
  return Object.hasOwn(books, isbn) ? books[isbn] : undefined;
}

async function getBooksByAuthor(author) {
  return Object.values(await getAllBooks()).filter(book => book.author === author);
}

async function getBooksByTitle(title) {
  return Object.values(await getAllBooks()).filter(book => book.title === title);
}

general.get('/', async (req, res) => res.json(await getAllBooks()));
general.get('/isbn/:isbn', async (req, res) => {
  const book = await getBookByISBN(req.params.isbn);
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});
general.get('/author/:author', async (req, res) => {
  res.json(await getBooksByAuthor(req.params.author));
});
general.get('/title/:title', async (req, res) => {
  res.json(await getBooksByTitle(req.params.title));
});
general.get('/review/:isbn', async (req, res) => {
  const book = await getBookByISBN(req.params.isbn);
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

module.exports = { general, getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };
