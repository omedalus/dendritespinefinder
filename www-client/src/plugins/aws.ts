const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
});

const awsCredentials = require('./aws-credentials.json');
AWS.config.update(awsCredentials);

