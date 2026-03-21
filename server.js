const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ROOT ROUTE
app.get('/', (req, res) => {
  res.send('DukaSmart Pro API is running...');
});

// TEST ROUTE
app.get('/test', (req, res) => {
  res.json({ message: 'API is working vizuri 🚀' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
