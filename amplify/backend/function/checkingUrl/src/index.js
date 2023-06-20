/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// function to query dynamoDB table
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  var url = event['url'];
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  var segments = url.split('/');
  console.log(event['url']);
  var lastSegment = segments[segments.length - 1] + "[translated]-" + event['targetLanguage']['code'] + "-" + event['translationModel']['type'];
  const params = {
    TableName : 'translations-aws-blog-posts',
    /* Item properties will depend on your application concerns */
    Key: {
      URL: lastSegment
    }
  };
  const data = await docClient.get(params).promise();
  console.log(data);
  console.log(event['url'])
  if (JSON.stringify(data) == "{}"){
     return {urlPresent: false,
        url: event['url'],
        targetLanguage : event['targetLanguage'],
        sourceLanguage : event['sourceLanguage'],
        translationModel: event['translationModel']
     };
  }
  else {
          // Specify the URLs of the LHS and RHS files
    const lhsUrl = data['Item']['LHS_s3_loc'];
    const rhsUrl = data['Item']['RHS_s3_loc'];
  
    try {
      // Extract the bucket name and object key from the URLs
      const lhsParams = extractBucketAndKey(lhsUrl);
      const rhsParams = extractBucketAndKey(rhsUrl);
      console.log(data['Item']['RHS_s3_loc'])
  
      // Retrieve the contents of the LHS file
      const lhsResponse = await s3.getObject({ Bucket: lhsParams.bucket, Key: lhsParams.key }).promise();
      const lhsContent = lhsResponse.Body.toString('utf-8');
  
      // Retrieve the contents of the RHS file
      const rhsResponse = await s3.getObject({ Bucket: rhsParams.bucket, Key: rhsParams.key }).promise();
      const rhsContent = rhsResponse.Body.toString('utf-8');
  
      return {
        statusCode: 200,
        urlPresent: true,
        body: { lhs: lhsContent, rhs: rhsContent },
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }
};

// Helper function to extract the bucket name and object key from the S3 URL
function extractBucketAndKey(url) {
  const urlParts = url.replace('https://s3.amazonaws.com/', '').split('/');
  const bucket = urlParts.shift();
  const key = urlParts.join('/');

  return { bucket, key };
}