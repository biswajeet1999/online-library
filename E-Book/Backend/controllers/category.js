const BookCategory = require("../models/BookCategory");
const Book = require("../models/Book");

exports.getCategoryById = (req, res, next, id) => {
  BookCategory.findById(id).exec((err, cate) => {
    if (err || !cate) {
      return res.status(400).json({ err: "category not found" });
    }
    req.category = cate;
    next();
  });
};

exports.createCategory = (req, res) => {
  const { name } = req.body;
  const category = new BookCategory({ name });
  category.save((err, category) => {
    if (err) {
      BookCategory.findOne({ name }, (err, category) => {
        if (category) {
          return res.status(400).json({ err: "Category already exists" });
        } else {
          return res.status(400).json({ err: "unable to create category" });
        }
      });
    }

    if (category) {
      return res.status(200).json({ msg: "category added" });
    }
  });
};

exports.removeCategory = (req, res) => {
  const { category } = req;

  if (category.count > 0) {
    return res.status(400).json({
      err: `${category.count} users using books of this category. Unable to delete this category`,
    });
  }
  // TODO: remove all books of this category if no user using books of this category
  category.remove((err, category) => {
    if (err || !category) {
      return res.status(400).json({ err: "unable to remove category" });
    }
    return res.status(200).json({ msg: "category removed" });
  });
};

exports.updateCategory = (req, res) => {
  const { category } = req;
  const { name } = req.body;

  category.name = name;

  category.save((err, category) => {
    if (err || !category) {
      return res.status(400).json({ err: "Unable to update category" });
    }
    return res.status(200).json({ msg: "Sucessfully updated" });
  });
};

exports.getAllCategory = (req, res) => {
  BookCategory.find({}, (err, categories) => {
    if (err) {
      return res.status(400).json({ err: "Unable to get categories" });
    }
    return res.status(200).json({ msg: categories });
  });
};

exports.getCategory = (req, res) => {
  const { category } = req;
  return res.status(200).json({ msg: category });
};
