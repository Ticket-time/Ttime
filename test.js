const express = require("express");
const app = express();
const request = require("request");
const port = 3000;
app.listen(3000);

app.get('/image', function(req, res){
    const options = {
        url : "http://3.37.125.95/home/ubuntu/img/IMG_3385.jpg",
        method: 'GET',
        encoding: null

    };

    request(options, (err, response, body) => {
        res.set('Content-Type', response.headers['content-type']);
        res.send(body);
    });

});