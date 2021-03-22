const dotenv = require('dotenv');
const express = require('express');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

/**
 * Middleware that checks for the JSON Web Token on Authorization header
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {void}
 */
function ensureAuthenticated(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(402).send({ message: 'Invalid token.' });
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api', (req, res) => {
  res.send('Welcome');
});

app.post('/api/login', (req, res) => {
  if (!req.body.username || !req.body.email) {
    return res.status(400).send({ message: 'Username or email is empty.' });
  }

  const user = {
    username: req.body.username,
    email: req.body.email,
  };

  const token = jwt.sign(user, JWT_SECRET);
  res.send({ data: token });
});

app.post('/api/posts', ensureAuthenticated, (req, res) => {
  if (!req.body.title || !req.body.content) {
    return res.status(400).send({ message: 'Post title or content is empty.' });
  }

  const post = {
    title: req.body.title,
    content: req.body.content,
    time: Date.now(),
    ...req.user,
  };

  res.send({ data: post });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => {
  console.log('Listening on port :' + PORT);
});
