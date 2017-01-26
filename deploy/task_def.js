var ALPHA_GATEWAY_URL = process.env.ALPHA_GATEWAY_URL
var SLACK_TOKEN = process.env.SLACK_TOKEN
var CIRCLE_BUILD_NUM = process.env.CIRCLE_BUILD_NUM

console.log(`{
  "containerDefinitions": [
    {
      "memory": 300,
      "name": "timesheet-slackbot",
      "environment": [
        {
          "name": "ALPHA_GATEWAY_URL",
          "value": "${ALPHA_GATEWAY_URL}"
        },
        {
          "name": "SLACK_TOKEN",
          "value": "${SLACK_TOKEN}"
        }
      ],
      "image": "156233825351.dkr.ecr.eu-west-1.amazonaws.com/timesheet-slackbot:build-${CIRCLE_BUILD_NUM}",
      "cpu": 0
    }
  ],
  "family": "timesheet-slackbot"
}`)
