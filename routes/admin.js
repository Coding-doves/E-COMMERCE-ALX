const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory
const calculateTotalCartItem = require('./cartUtils');

// admin route
// GET request to display the form
router.get('/admin/admin_page', function(req, res) {

    // Initialize variables with default values
    const name = "";
    const image = "";
    const desc = "";
    const price = "";
    const qty = "";
    const category = "";
    const brand = "";

    res.render('pages/admin/admin_page', {
        name: name,
        image: image,
        desc: desc,
        price: price,
        qty: qty,
        category: category,
        brand: brand
    });
});

// POST request to handle form submission
router.post('/admin/add_page', upload.single('image'), [
    body('prod_name').notEmpty().withMessage('Product must have a name'),
    body('image').notEmpty().withMessage('Image must have a value'),
    ], function(req, res) {
    const name = req.body.name; //body is bodypaser and title is the name of the input field in the html(ejs) file
    const image = req.file; // Use req.file to access the uploaded file
    const price = req.body.price;
    //const sale_price = req.body.sale_price;
    const qty = req.body.qty;
    const category = req.body.category;
    const brand = req.body.brand;
    const desc = req.body.desc;

    // Checking for validation errors using validationResult
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('pages/admin/admin_page', {
            errors: errors,
            name: name,
            price: price,
            qty: qty,
            category: category,
            brand: brand,
            desc: desc,
            image: image || ""
        });
    } else {
        // Handle the success case, e.g., save to the database
        let query = " INSERT INTO products (name, description, price, quantity, image, category, brand) VALUES ?";
        let values = [[name, desc, price, qty, image.buffer, category, brand]];//double array
        connection.query(query, [values], (err, response) => {
        if (err) {
            console.error('Error inserting order:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Product added successfully');
        }
    });
    }
});

module.exports = router;
