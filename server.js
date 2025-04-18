/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students.
*
*  Name: Novel Myint Moh
*  Student ID: 101573236
*  Railway Web App URL: [Paste final Railway link here]
*  GitHub Repository URL: https://github.com/novel3232/web322-app
**********************************************************************************/

require("dotenv").config();

const express = require("express");
const storeService = require("./store-service");
const authData = require("./auth-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const clientSessions = require("client-sessions");

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Cloudinary config
cloudinary.config({
  cloud_name: "dupzz5jsk",
  api_key: "294379793524562",
  api_secret: "uiNnDG8KQVkHpw0qMAGCouh6Etg",
  secure: true
});

const upload = multer();

// Sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "superSecretNovel123",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.active = req.path;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Routes
app.get("/", (req, res) => res.redirect("/shop"));

app.get("/about", (req, res) => {
  res.render("about", { title: "About Us", active: "about" });
});

app.get("/shop", async (req, res) => {
  try {
    const items = await storeService.getPublishedItems();
    const categories = await storeService.getCategories();
    res.render("shop", { title: "Shop", active: "shop", items, categories });
  } catch {
    res.render("shop", { title: "Shop", active: "shop", items: [], categories: [], message: "No items found" });
  }
});

// REGISTER
app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    errorMessage: undefined,
    successMessage: undefined,
    userName: ''
  });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => res.render("register", {
      successMessage: "User created",
      title: "Register"
    }))
    .catch(err => res.render("register", {
      errorMessage: err,
      userName: req.body.userName,
      title: "Register"
    }));
});

// LOGIN
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    errorMessage: undefined,
    userName: ''
  });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect("/items");
    })
    .catch(err => res.render("login", {
      errorMessage: err,
      userName: req.body.userName,
      title: "Login"
    }));
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { title: "User History" });
});

// ADMIN ROUTES
app.get("/items", ensureLogin, async (req, res) => {
  try {
    const items = await storeService.getAllItems();
    const categories = await storeService.getCategories();
    res.render("items", { title: "Items", items, categories });
  } catch {
    res.render("items", { title: "Items", items: [], categories: [], message: "No items found" });
  }
});

app.get("/items/add", ensureLogin, async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render("addItem", { title: "Add Item", categories });
  } catch {
    res.render("addItem", { title: "Add Item", categories: [] });
  }
});

app.post("/items/add", ensureLogin, upload.single("featureImage"), async (req, res) => {
  try {
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      const uploaded = await streamUpload(req);
      req.body.featureImage = uploaded.url;
    } else {
      req.body.featureImage = "";
    }
    await storeService.addItem(req.body);
    res.redirect("/items");
  } catch {
    res.status(500).send("Unable to add item.");
  }
});

app.get("/items/delete/:id", ensureLogin, async (req, res) => {
  try {
    await storeService.deletePostById(req.params.id);
    res.redirect("/items");
  } catch {
    res.status(500).send("Unable to Remove Post / Post not found");
  }
});

app.get("/categories", ensureLogin, async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render("categories", { title: "Categories", categories, showAddForm: true });
  } catch {
    res.render("categories", { title: "Categories", categories: [], message: "No results", showAddForm: true });
  }
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory", { title: "Add Category" });
});

app.post("/categories/add", ensureLogin, async (req, res) => {
  try {
    await storeService.addCategory(req.body);
    res.redirect("/categories");
  } catch {
    res.status(500).send("Unable to add category.");
  }
});

app.get("/categories/delete/:id", ensureLogin, async (req, res) => {
  try {
    await storeService.deleteCategoryById(req.params.id);
    res.redirect("/categories");
  } catch {
    res.status(500).send("Unable to Remove Category / Category not found");
  }
});

// 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// Init
storeService.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(`❌ Failed to start server: ${err}`);
    process.exit(1);
  });
