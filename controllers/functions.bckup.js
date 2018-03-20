var bodyParser = require('body-parser');
var connect = require('./connection');
var tbl = require('../model/tbl.js');

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('dashboard');
  });

  app.get('/stocks', function(req, res) {
    tbl.find({}).populate('category').exec(function(err, data) {
      tbl.aggregate([
        {
          "$project": {
            "totalQuantity": {
              "$sum": "$quantity.itemCount"
            }
          }
        }
      ], function(err,count){
        console.log(count);
        tbl.Category.find({}, function(err, cat) {
          res.render('stocks', {
            stockData: data,
            caData: cat,
            count: count
          });
        })
      });

    })

    /*tbl.find({}).populate('category').exec(function(err,data){
      tbl.Category.find({},function(err,cat){
          res.render('stocks', {stockData: data, caData: cat});
      })
    })*/
  });

  /*Stock Post*/
  app.post('/addStock', urlencodedParser, function(req, res) {
    var formData = req.body;
    var newStocks = tbl(formData).save(function(err, data) {
      if (err) throw err;
      else {
        //console.log(data);
        tbl.Category.findOneAndUpdate({
            _id: formData.category
          }, {
            $push: {
              stock: data._id
            }
          }, {
            safe: true,
            upsert: true
          },
          function(err, model) {
            if (err) throw err;
            res.redirect('/stocks');
          });
      }
    });
  });

  app.post('/addQuantity', urlencodedParser, function(req, res) {
    var data = req.body;
    console.log(data);
    var q = {
      itemCount: data.quantity,
      issuedBy: 'Delivery'
    };
    tbl.findOneAndUpdate({
        _id: data.asset
      }, {
        $push: {
          quantity: q
        }
      }, {
        safe: true,
        upsert: true
      },
      function(err, model) {
        console.log(err);
        res.redirect('/stocks');
      });
  });

  app.post('/editStock', urlencodedParser, function(req, res) {
    console.log(req.body);
    var data = req.body;
    tbl.findOneAndUpdate({
      assetId: data.assetId
    }, {
      itemName: data.itemName,
      description: data.description,
      category: data.category,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.findOne({
        assetId: data.assetId
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/stocks');
      });
    });
  });

  app.get('/deleteData', function(req, res) {
    var data = req.query;
    if (data.page === 'stocks') {
      tbl.findOneAndRemove({
        assetId: data.assetId
      }).then(function() {
        tbl.findOne({
          assetId: data.assetId
        }).then(function(result) {
          console.log('Successfully deleted the Record');
          res.redirect('/stocks');
        });
      });
    } else if (data.page === 'category') {
      tbl.Category.findOneAndRemove({
        caCode: data.caCode
      }).then(function() {
        tbl.Category.findOne({
          caCode: data.caCode
        }).then(function(result) {
          console.log('Successfully deleted the Record');
          res.redirect('/stocksCategory');
        });
      });
    } else if (data.page === 'dept') {
      tbl.Department.findOneAndRemove({
        deptCode: data.deptCode
      }).then(function() {
        tbl.Department.findOne({
          deptCode: data.deptCode
        }).then(function(result) {
          console.log('Successfully deleted the Record');
          res.redirect('/userDepartment');
        });
      });
    }
  });

  /*Category*/
  app.get('/stocksCategory', function(req, res) {
    tbl.Category.find({}).populate('stock').exec(function(err, data) {
      if (err) throw err;
      res.render('category', {
        caData: data
      });
    });
  });

  app.post('/addCategory', urlencodedParser, function(req, res) {
    tbl.Category(req.body).save(function(err, data) {
      if (err) {
        throw err;
      }
      console.log('Successfully Added New Record');
      res.redirect('/stocksCategory');
    });
  });

  app.post('/editCategory', urlencodedParser, function(req, res) {
    console.log(req.body);
    var data = req.body;
    tbl.Category.findOneAndUpdate({
      caCode: data.caCode
    }, {
      caName: data.caName,
      caDescription: data.caDescription,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Category.findOne({
        caCode: data.caCode
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/stocksCategory');
      });
    });
  });


  /*User*/
  app.get('/users', function(req, res) {
    tbl.Users.find({}, function(err, data) {
      if (err) throw err;
      res.render('users', {
        usersData: data
      });
    });
  });

  app.post('/addUsers', urlencodedParser, function(req, res) {
    var newUsers = tbl.Users(req.body).save(function(err, data) {
      if (err) throw err;
      console.log('Successfully Added New Record');
      res.redirect('/users');
    });
  });

  app.post('/editUsers', urlencodedParser, function(req, res) {
    console.log(req.body);
    var data = req.body;
    tbl.Users.findOneAndUpdate({
      userId: data.userId
    }, {
      userFName: data.userFName,
      userLName: data.userLName,
      department: data.department,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Users.findOne({
        userId: data.userId
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/users');
      });
    });
  });

  app.get('/statAcc', function(req, res) {
    var data = req.query;

    if (data.stat == 'true') {
      var newStat = 'false';
    } else {
      var newStat = 'true';
    }

    tbl.Users.findOneAndUpdate({
      userId: data.userId
    }, {
      status: newStat,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Users.findOne({
        userId: data.userId
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/users');
      });
    });

  });

  app.get('/userDepartment', function(req, res) {
    tbl.Department.find({}, function(err, data) {
      if (err) throw err;
      res.render('department', {
        deptData: data
      });
    });
  });

  app.post('/addDept', urlencodedParser, function(req, res) {
    var newDept = tbl.Department(req.body).save(function(err, data) {
      if (err) throw err;
      console.log('Successfully Added New Record');
      res.redirect('/userDepartment');
    });
  });

  //app.delete('/', function(req,res){

  //});
}
