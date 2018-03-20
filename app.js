var express = require('express');
var functions = require('./controllers/functions');

var app = express();

//set up template engine
app.set('view engine', 'ejs');
app.use(express.static('./public'));

//pass express to function
functions(app);

app.listen(3000);
console.log('You are listening to port 3000');
