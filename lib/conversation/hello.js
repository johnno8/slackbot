'use strict'

const fs = require('fs')

exports.register = function register (controller) {
  function hello (bot, message) {
    let userDetails
    controller.storage.users.get(message.user, (err, userData) => {
      if (err) console.log(err)
      userDetails = userData
      console.log(userDetails)
    })

    let askName = function (err, convo) {
      convo.ask('Howya, what\'s your name?', function (response, convo) {
        convo.say('Deadly, I\'m mebot')
        askAge(response, convo)
        convo.next()
      }, {key: 'name'})
      if (err) {
        console.log(err)
      }
    }

    let askAge = function (response, convo) {
      convo.ask('What age are you ' + userDetails.profile.first_name + '?', function (response, convo) {
        console.log(response)
        convo.say('That old? Ok!')

        if (isNaN(response.text)) {
          convo.stop()
        }
        askWhereFrom(response, convo)
        convo.next()
      }, {key: 'age'})
    }

    let askWhereFrom = function (response, convo) {
      convo.ask('Where are you from anyway?', function (response, convo) {
        convo.say('Ah yeah, I know it well, nice place!')
        endCon(response, convo)
        convo.next()
      }, {key: 'domicile'})
    }

    let endCon = function (response, convo) {
      convo.say({ text: 'Talk to you later...', action: 'completed' })
      convo.on('end', function (convo) {
        if (convo.status === 'completed') {
          let resStr = JSON.stringify(convo.extractResponses())
          console.log(resStr)
          // fs.writeFile('/tmp/test', resStr, function (err) {
          fs.appendFile('/tmp/test', resStr, function (err) {
            if (err) {
              return console.log(err)
            }
            console.log('The file was saved!')
          })
        } else {
          console.log('Conversation ended prematurely due to unknown error')
        }
      })
    }

    bot.startConversation(message, askName)
  }

  controller.hears(['hello'], ['message_received', 'direct_message', 'direct_mention', 'mention'], hello)
}
