let express = require('express');
let path = require('path');
let app = express();

app.use(express.static("images"));
app.use(express.static("styles"));
app.use(express.static("views"));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './views/Home.html'));
    //res.send("test");
});

app.listen(8088,()=>{
    console.log("Connected to server");
});