/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// function to query dynamoDB table
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  var segments = event['url'].split('/');
  console.log(event['url'])
  var lastSegment = segments[segments.length - 1];
  const params = {
    TableName : 'translations-aws-blog-posts',
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
  //   // Specify the bucket name
  // const bucketName = data['Item']['RHS_s3_loc'];

  // // Specify the file names you want to retrieve
  // const fileNames = ['file1.txt', 'file2.txt', 'file3.txt'];

  // try {
    // const promises = fileNames.map(async (fileName) => {
    //   // Retrieve the contents of each file
    //   const response = await s3.getObject({ Bucket: bucketName, Key: fileName }).promise();
    //   const content = response.Body.toString('utf-8');

    //   return { fileName, content };
    // });

    // // Wait for all promises to resolve
    // const results = await Promise.all(promises);
  return {urlPresent: true,
         body: JSON.stringify(data)};
  }
};