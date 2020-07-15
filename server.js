const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(`\nUncautch Exception 🎆`);
  console.log(`Error name: ${err.name}, \nMessage: ${err.stack}`);
  process.exit(1);
});
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connected'));

const port = process.env.NODE_PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Server started at val ${port}`)
);

process.on('unhandledRejection', (err) => {
  console.log(`UHANDLEREJection 🎇`);
  console.log(`Error name: ${err.name} \nMessage: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
