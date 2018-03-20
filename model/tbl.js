var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StocksSchema = new Schema({
  assetId: String,
  itemName: String,
  description: String,
  category: {type: Schema.ObjectId, ref: 'Category'},
  quantity: [{
    itemCount: {type: Number, default: 0},
    dateUpdate: {type: Date, default: Date.now},
    issue: Number,
    issuedBy: {type: Schema.ObjectId, ref: 'Users'}
  }],
  lastUpdate: {type: Date, default: Date.now}
});

var CaSchema = new Schema({
  caCode: String,
  caName: String,
  caDescription: String,
  stock: [{type: Schema.ObjectId, ref: 'Stocks'}],
  lastUpdate: {type: Date, default: Date.now}
});

var UsersSchema = new Schema({
  userId: String,
  userFName: String,
  userLName: String,
  department: {type: Schema.ObjectId, ref: 'Department'},
  status: {type: Boolean, default: true},
  lastUpdate: {type: Date, default: Date.now}
});

var deptSchema = new Schema({
  deptCode: String,
  deptName: String,
  deptDescription: String,
  users: [{type: Schema.ObjectId, ref: 'Users'}],
  lastUpdate: {type: Date, default: Date.now}
});

var TransactionsSchema = new Schema({
  trID: String,
  users: {type: Schema.ObjectId, ref: 'Users'},
  update: {type: Date, default: Date.now},
  transactions: [{
    stock: {type: Schema.ObjectId, ref: 'Stocks'},
    quantity: {type: Number, default: 0},
  }]
});


var Base = mongoose.model('Stocks', StocksSchema);
Base.Category = mongoose.model('Category', CaSchema);
Base.Users = mongoose.model('Users', UsersSchema);
Base.Department = mongoose.model('Department', deptSchema);
Base.Transactions = mongoose.model('Transactions', TransactionsSchema);


var exports = module.exports = Base;
