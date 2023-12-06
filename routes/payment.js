const express = require('express');
const router = express.Router();
const calculateTotalCartItem = require('./cartUtils');

// Rest of your code...

// load checkout page
router.get('/checkout', function(req, res) {
    calculateTotalCartItem(req);
    let total = req.session.total;

    res.render('pages/checkout', {total:total})
});

// push to db client data and payment status
router.post('/place_order',function(req, res) {
    let product_id  = "";
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let country = req.body.country;
    let city = req.body.city;
    let address = req.body.address;
    let cost = req.session.total;
    let status = 'Not paid';
    let date = new Date();

    let carth = req.session.cart;
    for(let i= 0; i < carth.length; i++) {
        product_id = product_id + "," + carth[i].id;
    }
    
    let query = " INSERT INTO orders (product_id, cost, customer_name, email, status, country, city, address, phone_no, date) VALUES ?";
    let values = [[product_id, cost, name, email, status, country, city, address, phone, date]];//double array
    connection.query(query, [values], (err, response) => {
        if (err) {
            console.error('Error inserting order:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/payment');
        }
    });
});

// work on payment later
router.get('/payment', function(req, res) {
    res.render('pages/payment');
});

module.exports = router;
