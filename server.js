const moongose = require('mongoose');
const dotenv = require('dotenv');

// process.on('uncaughtException', err => {
//   console.log(err.name, err.message);
//   console.log('Uncaught Exception! Shutting Down');
//   process.exit(1);
// });

const app = require('./app');
dotenv.config();

moongose.connect(process.env.CONNECTION_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }).then(() => {
    console.log('Database connected Successfully');
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT}`);
});

moongose.set('useFindAndModify', false);

// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message);
//   console.log('Unhandled Rejection! Shutting Down');
//   server.close(() => {
//     process.exit(1); // 1 stands for uncought exception
//   });
// });

