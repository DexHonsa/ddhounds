const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var config = require('../config.js');
var URL = config.URL;
  router.get("/get_all/:id", (req, res, next) => {
    let userId = req.params.id;
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("notifications");
      collection.find({user_id:userId}).toArray().then(result=>{
        client.close();
        res.status(200).send(result);
      },err=>{
        client.close();
        res.status(500).send({message:'Error'});
      })
              
    });
  });
 

module.exports = router;