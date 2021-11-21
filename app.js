const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase/app");
const firebaseAuth = require("firebase/auth");
const firebaseService = require("firebase-service");
const serviceAccount = require("./garudahacks-f6ce2-firebase-adminsdk-pq2va-adbd36d8f6.json");

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

const firebaseConfig = {
    apiKey: "AIzaSyDJv0pnzZSMYPVAyJ7SIoxdE5EyZNwRLks",
    authDomain: "garudahacks-f6ce2.firebaseapp.com",
    projectId: "garudahacks-f6ce2",
    storageBucket: "garudahacks-f6ce2.appspot.com",
    messagingSenderId: "1007671370287",
    appId: "1:1007671370287:web:ff3036b5ed7fc516b7dcda",
    measurementId: "G-ZNHJGS3HBS"
};

firebase.initializeApp(firebaseConfig);

const auth = firebaseAuth.getAuth();

auth.onAuthStateChanged( user => {
    if (user) {
        return user;
    } else {
        return undefined;
    }
});

// const getArticles = async () => {
//     const token = await auth.currentUser.getIdToken();
    
//     return axios.get('https://your-api-url/articles', {headers:  
//       { authorization: `Bearer ${token}` }})
//       .then(res => res.data);
// }
    

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

const checkIfAuthenticated = (req, res, next) => {
    getAuthToken(req, res, async () => {
        return auth.currentUser?next():res
        .status(401)
        .send({ error: 'You are not authorized to make this request' });
    });
};


app.get('/', function(req, res){
    res.render(path.join(__dirname, "./views/Home.ejs"));
    //res.send("test");
});

app.get('/register-influencer', function(req, res) {
    res.render(path.join(__dirname, "views/signUpInfluencer.ejs"), {error:''});
});

app.get('/login',(req,res)=>{
    res.render(path.join(__dirname,"./views/Login.ejs"), {error:''});
});

app.get('/influencer/:id', checkIfAuthenticated, (req,res)=>{
    res.render(path.join(__dirname,"./views/Influencers.ejs"));
});

app.get('influencerFilter', (req, res)=> {
    res.render(path.join(__dirname,"./views/InfluencerSearchFilter.ejs"));
});

// Showing Influencer Profile Page View
app.get('/infProfPageView',checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/influencerProfilePageView.ejs"));
});

// Showing Influencer Profile Page Edit
app.get('/infProfPageEdit',checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/influencerProfilePageEdit.ejs"));
});

// Showing Company Profile Page View
app.get('/ComProfPageView',checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/companyProfilePageView.ejs"));
});

// Showing Company Profile Page Edit
app.get('/ComProfPageEdit',checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/companyProfilePageEdit.ejs"));
});

app.post('/register-influencer', async (req, res) => {
    console.log("posted data for registering influencers");
    const {
        fullname,
        email,
        password,
        birthdate,
        phoneNumber
    } = req.body;
    const user = await firebaseAdmin.auth().createUser({
        email,
        password,
        birthdate,
        phoneNumber: phoneNumber,
        displayName: fullname
    }).catch(
        (err)=> {
            console.log(err);
            res.render(path.join(__dirname, "views/signUpInfluencer.ejs"), {error: err});
        }
    );
    const userInfo = {
        "email" : email,
        "password" : password,
        "displayName":fullname,
        "birthdate":birthdate,
        "phoneNumber":phoneNumber,
        "role" : "influencer"
    };
    const newDoc = await db.collection("users").doc(user.uid).set(userInfo).catch((err)=>{
        res.render(path.join(__dirname, "views/signUpInfluencer.ejs"), {error: err});
    });
    res.redirect("/login");
});

app.get('/login', (req,res)=>{
    res.render(path.join(__dirname,"./views/Login.ejs"));
});

app.post('/login', async (req, res) => {
    const {
        email,
        password,
        checked
    } = req.body;
    console.log(email, password);
    console.log(req.body);
    const user = await firebaseAuth.signInWithEmailAndPassword(auth, email, password).catch(
        (err) => {
            console.log(err)
            console.log("LOGIN FAILED");
            res.render(path.join(__dirname,"views/Login.ejs"), {error: err});
        });
    var uid = user.user.uid;
    console.log(uid, "LOGIN SUCCESSFUL");
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    //finding the role of the user (influencer or company)
    let role;
    if (!doc.exists) {
        role = "Unknown";
    } else {
        role = doc._fieldsProto.role.stringValue.toUpperCase();    
        if(role=="INFLUENCER"){
            res.redirect("/influencer");
        }else{
            res.redirect("/");
        }
    }
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/signUpEmployer.ejs"), {error:""});
});

app.get('/home', checkIfAuthenticated, function(req, res) {
    res.render(path.join(__dirname, "views/Home.ejs"));
});

app.get('/profile', checkIfAuthenticated, function(req, res) {
    res.render(path.join(__dirname, "views/profilePage.ejs"));
});

app.post('/influencerResult',(req, res)=>{
    console.log(req.body);
    const genre = req.body["market-select"];
    const location = req.body["location-select"];
    res.redirect(301, `/searchResult/${genre}/${location}`);
    //res.redirect("/searchResult/" +genre + "/" + location);
});

app.get('/searchResult/:genre/:location', (req, res) => {
    console.log("genre: " + req.params.genre);
    console.log("location: " + req.params.location);
    res.render(path.join(__dirname, "views/InfluencerSearchFilter.ejs"));
});

app.listen(8080,()=>{
    console.log("Connected to server");
});