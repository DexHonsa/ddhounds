const express = require("express");
const router = express.Router();
var multer = require("multer");
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var config = require("../config");
var nodemailer = require("nodemailer");


var URL = config.URL; 
router.post("/", (req, res, next) => {
  const { email, password } = req.body;
  var lowercase = email.toLowerCase();
  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("seasons_users");
    collection.findOne({ email: lowercase, password: passwordHash, archived: null }).then(
      result => {
        if (result != null) {
          var token = jwt.sign(
            {
              id: result._id,
              role: result.role,
              email: result.email,
              is_active: result.is_active,
              first_name: result.first_name,
              last_name: result.last_name,
              creditor:result.creditor,
              password_reset: result.password_reset
            },
            config.secret,
            {
              expiresIn: 86400 // expires in 24 hours
            }
          );
          res.send({ auth: true, token: token });
        }
        else {
          res.status(401).send({ error: "Incorrect Credentials" });
        }
      },
      err => {
        res.status(401).send({ error: err });
      }
    );
  });
});

function makeid() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.post("/reset_password", (req, res) => {
  var email = req.body.email;

  var token = jwt.sign(
    {
      email
    },
    config.secret,
    {
      expiresIn: 86400 // expires in 24 hours
    }
  );
  var tokenHash = crypto
    .createHash("md5")
    .update(token)
    .digest("hex");

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("seasons_users");
    collection
      .findOneAndUpdate({ email: email, archived: null }, { $set: { password: tokenHash, password_reset: true } })
      .then(
        result => {
          let transporter = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            port: 25,
            auth: {
              user: "dexhonsa@gmail.com",
              pass: "mdoxjxrxbvddjtvr"
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          const emailOutputToUser = `
    <div style="background:#f8f8f8; text-align: center; width:100%; padding:30px 15px;box-sizing: border-box;">
    <div style="max-width: 500px; width:100%; background:#fff; text-align: center;display: inline-block; border:solid 1px #eaeaea; border-radius: 3px;box-sizing: border-box;">
    
    <img style="width:300px; margin-top:25px;" src="https://seasonscollect.com/logo.png"/>
    <div style="padding:15px">
      <div style="color:#000;  font-size: 12pt; font-family: Arial; font-weight: bold; margin:10px 0px; display: inline-block">Password Reset</div>
      <div style=" font-size: 10pt; padding:15px;
      color:#808080;
      font-family:Arial;
      ">
        To change your password, please click <a href="https://portal.seasonscollect.com/reset_password?token=${token}">here</a>
      </div>
      
      <div style=" font-size: 10pt; padding:15px;
      color:#808080;
      font-family:Arial;
      ">
        Please use this token to login to your account and change your password.
      </div>
      </div>
      
    </div><br>
    <div style="display: inline-block; font-size: 10pt;
      font-family:Arial; color:#AFAFAF; margin-top:15px">
        Seasons Collections
      </div>
      </div>
    `;

          let mailOptionsToUser = {
            from: '"Seasons Collections" <support@seasonscollect.com>', // sender address
            to: email, // list of receivers
            subject: "Your New Password!", // Subject line
            text: "Hello world?", // plain text body
            html: emailOutputToUser // html body
          };

          transporter.sendMail(mailOptionsToUser, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("User sent: %s", info.messageId);
          });
          client.close();
          res.send({ message: "sent" });

        },
        err => {
          res.status(500).send({ message: "error burh" });
        }
      );
  });
});

router.post("/new_password", (req, res) => {

  var password = req.body.password;
  var email = req.body.email;


  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");


  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("seasons_users");
    collection.findOneAndUpdate({ email: email, archived: null }, { $set: { password: passwordHash, password_reset: false } }).then(
      result => {
        client.close();
        res.status(200).send({ message: 'success' })
      },
      err => {
        client.close();
        res.status(500).send({ message: "error burh" });
      }
    );
  });
});

router.post("/change_password", (req, res) => {
  var id = req.body.id;
  var password = req.body.password;
  var newPassword = req.body.newPassword;

  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");

  var newPasswordHash = crypto
    .createHash("md5")
    .update(newPassword)
    .digest("hex");

  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("users");
    collection.findOne({ _id: ObjectId(id), password: passwordHash }).then(
      result => {
        if (result == null) {
          client.close();
          res.status(500).send({ message: "Current password was incorrect" });
        } else {
          if (newPassword.length < 6) {
            res
              .status(500)
              .send({ message: "Password Must be at least 6 characters" });
          } else {
            collection
              .update(
                { _id: ObjectId(id) },
                { $set: { password: newPasswordHash } }
              )
              .then(result2 => {
                res
                  .status(200)
                  .send({ message: "Password Successfully Changed." });
              });
          }
        }
      },
      err => {
        client.close();
        res.status(500).send({ message: "error burh" });
      }
    );
  });
});

router.post("/welcome", (req, res, next) => {
  var email = req.body.email;
  var sub = req.body.sub;
  var text = "";
  if (sub == "m") {
    text = "Your account will be billed monthly for $9.99.";
  } else {
    text = "Your account will be billed yearly for $99.99.";
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
      user: "dexhonsa@gmail.com",
      pass: "mdoxjxrxbvddjtvr"
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const emailOutputToUser = `
  <div style="background:#f8f8f8; text-align: center; width:100%; padding:30px 15px;box-sizing: border-box;">
  <div style="max-width: 500px; width:100%; background:#fff; text-align: center;display: inline-block; border:solid 1px #eaeaea; border-radius: 3px;box-sizing: border-box;">
  <div>
  <img src="https://hollywood-id.com/img/hollywood_blue_blur.cd0a2825.jpg" alt="" width="100%">
  </div>
  <div style="margin-top:10px;">
    <img src="https://hollywood-id.com/img/logo_black.63f50681.png" alt="" style="max-height:100px; padding-left:15px; max-width:90%;">
  </div>
  <div style="padding:15px">
    <div style="color:#000;  font-size: 12pt; font-family: Arial; font-weight: bold; margin:10px 0px; display: inline-block">Welcome To The Hollywood Insider Directory</div>
    <div style=" font-size: 10pt; padding:15px;
    color:#808080;
    font-family:Arial;
    ">
      Thank you for joining The Hollywood Insider Directory! ${text}  To manage your subscription, please login to your account <a href="https://hollywood-id.com/">here</a>
    </div>
    </div>
    
  </div><br>
  <div style="display: inline-block; font-size: 10pt;
    font-family:Arial; color:#AFAFAF; margin-top:15px">
      Hollywood Insider Directory | 77900 Country Club Dr | Palm Desert, CA 92211
    </div>
    </div>
  `;

  let mailOptionsToUser = {
    from: '"Hollywood ID" <support@hid.com>', // sender address
    to: email, // list of receivers
    subject: "Thank you for Joining The Hollywood Insider Directory!", // Subject line
    text: "Hello world?", // plain text body
    html: emailOutputToUser // html body
  };

  transporter.sendMail(mailOptionsToUser, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("User sent: %s", info.messageId);
  });
  res.send({ message: "sent" });
});

router.patch("/edit/:id", (req, res, next) => {
  const options = req.body;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("users");
    collection
      .findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $set: options })
      .then(
        result => {
          client.close();
          res.status(200).send({ message: "success" });
        },
        err => {
          client.close();
          res.status(401).send({ message: "There was an Error" });
        }
      );
  });
});
router.post("/signup", (req, res, next) => {
  const {
    password,
    email,
    first_name,
    last_name,
  } = req.body;
  lowerEmail = email.toLowerCase();
  var lowercase = email.toLowerCase();
  if (email.indexOf(" ") > -1) {
    res.status(401).send({ error: "emails cannot have spaces" });
    return;
  }
  if (password.length < 6) {
    res
      .status(401)
      .send({ error: "Passwords must have more than 6 characters" });
    return;
  }
  var passwordHash = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection("users");
    collection.findOne({ email: lowercase, archived: null }).then(result => {
      if (result == null) {
        collection
          .insert({
            email: lowercase,
            password: passwordHash,
            role: "normal",
            first_name,
            last_name,
            created_at: new Date()
          })
          .then(result => {
            client.close();
            res.send({
              userId: result.ops[0]["_id"],
              message: "Created Succesfully"
            });
          });
      } else {
        client.close();
        res.status(401).send({ error: "Email Exists" });
      }
    });
  });
});
router.get("/me", function (req, res) {
  var token = req.headers["authorization"];
  token = token.split(" ");
  if (!token[1])
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token[1], config.secret, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    res.status(200).send(decoded);
  });
});

module.exports = router;
