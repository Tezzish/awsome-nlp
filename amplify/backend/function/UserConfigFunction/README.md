# UserConfigFunction

This directory contains the service that is responsible for interacting with the proper translation model, and sending the result back to the AppSync in proper format, given a URL input.

## Tech Specs
This function uses Java 17 and Gradle as a package manager. It is intended to run on using AWS Lambda.

### Directory Structure

- [Handler](src/main/java/com/awsomenlp/lambda/config/): This is what is called when this lambda is invoked.
- [Objects](src/main/java/com/awsomenlp/lambda/config/objects): This is where the objects are stored.
- [Resolvers](src/main/java/com/awsomenlp/lambda/config/resolvers): This is where the resolvers are stored. Resolvers act as interfaces between different services, for example, the AppSyncResolver converts relevant data from this service into something AppSync can understand.
- [Models](src/main/java/com/awsomenlp/lambda/config/models): This is where the different translation models are stored and interfaced with.

### Building & Testing

Since this project is using Gradle, you can test it using ```$ gradle test``` and build using ```$ gradle build```. 

#### Deployment

This function should be deployed automatically by CDK, however, if you'd like to deploy this manually, you can with ```$ gradle buildZip``` and uploading it to a Lambda function with the following specifications:

```     
role: userConfigFunctionRole,
runtime: Runtime.JAVA_17,
handler: com.awsomenlp.lambda.config.UserConfigHandler::handleRequest,
memorySize*: 1024MB,
timeout: cdk.Duration.seconds(45)
```

*The memory size is totally optional, this can be left at default.

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
    "blogPostOriginalPostId": "10",
    "blogPostLanguageCode": "tr",
    "id": "100",
    "title": (Translated Title),
    "content": [
        (Translated Paragraph),
        (Translated Paragraph)
    ],
    "authors": [
        (Author 1), 
        (Author 2)
    ]
}
```