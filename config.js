require('dotenv').config()

module.exports = {
  slackToken: process.env.SLACK_TOKEN,
  alphaGatewayURL: 'http://jenny-production-ecs-1811095239.eu-west-1.elb.amazonaws.com'
}
