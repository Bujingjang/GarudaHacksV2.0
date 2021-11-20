const express = require('express');
const path = require('path');
const app = express();
const app2 = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const firebaseFunctions = require("firebase-functions");

app.use('/api/v1', app2);
app.use(bodyParser.json());
app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("views"));
app.use(express.static(__dirname + '/public'));

firebaseAdmin.initializeApp(firebaseFunctions.config().firebase);

const db = firebaseAdmin.firestore();
const userCollection = 'users';
const webApi = firebaseFunctions.https.onRequest(app);

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