require('dotenv').config()
const express = require('express');
const request = require('request');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('DB connection established!');
});

//var app = express();
var Schema = mongoose.Schema;
var ipSchema = new Schema({
    "ip": String
});

var IP = mongoose.model('ip', ipSchema);

let result = IP.findById(process.env.id, (err, res) => {
        console.log(res.ip);
        let url = 'http://'+res.ip;
        request.post({
            url:     url,
            form:    { UNLOCK2: "on" }},
        function(err,res,body){
          if(err){
              console.log("=== ERROR ===");
              console.log(err);
              return;
          }
          if(res.statusCode !== 200 ){
              console.log(res)
              console.log(res.statusCode);
              return;
          }
          console.log("=== SUCCESS ===")
          console.log(res.statusCode);
        });
});

