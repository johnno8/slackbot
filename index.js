var Botkit = require('botkit');
var config = require('./config');

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: config.slackToken,
}).startRTM()

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

    console.log('Bleh')
  console.log(JSON.stringify(message));
  bot.reply(message,'Hello yourself.');

});
