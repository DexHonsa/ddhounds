const express = require("express");
const router = express.Router();
var multer = require("multer");
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var XLSX = require("xlsx");
var ObjectId = require("mongodb").ObjectId;
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var config = require("../config");
const csv = require('csv-parser');
// var io = require('socket.io')(http);
var ws = require('ws').Server;
var wss = new ws({ port: '3001' });
const { Parser } = require('json2csv');

var myWS;

wss.on("connection", function (ws) {
  // console.log(ws);
  myWS = ws;
  ws.send("Welcome to Cyberchat");
  console.log('connected');
  ws.on("message", function (data) {
    ws.send("SUP BOIII");
  });
})




var URL = config.URL;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp/");
  },
  filename: function (req, file, cb) {
    //var datetimestamp = Date.now();
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage,
  onError: function (err, next) {
    console.log("error", err);
    next(err);
  }
}).single("file");



router.post("/add_doc/:accountid", (req, res) => {
  upload(req, res, function (err) {
    var accountId = req.params.accountid;

    mkdirp("./uploads/test", function (err) {
      var dir = "/uploads/" + accountId;
      var size = req.file.size;
      var filename = req.file.filename;
      fs.move("./tmp/" + filename, "./" + dir + "/" + filename, { overwrite: false }, function (err) {
        if (err) {
          fs.remove("./tmp/" + filename);
          console.log(err);
          var errorMessage = 'File Exists';
          if (err.code == 'EBUSY') {
            errorMessage = "The file is currently busy. Please close the file."
          }

          res.status(500).send({ message: errorMessage })
        } else {
          res.status(200).send({ message: 'Successful Upload!' })
        }
      })
    })
  })

})
router.get('/get_docs/:accountId', (req, res) => {
  const testFolder = './uploads/' + req.params.accountId;
  console.log(req.params.accountId)
  fs.readdir(testFolder, (err, files) => {
    console.log(files);
    if (err) {
      res.status(500).send({ message: 'No Docs' })
      return
    }
    let docs = [];
      files.forEach(file => {
      docs.push(file);
      
    });
    res.status(200).send({ docs })

    
    
  });
})


router.get("/:userId/:projectId", (req, res, next) => {
  const userId = req.params.userId;
  const projectId = req.params.projectId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("files");
    collection
      .find({ project_id: projectId })
      .toArray()
      .then(result => {
        res.status(200).send(result);
      });
  });
});

//--------------------------------
// UPDATE Files
//--------------------------------

router.post("/update", (req, res, next) => {
  const { update_prop, condition_type, update_type, condition_prop, condition_value, update_value, operator } = req.body;
  var numberProps = ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'];
  var dateProps = ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'];
  var obj = {};
  switch (condition_type) {
    case 'number':
      switch (operator) {
        // case 'between':
        //   obj[filters[i].name] = {$gt:Number(filters[i].min), $lt:Number(filters[i].max)}
        //   break;
        case 'greater than':
          obj[condition_prop] = { $gt: Number(condition_value) }
          break;
        case 'less than':
          obj[condition_prop] = { $lt: Number(condition_value) }
          break;
      }
      break;
    case 'string':
      switch (operator) {
        case 'contains':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = reg;
          break;
        case 'equals':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = { $eq: condition_value };
          break;
      }
      break;
    case 'date':
      switch (operator) {
        case 'on':
          obj[condition_prop] = { $eq: condition_value }
          break;
        case 'after':
          obj[condition_prop] = { $gte: condition_value }
          break;
        case 'before':
          obj[condition_prop] = { $lte: condition_value }
          break;
      }
      break;
  }

  var setQuery = {}
  if (numberProps.includes(update_prop)) {
    setQuery[update_prop] = Number(update_value);
  }
  if (dateProps.includes(update_prop)) {
    setQuery[update_prop] = new Date(update_value);
  }
  if (!numberProps.includes(update_prop) && !dateProps.includes(update_prop)) {
    setQuery[update_prop] = update_value;
  }



  const projectId = req.params.projectId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    var bulk = collection.initializeUnorderedBulkOp();
    collection
      .find(obj).toArray()
      .then(result => {

        for (let i = 0; i < result.length; i++) {
          bulk.find({ _id: ObjectId(result[i]._id) }).update({ $set: setQuery })
        }
        bulk.execute();
        client.close();
        res.status(200).send(result);
      });
  });
});

//--------------------------------
// PREVIEW UPDATE Files
//--------------------------------

router.post("/preview/update", (req, res, next) => {
  const { update_prop, condition_type, update_type, condition_prop, condition_value, update_value, operator } = req.body;
  var numberProps = ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'];
  var dateProps = ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'];
  var obj = {};
  switch (condition_type) {
    case 'number':
      switch (operator) {
        // case 'between':
        //   obj[filters[i].name] = {$gt:Number(filters[i].min), $lt:Number(filters[i].max)}
        //   break;
        case 'greater than':
          obj[condition_prop] = { $gt: Number(condition_value) }
          break;
        case 'less than':
          obj[condition_prop] = { $lt: Number(condition_value) }
          break;
      }
      break;
    case 'string':
      switch (operator) {
        case 'contains':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = reg;
          break;
        case 'equals':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = { $eq: condition_value };
          break;
      }
      break;
    case 'date':
      switch (operator) {
        case 'on':
          obj[condition_prop] = { $eq: condition_value }
          break;
        case 'after':
          obj[condition_prop] = { $gte: condition_value }
          break;
        case 'before':
          obj[condition_prop] = { $lte: condition_value }
          break;
      }
      break;
  }

  var setQuery = {}
  if (numberProps.includes(update_prop)) {
    setQuery[update_prop] = Number(update_value);
  }
  if (dateProps.includes(update_prop)) {
    setQuery[update_prop] = new Date(update_value);
  }
  if (!numberProps.includes(update_prop) && !dateProps.includes(update_prop)) {
    setQuery[update_prop] = update_value;
  }



  const projectId = req.params.projectId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    var bulk = collection.initializeUnorderedBulkOp();
    collection
      .find(obj).limit(100).toArray()
      .then(result => {
        client.close();
        res.status(200).send(result);
        //res.status(200).send(result);
      });
  });
});

router.post("/preview/delete", (req, res, next) => {
  const { condition_type, condition_prop, condition_value, operator } = req.body;
  var obj = {};
  switch (condition_type) {
    case 'number':
      switch (operator) {
        // case 'between':
        //   obj[filters[i].name] = {$gt:Number(filters[i].min), $lt:Number(filters[i].max)}
        //   break;
        case 'greater than':
          obj[condition_prop] = { $gt: Number(condition_value) }
          break;
        case 'less than':
          obj[condition_prop] = { $lt: Number(condition_value) }
          break;
      }
      break;
    case 'string':
      switch (operator) {
        case 'contains':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = reg;
          break;
        case 'equals':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = { $eq: condition_value };
          break;
      }
      break;
    case 'date':
      switch (operator) {
        case 'on':
          obj[condition_prop] = { $eq: condition_value }
          break;
        case 'after':
          obj[condition_prop] = { $gte: condition_value }
          break;
        case 'before':
          obj[condition_prop] = { $lte: condition_value }
          break;
      }
      break;
  }



  const projectId = req.params.projectId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    var bulk = collection.initializeUnorderedBulkOp();
    collection
      .find(obj).limit(100).toArray()
      .then(result => {
        client.close();
        res.status(200).send(result);
        //res.status(200).send(result);
      });
  });
});
//--------------------------------
// DELETE FILES
//--------------------------------
router.post("/delete", (req, res, next) => {
  const { update_prop, condition_type, update_type, condition_prop, condition_value, update_value, operator } = req.body;
  var numberProps = ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'];
  var dateProps = ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'];
  var obj = {};
  switch (condition_type) {
    case 'number':
      switch (operator) {
        // case 'between':
        //   obj[filters[i].name] = {$gt:Number(filters[i].min), $lt:Number(filters[i].max)}
        //   break;
        case 'greater than':
          obj[condition_prop] = { $gt: Number(condition_value) }
          break;
        case 'less than':
          obj[condition_prop] = { $lt: Number(condition_value) }
          break;
      }
      break;
    case 'string':
      switch (operator) {
        case 'contains':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = reg;
          break;
        case 'equals':
          reg = new RegExp(condition_value, 'i');
          obj[condition_prop] = { $eq: condition_value };
          break;
      }
      break;
    case 'date':
      switch (operator) {
        case 'on':
          obj[condition_prop] = { $eq: condition_value }
          break;
        case 'after':
          obj[condition_prop] = { $gte: condition_value }
          break;
        case 'before':
          obj[condition_prop] = { $lte: condition_value }
          break;
      }
      break;
  }

  var setQuery = {}
  if (numberProps.includes(update_prop)) {
    setQuery[update_prop] = Number(update_value);
  }
  if (dateProps.includes(update_prop)) {
    setQuery[update_prop] = new Date(update_value);
  }
  if (!numberProps.includes(update_prop) && !dateProps.includes(update_prop)) {
    setQuery[update_prop] = update_value;
  }



  const projectId = req.params.projectId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    collection
      .deleteMany(obj)
      .then(result => {
        client.close();
        res.status(200).send(result);
      });
  });
});


//--------------------------------
// EXPORT Files
//--------------------------------

router.post("/export_old", (req, res, next) => {
  const { included } = req.body;
  var obj = {};
  for (let i = 0; i < included.length; i++) {
    obj[included[i]] = 1;
  }

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    collection.find({}, obj).toArray().then(result => {
      const json2csvParser = new Parser({ included });
      const csv = json2csvParser.parse(result);
      var filepath = "./uploads/export.csv";
      fs.writeFile(filepath, csv, function (err) {
        if (err) {
          client.close();
          return res.json(err).status(500);
        }
        else {
          setTimeout(function () {
            fs.unlinkSync(filePath); // delete this file after 30 seconds
          }, 30000)
          client.close();
          return res.status(200).send({ url: "static/export.csv" });
        }
      });
    })


  });






});

router.post("/export", (req, res, next) => {
  const { term, type, filters, included } = req.body;

  var includedObj = {};
  for (let i = 0; i < included.length; i++) {
    includedObj[included[i]] = 1;
  }
  let archived = null;
  if (req.body.archived == false) {
    archived = false;
  }
  if (req.body.archived) {
    archived = true;
  }


  var filterQuery = [];
  var reg;
  for (let i = 0; i < filters.length; i++) {
    var obj = {};
    switch (filters[i].type) {
      case 'number':
        switch (filters[i].operator) {
          case 'between':
            obj[filters[i].name] = { $gt: Number(filters[i].min), $lt: Number(filters[i].max) }
            break;
          case 'greater than':
            obj[filters[i].name] = { $gt: Number(filters[i].value) }
            break;
          case 'less than':
            obj[filters[i].name] = { $lt: Number(filters[i].value) }
            break;
        }
        break;
      case 'string':
        switch (filters[i].operator) {
          case 'contains':
            reg = new RegExp(filters[i].value, 'i');
            obj[filters[i].name] = reg;
            break;
          case 'excludes':
            reg = new RegExp(filters[i].value, 'i');
            obj[filters[i].name] = { $not: { $regex: reg } };
            break;
        }
        break;
      case 'bool':
        switch (filters[i].operator) {
          case 'equals':

            obj[filters[i].name] = (filters[i].value == 'true');
            break;
        }
        break;
      case 'date':
        switch (filters[i].operator) {
          case 'on':
            obj[filters[i].name] = { $eq: filters[i].startDate }
            break;
          case 'after':
            obj[filters[i].name] = { $gte: filters[i].startDate }
            break;
          case 'before':
            obj[filters[i].name] = { $lte: filters[i].startDate }
            break;
        }
        break;
    }
    filterQuery.push(obj);
  };
  reg = new RegExp(term, 'i');

  filterQuery.push({ first_name: reg })
  if (type != 'all') {
    filterQuery.push({ status: type })
  }
  // if(type == 'all'){
  //   filterQuery.push({status:{$ne:'Dispute'}})
  // }
  if (!archived && type == 'Dispute' && archived != null) {
    filterQuery.push({ active_dispute: true })
  }
  var query = { $and: filterQuery }

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    var call = collection.find(query, includedObj);
    call.toArray((err, result) => {
      const json2csvParser = new Parser({ included });
      const csv = json2csvParser.parse(result);
      var filepath = "./uploads/export.csv";
      fs.writeFile(filepath, csv, function (err) {
        if (err) {
          client.close();
          return res.json(err).status(500);
        }
        else {
          client.close();
          // setTimeout(function () {
          //   fs.unlinkSync(filePath); // delete this file after 30 seconds
          // }, 5000)
          return res.status(200).send({ url: "static/export.csv" });
        }
      });

    })
  });
});




//--------------------------------
// Get File
//--------------------------------

router.get("/:userId/:projectId/:fileId", (req, res, next) => {
  const userId = req.params.userId;
  const projectId = req.params.projectId;
  const fileId = req.params.fileId;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("files");
    collection
      .find({ _id: ObjectId(fileId) })
      .toArray()
      .then(result => {
        client.close();
        res.status(200).send(result);
      });
  });
});


//--------------------------------
// Upload File
//--------------------------------

router.post("/add/:id", (req, res, next) => {


  upload(req, res, function (err) {
    var userId = req.params.id
    mkdirp("./uploads/test", function (err) {
      var dir = "/uploads/" + userId;
      var size = req.file.size;
      var filename = 'upload.csv';
      fs.move("./tmp/" + filename, "./" + dir + "/" + filename, { overwrite: true }, function (
        err
      ) {
        if (err) {
          fs.remove("./tmp/" + filename);
          console.log(err);
          var errorMessage = 'File Exists';
          if (err.code == 'EBUSY') {
            errorMessage = "The file is currently busy. Please close the file."
          }

          res.status(500).send({ message: errorMessage })
        } else {
          // MongoClient.connect(URL, function(err, client) {
          //   if (err) throw err;
          //   var collection = db.collection("clients");
          //   var bulk = collection.initializeUnorderedBulkOp();
          // });
          var headers = [];
          fs.createReadStream("./" + dir + "/" + filename, { encoding: 'ASCII' })
            .pipe(csv({ raw: true }))
            .on('headers', heads => {
              //console.log(heads[0])
            })
            .on('data', (data) => {
              headers.push(data)
              //console.log(Object.keys(data))

            })
            .on('end', function () {

              var results = [];
              if (headers.length < 10) {
                for (let i = 0; i < headers.length; i++) {

                  results.push(headers[i]);
                }
              } else {
                for (let i = 0; i < 11; i++) {
                  results.push(headers[i])
                }
              }

              res.status(200).send({ message: 'Successful', headers: Object.keys(headers[0]), results, size, length: headers.length });
            });

        }
      });
    });
  });
});


//--------------------------------
// Confirm Upload File
//--------------------------------

router.post("/confirm_upload", (req, res, next) => {
  var numberProps = ['creditors_total_due', 'total_paid_to_date', 'monthly_payment_amount'];
  var dateProps = ['dob', 'date_of_notice', 'next_payment_date', 'creditors_invoice_date', 'date_of_order'];
  const { user_id, included, match, matchTo, length } = req.body;
  let future = req.body.future || false;
  var dir = "/uploads/" + user_id;

  var filename = 'upload.csv';

  var results = [];
  var percents = Math.floor((length - 1) / 20);
  var lengthToGo = length - 1;
  var resultsAdded = 0;
  var index = 1;
  var remainder = null;

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    var bulk;
    var bulkPromises = [];

    //res.status(200).send({ message: 'Successful' });
    // function callBack(call, length, lengthToGo, index){
    //   console.log(Math.round(((length - lengthToGo + 1) / length) * 100) / 100)
    //     myWS.send(Math.round(((length - lengthToGo + 1) / length) * 100) / 100)
    //   call.execute().then(data=>{

    //   })

    // }
    if (match != null) {

      fs.createReadStream("./" + dir + "/" + filename, { encoding: 'UTF-8' })
        .pipe(csv())
        .on('data', (data) => {
          var typedData = {};
          for (let k = 0; k < Object.keys(data).length; k++) {
            if (numberProps.includes(Object.keys(data)[k])) {
              typedData[Object.keys(data)[k]] = Number(data[Object.keys(data)[k]])
            }
            if (dateProps.includes(Object.keys(data)[k])) {
              typedData[Object.keys(data)[k]] = new Date(data[Object.keys(data)[k]])
            }
            if (!numberProps.includes(Object.keys(data)[k]) && !dateProps.includes(Object.keys(data)[k])) {
              typedData[Object.keys(data)[k]] = data[Object.keys(data)[k]];
            }
          }
          if (index == 1) {
            bulk = collection.initializeUnorderedBulkOp();
          }
          var findquery = {};
          findquery[matchTo] = typedData[match];
          var setQuery = {};
          for (let i = 0; i < included.length; i++) {
            setQuery[included[i]] = typedData[included[i]]
          }
          bulk.find(findquery).update({ $set: setQuery })
          resultsAdded = resultsAdded + 1;
          index = index + 1;

        })
        .on('end', function () {
          bulk.execute().then(() => {
            myWS.send("import complete");
          });
        });
    } else {
      fs.createReadStream("./" + dir + "/" + filename, { encoding: 'UTF-8' })
        .pipe(csv())
        .on('data', (data) => {
          if(future){
            data.future = true;
          }
          var typedData = {};
          for (let k = 0; k < Object.keys(data).length; k++) {
            if (numberProps.includes(Object.keys(data)[k])) {
              typedData[Object.keys(data)[k]] = Number(data[Object.keys(data)[k]])
            }
            if (dateProps.includes(Object.keys(data)[k])) {
              let datecheck = new Date('1970-12-30');
              if(new Date(data[Object.keys(data)[k]]) < datecheck){
                typedData[Object.keys(data)[k]] = ""
              }else{
                typedData[Object.keys(data)[k]] = new Date(data[Object.keys(data)[k]])
              }
              
            }
            if (!numberProps.includes(Object.keys(data)[k]) && !dateProps.includes(Object.keys(data)[k])) {
              if(Object.keys(data)[k] == 'creditors_total_due'){
                if(data[Object.keys(data)[k]] != null){
                  typedData[Object.keys(data)[k]] = data[Object.keys(data)[k]];
                }else{
                  typedData[Object.keys(data)[k]] = 0;
                }
              }else{
                typedData[Object.keys(data)[k]] = data[Object.keys(data)[k]];
              }
              
            }
          }
          if (index == 1) {
            bulk = collection.initializeUnorderedBulkOp();
          }
          var insertObj = {};
          for (let i = 0; i < included.length; i++) {
            insertObj[included[i]] = typedData[included[i]]
          }
          bulk.insert(insertObj);
          resultsAdded = resultsAdded + 1;
          index = index + 1;
        })
        .on('end', function () {
          bulk.execute().then(() => {
            res.status(200).send({message:'complete'});
            //myWS.send("import complete");
          });
        });
    }

  });






});





module.exports = router;