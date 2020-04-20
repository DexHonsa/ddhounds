const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var config = require('../config.js');
var URL = config.URL;
  router.post("/add", (req, res, next) => {
    const {subscriptionId, userId, userName, clientId,numberOfPayments, amount, type, startDate} = req.body;

    var start = new Date(startDate);
    var occurences = numberOfPayments - 1;

    var endDate = new Date(start.setMonth(start.getMonth() + occurences));
    
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("subscriptions");
      collection.insert({
          client_id:clientId,
          user_id:userId,
          user_name:userName,
          end_date:endDate,
          active:true,
          amount,
          type,
          next_payment_due:new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)),
          subscription_id:subscriptionId,
          start_date:startDate,
          number_of_payments:numberOfPayments,
          number_of_payments_made:0,
          created_at: new Date()
       }).then(result=>{
        client.close();
        res.send(result);
      })
              
    });
  });

  router.post('/edit/:id', (req, res)=>{
    var id = req.params.id;
    var update = req.body;
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("subscriptions");
      collection.findOneAndUpdate({_id:ObjectId(id)}, {$set:update}).then(result=>{
        client.close();
        res.send(result);
      },err=>{
        client.close();
        res.status(500).send({message:'Error'})
      })
              
    });

  })

  router.post("/cancel/:id", (req, res, next) => {
    var id = req.params.id;
    var _id = req.body._id;
    cancelSubscription(id, (item) => {
      console.log(item);
      var code = item.messages.resultCode;
      if(code != 'Error'){
          MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
                if (err) throw err;
                var collection = db.collection("subscriptions");
                collection.findOneAndUpdate({_id:ObjectId(_id)}, {$set:{active:false}}).then(result=>{
                  client.close();
                  res.send(result);
                })
                        
                });
      }else{
        res.status(500).send({message:'error canceling sub'})
      }

      
    });
    
    
  });

  router.get("/:id", (req, res, next) => {
    var id = req.params.id;
    
    MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("subscriptions");
      collection.find({client_id: id}).toArray().then(result=>{
        client.close();
        res.send(result);
      })
              
    });
  });

  function cancelSubscription(subscriptionId, callback) {
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName('93jhGrV5Jz2');
	merchantAuthenticationType.setTransactionKey('65RND55N7BDs7hza');
  
    var cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
    cancelRequest.setMerchantAuthentication(merchantAuthenticationType);
    cancelRequest.setSubscriptionId(subscriptionId);
  
    console.log(JSON.stringify(cancelRequest.getJSON(), null, 2));
  
    var ctrl = new ApiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());
  
    ctrl.execute(function(){
  
      var apiResponse = ctrl.getResponse();
  
      var response = new ApiContracts.ARBCancelSubscriptionResponse(apiResponse);
  
      console.log(JSON.stringify(response, null, 2));
  
      if(response != null){
        if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
          console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
          console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
        }
        else{
          console.log('Result Code: ' + response.getMessages().getResultCode());
          console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
          console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
        }
      }
      else{
        console.log('Null Response.');
      }
      
      callback(response);
    });
  }
module.exports = router;