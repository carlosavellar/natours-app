const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// var livereload = require('livereload');
// var serverReload = livereload.createServer();
// serverReload.watch(__dirname + '/public');
// const webpack = require('webpack');
// const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const middleware = require('webpack-dev-middleware');
// var template = require('pug-loader!./base.pug');

// var template = require('./base.pug');

// var locals = {
//   /* ... */
// };

// var html = template(locals);
// const compiler = webpack({
//   entry: path.join(__dirname, 'views/base.pug'),
//   mode: 'development',
//   devtool: 'inline-source-map',
//   devServer: {
//     contentBase: path.join(__dirname, '/public'),
//     compress: true,
//     port: 9000,
//   },
//   module: {
//     rules: [
//       {
//         test: /\.pug$/,
//         use: [
//           {
//             loader: 'apply-loader',
//             options: {
//               // => sourceFn({a: 1}, true)
//               args: [{ a: 1 }, true],
//               // => sourceFn({a: 1})
//               obj: { a: 1 },
//               // => sourceFn(require('webpack.config').customConfig)
//               config: 'customConfig',
//             },
//           },
//         ],
//       },
//     ],
//   },
//   plugins: [
//     // new HtmlWebpackPlugin({
//     //   filename: 'base.pug',
//     // }),
//     // new HtmlWebpackPugPlugin(),
//     new HtmlWebpackPlugin({
//       template: './views/base.pug',
//       filename: 'base.pug',
//     }),
//     new HtmlWebpackPlugin({
//       template: './views/base.pug',
//       filename: 'base.pug',
//     }),
//     new HtmlWebpackPugPlugin(),
//   ],
// });

const app = require('./app');

// app.use(middleware(compiler));
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log(`Uncautch Exception 🎆 \n`);
  console.log(`Error name: ${err.name}, \n Message: ${err.message}`);
  process.exit(1);
});
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

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
  console.log(`Error name: ${err.name} \nMessage: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  MyMonitoringTool.logSync(err, origin);
});
