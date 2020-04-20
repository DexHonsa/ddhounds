const express = require("express");
const router = express.Router();
var multer = require("multer");
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var jwt = require("jsonwebtoken");
var config = require("../config");
var crypto = require("crypto");
var fs = require("fs-extra");

var URL = config.URL;

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./tmp/");
  },
  filename: function(req, file, cb) {
    //var datetimestamp = Date.now();
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage,
  onError: function(err, next) {
    console.log("error", err);
    next(err);
  }
}).single("file");

router.get("/get_admins", (req, res)=>{
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .find({ "role": "admin" }).toArray().then(result=>{
          if(result.length > 0){
            res.status(200).send({message:'success', result});
          }else{
            res.status(500).send({message:'error'});
          }
        })

        
    }
  );
})

router.get("/user_history/:id", (req, res, next) => {
  var today = new Date();
  var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const id = req.params.id;
  MongoClient.connect(URL, function(err, client) {
const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("history");
    collection.find({
      created_by: id,
      created_at: {
          $gte: lastWeek,
          $lt: tomorrow
      }
  }).toArray().then(result=>{
      client.close();
      res.send(result);
    },err=>{
      client.close();
      res.status(500).send({message:'error'})
      
    })
            
  });
});

router.get('/get_user/:id',(req,res)=>{
  const id = req.params.id;
  
  MongoClient.connect(URL,function(err, client) {
const db = client.db('main');
    if(err) throw err;
    var collection = db.collection('seasons_users');
    collection.find({_id:ObjectId(id)}).toArray().then(result=>{
      client.close();
      res.status(200).send(result[0]);
    },err=>{
      client.close();
      res.status(500).send({message:'error'})
    })
  })
})

router.get('/get_users',(req,res)=>{

  MongoClient.connect(URL,function(err, client) {
const db = client.db('main');
    if(err) throw err;
    var collection = db.collection('seasons_users');
    collection.find({archived:null}).toArray().then(result=>{
      client.close();
      res.status(200).send(result);
    },err=>{
      client.close();
      res.status(500).send({message:'error'})
    })
  })
})

router.post('/change_password', (req, res)=>{
    let {userId, password} = req.body;
    var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
    MongoClient.connect(URL,function(err, client) {
const db = client.db('main');
      if(err) throw err;
      var collection = db.collection('seasons_users');
      collection.findOneAndUpdate({_id:ObjectId(userId)}, {$set:{password:passwordHash}}).then(result=>{
        client.close();
        res.status(200).send(result);
      },err=>{
        client.close();
        res.status(500).send({message:'error'})
      })
    })
})

router.post('/new_account_login', (req, res)=>{
  let {id, password} = req.body;
  var passwordHash = crypto
  .createHash("md5")
  .update(password)
  .digest("hex");
  MongoClient.connect(URL,function(err, client) {
const db = client.db('main');
    if(err) throw err;
    var collection = db.collection('seasons_users');
    collection.findOneAndUpdate({_id:ObjectId(id)}, {$set:{password:passwordHash, logged_in:true},}).then(result=>{
      client.close();
      res.status(200).send(result);
    },err=>{
      client.close();
      res.status(500).send({message:'error'})
    })
  })
})

router.get('/get_archived_users',(req,res)=>{

  MongoClient.connect(URL,function(err, client) {
const db = client.db('main');
    if(err) throw err;
    var collection = db.collection('seasons_users');
    collection.find({archived:true}).toArray().then(result=>{
      client.close();
      res.status(200).send(result);
    },err=>{
      client.close();
      res.status(500).send({message:'error'})
    })
  })
})

router.post("/add_admin", (req, res)=>{
  var email = req.body.email;
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .findOneAndUpdate({ "email": email }, {$set:{role:'admin'}}).then(result=>{
          
          if(result.value != null){
            res.status(200).send({message:'success'});
          }else{
            res.status(500).send({message:'User not found'});
          }
        },err=>{
          res.status(500).send({message:'User not found'});
        })
    }
  );
})

router.post("/remove_admin", (req, res)=>{
  var email = req.body.email;
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .findOneAndUpdate({ "email": email }, {$set:{role:'agent'}}).then(result=>{
          if(result != null){
            res.status(200).send({message:'success'});
          }else{
            res.status(500).send({message:'error'});
          }
        })
    }
  );
})
router.get("/", (req, res, next) => {
  var token = req.headers["authorization"];
  if (token == null) {
    res.status(500).send({ auth: false, message: "No token provided." });
  }
  // token = token.split(" ");
  // if (!token[1]) {
  //   return res.status(401).send({ auth: false, message: "No token provided." });
  // }
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      var users = collection
        .find({})
        .toArray()
        .then(result => {
          client.close();
          res.json(result);
        });
    }
  );
});
router.post("/", (req, res, next) => {
  var token = req.headers["authorization"];
  token = token.split(" ");
  if (!token[1])
    return res.status(401).send({ auth: false, message: "No token provided." });
  const { username, password, email } = req.body;
  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  //console.log(username, password, email);
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .insert({ username: username, password: passwordHash, email: email })

        .then(result => {
          client.close();
          res.json(result);
        });
    }
  );
});

router.get("/:id", (req, res)=>{
  var id = req.params.id;
  console.log('sup')
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .findOne({ _id: ObjectId(id) }, {first_name:1, last_name:1,email:1,}).then(result=>{
          console.log(result);
          if(result != null){
            client.close();
            res.status(200).send({message:'success', user:{first_name:result.first_name, last_name:result.last_name, email:result.email, logged_in:result.logged_in, created_at:result.created_at, reset_password:result.reset_password}});
          }else{
            client.close();
            res.status(500).send({message:'error'});
          }
        })

        
    }
  );
})

router.post("/update_user", (req, res)=>{
  const update = req.body;
  var userObj = JSON.parse(JSON.stringify(update));
  delete userObj._id;
  console.log(userObj);
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .findOneAndUpdate({ _id: ObjectId(update._id) }, {$set:userObj}).then(result=>{
          if(result != null){
            client.close();
            res.status(200).send({message:'success', user:result});
          }else{
            client.close();
            res.status(500).send({message:'error'});
          }
        })

        
    }
  );
})

router.get("/user/:id", (req, res) => {
  var id = req.params.id;
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection.findOne({ _id: ObjectId(id) }).then(result => {
        if (result != null) {
          var token = jwt.sign({ id: result._id, role:result.role, email: result.email, is_active:result.is_active, first_name: result.first_name, last_name:result.last_name, cus_id:result.cus_id, sub_id: result.sub_id, image:result.image }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          client.close();
          res.status(200).send({ message: 'success', token });
        } else {
          client.close();
          // res.status(500).send({ message: "error" });
        }
      });
    }
  );
});

router.patch("/:id", (req, res, next) => {
  var token = req.headers["authorization"];
  token = token.split(" ");
  if (!token[1])
    return res.status(401).send({ auth: false, message: "No token provided." });
  const id = req.params.id;
  const { username, password, email } = req.body;
  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection
        .update(
          { _id: ObjectId(id) },
          { username: username, password: passwordHash, email: email }
        )

        .then(result => {
          client.close();
          res.json(result);
        });
    }
  );
});
router.delete("/:id", (req, res, next) => {
  var token = req.headers["authorization"];
  token = token.split(" ");
  if (!token[1])
    return res.status(401).send({ auth: false, message: "No token provided." });
  const id = req.params.id;
  const { username, password, email } = req.body;
  //console.log(username, password, email);
  MongoClient.connect(
    URL,
    function(err, client) {
const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("seasons_users");
      collection.remove({ _id: ObjectId(id) }).then(result => {
        client.close();
        res.json(result);
      });
    }
  );
});

router.post("/add_image/:id", (req, res, next) => {
  const id = req.params.id;
  console.log("OK");

  upload(req, res, function(err) {
    if (err) {
      console.log(err);
    }
    var extension = req.file.filename.substr(-4);
    var fileName = req.file.filename;
    console.log(req.file.filename);
    fs.rename("./tmp/" + req.file.filename, "./tmp/" + fileName).then(res1 => {
      fs.move("./tmp/" + fileName, "./user_uploads" + "/" + fileName, {
        overwrite: false
      })
        .then(result => {
          // res.status(200).send({message:'uploaded'});
          MongoClient.connect(
            URL,
            function(err, client) {
const db = client.db('main');
              if (err) throw err;
              var collection = db.collection("seasons_users");

              collection.findOne({ _id: ObjectId(id) }).then(result => {
                // console.log(result);
                if (result != null) {
                  //console.log(result);
                  res.send("success");
                  collection
                    .update(
                      { _id: ObjectId(id) },
                      { $set: { image: fileName } }
                    )
                    .then(result => {
                      client.close();
                      res
                        .status(200)
                        .send({ message: "uploaded", filename: fileName });
                    });
                } else {
                  client.close();
                  res.status(401).send({ error: "none found" });
                }
              });
            }
          );
        })
        .catch(err => {
          client.close();
          res.status(401).send({ message: "already exists" });
        });
    });
  });
});



module.exports = router;
