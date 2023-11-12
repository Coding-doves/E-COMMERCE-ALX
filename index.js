const express = require('express');
const ejs = require('ejs');
const bodyParser  = require('body-parser');
const mysql = require('mysql');
const session = require('express-session')
//const https = require('http');
const { hostname } = require('os');

//connect to mysql database.
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"e-commerce_project"
});

//const hostname = '0.0.0.0';
const port = 8080;

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
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Zeet Node');
});

server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}/`);
});
*/

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


app.listen(port, () => {
    console.log('Server started on localhost:8080')
});
