var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');
var parse = require('./parse.js');
var request = require('./request.js');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// setup database
// make sure database accepts SSL connections
pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client, done){
  if (err) {
    console.log('Encountered an error:', err.message);
    return res.send(500, err.message);
  }
  client.query("CREATE TABLE IF NOT EXISTS users (uid bigint PRIMARY KEY UNIQUE NOT NULL, room varchar(20), budget varchar(20), timeline varchar(30), style  varchar(20), image_url varchar(1000), special varchar(2048))");
  client.query("CREATE TABLE IF NOT EXISTS images (iid SERIAL PRIMARY KEY, uid bigint references users(uid), url varchar(1000))");
});

var questions = ["What room can we help you with?", "What's your budget or price range?",
  "When do you need your furniture by?", "How would you describe your style?",
  "Can you send us some pictures of your space?", "Any special requests or additional information?"];
var question_index = {};

// Create Welcome Message
request.callWelcomeScreen();

// Start server
app.listen((process.env.PORT || 8000));

// Retrieve responses from user
app.get('/webhook/:uid', function(req, res){
  // connect to database
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    if (err) {
      console.log('Encountered an error:', err.message);
      return res.send(500, err.message);
    }
    var obj = {};
    // query row with id
    client.query("SELECT * FROM users WHERE uid = $1", [req.params.uid], function(err, result){
      if (err) {
        console.log('Encountered an error:', err.message);
        return res.send(500, err.message);
      }
      // return null if row does not exist
      if (result.rows.length == 0){
        return res.jsonp(null);
        // otherwise return objects
      } else {
        var row = result.rows[0];
        obj = {uid: row.uid, room: row.room, budget: row.budget, timeline: row.timeline, style: row.style, special: row.special};
      }
    });
    client.query("SELECT url FROM images where uid = $1", [req.params.uid], function(err, result){
      if (err) {
        console.log('Encountered an error:', err.message);
        return res.send(500, err.message);
      }
      var urls = [];
      for (var i = 0; i < result.rows.length; i++){
        urls.push(result.rows[i].url);
      }
      obj.images = urls;
      return res.jsonp(obj);
    });
    
  });
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == 'page'){
    // iterate over each entry
    data.entry.forEach(function(pageEntry){
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent){
        if (messagingEvent.message){
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback){
          receivedPostback(messagingEvent);
        }

      });
    });
  }
  // Assume all went well
  res.sendStatus(200);
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var messageID = message.mid;
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    if (question_index[senderID] < questions.length && question_index[senderID] != 4){
      saveAnswer(senderID, messageText, question_index[senderID]);
    }
    question_index[senderID] += 1;
    if (question_index[senderID] < questions.length){
      sendTextMessage(senderID, questions[question_index[senderID]]);
    } else if (question_index[senderID] == questions.length){
      sendTextMessage(senderID, "Thanks for answering these questions! A representative will speak to you shortly!");
    }
  } else if (messageAttachments) {
    if (question_index[senderID] == 4){
      sendTextMessage(senderID, "Image received. Send more or type finished.");
      saveAnswer(senderID, messageAttachments[0].payload.url, question_index[senderID]);
    }
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  var payload = event.postback.payload;
  if (payload === 'Start Chatting'){
    pg.connect(process.env.DATABASE_URL, function(err, client, done){
      if (err) {
        console.log('Encountered an error:', err.message);
        return res.send(500, err.message);
      }
      client.query("INSERT INTO users (uid) SELECT ($1) WHERE NOT EXISTS (SELECT uid FROM users WHERE uid = $1)", [senderID]);
    });
    question_index[senderID] = 0;
    sendTextMessage(senderID, questions[question_index[senderID]]);
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  request.callSendAPI(messageData);
}


function saveAnswer(senderID, messageText){
  var index = question_index[senderID];
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    if (err) {
      console.log('Encountered an error:', err.message);
      return res.send(500, err.message);
    }
    switch (index){
      case 0:
        client.query("UPDATE users SET room=$1 WHERE uid=$2", [parse.room(messageText), senderID]);
        break;
      case 1:
        client.query("UPDATE users SET budget=$1 WHERE uid=$2", [parse.budget(messageText), senderID]);
        break;
      case 2:
        client.query("UPDATE users SET timeline=$1 WHERE uid=$2", [parse.timeline(messageText), senderID]);
        break;
      case 3:
        client.query("UPDATE users SET style=$1 WHERE uid=$2", [parse.style(messageText), senderID]);
        break;
      case 4:
        client.query("INSERT INTO images (uid, url) VALUES ($1, $2)", [senderID, messageText]);
        break;
      case 5:
        client.query("UPDATE users SET special=$1 WHERE uid=$2", [messageText, senderID]);
        break;
    }
  });
}
