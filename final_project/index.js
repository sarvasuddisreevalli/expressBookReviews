// IBM Book Review final project: Express server, sessions, and JWT authentication.
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-session-secret-change-me';

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Accept form-encoded cURL review bodies.
app.use('/customer', session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// Authentication middleware applies to all /customer/auth endpoints.
app.use('/customer/auth', (req, res, next) => {
  const token = req.session?.authorization?.accessToken;
  if (!token) {
    return res.status(403).json({ message: 'User not logged in' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(403).json({ message: 'User not authenticated' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

if (require.main === module) {
  app.listen(PORT, () => console.log(`Book Review API running on port ${PORT}`));
}

module.exports = app;
