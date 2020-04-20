const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;

var jwt = require("jsonwebtoken");
var config = require("../config");
var moment = require('moment');



var URL = config.URL;

router.post('/get_clock',(req,res)=>{
  let {date, user_id} = req.body;
  date = new Date(date);
  date.setHours(0,0,0,0);
  MongoClient.connect(
        URL,
        function (err, client) {
          const db = client.db('main');
          if (err) throw err;
          var clock = db.collection('clock');
          clock.findOne({$and:[{user_id},{date: new Date(date)}] }).then(result => {
              res.status(200).send(result)
          }, err => {
            res.status(500).send({ message: 'error' })
          })
    
        })
})

router.post('/clock',(req,res)=>{
  let update = req.body;
  if(update.clock_in){
    update.clock_in = new Date(update.clock_in)
  }
  if(update.clock_out){
    update.clock_out = new Date(update.clock_out)
  }
  if(update.lunch_in){
    update.lunch_in = new Date(update.lunch_in)
  }
  if(update.lunch_out){
    update.lunch_out = new Date(update.lunch_out)
  }
  if(update.date){
    let d = new Date(update.date);
    d.setHours(0,0,0,0);
    update.date = new Date(d);
  }

  MongoClient.connect(
        URL,
        function (err, client) {
          const db = client.db('main');
          if (err) throw err;
          var clock = db.collection('clock');
          clock.findOneAndUpdate({ user_id:update.user_id, date: new Date(update.date) } ,{$set:update}, {upsert:true}).then(result => {
                    res.status(200).send({message:'clocked'})
           
          }, err => {
            res.status(500).send({ message: 'error' })
          })
    
        })
})

router.post('/add', (req,res)=>{
    let state = req.body;
    state.week_of = new Date(state.week_of);
    MongoClient.connect(
        URL,
        function (err, client) {
          const db = client.db('main');
          if (err) throw err;
          var timesheets = db.collection('timesheets');
          
          
          timesheets.find({ $and:[{week_of: new Date(state.week_of)},{user_id:state.user_id}] }).toArray().then(result => {
              if(result.length > 0){
                state.week_of = new Date(state.week_of);
                timesheets.findOneAndUpdate({_id:ObjectId(result[0]._id)}, {$set:state}).then(()=>{
                  res.status(200).send({message:'submitted successfully'})
                })
                  
              }else{
                  
                timesheets.insert(state).then(()=>{
                    res.status(200).send({message:'submitted successfully'})
                })
              }
           
          }, err => {
            res.status(500).send({ message: 'error' })
          })
    
        })
})
router.post('/get', (req,res)=>{
  const state = req.body;
  MongoClient.connect(
      URL,
      function (err, client) {
        const db = client.db('main');
        if (err) throw err;
        var timesheets = db.collection('timesheets');
        
        
        timesheets.find({ $and:[{week_of: new Date(state.week_of)},{user_id:state.user_id}] }).toArray().then(result => {
            if(result.length > 0){
                res.status(200).send({...result[0]})
            }else{
                res.status(500).send({message:'error retreiving'})
            }
         
        }, err => {
          res.status(500).send({ message: 'error' })
        })
  
      })
})



module.exports = router;