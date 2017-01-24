'use strict'

const config = require('../../config')
const WebClient = require('@slack/client').WebClient
const web = new WebClient(config.slackToken)

exports.getUsers = function getUsers (controller, callback) {

  web.users.list((err, response) => {
    if (err) return callback(err)
    response.members.forEach((user) => {
    // need to get id for each user and pass it into the save below
      controller.storage.users.save(user, function (err) {
        if (err) console.log(err)
      })
    })
    callback(null, response)
  })

}