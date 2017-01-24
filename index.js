
'use strict'

const Botkit = require('botkit')
const config = require('./config')
//const request = require('request')
const conversation = require('./lib/conversation/hello')
const users = require('./lib/users/users')
const projects = require('./lib/projects/projects')

let projectList = null
let year = new Date().getFullYear()

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: './slackdata'
  // include "log: false" to disable logging
  // or a "logLevel" integer from 0 to 7 to adjust logging verbosity
})

conversation.register(controller)

projects.getProjects(year, (err, projects) => {
  if (err) return console.log(err)
  projectList = projects
  console.log('2017 projects retrieved ok')

  users.getUsers(controller, (err, users) => {
    if (err) return console.log(err)
    console.log('users retrieved ok')
    controller.spawn({
      token: config.slackToken
    }).startRTM()
  })
})

/*
function getProjects (year, callback) {
  request(config.alphaGatewayURL + '/api/projects/' + year, (err, response, body) => {
    if (err) return callback(err)
    let info = JSON.parse(body)
    callback(null, info.projects)
  })
}*/
