

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// function to query dynamoDB table
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  const params = {
    TableName : 'translations-aws-blog-posts',
    /* Item properties will depend on your application concerns */
    Key: {
      URL: "?trk=7a3f46e1-9c31-4493-9807-8174ec76e623&sc_channel=el"
    }
  }
  try {
    const data = await docClient.get(params).promise()
    print(data)
    return { body: JSON.stringify(data) }
  } catch (err) {
    return { error: err }
  }
}