// require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser  = require('body-parser');
const session = require('express-session')
const { hostname } = require('os');
const connection = require('./routes/db');
const path = require('path');
const { body, validationResult } = require('express-validator');
const cartRoute = require('./routes/cartBasket');
const paymentRoute = require('./routes/payment');
const adminRoute = require('./routes/admin');
const productRoute = require('./routes/product');
const calculateTotalCartItem = require('./routes/cartUtils');

//const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);



//const hostname = '0.0.0.0';
const port = /*process.env.PORT ||*/5000;

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
app.get(['/', '/shop'], function(request, response) {
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
            default:
                break;
        }

        // Render the appropriate page
        response.render(pageToRender, { products: result, cart: request.session.cart, item_count: item_count });
    });
});

//all product routes
app.use('/product', productRoute);

//all cart routes
app.use('/cart', cartRoute);

//all payment routes
app.use('/pay', paymentRoute);

//all admin routes
app.use('/admin', adminRoute);




// Catch-all route for 404 errors
app.get('*', function(request, response) {
    response.status(404).render('pages/404', { error: 'Page not found' });
});


app.listen(port, () => {
    console.log('Server started on localhost:5000')
});
