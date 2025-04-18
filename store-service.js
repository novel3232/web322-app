/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Novel Myint Moh
*  Student ID: 101573236
*  Railway Web App URL: web322-app-production-134e.up.railway.app
*  GitHub Repository URL: https://github.com/novel3232/web322-app
**********************************************************************************/

const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  body: String,
  title: String,
  postDate: Date,
  featureImage: String,
  published: Boolean,
  price: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }
});

const categorySchema = new mongoose.Schema({
  category: String
});

let Item;
let Category;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection(
      "mongodb+srv://web322_novel:Web%40%213232@cluster0.3w7qdmm.mongodb.net/web322_store?retryWrites=true&w=majority"
    );

    db.on("error", err => reject(err));
    db.once("open", () => {
      Item = db.model("Item", itemSchema);
      Category = db.model("Category", categorySchema);
      resolve();
    });
  });
};

module.exports.getAllItems = () => Item.find().populate("category").exec();

module.exports.getPublishedItems = () => Item.find({ published: true }).populate("category").exec();

module.exports.getPublishedItemsByCategory = (categoryId) =>
  Item.find({ published: true, category: categoryId }).populate("category").exec();

module.exports.getCategories = () => Category.find().exec();

module.exports.addItem = (itemData) => {
  itemData.published = !!itemData.published;
  for (let key in itemData) {
    if (itemData[key] === "") itemData[key] = null;
  }
  itemData.postDate = new Date();
  return new Item(itemData).save();
};

module.exports.getItemsByCategory = (categoryId) =>
  Item.find({ category: categoryId }).populate("category").exec();

module.exports.getItemsByMinDate = (minDateStr) =>
  Item.find({ postDate: { $gte: new Date(minDateStr) } }).populate("category").exec();

module.exports.getItemById = (id) =>
  Item.findById(id).populate("category").exec();

module.exports.addCategory = (categoryData) => {
  for (let key in categoryData) {
    if (categoryData[key] === "") categoryData[key] = null;
  }
  return new Category(categoryData).save();
};

module.exports.deleteCategoryById = (id) => Category.findByIdAndDelete(id).exec();

module.exports.deletePostById = (id) => Item.findByIdAndDelete(id).exec();
