const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(`__ ${err.name} -- ${err.message} __`);
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app.js');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connected'));

const port = process.env.PORT || 8000;

const server = app.listen(port, () => console.log('Server'));

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection - ***');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
