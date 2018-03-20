var express = require('express');
var functions = require('./controllers/functions');

var app = express();

//set up template engine
app.set('view engine', 'ejs');
app.use(express.static('./public'));

//pass express to function
functions(app);

const port = process.env.PORT || 4000;

app.listen(port);
console.log('You are listening to port 3000');
