var Botkit = require('botkit')
var config = require('./config')

var controller = Botkit.slackbot({
  debug: false
  // include "log: false" to disable logging
  // or a "logLevel" integer from 0 to 7 to adjust logging verbosity
})

// connect the bot to a stream of messages
controller.spawn({
  token: config.slackToken
}).startRTM()

// give the bot something to listen for.
/*
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {

  console.log(JSON.stringify(message));
  bot.reply(message,'Hello yourself.');

}); */

controller.hears(['hello'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
  var askName = function (err, convo) {
    convo.ask('Howya, what\'s your name?', function (response, convo) {
      convo.say('Deadly, I\'m mebot')
      askAge(response, convo)
      convo.next()
    })
    if (err) {
      console.log(err)
    }
  }

  var askAge = function (response, convo) {
    convo.ask('What age are you?', function (response, convo) {
      console.log(JSON.stringify(response))
      convo.say('That old? Ok!')

      if (!response.text.match(/^\d+$/)) {
        convo.stop()
      }

      askWhereFrom(response, convo)
      convo.next()
    })
  }

  var askWhereFrom = function (response, convo) {
    convo.ask('Where are you from anyway?', function (response, convo) {
      convo.say('Ah yeah, I know it well, nice place!')
      convo.say('Talk to you later...')
      convo.next()
      convo.on('end', function (convo) {
        if (convo.status === 'completed') {
          // do something useful with the users responses
          var res = convo.extractResponses()
          console.log(JSON.stringify(res))
          // reference a specific response by key
          //  var value  = convo.extractResponse('key');
          // ... do more stuff...
        } else {
          // something happened that caused the conversation to stop prematurely
        }
      })
    })
  }

  bot.startConversation(message, askName)
})
