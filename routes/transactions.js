const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var config = require('../config.js');
var URL = config.URL;

router.post("/search", (req, res, next) => {
  const { term, categories, page, type, sort, sortName, filters, creditor } = req.body;
  let archived = null;
  if(req.body.archived == false){
    archived = false;
  }
  if(req.body.archived){
    archived = true;
  }

  let pif = null;
  if(req.body.paid_in_full == false){
    pif = false;
  }
  if(req.body.paid_in_full){
    pif = true;
  }
  
  var sortObj = {};
    if(sort == 'asc'){
      sortObj[sortName] = 1;
    }else{
      sortObj[sortName] = -1;
    }
  var filterQuery = [];
  var reg;
  for(let i = 0; i < filters.length; i++){
    var obj = {};
    switch(filters[i].type){
      case 'number':
          switch(filters[i].operator){
            case 'between':
              obj[filters[i].name] = {$gt:Number(filters[i].min), $lt:Number(filters[i].max)}
              break;
            case 'greater than':
              obj[filters[i].name] = {$gt:Number(filters[i].value)}
              break;
            case 'less than':
              obj[filters[i].name] = {$lt:Number(filters[i].value)}
              break;
          }
          break;
      case 'string':
          switch(filters[i].operator){
            case 'contains':
              reg = new RegExp(filters[i].value, 'i');
              obj[filters[i].name] = reg;
              break;
            case 'excludes':
              reg = new RegExp(filters[i].value, 'i');
              obj[filters[i].name] = {$not:{$regex:reg}};
              break;
          }
          break;
      case 'bool':
          switch(filters[i].operator){
            case 'equals':
              
              obj[filters[i].name] = (filters[i].value == 'true');
              break;
          }
          break;
      case 'date':
          switch(filters[i].operator){
            case 'on':
              obj[filters[i].name] = {$eq:filters[i].startDate}
              break;
            case 'after':
              obj[filters[i].name] = {$gte:filters[i].startDate}
              break;
            case 'before':
              obj[filters[i].name] = {$lte:filters[i].startDate}
              break;
          }
          break;
    }
    filterQuery.push(obj);
  }; 
  reg = new RegExp(term, 'i');
  
  filterQuery.push({account_number:reg})
  if(type != 'all'){
    if(type == 'master'){
      
    }else{
      filterQuery.push({status:type})
    }
    
  }
 

  var query = {$and: filterQuery}
  if(term == ''){
    query = {}
  }else{
    query = {$text:{$search:term}}
  }
  filterQuery.push({creditor:creditor});
   var skip = page * 10 - 10;
  MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("transactions");
    var call = collection.find(query).sort(sortObj).skip(skip).limit(25);
    call.toArray((err, result) =>{
      collection.count(query).then(count=>{
        client.close();
        res.send({query, items:result, total:count});
        // res.send({items:result, total:count});
      },err=>{
        console.log(err)
      })
     
    })
  });
});

  router.post("/add", (req, res, next) => {
    const {transactionId, charge, userId,account_number, balanceAfterPayment, userName, clientId, amount, type, last4, payment_date} = req.body;
    let t_id = 'none';
    if(transactionId){
      t_id = transactionId;
    }
    console.log(payment_date);
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("transactions");
      collection.insert({
          client_id:clientId,
          account_number:account_number,
          charge:charge,
          user_id:userId,
          user_name:userName,
          balance_after_payment:balanceAfterPayment,
          amount,
          type,
          last_4:last4,
          transaction_id:t_id,
          payment_date: new Date(payment_date),
          created_at: new Date()
       }).then(result=>{
        client.close();
        res.send(result);
      })
              
    });
  });

  router.get("/:id", (req, res, next) => {
    var id = req.params.id;
    
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("transactions");
      collection.find({client_id: id}).toArray().then(result=>{
        client.close();
        res.send(result);
      })
              
    });
  });
module.exports = router;