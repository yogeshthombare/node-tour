const fs = require('fs');
const moongose = require('mongoose');
const Tour = require('../models/tourModel');
const dotenv = require('dotenv');

dotenv.config();
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tour-samples.json`, 'utf-8'));

// console.log(tours);

const DB = process.env.CONNECTION_URL;

moongose.connect(DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
).then(() => {
  console.log('Db connected');
})

importTours = async () => {
  try {
    console.log('I am herer');
    await Tour.create(tours);
    console.log('Data inported successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

deleteTours = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

if (process.argv[2] == '--import') {
  importTours();
} else if (process.argv[2] == '--delete') {
  deleteTours();
}




