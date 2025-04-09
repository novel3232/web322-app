/*********************************************************************************
*  WEB322 – Assignment 05 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Novel Myint Moh 
*  Student ID: 101573236 
*  Date: [8/4/2025]
*  Cyclic Web App URL: [Your Cyclic URL]
*  GitHub Repository URL: [Your GitHub URL]
**********************************************************************************/

const express = require("express");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Set EJS as view engine
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: "dupzz5jsk",
    api_key: "294379793524562",
    api_secret: "uiNnDG8KQVkHpw0qMAGCouh6Etg",
    secure: true
});

const upload = multer();

app.use((req, res, next) => {
    res.locals.active = req.path;
    next();
});

app.get("/", (req, res) => res.redirect("/shop"));

app.get("/about", (req, res) => {
    res.render("about", { title: "About Us", active: "about" });
});

app.get("/shop", async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        const categories = await storeService.getCategories();
        res.render("shop", { title: "Shop", active: "shop", items, categories });
    } catch (err) {
        res.render("shop", { title: "Shop", active: "shop", items: [], categories: [], message: "No items found" });
    }
});

app.get("/items", async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        const categories = await storeService.getCategories();
        res.render("items", { title: "Items", active: "items", items, categories });
    } catch (err) {
        res.render("items", { title: "Items", active: "items", items: [], categories: [], message: "No items found" });
    }
});

app.get("/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("categories", {
            title: "Categories",
            active: "categories",
            categories,
            showAddForm: true 
        });
    } catch (err) {
        res.render("categories", {
            title: "Categories",
            active: "categories",
            categories: [],
            message: "No results",
            showAddForm: true
        });
    }
});

app.get("/items/add", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("addItem", { title: "Add Item", active: "add", categories });
    } catch (err) {
        res.render("addItem", { title: "Add Item", active: "add", categories: [] });
    }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    try {
        if (req.file) {
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            let uploaded = await streamUpload(req);
            req.body.featureImage = uploaded.url;
        } else {
            req.body.featureImage = "";
        }

        await storeService.addItem(req.body);
        res.redirect("/items");
    } catch (err) {
        res.status(500).json({ error: "Unable to add item" });
    }
});

app.get("/categories/add", (req, res) => {
    res.render("addCategory", { title: "Add Category", active: "add" });
});

app.post("/categories/add", async (req, res) => {
    try {
        await storeService.addCategory(req.body);
        res.redirect("/categories");
    } catch (err) {
        res.status(500).json({ error: "Unable to add category" });
    }
});

app.get("/categories/delete/:id", async (req, res) => {
    try {
        await storeService.deleteCategoryById(req.params.id);
        res.redirect("/categories");
    } catch (err) {
        res.status(500).send("Unable to Remove Category / Category not found");
    }
});

app.get("/items/delete/:id", async (req, res) => {
    try {
        await storeService.deletePostById(req.params.id);
        res.redirect("/items");
    } catch (err) {
        res.status(500).send("Unable to Remove Post / Post not found");
    }
});

app.use((req, res) => {
    res.status(404).render("404", { title: "Page Not Found", active: "" });
});

// Initialize DB and start server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(`❌ Failed to start server: ${err}`);
        process.exit(1);
    });









