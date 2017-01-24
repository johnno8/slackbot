require('dotenv').config()

module.exports = {
  slackToken: process.env.SLACK_TOKEN,
  alphaGatewayURL: process.env.ALPHA_GATEWAY_URL
}
