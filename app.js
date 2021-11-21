const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const firebase = require("firebase/app");
const firebaseAuth = require("firebase/auth");
const firebaseService = require("firebase-service");
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
        return user;
    } else {
        return undefined;
    }
});

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'https://www.example.com/finishSignUp?cartId=1234',
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: 'example.page.link'
};

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
    const userRef = await db.collection('users').doc(uid).get().catch(err => console.log(err));
    const role = userRef.data().role;
    if (role) {
        if (role.toUpperCase()=="INFLUENCER") {
            res.redirect(301, `influencer/${uid}`);
        }  
        if (role.toUpperCase()=="COMPANY") {
            res.redirect(301, "/");
        }
    } else {
        res.render(path.join(__dirname,"views/Login.ejs"), {error: "This user does not have a role"});
    }
    
    // const doc = await userRef.get();
    //finding the role of the user (influencer or company)
    // let role;
    // if (!doc.exists) {
    //     role = "Unknown";
    // } else {
    //     role = doc._fieldsProto.role.stringValue.toUpperCase();    
    //     if(role=="INFLUENCER"){
    //         res.redirect("/influencer");
    //     }else{
    //         res.redirect("/");
    //     }
    // }
    res.redirect(301, `/influencer/${uid}`);
});

app.get('/register-employer', function(req, res) {
    res.render(path.join(__dirname, "views/signUpEmployer.ejs"), {error:""});
});

app.get('/influencer', checkIfAuthenticated, (req,res)=>{
    res.render(path.join(__dirname,"./views/Influencers.ejs"));
});

app.get('/influencerFilter', checkIfAuthenticated, (req, res)=> {
    res.render(path.join(__dirname,"./views/InfluencerSearchFilter.ejs"));
});

// Showing Influencer Profile Page View
app.get('/infProfPageView', checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/influencerProfilePageView.ejs"));
});

// Showing Influencer Profile Page Edit
app.get('/infProfPageEdit',checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/influencerProfilePageEdit.ejs"));
});

// Showing Company Profile Page View
app.get('/ComProfPageView', checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/companyProfilePageView.ejs"));
});

// Showing Company Profile Page Edit
app.get('/ComProfPageEdit', checkIfAuthenticated, (req, res) => {
    res.render(path.join(__dirname,"./views/companyProfilePageEdit.ejs"));
});

app.get('/profile/:id', checkIfAuthenticated, async (req, res) => {
    // console.log(req.params);
    let uid = req.params.id;
    let snapshot = await db.collection("users").doc(uid).get().catch(err => console.log(err));
    let profile = snapshot.data();
    // console.log(profile);
    // let name = await db.collection("users").doc(auth.currentUser.user.uid).get("displayName").catch(err => console.log(err));
    res.render(path.join(__dirname, "views/profilePage.ejs"), {profile:profile});
});

app.post('/influencerResult', checkIfAuthenticated, (req, res)=>{
    console.log(req.body);
    const genre = req.body["market-select"];
    const location = req.body["location-select"];
    res.redirect(301, `/searchResult/${genre}/${location}`);
    //res.redirect("/searchResult/" +genre + "/" + location);
});

app.get('/searchResult/:genre/:location', checkIfAuthenticated, async (req, res) => {
    let snapshot = await db.collection("users").get().catch(err => console.log(err));
    let influencers = [];
    // for (let snap of snapshot) {
    //     let id = snap.id;
    //     influencers.push({
    //         id: snap.data()
    //     });
    // }
    snapshot.forEach(doc => {
        let influencer = {...doc.data(), id: doc.id};
        influencers.push(influencer);
    });
    console.log(influencers);
    res.render(path.join(__dirname, "views/InfluencerSearchFilter.ejs"), {influencers: influencers});
});

app.listen(8080,()=>{
    console.log("Connected to server");
});