const express = require('express');
const router = express.Router();
const calculateTotalCartItem = require('./cartUtils');

// work on product 
router.get('/', function(req, res) {
    const product = req.params.id;

    // retrieve data from database that has the id
    const queryIds = "SELECT * FROM products WHERE id = ?";
    const query = "SELECT * FROM products";

        connection.query(queryIds,  [product], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (result.length  === 0) {
                // Handle the case where the product with the given ID is not found
                res.status(404).send('Product not found');
                return
            }

            const product = result[0];
            
            connection.query(query, (err, result)=>{
                // Ensure that req.session.cart is defined
                if(!req.session.cart) {
                    req.session.cart = [];
                }
            const { total, item_count } = calculateTotalCartItem(req);

            res.render('pages/product', {product, products: result, item_count, cart: req.session.cart});
        });
    });
});

module.exports = router;
