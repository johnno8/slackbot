const Botkit = require('botkit')
const config = require('./config')
const fs = require('fs')
const request = require('request')
const WebClient = require('@slack/client').WebClient
let projectList = null

const token = process.env.SLACK_TOKEN || ''
const web = new WebClient(token)

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: '/Users/johnokeeffe/dev/slackbot/users.json'
  // include "log: false" to disable logging
  // or a "logLevel" integer from 0 to 7 to adjust logging verbosity
})

getProjects(function (err, projects) {
  if (err) console.log(err)
  else {
    projectList = projects
    console.log('2017 projects retrieved ok\n')
  }
})

getUsers(function (err, users) {
  if (err) console.log(err + ' c')
  else {
    console.log('users retrieved ok')
  }
})

// connect the bot to a stream of messages
controller.spawn({
  token: config.slackToken
}).startRTM()

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
        // something happened that caused the conversation to stop prematurely
        console.log('Conversation ended prematurely due to unknown error')
      }
    })
  }

  bot.startConversation(message, askName)
})

function getUsers (callback) {
  web.users.list(token, (err, response) => {
    if (!err) {
      response.members.forEach((user) => {
      // need to get id for each user and pass it into the save below
        controller.storage.users.save(user, function (err) {
          if (err) console.log(err + ' a')
        })
      })
      callback(null, response)
    } else callback(err + ' b')
  })
}

function getProjects (callback) {
  request('http://jenny-production-ecs-1811095239.eu-west-1.elb.amazonaws.com/api/projects/2017', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let info = JSON.parse(body)
      callback(null, info.projects)
    } else callback(error)
  })
}
