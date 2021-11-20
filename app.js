const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const firebaseService = require("firebase-service");
const serviceAccount = require("./garudahacks-f6ce2-firebase-adminsdk-pq2va-267b29bf43.json");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("views"));
app.use(express.static(__dirname + '/public'));

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});

const db = firebaseAdmin.firestore();
const userCollection = 'users';

const getAuthToken = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        req.authToken = req.headers.authorization.split(' ')[1];
    } else {
        req.authToken = null;
    }
    next();
};

app.get('/', function(req, res){
    res.render(path.join(__dirname, "./views/Home.ejs"));
    //res.send("test");
});

app.get('/register-influencer', function(req, res) {
    //console.log("customer");
    // let anjing = {
    //     Public: {
    //         name: "ANJING",
    //     },
    // };
    // db.collection("Sample").doc("TIKBAI").set(anjing);
    res.render(path.join(__dirname, "views/signUpInfluencer.ejs"), {error:''});
});

app.get('/login',(req,res)=>{
    res.render(path.join(__dirname,"./views/Login.ejs"));
})

app.post('/register-influencer', async (req, res) => {
    console.log("posted data for registering influencers");
    const {
        displayName,
        email,
        password,
        birthdate,
        phoneNumber
    } = req.body;
    console.log(req.body);
    const user = await firebaseAdmin.auth().createUser({
        email,
        password,
        birthdate,
        phoneNumber: phoneNumber,
        displayName: displayName,
    }).catch(
        (err)=> {
            console.log(err);
            res.render(path.join(__dirname, "views/register.ejs"), {error: err});
        }
    );
    console.log(user);
    // const user = await firebaseAdmin.auth().createUserWithEmailAndPassword({
    //     email:email,
    //     password:password
    // }).catch(err=>console.log(err));
    res.redirect("/");
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.get('/home', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.get('/profile', function(req, res) {
    res.render(path.join(__dirname, "views/profilePage.ejs"));
});

app.listen(8080,()=>{
    console.log("Connected to server");
});