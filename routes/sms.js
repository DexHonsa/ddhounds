
const express = require("express");
const router = express.Router();
const Nexmo = require('nexmo');


router.get("/", (req, res, next) => {
    const nexmo = new Nexmo({
        apiKey: 'e93caf65',
        apiSecret: 'TQye9Gh30yWGL2Fb'
      })
      
      const from = '17604138297'
      const to = '17605349625'
      const text = 'Hello from Nexmo'

      nexmo.message.sendSms(from, to, text)
      res.send({message:'success'})
});

module.exports = router;
