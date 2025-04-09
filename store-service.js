/*********************************************************************************
*  WEB322 – Assignment 05 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Novel Myint Moh 
*  Student ID: 101573236 
*  Date: [Current Date]
*  Cyclic Web App URL: [Your Cyclic URL]
*  GitHub Repository URL: [Your GitHub URL]
**********************************************************************************/

const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

const sequelize = new Sequelize('railway', 'postgres', 'wFfHIcJyCMwIFiYyeQVRqhReyjFkgKKr', {
    host: 'crossover.proxy.rlwy.net',
    dialect: 'postgres',
    port: 28797,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define Item model
const Item = sequelize.define('Item', {
    body: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: true
    },
    postDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    featureImage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    published: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: true
    }
});

// Define Category model
const Category = sequelize.define('Category', {
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Define relationship
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize function
const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to sync the database");
            });
    });
};

// Get all items
const getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
};

// Get items by category
const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject("no results returned");
        });
    });
};

// Get items by minimum date
const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject("no results returned");
        });
    });
};

// Get item by ID
const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id }
        })
        .then(data => {
            resolve(data[0]);
        })
        .catch(err => {
            reject("no results returned");
        });
    });
};

// Add new item
const addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        
        // Replace empty values with null
        for (const key in itemData) {
            if (itemData[key] === "") {
                itemData[key] = null;
            }
        }
        
        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create post");
            });
    });
};

// Get published items
const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject("no results returned");
        });
    });
};

// Get published items by category
const getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { 
                published: true,
                category: category 
            }
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject("no results returned");
        });
    });
};

// Get all categories
const getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => {
                resolve(data);
            })
            .catch(err => {
                reject("no results returned");
            });
    });
};

// Add new category
const addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        // Replace empty values with null
        for (const key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }
        
        Category.create(categoryData)
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject("unable to create category");
            });
    });
};

// Delete category by ID
const deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
        .then(() => {
            resolve();
        })
        .catch(err => {
            reject("unable to delete category");
        });
    });
};

// Delete item by ID
const deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then(() => {
            resolve();
        })
        .catch(err => {
            reject("unable to delete post");
        });
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getPublishedItemsByCategory,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addCategory,
    deleteCategoryById,
    deletePostById
};