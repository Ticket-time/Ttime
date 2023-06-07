var mysql = require('mysql');
require('dotenv').config()
console.log(process.env)
var db = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT
});

db.connect(function(err) {
    if(err) {
        console.error('DB connection failed' + err.stack);
        return;
    }
    console.log('connected to DB');
})

module.exports = db;