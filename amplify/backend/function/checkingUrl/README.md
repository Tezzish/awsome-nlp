# checkingUrl

This directory contains the service that is responsible for checking if the AWS blogpost is in the database or not. In the case that it is, the translated blog post and the original blog post is retrieved from the S3 buckets, otherwise the output of storingTranslation function is returned. 

## Tech Specs
This function uses Node.js 18. It is intended to run using AWS Lambda. The dependencies used by this function are installed in a packages directory and uploaded as a Lambda layer: aws-sdk. 

### Testing
Jest was used to test the functionality by running the command ```$ npm test```

#### Deployment

This function should be deployed automatically by CDK, however, if you'd like to deploy this manually, you can build a zip of this function and upload it to a Lambda function with the following specifications:

```     
role: DynamoDB FullAccess, S3 FullAccess
runtime: Node.js 18
handler: index.handler
```

**input**

```
        {
            "url":https://aws.amazon.com/blogs/mobile/export-amplify-backends-to-cdk-and-use-with-existing-deployment-pipelines/,
            "targetLanguage": {
                "name": "TURKISH",
                "code": "tr"
            },
            "sourceLanguage": {
                "name": "ENGLISH",
                "code": "en"
            },
            "translationModel": {
                "type": "amazonTranslate"
            }
        }
```

**output**

```
{
    "urlPresent": boolean,
    "body": {
        "id":  (adjusted id of the blog post),
        "lhs": (left side of the screen, original post),
        "rhs": (right side of the screen, translated post)
    }
}
```