/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Novel Myint Moh 
*  Student ID: 101573236 
*  Date: 4/02/2025
*  Cyclic Web App URL:  
*  GitHub Repository URL: 
**********************************************************************************/

const express = require("express");
const storeService = require("./store-service");
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files (CSS, JS, Images)
app.use(express.static("public"));

// Redirect root "/" to "/about"
app.get("/", (req, res) => res.redirect("/about"));

// Serve HTML pages
app.get("/about", (req, res) => res.sendFile(__dirname + "/views/about.html"));
app.get("/shop", (req, res) => res.sendFile(__dirname + "/views/shop.html"));
app.get("/items", (req, res) => res.sendFile(__dirname + "/views/items.html"));
app.get("/categories", (req, res) => res.sendFile(__dirname + "/views/categories.html"));

// API Routes
app.get("/api/items", (req, res) => {
    storeService.getAllItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

app.get("/api/items/published", (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

app.get("/api/categories", (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

// Handle 404 - Route not found
app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});

// Initialize the store service, then start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(`Failed to start server: ${err}`);
        process.exit(1);
    });
