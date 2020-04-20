const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;

var jwt = require("jsonwebtoken");
var config = require("../config");



var URL = config.URL;
router.get('/keys', (req, res) => {
  MongoClient.connect(URL, (err, client) => {
    const db = client.db('main');
    var allKeys = {};
    db.collection('clients').find().forEach((doc) => {
      Object.keys(doc).forEach((key) => {

        allKeys[key] = 1
      })
    }, () => {
      res.send(Object.keys(allKeys));
      client.close();
    })


  })
})
router.get("/", function (req, res) {
  MongoClient.connect(
    URL,
    (err, client) => {
      const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("clients");
      collection
        .find().toArray().then(result => {
          if (result.length > 0) {
            client.close();
            res.status(200).send({ message: 'success', result });
          } else {
            client.close();
            res.status(500).send({ message: 'error' });
          }
        })
    }
  );
});

router.post("/search", (req, res, next) => {
  const { term, categories, page, type, sort, sortName, filters, field, creditor } = req.body;
  let future = req.body.future || false;
  
  let archived = null;
  if (req.body.archived == false) {
    archived = false;
  }
  if (req.body.archived) {
    archived = true;
  }

  let pif = null;
  if (req.body.paid_in_full == false) {
    pif = false;
  }
  if (req.body.paid_in_full) {
    pif = true;
  }

  var sortObj = {};
  if (sort == 'asc') {
    sortObj[sortName] = 1;
  } else {
    sortObj[sortName] = -1;
  }
  var filterQuery = [];
  var orQuery = [];
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
            obj[filters[i].name] = { $eq: new Date(filters[i].startDate) }
            break;
          case 'after':
            obj[filters[i].name] = { $gte: new Date(filters[i].startDate) }
            break;
          case 'before':
            obj[filters[i].name] = { $lte: new Date(filters[i].startDate) }
            break;
        }
        break;
    }
    filterQuery.push(obj);
  };
  reg = new RegExp(term, 'i');


   
   if(future){
    filterQuery.push({future:{ $exists: true, $eq: true } })
   }else{
    filterQuery.push({$or:[{future:{ $exists: false }}, {future:{$eq:false}}] })
   }
   

  if (type != 'all') {
    if (type == 'master') {
      
    } else {
      filterQuery.push({ status: type })
    }

  }
  if (type == 'all') {
    filterQuery.push({ status: { $ne: ['Dispute', 'Cease and Desist', 'Bankruptcy'] } })
    filterQuery.push({ status: 'Owed' })
  }
  if (!archived && type == 'Dispute' && archived == null) {
    filterQuery.push({ active_dispute: true })
  }


  if (!pif && type == 'Payment Plan' && pif != null) {
    filterQuery.push({ paid_in_full: { $in: [null, false] } })
    // filterQuery.push({paid_in_full:false})
  }



  if (pif && type == 'Payment Plan' && pif != null) {
    filterQuery.push({ paid_in_full: true })
  }

  //var query = { $and: filterQuery }
  var query;
  if (field == 'name') {
    filterQuery.push({ "name": { $regex: reg } });
    console.log(filterQuery);
    query = [
      { $project: { "name": { $concat: ["$first_name", " ", "$last_name"] }, _id: 1, future:1, account_number: 1, zip: 1, first_name: 1, middle_name: 1, email: 1, last_name: 1, dispute_end_date: 1, creditor: 1, state: 1, city: 1, address: 1, state: 1, total_paid_to_date: 1, monthly_payment_amount: 1, phone: 1, date_of_notice: 1, cellphone: 1, creditors_total_due: 1, status: 1 } },
      { $match: { $and: filterQuery } },
    ]
  }
  if (field == 'phone') {
    nterm = term.replace(/[()-]/g, '');
    nterm = nterm.replace(/\s+/g, '');
    console.log(nterm);
    reg = new RegExp(nterm, 'i');
    filterQuery.push({ $or:[{"cellphoneReg": { $regex: reg }},{ "phoneReg": { $regex: reg } }] })
    query = [
      {
        $project: {
          "phoneReg":  '$phone' ,
          "cellphoneReg": '$cellphone',
          _id: 1,
          account_number: 1, zip: 1, first_name: 1, middle_name: 1, email: 1, last_name: 1, dispute_end_date: 1, creditor: 1, state: 1, city: 1, address: 1, state: 1, total_paid_to_date: 1, monthly_payment_amount: 1, phone: 1, cellphone: 1, date_of_notice: 1, creditors_total_due: 1, status: 1
        }
      },
      { $match: { $and:filterQuery } },
    ]
  }
  if (field == 'account_number') {
    nterm = term.replace(/[()-]/g, '');
    nterm = nterm.replace(/\s+/g, '');
    console.log(nterm);
    reg = new RegExp(nterm, 'i');
    filterQuery.push({"account_number": { $regex: reg } });
    
    query = [
      {
        $project: {
          _id: 1,
          account_number: 1, zip: 1,total:1, first_name: 1, middle_name: 1, email: 1, last_name: 1, dispute_end_date: 1, creditor: 1, state: 1, city: 1, address: 1, state: 1, total_paid_to_date: 1, monthly_payment_amount: 1, phone: 1, cellphone: 1, date_of_notice: 1, creditors_total_due: 1, status: 1
        }
      },
      { $match: { $and:filterQuery } },
    ]
  }

  filterQuery.push({'creditor': creditor})
  var skip = page * 25 - 25;
  var allResults = [];
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;

    var collection = db.collection("clients");
    var call = collection.aggregate(query).sort(sortObj).skip(skip).limit(25);
    call.toArray((err, result) => {
      collection.aggregate([query[0],query[1],{$count:'total'}]).toArray((er,count)=>{
        let c;
        allResults = result;
        if(count.length > 0){
          c = count[0].total;
        }else{
          c = 0;
        }
        
      client.close();
      
      res.send({ query, items: allResults, total: c });
      })
      
      

    })
  });
});


router.get("/:id", (req, res, next) => {

  const id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    collection.findOne({ _id: ObjectId(id) }).then(result => {
      client.close();
      res.send(result);
    })

  });
});

router.post("/fields/:id", (req, res, next) => {
  const fields = req.body;
  const id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("clients");
    collection.findOne({ _id: ObjectId(id) }, fields).then(result => {
      client.close();
      res.send(result);
    })

  });
});

router.get("/recent_history/:id", (req, res, next) => {
  var today = new Date();
  var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("history");
    collection.find({
      client_id: id,
      created_at: {
        $gte: lastWeek,
        $lt: tomorrow
      }
    }).toArray().then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});
router.post("/add_history", (req, res, next) => {
  const { type, client_id, user_id, user_name, action, message } = req.body;

  let obj = {};
  if(type == 'mailer'){
    obj = {
      client_id,
      type,
      created_by: user_id,
      user_name,
      message,
      created_at: new Date()
    }
  }else{
    obj = {
      client_id,
      type,
      created_by: user_id,
      user_name,
      action,
      created_at: new Date()
    }
  }

  const id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("history");
    
    collection.insert(obj).then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});

router.get("/notes/:id", (req, res, next) => {

  const id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("notes");
    collection.find({
      client_id: id,
    }).toArray().then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});
router.post("/add_note", (req, res, next) => {
  const { client_id, user_id, user_name, note } = req.body;

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("notes");
    collection.insert({
      client_id,
      created_by: user_id,
      user_name,
      note,
      created_at: new Date()

    }).then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});

router.post("/edit_note", (req, res, next) => {
  const { id, note } = req.body;

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("notes");
    collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { note: note } }).then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});

router.get("/delete_note/:id", (req, res, next) => {
  const id = req.params.id;

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("notes");
    collection.deleteOne({ _id: ObjectId(id) }).then(result => {
      client.close();
      res.send(result);
    }, err => {
      client.close();
      res.status(500).send({ message: 'error' })

    })

  });
});


router.post("/edit/:id", (req, res, next) => {
  var id = req.params.id;
  var update = req.body;
  console.log(update);
  delete update._id;
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("clients");
      collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: update }, { upsert: true }).then(
        result => {
          client.close();
          res.status(200).send({ message: "success" });
        },
        err => {
          client.close();
          res.status(500).send({ message: "Error" });
        }
      );
    }
  );
});

router.delete("/delete/:id", (req, res, next) => {
  var id = req.params.id;
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("clients");
      collection.deleteOne({ _id: ObjectId(id) }).then(
        result => {
          client.close();
          res.status(200).send({ message: "success" });
        },
        err => {
          client.close();
          res.status(500).send({ message: "Error" });
        }
      );
    }
  );
});


module.exports = router;