# AWSome-NLP

This full stack application was made to translate English blog posts into low-resource languages in order to improve the accessibility to people who may not have access to good translation services.

## Translation models

This application uses Amazon Translate and our own, fine tuned Transformer based model hosted on AWS SageMaker in order to translate the blogposts. (Note that the SageMaker model currently only translates the blog posts into Turkish but this can be extended into other languages.

## Services

In order to build this application we use the following AWS services:

- Amazon Translate to translate blog posts
- AWS Amplify to host and deploy our application
- AWS Lambda to build logic (for example to scrape the blog posts and save them)
- DynamoDB to store translations and ratings for those translations so that it acts as a cache
- AWS step functions for control flow within the application
- AWS AppSync for GraphQL queries and to facilitate communication between different services
- AWS S3 to store translations
- AWS CloudFormation for frontend aesthetics

## Tools

The tools that we use in order to build this application are:

- React for the frontend (which can be started by running ```$ npm install & npm start```)
- AWS Lambda for logic (which can be found on the AWS Console and run using the provided test templates)

