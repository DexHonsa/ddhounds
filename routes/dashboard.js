const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var config = require('../config.js');
var URL = config.URL;
  router.post("/get_transaction_history", (req, res, next) => {
    const {userId, startDate, endDate} = req.body;
    console.log(new Date(startDate));
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("transactions");
      collection.find({created_at:{$gt: new Date(startDate), $lt: new Date(endDate)}, user_id:userId}).toArray().then(result=>{
        client.close();
        res.send(result);
      })
              
    });
  });

module.exports = router;