const express = require('express');
const session = require('express-session');
const { randomBytes } = require('node:crypto');
const { authenticated } = require('./router/auth_users');
const { general } = require('./router/general');

const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false
}));
app.use('/customer/auth', (req, res, next) => {
  if (!req.session.username) {
    return res.status(401).json({ message: 'Login required' });
  }
  return next();
});
app.use('/customer', authenticated);
app.use('/', general);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server is running on port ' + port));
