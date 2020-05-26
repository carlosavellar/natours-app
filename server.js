const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.js' });

const DB = process.env.DATABASE.replace('<PROCESS>', process.env.PASSWORD);
const app = require('./app.js');

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log('Server'));
