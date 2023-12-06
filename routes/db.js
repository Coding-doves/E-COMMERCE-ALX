const mysql = require('mysql');

//connect to mysql database.
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"e-commerce_project"
});

module.exports = connection;
