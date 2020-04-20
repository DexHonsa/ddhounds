const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var config = require("../config");
var URL = config.URL;

router.get("/:accountNumber", (req, res, next) => {
  var accountNumber = req.params.accountNumber;
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("meta");
      collection.findOne({ account_number: accountNumber }).then(
        result => {
          client.close();
          res.status(200).send(result);
        },
        err => {
          client.close();
          res.status(500).send({ message: "Error" });
        }
      );
    }
  );
});

router.post("/update/:accountNumber", (req, res, next) => {
  var accountNumber = req.params.accountNumber;
  let update = req.body;
  if (!update.account_number) {
    update = { ...update, account_number: accountNumber };
  }
  delete update._id;
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var collection = db.collection("meta");
      collection.update({ account_number: accountNumber }, update, { upsert: true }).then(
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