require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(402).send('Invalid token');
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api', (req, res) => {
  res.send('Welcome');
});

app.post('/api/login', (req, res) => {
  if (!req.body.username || !req.body.email)
    return res.status(400).send('Username or email empty.');

  const user = {
    username: req.body.username,
    email: req.body.email,
  };

  const token = jwt.sign(user, JWT_SECRET);

  res.send(token);
});

app.post('/api/posts', auth, (req, res) => {
  if (!req.body.title || !req.body.content)
    return res.status(400).send('Post title or content empty');

  const post = {
    title: req.body.title,
    content: req.body.content,
    time: Date.now(),
    ...req.user,
  };

  res.send(post);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
