/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// function to query dynamoDB table
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  var segments = event['url'].split('/');
  var lastSegment = segments[segments.length - 1];
  const params = {
    TableName : 'translation-storages-db',
    /* Item properties will depend on your application concerns */
    Key: {
      URL: lastSegment
    }
  };
  const data = await docClient.get(params).promise();
  console.log(data);
  if (JSON.stringify(data) == "{}"){
     return {urlPresent: false,
       url: event['url']
     };
  }
  else {
  return {urlPresent: true,
         body: JSON.stringify(data)};
  }
};