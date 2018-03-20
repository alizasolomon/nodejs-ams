var bodyParser = require('body-parser');
var shortid = require('shortid');
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
    tbl.aggregate([{
      $project: {
        "assetId": "$assetId",
        "itemName": "$itemName",
        "description": "$description",
        "category": "$category",
        "quantity": "$quantity",
        "total" : {
          "$let": {
            "vars": {
              "totalIn": {
                "$sum": {
                  "$map": {
                    "input": {
                        "$filter": {
                          "input": "$quantity",
                          "cond": {
                            "$eq": [
                              "$$this.issue",
                              1
                            ]
                          }
                        }
                      },
                      "in": "$$this.itemCount"
                  }
                }
              },
              "totalOut": {
                "$sum": {
                  "$map": {
                    "input": {
                        "$filter": {
                          "input": "$quantity",
                          "cond": {
                            "$eq": [
                              "$$this.issue",
                              0
                            ]
                          }
                        }
                      },
                      "in": "$$this.itemCount"
                  }
                }
              },
            },
            "in": {
              "totalQuantity":{
                "$subtract": [ "$$totalIn", "$$totalOut" ]
              },
              "totalIn": "$$totalIn",
              "totalOut": "$$totalOut",
            }
          }
        },
        /*"totalQuantity": {
          "$sum": "$quantity.itemCount"
        },*/
        /*"totalQuantity": {
          "$subtract": [ "$$totalOut", "$$totalIn" ]
        },*/
        "lastUpdate": "$lastUpdate"
      }
    }], function(err, count) {
      console.log(count);

      tbl.populate(count, {
        path: "category"
      }, function(err, categoryStock) {
        if (err) throw err;
        //console.log(categoryStock);
        tbl.Category.find({}, function(err, cat) {
          res.render('stocks', {
            stockData: categoryStock,
            caData: cat,
          });
        });
      });
    })
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
    console.log(formData);
  });

  app.post('/addQuantity', urlencodedParser, function(req, res) {
    var data = req.body;
    console.log(data);
    var q = {
      itemCount: data.quantity,
      issue: '1'
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
        //console.log(err);
        res.redirect('/stocks');
      });
  });

  app.post('/editStock', urlencodedParser, function(req, res) {
    var data = req.body;
    //console.log(data);
    tbl.Category.update({
      _id: data.oldCategory
    }, {
      $pull: {
        stock: data.u
      }
    }, function(err) {
      tbl.Category.findOneAndUpdate({
          _id: data.category
        }, {
          $push: {
            stock: data.u
          }
        }, {
          safe: true,
          upsert: true
        },
        function(err, model) {
          if (err) throw err;
          tbl.findOneAndUpdate({
            _id: data.u
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
    });


  });

  app.get('/deleteData', function(req, res) {
    var data = req.query;
    console.log(data);
    if (data.page === 'stocks') {
      tbl.Category.update({
        _id: data.cat
      }, {
        $pull: {
          stock: data.u
        }
      }, function(err) {
        if (err) throw err;
        else {
          console.log('Deleted from category');
          tbl.findOneAndRemove({
            _id: data.u
          }).then(function() {
            tbl.findOne({
              _id: data.u
            }).then(function(result) {
              console.log('Successfully deleted the Record');
              res.redirect('/stocks');
            });
          });
        }
      });
    } else if (data.page === 'category') {
      tbl.Category.findOneAndRemove({
        _id: data.u
      }).then(function() {
        tbl.Category.findOne({
          _id: data.u
        }).then(function(result) {
          console.log('Successfully deleted the Record');
          res.redirect('/stocksCategory');
        });
      });
    } else if (data.page === 'dept') {
      tbl.Department.findOneAndRemove({
        _id: data.u
      }).then(function() {
        tbl.Department.findOne({
          _id: data.u
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
      _id: data.u
    }, {
      caName: data.caName,
      caDescription: data.caDescription,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Category.findOne({
        _id: data.u
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/stocksCategory');
      });
    });
  });


  /*User*/
  app.get('/users', function(req, res) {
    tbl.Users.find({}).populate('department').exec(function(err, data) {
      if (err) throw err;
      //console.log(categoryStock);
      tbl.Department.find({}, function(err, dept) {
        res.render('users', {
          usersData: data,
          deptData: dept,
        });
      });
    });
  });

  app.post('/addUsers', urlencodedParser, function(req, res) {
    var form = req.body;
    var newUsers = tbl.Users(form).save(function(err, data) {
      if (err) throw err;
      else {
        //console.log(data);
        tbl.Department.findOneAndUpdate({
            _id: form.department
          }, {
            $push: {
              users: data._id
            }
          }, {
            safe: true,
            upsert: true
          },
          function(err, model) {
            if (err) throw err;
            res.redirect('/users');
          });
      }
    });
  });

  app.post('/editUsers', urlencodedParser, function(req, res) {
    var data = req.body;
    console.log(data);
    tbl.Department.update({
      _id: data.oldDepartment
    }, {
      $pull: {
        users: data.u
      }
    }, function(err) {
      tbl.Department.findOneAndUpdate({
          _id: data.department
        }, {
          $push: {
            users: data.u
          }
        }, {
          safe: true,
          upsert: true
        },
        function(err, model) {
          if (err) throw err;
          tbl.Users.findOneAndUpdate({
            _id: data.u
          }, {
            userFName: data.userFName,
            userLName: data.userLName,
            department: data.department,
            lastUpdate: Date.now()
          }).then(function() {
            tbl.Users.findOne({
              _id: data.u
            }).then(function(result) {
              console.log('Successfully updated the Record');
              res.redirect('/users');
            });
          });
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
      _id: data.u
    }, {
      status: newStat,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Users.findOne({
        _id: data.u
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/users');
      });
    });

  });

  app.get('/userDepartment', function(req, res) {
    tbl.Department.find({}).populate('users').exec(function(err, data) {
      console.log(data);
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

  app.post('/editDept', urlencodedParser, function(req, res) {
    var data = req.body;
    console.log(data);
    tbl.Department.findOneAndUpdate({
      _id: data.u
    }, {
      deptName: data.deptName,
      deptDescription: data.description,
      lastUpdate: Date.now()
    }).then(function() {
      tbl.Department.findOne({
        _id: data.u
      }).then(function(result) {
        console.log('Successfully updated the Record');
        res.redirect('/userDepartment');
      });
    });
  });

  app.get('/inventory', function(req, res) {
    tbl.aggregate([{
      $project: {
        "assetId": "$assetId",
        "itemName": "$itemName",
        "category": "$category",
        "quantity": "$quantity",
        "total" : {
          "$let": {
            "vars": {
              "totalIn": {
                "$sum": {
                  "$map": {
                    "input": {
                        "$filter": {
                          "input": "$quantity",
                          "cond": {
                            "$eq": [
                              "$$this.issue",
                              1
                            ]
                          }
                        }
                      },
                      "in": "$$this.itemCount"
                  }
                }
              },
              "totalOut": {
                "$sum": {
                  "$map": {
                    "input": {
                        "$filter": {
                          "input": "$quantity",
                          "cond": {
                            "$eq": [
                              "$$this.issue",
                              0
                            ]
                          }
                        }
                      },
                      "in": "$$this.itemCount"
                  }
                }
              },
            },
            "in": {
              "totalQuantity":{
                "$subtract": [ "$$totalIn", "$$totalOut" ]
              },
              "totalIn": "$$totalIn",
              "totalOut": "$$totalOut",
            }
          }
        }
      }
    }], function(err, count) {
      tbl.populate(count, {
        path: "category"
      }, function(err, stock) {
        if (err) throw err;
        //console.log(categoryStock);
        tbl.Users.find({}).populate('department').exec(function(err, user) {
          res.render('inventory', {
            stockData: stock,
            userData: user,
          });
        });
      });
    })
  });

  app.post('/addInventory', urlencodedParser, function(req, res) {
    var form = req.body;

    var id = form.u;
    var quant = form.quantity;
    var users = form.user;

    var shortId = 'MSW-' + shortid.generate();

    if (Array.isArray(id) === true) {
      var fin_array = new Array();
      for (var c = 0; c < id.length; c++) {
        var q = {
          stock: id[c],
          quantity: quant[c]
        };
        var s = {
          itemCount: quant[c],
          issuedBy: users,
          issue: '0'
        };
        tbl.findOneAndUpdate({
            _id: id[c]
          }, {
            $push: {
              quantity: s,
            }
          }, {
            safe: true,
            upsert: true
          },
          function(err, model) {
            //console.log(err);
          });
        fin_array.push(q);
      }
      var insertdata = {
        trID: shortId,
        users: form.user,
        transactions: fin_array
      };
    } else {
      var q = {
        stock: id,
        quantity: quant
      };
      var s = {
        itemCount: quant,
        issuedBy: users,
        issue: '0'
      };

      tbl.findOneAndUpdate({
          _id: id
        }, {
          $push: {
            quantity: s,
          }
        }, {
          safe: true,
          upsert: true
        },
        function(err, model) {
          //console.log(model);
        });

      var insertdata = {
        trID: shortId,
        users: form.user,
        transactions: q
      };
    }

    tbl.Transactions(insertdata).save(function(err, data) {
      if (err) throw err;
      res.redirect('/inventory');
    });
  });

  app.get('/transactions', function(req, res) {
    tbl.Transactions.find({}).populate({
      path: 'users',
      populate: {
        path: 'department'
      }
    }).populate('transactions.stock').exec(function(err, data) {
      if (err) throw err;
      res.render('transactions', {
        transData: data
      });
    });
  });

}
