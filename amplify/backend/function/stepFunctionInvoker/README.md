# stepFunctionInvoker

This directory contains the service that is responsible for invoking the step function with the respective ARN which creates the workflow of the whole application. 

## Tech Specs
This function uses Python 3.9. It is intended to run using AWS Lambda. This function uses the dependencies: os, boto3, json, time to interact with AWS services and the operating system. 

### Testing
This function is tested using unittest pytest. 

#### Deployment
This function should be deployed automatically by CDK, however, if you'd like to deploy this manually, you can build a zip of this function and upload it to a Lambda function on the AWS console with the following specifications:

```     
role: Step Function FullAccess,
runtime: Python 3.9,
handler: index.handler,
timeout: cdk.Duration.minutes(1)
```

**input**

```
{
    "arguments": {
        "input": {
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
    }
}
```

**output**

```
{
    "id": (adjusted url of the blog post),
    "lhs": (left side of the screen, original post),
    "rhs": (right side of the screen, translated post)
}
```