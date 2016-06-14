var request = require('request');

var welcomeData = {
  'setting_type': 'call_to_actions',
  'thread_state': 'new_thread',

  'call_to_actions': [
    {
      "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title":"Welcome to Homee!",
                "item_url":"http://homeeapp.com/",
                "image_url":"http://a2.mzstatic.com/us/r30/Purple18/v4/1c/b7/00/1cb70035-26d3-f861-7e77-0a4b468c9b17/icon175x175.jpeg",
                "subtitle":"We have the right furniture for you!",
                "buttons":[
                  {
                    "type":"web_url",
                    "title":"View Website",
                    "url":"http://homeeapp.com/"
                  },
                  {
                    "type":"postback",
                    "title":"Start Chatting",
                    "payload":"Start Chatting"
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ]
};

exports.welcomeScreen = function(){

  request({
    uri: 'https://graph.facebook.com/v2.6/1303906352970309/thread_settings',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: welcomeData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });   
}