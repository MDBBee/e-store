require('dotenv').config();

const express = require('express');
const app = express();

const morgan = require('morgan');
// Db
const db = require('./db/connect');

// Routes imports
const authRoutes = require('./routes/authRoutes');
// Error handlers
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

app.use(morgan('tiny'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to e-store');
});
app.use('/api/v1/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db(process.env.MONGO_URL);
    app.listen(PORT, () => {
      console.log(`App is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
