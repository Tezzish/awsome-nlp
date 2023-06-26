# storingTranslation
This directory contains the service that is responsible for storing the translated AWS blog post on the S3 buckets. This function calls the UserConfigFunction to retrieve the translated version of the blog post according to user's choice of the translation model. This function also calls getBlogContent to retrieve the original blog post. 

## Tech Specs
This function uses Python 3.9. It is intended to run using AWS Lambda. The dependencies used by this function are installed in a packages directory and uploaded as a Lambda layer: BeautifulSoup (bs4), copy, boto3, json, and os to interact with AWS services and carry out the functionalities needed for storing the translation. 


### Testing
This function is tested using pytest. 

#### Deployment

This function should be deployed automatically by CDK, however, if you'd like to deploy this manually, you can build a zip of this function and upload it to a Lambda function on the AWS console with the following specifications:

```     
role: S3 FullAccess, DynamoDB FullAccess, Lambda FullAccess
runtime: Python 3.9,
handler: index.handler,
timeout: cdk.Duration.minutes(1)
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
    "statusCode": "200",
    "body": "great success",
    "url": URL,
    "targetLanguage": (target language of the translation),
    "translationModel": (translation model used for the translation)
}
```