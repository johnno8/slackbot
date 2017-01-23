const Botkit = require('botkit')
const config = require('./config')
const fs = require('fs')
const request = require('request')
let projectList = null

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: '/Users/johnokeeffe/dev/slackbot/users.json'
  // include "log: false" to disable logging
  // or a "logLevel" integer from 0 to 7 to adjust logging verbosity
})

// connect the bot to a stream of messages
controller.spawn({
  token: config.slackToken
}).startRTM()

getProjects(function (err, projects) {
  if (err) console.log(err)
  else {
    projectList = projects
    console.log('2017 projects retrieved ok\n')
  }
})

controller.on('rtm_open', function (bot, message) {
  getUsers(bot)
  console.log(projectList[0])
})

/* let getUser = function (bot, user, callback) {
  controller.storage.users.get(user, function(err, user_data) {
    if (err) {
      console.log(err)
      getUsers(bot)
    }
    callback(null, user)
  })
} */
/* getUser(bot, 'dara', function(err, dara) {
  console
}) */

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
      //let num = JSON.stringify(response)
      console.log(response)
      convo.say('That old? Ok!')
      
      //if (!function isNumeric (num) { return !isNaN(parseFloat(num)) && isFinite(num); }) {
      //if (!function isNumeric (num) {}) {
      //if (!function isNumeric(num) { return (num > 0 || num === 0 || num === '0' || num < 0) && num !== true && isFinite(num) }) {
      if (isNaN(response.text)){
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

let getUsers = function (bot) {
  bot.api.users.list({}, (err, response) => {
    if (err) return err
    // console.log(response.members[0])
    response.members.forEach((user) => {
      // need to get id for each user and pass it into the save below
      controller.storage.users.save(user, function (err) {
        if (err) console.log(err)
      })
    })
    return response
  })
}

function getProjects (callback) {
  request('http://jenny-production-ecs-1811095239.eu-west-1.elb.amazonaws.com/api/projects/2017', (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let info = JSON.parse(body)
      // console.log('\nJenny Pojects 2017:\n')
      /* info.projects.forEach(function (project) {
        console.log(project.name)
      }) */
      // projectList = info.projects
      callback(null, info.projects)
    } else callback(error)
  })
}

