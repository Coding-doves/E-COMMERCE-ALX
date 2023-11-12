const express = require('express');
const ejs = require('ejs');
const bodyParser  = require('body-parser');
const mysql = require('mysql');
const session = require('express-session')

//connect to mysql database.
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"e-commerce_project"
});

let app = express();

//middleware for serving static file
app.use(express.static('public'));

//set up ejs as template engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:false}));//change true to false
app.use(bodyParser.json());

//set up session middleware
app.use(session({
    secret:"secretdove",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));

// check database connection
connection.connect((error) => {
    console.log('Connected to mysql database');
});
/*
function isProductInCart(cart, id){
    for(i = 0; i < cart.length; i++){
        if (cart[i].id == id){ return true; }
    }

    return false;
}


function calculateTotalCartItem(cart, req) {
    total = 0;

    for(i = 0; i < cart.length; i++){
        if(cart[i.sale_price]){
            total += (cart[i].sale_price * cart[i].quantity);
        }else{
            total += (cart[i].price *  cart[i].quantity);
        }
    }
    req.eSession.total = total;
    return total;
};*/


// root: localhost:8080
// route loads product data /landing page
app.get('/', function(request, response) {

    query = "SELECT * FROM products LIMIT 3";
    connection.query(query, (err, result)=>{
        if(!request.session.cart) {
            request.session.cart = [];
        }
        response.render('pages/index', {/*result*/products: result, cart: request.session.cart});
    });
});


app.post('/update_quantity', (req, res) => {
    const id = req.body.id;
    const quantity = parseInt(req.body.quantity);

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart[i].quantity = quantity;
        }
    }

    res.redirect('/');
});


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
        res.redirect('/');
});


app.get('/remove_item', (req, res) => {
    const id = req.query.id;

    for (let i = 0; i < req.session.cart.length; i++) {
        if (req.session.cart[i].id === id) {
            req.session.cart.splice(i, 1);
        }
    }
    res.redirect('/');
});


app.listen(8080, () => {
    console.log('Server started on localhost:8080')
});
    
    /* 
    let product = {id:id, name:name, price:price, sale_price:sale_price, quantity:quantity, image:image};
    
    let cart;
    if (req.eSession.cart) {
        cart = req.eSession.cart;

        if (!isProductInCart(cart, id)) {
            cart.push(product);
        }
    }else{
        req.eSession.cart = [product];
        cart = req.eSession.cart;
    }

    calculateTotalCartItem(cart, req);

    //return to cart
});


app.get('/cart', function(req, res) {
    let cart = req.eSession.cart;
    let total = req.eSession.total;

    res.render('pages/cart.ejs', {cart:cart, total:total});})
*/
