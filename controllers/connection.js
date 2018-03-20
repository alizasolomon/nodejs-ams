var mongoose = require('mongoose');

//Connection
mongoose.connect('mongodb://localhost/assetManagement');

mongoose.connection.once('open',function(){
  console.log('Now connected to MongoDB: assetManagement');
}).on('error',function(error){
  console.log('Error');
});
