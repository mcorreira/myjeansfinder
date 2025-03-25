const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('MyJeansFinder API is running');
});

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/search', require('./src/routes/search.routes'));

// Only start server if this file is run directly

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export app for testing
module.exports = app;
