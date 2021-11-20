const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./garudahacks-f6ce2-firebase-adminsdk-pq2va-adbd36d8f6.json");

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("views"));

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

const db = firebaseAdmin.firestore();
const userCollection = 'users';

app.get('/', function(req, res){
    res.render(path.join(__dirname, "./views/Home.ejs"));
    //res.send("test");
});

app.get('/login',(req,res)=>{
    res.render(path.join(__dirname,"./views/Login.ejs"));
})

app.get('/register-influencer', function(req, res) {
    console.log("customer");
    let anjing = {
        Public: {
            name: "ANJING"
        }
    };
    // db.collection("Sample").doc("TIKBAI").set(anjing);
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.post('register-influencer', function(req, res) {
    console.log("posted data for registering influencers");
    res.redirect();
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.listen(8080,()=>{
    console.log("Connected to server");
});