const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var CircularJSON = require("circular-json");
var ObjectId = require("mongodb").ObjectId;
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var path = require('path');
var multer = require("multer");
var pdf2html = require('pdf2html');
var config = require('../config.js');
var moment = require('moment');
var rimraf = require('rimraf');

var URL = config.URL;

var PizZip = require('pizzip');
var archiver = require('archiver');
var Docxtemplater = require('docxtemplater');
var DocxMerger = require('docx-merger')


router.get('/generate_initial_demands', (req, res) => {
  console.log('ey');
  MongoClient.connect(
    URL,
    function (err, client) {
      const db = client.db('main');
      if (err) throw err;
      var clients = db.collection('clients');
      var future_que = db.collection('future_que');
      let start = new Date();
      start.setHours(0, 0, 0, 0);
      let end = new Date();
      end.setHours(23, 59, 59, 59);
      future_que.findOne({ sent: null, transfer_date: { $gte: start, $lt: end } }).then((q) => {
        if (q == null) {
          client.close();
          res.status(500).send({ message: 'None today bruh' })
          return;
        }
        clients.find({ _id: { $in: q.ids } }).project({ first_name: 1, last_name: 1, account_number: 1, creditor: 1, date_of_notice: 1, creditors_total_due: 1, street1: 1, street2: 1, city: 1, state: 1, zip: 1, }).toArray().then(results => {
          if (results != null) {
            let promises = [];
            for (let i = 0; i < results.length; i++) {
              results[i].today = moment().format('MM/DD/YYYY');
              // results[i].date_of_notice = moment().format('MM/DD/YYYY');
              results[i].first_name = results[i].first_name.toUpperCase();
              results[i].last_name = results[i].last_name.toUpperCase();
              results[i].street1 = results[i].street1.toUpperCase();
              results[i].street2 = results[i].street2.toUpperCase();
              results[i].city = results[i].city.toUpperCase();
              results[i].creditors_total_due = Number(results[i].creditors_total_due).toFixed(2)
              promises.push(writeFile(results[i], i + 1))
            }
            Promise.all(promises).then(results2 => {
              let files = [];
              for (let i = 1; i < promises.length + 1; i++) {
                files.push(fs.readFileSync(path.resolve(__dirname + '/../uploads/initial_demands_week', i + '_initial_demand.docx'), 'binary'));
              }


              var docx = new DocxMerger({}, files);


              //SAVING THE DOCX FILE

              docx.save('nodebuffer', function (data) {
                // fs.writeFile("output.zip", data, function(err){/*...*/});
                fs.writeFile(__dirname + '/../uploads/initial_demands/' + moment().format("MM_DD_YYYY") + "_initial_demands.docx", data,
                  function (err) {
                    if (err) {
                      client.close();
                      res.status(500).send({ message: 'Error writing file!!!' })
                    }
                    rimraf(__dirname + '/../uploads/initial_demands_week', () => {
                      clients.updateMany({ _id: { $in: q.ids } }, { $set: { future: false } }).then(() => {
                        var s = new Date();
                        s.setHours(0, 0, 0, 0);
                        var e = new Date();
                        e.setHours(23, 59, 59, 999);

                        future_que.updateOne({ transfer_date: { $gte: s, $lt: e } }, { $set: { sent: true } }, { upsert: true }).then(() => {
                          client.close();
                          res.status(200).send({ message: 'Created SuccessfullY!' })
                          return;
                        }, err => {
                          client.close();
                          res.status(500).send({ message: 'Error updating Future Que' })
                          return;
                        })

                      }, err => {
                        client.close();
                        res.status(500).send({ message: 'Error' })
                        return;
                      })
                    })


                  });
              });

            }, err => {
              client.close();
              res.status(500).send({ message: 'Error!!!' })
            })
          }
        })

      });
    })


  writeFile = (data, i) => {
    return new Promise((resolve, reject) => {
      mkdirp("./uploads/initial_demands_week", function (err) {
        var content = fs.readFileSync(path.resolve(__dirname, 'templates/initial_demand.docx'), 'binary');
        var zip = new PizZip(content);
        var doc = new Docxtemplater();
        doc.loadZip(zip);

        //set the templateVariables
        doc.setData(data);

        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render()
        }
        catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object).
          var e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
          }
          console.log(JSON.stringify({ error: e }));
          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors.map(function (error) {
              return error.properties.explanation;
            }).join("\n");
            console.log('errorMessages', errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }

        var buf = doc.getZip()
          .generate({ type: 'nodebuffer' });

        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        fs.writeFileSync(path.resolve(__dirname + '/../uploads/initial_demands_week', i + '_initial_demand.docx'), buf, { flag: "wx" });

        resolve();
      })
    })

  }

})
router.post('/generate_mail', (req, res) => {
  const { type, account_number, data } = req.body;
  mkdirp("./uploads/" + account_number, function (err) {


    var content = fs.readFileSync(path.resolve(__dirname, 'templates/' + type + '.docx'), 'binary');
    var zip = new PizZip(content);

    var doc = new Docxtemplater();
    doc.loadZip(zip);

    //set the templateVariables
    doc.setData(data);

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render()
    }
    catch (error) {
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object).
      var e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties,
      }
      console.log(JSON.stringify({ error: e }));
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
          return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
      }
      throw error;
    }

    var buf = doc.getZip()
      .generate({ type: 'nodebuffer' });

    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    fs.writeFileSync(path.resolve(__dirname + '/../uploads/' + account_number, type + '_' + moment().format('MM_DD_YYYY_SS') + '.docx'), buf, { flag: "wx" });
    fs.writeFileSync(path.resolve(__dirname + '/../uploads/printable', account_number + '_' + type + '_' + moment().format('MM_DD_YYYY_SS') + '.docx'), buf, { flag: "wx" });
    res.status(200).send({ message: 'Document Generated Successfully' })
  })
})

var URL = config.URL; var storage = multer.diskStorage({
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

router.get("/initial_demand", (req, res) => {
  pdf2html.html('./init_demand.pdf', (err, html) => {
    if (err) {
      console.error('Conversion error: ' + err)
    } else {
      res.send(html);
      console.log(html)
    }
  })
})


router.post("/add/:account_number", (req, res, next) => {

  upload(req, res, function (err) {

    var account_number = req.params.account_number
    mkdirp("./uploads/" + account_number, function (err) {
      var dir = "/uploads/" + account_number;
      var filename = req.file.filename;

      fs.move("./tmp/" + filename, "./" + dir + '/' + filename, { overwrite: false }, function (
        err
      ) {
        if (err) {
          fs.remove("./tmp/" + filename);
          console.log(err);
          res.status(500).send({ message: 'File Exists' });
        } else {
          res.status(200).send({ message: 'Successful upload' });
        }
      });
    });


  });

});

router.get('/delete_mailers', (req, res) => {
  rimraf(__dirname + '/../uploads/printable', () => {
    mkdirp('./uploads/printable')
    res.status(200).send({ message: 'successful' })
  },err=>{
    res.status(500).send({ message: 'error' })
  });

 
})

router.get('/download_mailers', (req, res) => {

  var output = fs.createWriteStream(__dirname + '/../uploads/printable.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory(__dirname + '/../uploads/printable', false);

  archive.finalize();
  res.status(200).send({ message: 'successful' })
})

router.get("/:id", (req, res) => {
  var id = req.params.id;
  MongoClient.connect(URL, function (err, client) {
    const db = client.db('main');
    if (err) throw err;
    var collection = db.collection('mail');
    collection.find({ client_id: id }).toArray().then(result => {
      client.close();
      res.status(200).send({ message: 'Success', items: result });
    }, err => {
      client.close();
      res.status(500).send({ message: 'There was an error' })
    })
  })
})

module.exports = router;