const Book = require("../models/Book");
const formidable = require("formidable");
const fs = require("fs");
const BookCategory = require("../models/BookCategory");

exports.getBookById = (req, res, next, id) => {
  Book.findById(id)
    .populate("category")
    .exec((err, book) => {
      if (err || !book) {
        return res.status(400).json({ err: "Book not found" });
      }
      req.book = book;
      next();
    });
};

exports.createBook = (req, res) => {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;

  // files will conatin pdf and cover photo
  // fields will contains other string data
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ err: "Some error occured" });
    }

    if (!fields.title || !fields.author || !fields.category) {
      return res.status(400).json({ err: "Please give all the information" });
    }

    if (fields.price && fields.price < 0) {
      return res.status(400).json({ err: "Price can't be negative" });
    }

    let book = new Book(fields);
    if (files.photo) {
      if (!files.photo.type.startsWith("image")) {
        return res.status(400).json({ err: "Photo must be of type Image" });
      }
      if (files.photo.size > 2097152) {
        // 2 mb max
        return res.status(400).json({ err: "Photo should be less than 2MB" });
      }
      book.photo.data = fs.readFileSync(files.photo.path);
      book.photo.contentType = files.photo.type;
    }
    if (!files.pdf) {
      return res.status(400).json({ err: "You should upload book in pdf fromat" });
    }
    if (!files.pdf.type.startsWith("application/pdf")) {
      return res.status(400).json({ err: "Book must be Pdf" });
    }
    if (files.pdf.size > 15728640) {
      // 15 mb max
      return res.status(400).json({ err: "Book should be less than 15MB" });
    }
    book.pdf.data = fs.readFileSync(files.pdf.path);
    book.pdf.contentType = files.pdf.type;

    // increment no of books by 1 to this category
    BookCategory.findByIdAndUpdate(fields.category, { $inc: { noOfBooks: 1 } }, (err) => {});

    // TODO: send mail to subscribed user and author
    book.save((err, book) => {
      if (err) {
        return res.status(400).json({ err: "Duplicate books are not allowed" });
      }
      return res.status(200).json({ msg: "Book created successfully" });
    });
  });
};

exports.deleteBook = (req, res) => {
  const { book } = req;

  if (book.readCount > 0) {
    return res
      .status(400)
      .json({ err: `${book.readCount} users using this book. Unable to remove this book.` });
  } else {
    book.remove((err, book) => {
      if (err) {
        return res.status(400), json({ err: "Unable to remove book" });
      }

      // decrement no of books by 1 to this category
      BookCategory.findByIdAndUpdate(fields.category, { $inc: { noOfBooks: -1 } }, (err) => {});
      return res.status(200).json({ msg: "Book deleted successfully" });
    });
  }
};

exports.updateBook = (req, res) => {
  const { book } = req;

  let form = formidable.IncomingForm();
  form.keepExtensions = true;

  // files will conatin pdf and cover photo
  // fields will contains other string data
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ err: "Some error occured" });
    }

    if (!fields.title || !fields.author || !fields.category) {
      return res.status(400).json({ err: "Please give all the information" });
    }

    if (fields.price < 0) {
      return res.status(400).json({ err: "Price can't be negative" });
    }

    if (files.photo) {
      if (!files.photo.type.startsWith("image")) {
        return res.status(400).json({ err: "Photo must be of type Image" });
      }
      if (files.photo.size > 2097152) {
        // 2 mb max
        return res.status(400).json({ err: "Photo should be less than 2MB" });
      }
      book.photo.data = fs.readFileSync(files.photo.path);
      book.photo.contentType = files.photo.type;
    }
    if (!files.pdf) {
      return res.status(400).json({ err: "You should upload book in pdf fromat" });
    }
    if (!files.pdf.type.startsWith("application/pdf")) {
      return res.status(400).json({ err: "Book must be Pdf" });
    }
    if (files.pdf.size > 15728640) {
      // 15 mb max
      return res.status(400).json({ err: "Book should be less than 15MB" });
    }
    book.pdf.data = fs.readFileSync(files.pdf.path);
    book.pdf.contentType = files.pdf.type;

    book.title = fields.title;
    book.author = fields.author;
    book.price = fields.price ? fields.price : 0;

    // if category changed then we have to update category demand using readerCount of the book and no of books to that category
    const previousCategoryId = book.category._id;
    const newCategoryId = fields.category;
    const readerCount = book.readerCount;

    if (previousCategoryId.toString() !== newCategoryId.toString()) {
      BookCategory.findByIdAndUpdate(
        previousCategoryId,
        { $inc: { count: -readerCount, noOfBooks: -1 } },
        (err) => {}
      );
      BookCategory.findByIdAndUpdate(
        newCategoryId,
        { $inc: { count: readerCount, noOfBooks: 1 } },
        (err) => {}
      );
    }

    book.category = fields.category;

    // save updated book
    book.save((err, book) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ err: "Unable to update book" });
      }
      return res.status(200).json({ msg: book });
    });
  });
};

const filterBooks = (books, purchasedList) => {
  let j;
  for (let i = 0; i < books.length; ) {
    for (j = 0; j < purchasedList.length; j++) {
      if (books[i]._id.toString() === purchasedList[j].bookId._id.toString()) {
        books.splice(i, 1);
        break;
      }
    }
    if (j === purchasedList.length) {
      i++;
    }
  }
  return books;
};

const removePdfAndPhotoFromBook = (books) => {
  return new Promise((res, rej) => {
    let updatedBooks = books.map((book) => {
      book.pdf = undefined;
      book.photo = undefined;
      return book;
    });
    res(updatedBooks);
  });
};

// we send 10 books at a a time
exports.getAllBooks = (req, res) => {
  const user = req.profile;
  const { skip, limit } = req.params;
  const filter = req.body;
  Book.find(filter)
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("category")
    .exec(async (err, books) => {
      if (err) {
        return res.status(400).json({ err: "Unable to get Books" });
      }
      // remove all books from the list which are purchased bye the user with role === 1
      // admin will get all books
      if (user.role === 1) {
        books = filterBooks(books, user.purchasedList);
      }
      const updatedBooks = await removePdfAndPhotoFromBook(books);
      return res.status(200).json({ msg: updatedBooks });
    });
};

// get only one boon using id for update purpose
exports.getBook = (req, res) => {
  const { book } = req;
  book.photo = undefined;
  book.pdf = undefined;

  res.status(200).json({ msg: book });
};

exports.getAllBooksByCategory = (req, res) => {
  const { categoryId } = req.params;
  Book.find({ category: categoryId })
    .populate("category")
    .exec(async (err, books) => {
      if (err) {
        return res.status(400).json({ err: "Unable to get Books" });
      }
      const updatedBooks = await removePdfAndPhotoFromBook(books);
      return res.status(200).json({ msg: updatedBooks });
    });
};

exports.getAllBooksByAuthor = (req, res) => {
  const { author } = req.params;
  Book.find({ author })
    .populate("category")
    .exec(async (err, books) => {
      if (err) {
        return res.status(400).json({ err: "Unable to get Books" });
      }
      const updatedBooks = await removePdfAndPhotoFromBook(books);
      return res.status(200).json({ msg: updatedBooks });
    });
};

exports.getAllBooksByTitle = (req, res) => {
  const { title } = req.params;
  Book.find({ title })
    .populate("category")
    .exec(async (err, books) => {
      if (err) {
        return res.status(400).json({ err: "Unable to get Books" });
      }
      const updatedBooks = await removePdfAndPhotoFromBook(books);
      return res.status(200).json({ msg: updatedBooks });
    });
};
// free or paid
exports.getAllBooksByPrice = (req, res) => {
  const { price } = req.params;
  let query;
  if (price === "FREE") {
    query = { $eq: 0 };
  } else {
    query = { $ne: 0 };
  }
  Book.find({ price: query })
    .populate("category")
    .exec(async (err, books) => {
      if (err) {
        return res.status(400).json({ err: "Unable to get Books" });
      }
      const updatedBooks = await removePdfAndPhotoFromBook(books);
      return res.status(200).json({ msg: updatedBooks });
    });
};

exports.getBookPhoto = (req, res) => {
  const { book } = req;
  res.set("Content-type", book.photo.contentType);
  if (!book.photo.data) {
    res.status(400);
  }
  res.send(book.photo.data);
};

exports.getBookPdf = (req, res) => {
  const { book } = req;
  res.set("Content-Type", book.pdf.contentType);
  res.send(book.pdf.data);
};
