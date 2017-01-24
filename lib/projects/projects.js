'use strict'

const config = require('../../config')
const request = require('request')

exports.getProjects = function getProjects (year, callback) {
  request(config.alphaGatewayURL + '/api/projects/' + year, (err, response, body) => {
    if (err) return callback(err)
    let info = JSON.parse(body)
    callback(null, info.projects)
  })
}
