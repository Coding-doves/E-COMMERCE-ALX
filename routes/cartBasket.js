const express = require('express');
const router = express.Router();
const calculateTotalCartItem = require('./cartUtils');

// update /add_to_cart when item quantity is increased in the cartbasket 
router.post('/update_quantity', (req, res) => {
    const id = req.body.id;
    const quantity = parseInt(req.body.quantity);

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart[i].quantity = quantity;
        }
    }

    res.redirect('/pages/shop');
});

// add items to cart
router.post('/add_to_cart', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const image = req.body.image;
    const price = req.body.price;
    const sale_price = req.body.sale_price;
    const quantity = parseInt(req.body.quantity);

    let count = 0;

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart[i].quantity += quantity;
            count++;
        }
    }
    if (count === 0){
        const new_cart_data = {
            id: id,
            name: name,
            image: image,
            price: parseFloat(price),
            sale_price: parseFloat(sale_price),
            quantity: quantity
        }
        req.session.cart.push(new_cart_data);
    }

    res.redirect('/pages/shop');
});

// remove item from cartbasket
router.get('/remove_item', (req, res) => {
    const id = req.query.id;

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart.splice(i, 1);
        }
    }
    res.redirect('/pages/shop');
});

module.exports = router;
