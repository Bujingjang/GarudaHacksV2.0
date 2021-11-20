let express = require('express');
let app = express();

app.get('/', function(req, res){
    res.send("test");
});

app.listen(8080);