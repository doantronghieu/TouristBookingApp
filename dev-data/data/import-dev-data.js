const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './../../config.env' });

// Create an array of objects with file names and models
const dataToProcess = [
  { fileName: 'tours.json', model: Tour },
  { fileName: 'users.json', model: User }, // attention to password encrytion middleware
  { fileName: 'reviews.json', model: Review },
];

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => console.log('DB connection successful.'));

const readJsonFile = (fileName) =>
  JSON.parse(fs.readFileSync(`${__dirname}/${fileName}`, 'utf-8'));

const importData = async (data, model) => {
  try {
    await model.create(data, { validateBeforeSave: false });
    console.log('Data successfully loaded for', model.modelName);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async (model) => {
  try {
    await model.deleteMany();
    console.log('Data successfully deleted for', model.modelName);
  } catch (err) {
    console.log(err);
  }
};

// Loop through the data and perform import or delete actions
const promises = [];

for (const { fileName, model } of dataToProcess) {
  if (process.argv[2] === '--import') {
    promises.push(importData(readJsonFile(fileName), model));
  } else if (process.argv[2] === '--delete') {
    promises.push(deleteData(model));
  }
}

Promise.all(promises)
  .then(() => {
    console.log('All promises resolved. Exiting...');
    process.exit();
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1); // Exit with error code
  });

console.log(process.argv);

// node .\import-dev-data.js --delete
// node .\import-dev-data.js --import
