const moongose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

moongose.connect(process.env.CONNECTION_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }).then(() => {
    console.log('Database connected Successfully');
    app.listen(process.env.PORT, () => {
      console.log(`server started on port ${process.env.PORT}`);
    });
  })

moongose.set('useFindAndModify', false)
