const express = require('express');
const path = require('path');
const app = express();


app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("views"));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render(path.join(__dirname, "./views/Home.ejs"));
    //res.send("test");
});

app.get('/register-influencer', function(req, res) {
    console.log("customer");
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.listen(8080,()=>{
    console.log("Connected to server");
});