'use strict'

require('dotenv').config()
const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const sleep = require('sleep');

mongoose.connect(process.env.MONGO_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('DB connection established!');
});

var app = express();
var Schema = mongoose.Schema;
var ipSchema = new Schema({
    "ip": String
});
var IP = mongoose.model('ip', ipSchema);
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello there, I am PandoraAI!');
    unlockTheDoor("");
})

app.get('/ping', function (req, res) {
    res.send('I am alive!!! 😇');
})

app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'open_my_box') {
        res.send(req.query['hub.challenge']);
	}
	res.send('Error, wrong token')
});

app.post('/webhook/', function (req, res) {
    console.log("=========");
    //console.log(req.body);
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        console.log(event);
	    if (event.message && event.message.text) {
            let text = event.message.text
            //sendTextMessage(sender, "Sorry, I am not smart yet to help you with that 😔");
            //sleep.sleep(1);
            //sendTextMessage(sender, "But I can ECHO your message 😄");
            //sleep.sleep(1);
            //sendTextMessage(sender, );
            //sleep.sleep(1);
            sendTextMessage(sender, "🤖 " + text.substring(0, 200)+"... Ok, I will not make jokes anymore 😶 Send me the (y) if you want me to unlock your door! 👍🏻🔓"); 
        }
        else if(event.message && event.message.sticker_id){
            sendTextMessage(sender, "Trying to unlock the door... 🔐");
            unlockTheDoor(sender);
        }
    }
    res.sendStatus(200)
})

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});

async function unlockTheDoor(sender){
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
                sendTextMessage(sender, "I cannot unlock the door right now 🔑😢 ")  
                return;
            }
            if(res.statusCode !== 200 ){
                console.log(res)
                console.log(res.statusCode);
                sendTextMessage(sender, "I cannot unlock the door right now 🔑😢 ")  
                return;
            }
            console.log("=== SUCCESS ===")
            console.log(res.statusCode);
            sendTextMessage(sender, "Door successfully unlocked! 🔑😊 ") 
        });
    });
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

