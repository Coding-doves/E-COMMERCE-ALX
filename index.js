// require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser  = require('body-parser');
const mysql = require('mysql');
const session = require('express-session')
const { hostname } = require('os');
const path = require('path');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory

//const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

//connect to mysql database.
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"e-commerce_project"
});

//const hostname = '0.0.0.0';
const port = /*process.env.PORT ||*/8080;

let app = express();

//middleware for serving static file
app.use(express.static('public'));

app.use(express.json());

//middleware for validating file
app.use(body());
//set up ejs as template engine
app.set('view engine', 'ejs');
// directory where views are located
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended:false}));//change true to false
app.use(bodyParser.json());

//set up session middleware
app.use(session({
    secret:"secretdove",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));

// global error variable
app.locals.errors = null;

// check database connection
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL:', error.message);
    } else {
        console.log('Connected to MySQL database');
    }
});


// root: localhost:8080
// route loads product data /landing page
app.get(['/', '/shop','/product', '/404'], function(request, response) {
    query = "SELECT * FROM products"; /*LIMIT 6*/
    connection.query(query, (err, result)=>{
        // Ensure that req.session.cart is defined
        if(!request.session.cart) {
            request.session.cart = [];
        }

        const { total, item_count } = calculateTotalCartItem(request);

        // Determine the page to render based on the path
        let pageToRender;
        switch(request.path){
            case '/':
                pageToRender = 'pages/index';
                break;
            case '/shop':
                pageToRender = 'pages/shop';
                break;
            case '/product':
                pageToRender = 'pages/product';
                break;
            default:
                break;
        }

        // Render the appropriate page
        response.render(pageToRender, { products: result, cart: request.session.cart, item_count: item_count });
    });
});


// update /add_to_cart when item quantity is increased in the cartbasket 
app.post('/update_quantity', (req, res) => {
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
app.post('/add_to_cart', (req, res) => {
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
app.get('/remove_item', (req, res) => {
    const id = req.query.id;

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart.splice(i, 1);
        }
    }
    res.redirect('/pages/shop');
});


// work on product 
app.get('/product/:id', function(req, res) {
    const productId = req.params.id;
    // retrieve data from database that has the id
    const query = "SELECT * FROM products WHERE id = ?";

    connection.query(query,  [productId], (err, result) => {
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

        res.render('pages/product', {productId});
    });
});

// total cost passed  to checkout
function calculateTotalCartItem(req) {
    total = 0;
    let item_count = 0;
    const cart = req.session.cart;

    for(i = 0; i < cart.length; i++){
        if(cart[i].sale_price){
            total += (cart[i].sale_price * cart[i].quantity);
        }else{
            total += (cart[i].price *  cart[i].quantity);
        }
        item_count += cart[i].quantity;
    }
    req.session.item_count = item_count;
    req.session.total = total;
    return { total, item_count };
};

// load checkout page
app.get('/checkout', function(req, res) {
    calculateTotalCartItem(req);
    let total = req.session.total;

    res.render('pages/checkout', {total:total})
});


// push to db client data and payment status
app.post('/place_order',function(req, res) {
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
app.get('/payment', function(req, res) {
    res.render('pages/payment');
});


// admin route
// GET request to display the form
app.get('/admin/admin_page', function(req, res) {

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
app.post('/admin/add_page', upload.single('image'), [
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

// Catch-all route for 404 errors
app.get('*', function(request, response) {
    response.status(404).render('pages/404', { error: 'Page not found' });
});


app.listen(port, () => {
    console.log('Server started on localhost:8080')
});
