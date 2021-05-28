const fs = require('fs');
const moongose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const dotenv = require('dotenv');

dotenv.config();
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

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
    await Tour.create(tours);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data inported successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

deleteTours = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
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




