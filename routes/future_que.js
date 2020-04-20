const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;

var jwt = require("jsonwebtoken");
var config = require("../config");
var moment = require('moment');



var URL = config.URL;
router.get("/allques", (req, res) => {
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var future_que = db.collection('future_que');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      future_que.find({ transfer_date: { $gte: today } }).toArray().then(result => {
        res.status(200).send(result);
      }, err => {
        res.status(500).send({ message: 'error' })
      })

    })

})
router.get("/get500", (req, res, next) => {
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var future_que = db.collection('future_que');
      var collection = db.collection("clients");


      collection.find({ future: true }, { _id: 1 }).toArray().then(async (result) => {
        console.log('length:', result.length);
        let perWeek = 10;
        let weeks = Math.ceil(result.length / perWeek);
        console.log(weeks);
        let promises = [];
        var dayOfWeek = 5;//friday
        let thisFriday = new Date();
        thisFriday.setHours(0, 0, 0, 0);

        var diff = thisFriday.getDay() - dayOfWeek;
        if (diff > 0) {
          thisFriday.setDate(thisFriday.getDate() + 6);
        }
        else if (diff < 0) {
          thisFriday.setDate(thisFriday.getDate() + ((-1) * diff))
        }


        let idArr = [];
        let p = 1;
        let lastOne = 0;
        let remainder = 0;
        let current = 0;

        for (let i = 0; i < result.length; i++) {

          if (p < weeks) {
            if (i == perWeek * p - 1) {
              idArr.push(result[i]._id);
              p++;
              promises.push(updateCollection(idArr, new Date(thisFriday)))
              idArr = [];
              thisFriday.setDate(thisFriday.getDate() + 7);
            } else {
              idArr.push(result[i]._id);
            }

          } else {
            current = i - (perWeek * (weeks - 1)) + 1;
            remainder = result.length - (perWeek * (weeks - 1));
            if (current == remainder) {
              idArr.push(result[i]._id);
              console.log('hit')
              promises.push(updateCollection(idArr, thisFriday))

            } else {
              idArr.push(result[i]._id);
            }

          }


        }
        Promise.all(promises).then(() => {
          client.close();
          res.status(200).send({ message: 'success' })
        }, err => {
          console.log(err);
          client.close();
          res.status(500).send({ message: 'error' })
        })

        function updateCollection(ids, transfer_date) {
          return new Promise((resolve, reject) => {
            collection.updateMany({ _id: { $in: ids } }, { $set: { date_of_notice: moment(transfer_date).format('MM/DD/YYYY') } }).then(() => {
              future_que.insert({
                created_at: new Date(),
                transfer_date: transfer_date,
                ids: ids
              }).then(() => {
                resolve();
              }, err => reject())

            }, err => reject())
          })
        }






      },
        err => {
          client.close();
          res.status(500).send({ message: "Error" });
        }
      );
    }
  );
});

router.post("/update", (req, res) => {
  const { queId, transferDate } = req.body;
  let d = new Date(transferDate);
  let dofn = new Date();
  dofn.setDate(d.getDate() - 1);
  dofn.setHours(0,0,0,0);
  d.setHours(0, 0, 0, 0);
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      const future_que = db.collection("future_que");
      const clients = db.collection('clients');

      future_que.findOneAndUpdate({ _id: ObjectId(queId) }, { $set: { transfer_date: d } }).then(result => {
        console.log(result);
        clients.update({ _id: { $in: result.value.ids } }, { $set: { date_of_notice: moment(dofn).format('MM/DD/YYYY') } }).then(() => {
          client.close();
          res.status(200).send({ message: 'success' })
        }, err => {
          client.close();
          res.status(500).send({ message: 'error updating clients' })
        })

      }, err => {
        client.close();
        res.status(500).send({ message: 'error' })
      })

    })
})

router.post("/transfer_que", (req, res) => {
  const { date } = req.body;
  let incDate = new Date(date);
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      const clients = db.collection("clients");
      const future_que = db.collection("future_que");

      var dayOfWeek = 5;//friday
      let friday = new Date();
      var diff = friday.getDay() - dayOfWeek;
      if (diff > 0) {
        friday.setDate(friday.getDate() + 6);
      }
      else if (diff < 0) {
        friday.setDate(friday.getDate() + ((-1) * diff))
      }


      var start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(incDate.getDate());


      var end = new Date();
      end.setHours(23, 59, 59, 999);
      end.setDate(incDate.getDate());
      future_que.findOne({ transfer_date: { $gte: start, $lt: end } }).then((result) => {
        if (result == null) {
          client.close();
          res.status(500).send({ message: 'None' })
          return;
        }

        clients.find({ _id: { $in: result.ids } }).project({ first_name: 1, last_name: 1 }).toArray().then((result2) => {
          client.close();
          res.status(200).send({ queId: result._id, items: result2 })
        })


      })

    })
})




module.exports = router;