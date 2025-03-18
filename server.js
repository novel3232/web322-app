/*********************************************************************************
*  WEB322 – Assignment 04 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Novel Myint Moh 
*  Student ID: 101573236 
*  Date: 18/03/2025
*  Cyclic Web App URL:  https://web322app-t885.onrender.com
*  GitHub Repository URL: https://github.com/NobleMyintMo/web322app
**********************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();
const PORT = process.env.PORT || 8080;

const hbs = exphbs.create({
    defaultLayout: "main", 
    extname: ".hbs",
    helpers: {
        navLink: function(url, text) {
            return `<li${(url === app.locals.activeRoute) ? ' class="active"' : ''}><a href="${url}">${text}</a></li>`;
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
            return lvalue == rvalue ? options.fn(this) : options.inverse(this);
        }
    }
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => res.redirect("/shop"));
app.get("/about", (req, res) => res.render("about", { title: "About Us" }));
app.get("/shop", async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        const categories = await storeService.getCategories();
        res.render("shop", { items, categories });
    } catch (err) {
        res.render("shop", { message: "No items found" });
    }
});

app.get("/items", async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        res.render("items", { items });
    } catch (err) {
        res.render("items", { message: "No items found" });
    }
});

app.get("/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("categories", { categories });
    } catch (err) {
        res.render("categories", { message: "No categories found" });
    }
});

app.get("/items/add", (req, res) => res.render("addItem", { categories: storeService.getCategories() }));

app.post("/items/add", multer().single("featureImage"), async (req, res) => {
    try {
        if (req.file) {
            let streamUpload = (req) => {
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
        console.error("Error adding item:", err);
        res.status(500).json({ error: "Unable to add item" });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { title: "Page Not Found" });
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(`❌ Failed to start server: ${err}`);
        process.exit(1);
    });
