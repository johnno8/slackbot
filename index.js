const Botkit = require('botkit')
const config = require('./config')
const fs = require('fs')
const request = require('request')
const WebClient = require('@slack/client').WebClient
let projectList = null

const web = new WebClient(config.slackToken)

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: './slackdata'
  // include "log: false" to disable logging
  // or a "logLevel" integer from 0 to 7 to adjust logging verbosity
})

let year = new Date().getFullYear()

getProjects(year, (err, projects) => {
  if (err) console.log(err)
  projectList = projects
  console.log('2017 projects retrieved ok')

  getUsers((err, users) => {
    if (err) console.log(err)
    console.log('users retrieved ok')
    controller.spawn({
      token: config.slackToken
    }).startRTM()
  })
})

controller.hears(['hello'], ['message_received', 'direct_message', 'direct_mention', 'mention'], function (bot, message) {
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
})

function getUsers (callback) {
  web.users.list((err, response) => {
    if (err) callback(err)
    response.members.forEach((user) => {
    // need to get id for each user and pass it into the save below
      controller.storage.users.save(user, function (err) {
        if (err) console.log(err)
      })
    })
    callback(null, response)
  })
}

function getProjects (year, callback) {
  request(config.alphaGatewayURL + '/api/projects/' + year, (err, response, body) => {
    if (err) callback(err)
    let info = JSON.parse(body)
    callback(null, info.projects)
  })
}
