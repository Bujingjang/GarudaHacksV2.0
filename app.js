const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase/app");
const firebaseService = require("firebase-service");
const firebaseAuth = require("firebase/auth");
const serviceAccount = require("./garudahacks-f6ce2-firebase-adminsdk-pq2va-c79c219345.json");
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
        console.log("YES");
        return user;
    }
});

// const getArticles = async () => {
//     const token = await auth.currentUser.getIdToken();
    
//     return axios.get('https://your-api-url/articles', {headers:  
//       { authorization: `Bearer ${token}` }})
//       .then(res => res.data);
// }
    

//still not done
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
  
  
//still not done
const checkIfAuthenticated = (req, res, next) => {
   getAuthToken(req, res, async () => {
      try {
        console.log("CHECKING");
        console.log(auth.currentUser);
        const { authToken } = await auth.currentUser.getIdToken();
        console.log(authToken);
        
        const userInfo = await firebaseService.admin
          .auth()
          .verifyIdToken(authToken);
        req.authId = userInfo.uid;
        return next();
      } catch (e) {
        return res
          .status(401)
          .send({ error: 'You are not authorized to make this request' });
      }
    });
  };


app.get('/', function(req, res){
    res.render(path.join(__dirname, "./views/Home.ejs"));
    //res.send("test");
});

app.get('/register-influencer', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"), {error:''});
});

app.post('/register-influencer', (req, res) => {
    console.log("posted data for registering influencers");
    const {
        displayName,
        email,
        password,
        birthdate,
        phoneNumber
    } = req.body;
    console.log(req.body);
    const user = firebaseAdmin.auth().createUser({
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
    res.redirect("/login");
});

app.get('/login', (req,res)=>{
    res.render(path.join(__dirname,"./views/Login.ejs"));
});

app.post('/login', async (req, res) => {
    const {
        username,
        password,
        checked
    } = req.body;
    console.log(username, password);
    console.log(req.body);
    const user = await firebaseAuth.signInWithEmailAndPassword(auth, username, password).catch(
        (err) => {
            console.log(err)
            console.log("LOGIN FAILED");
        });
    
    console.log(user);
    res.redirect("/home");
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/register.ejs"));
});

app.get('/home', checkIfAuthenticated, function(req, res) {
    res.render(path.join(__dirname, "views/Home.ejs"));
});

app.get('/profile', function(req, res) {
    res.render(path.join(__dirname, "views/profilePage.ejs"));
});

app.listen(8080,()=>{
    console.log("Connected to server");
});