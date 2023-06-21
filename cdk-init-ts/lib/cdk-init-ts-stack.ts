import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { AuthorizationType} from 'aws-cdk-lib/aws-appsync';
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as ddb from 'aws-cdk-lib/aws-dynamodb'
import * as amplify from '@aws-cdk/aws-amplify-alpha'


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkInitTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //  // Define an S3 bucket
    //  const bucket = new cdk.aws_s3.Bucket(this, 'tscodebucket', {
    //   bucketName: 'tscodebucket'
    // });

    // const deployment = new s3deploy.BucketDeployment(this, 'DeploymentBucket', {
    //   sources: [s3deploy.Source.asset('../amplify/backend/function/UserConfigFunction/build/distributions/user_config_latest.zip'),
    //     s3deploy.Source.asset('../amplify/backend/function/UserConfigFunction/build/distributions/get_blog_content.zip')],
    //   destinationBucket: bucket,
    //   extract: false
    // });


    // Define Lambda Execution Role
    const userConfigFunctionRole = new Role(this, 'LambdaExecutionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('TranslateFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess')
      ]
    });

    const bucket = cdk.aws_s3.Bucket.fromBucketName(this, 'tscodebucket', 'tscodebucket');

    // Define UserConfigFunctionCDK
    const userConfigFunctionCDK = new Function(this, 'UserConfigFunctionCDK', {
      role: userConfigFunctionRole,
      runtime: Runtime.JAVA_17,
      code: Code.fromBucket(bucket, 'e8977cbf58d4dcee9c8746350834eed39d5effcb02a65be5316f7dbf117a1fcd.zip'), //idk how to change the names :sob:
      handler: 'com.awsomenlp.lambda.config.UserConfigHandler::handleRequest',
      description: 'UserConfigLambda',
      memorySize: 256,
      timeout: cdk.Duration.seconds(45)
    });

    // Define GetBlogPostParsedFunction
    const getBlogPostParsedFunction = new Function(this, 'GetBlogPostParsedFunction', {
      runtime: Runtime.PYTHON_3_10,
      code: Code.fromBucket(bucket, '7f3a37abd3a94feec33aada636add5af982bda1231d84433177736b386e4b4f0.zip'),
      handler: 'app.handler',
      description: 'Function to get blog post parsed',
      memorySize: 256,
      timeout: cdk.Duration.seconds(45)
    });

    // Define GraphqlApi
    const api = new GraphqlApi(this, 'API', {
      name: 'awsomenlp-api',
      schema: SchemaFile.fromAsset('../amplify/backend/api/awsomenlp/schema.graphql'), 
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        }
      }
    });

    // Define Lambda Data Source for translateDS
    const translateDS = api.addLambdaDataSource('lambdaDS', userConfigFunctionCDK);

    translateDS.createResolver('userConfigResolver', {
      typeName: 'Query',
      fieldName: 'translate'
    });

    // Define Lambda Data Source for blogPostLambdaDataSource
    const blogPostLambdaDataSource = api.addLambdaDataSource('blogPostLambdaDS', getBlogPostParsedFunction);

    blogPostLambdaDataSource.createResolver('getBlogPostResolver', {
      typeName: 'Query',
      fieldName: 'getBlogPostParsed'
    });


    const blogPostTable = new ddb.Table(this, 'BlogPostTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const ratingTable = new ddb.Table(this, 'RatingTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const languageTable = new ddb.Table(this, 'LanguageTable', {
      partitionKey: { name: 'code', type: ddb.AttributeType.STRING },
    });

    const translationModelTable = new ddb.Table(this, 'TranslationModelTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const translationConfigTable = new ddb.Table(this, 'TranslationConfigTable', {
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
    });

    const blogPostDS = api.addDynamoDbDataSource('BlogPost', blogPostTable);
    const ratingDS = api.addDynamoDbDataSource('Rating', ratingTable);
    const languageDS = api.addDynamoDbDataSource('Language', languageTable);
    const translationModelDS = api.addDynamoDbDataSource('TranslationModel', translationModelTable);
    const translationConfigDS = api.addDynamoDbDataSource('TranslationConfig', translationConfigTable);

    blogPostDS.createResolver("getBlogPost", {
      typeName: 'Query',
      fieldName: 'getBlogPost',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    ratingDS.createResolver("getRating", {
      typeName: 'Query',
      fieldName: 'getRating',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    languageDS.createResolver("getLanguage", {
      typeName: 'Query',
      fieldName: 'getLanguage',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('code', 'code'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationModelDS.createResolver("getTranslationModel", {
      typeName: 'Query',
      fieldName: 'getTranslationModel',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    blogPostDS.createResolver("createBlogPost", {
      typeName: 'Mutation',
      fieldName: 'createBlogPost',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').auto(), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    ratingDS.createResolver("createRating", {
      typeName: 'Mutation',
      fieldName: 'createRating',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').auto(), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    languageDS.createResolver("createLanguage", {
      typeName: 'Mutation',
      fieldName: 'createLanguage',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('code').is('input.code'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationModelDS.createResolver("createTranslationModel", {
      typeName: 'Mutation',
      fieldName: 'createTranslationModel',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').auto(), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationConfigDS.createResolver("createTranslationConfig", {
      typeName: 'Mutation',
      fieldName: 'createTranslationConfig',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').auto(), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    //Update resolvers
    
    blogPostDS.createResolver("updateBlogPost",{
      typeName: 'Mutation',
      fieldName: 'updateBlogPost',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').is('input.id'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    ratingDS.createResolver("updateRating",{
      typeName: 'Mutation',
      fieldName: 'updateRating',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('code').is('input.code'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    languageDS.createResolver("updateLanguage", {
      typeName: 'Mutation',
      fieldName: 'updateLanguage',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').is('input.id'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationModelDS.createResolver("updateTranslationModel", {
      typeName: 'Mutation',
      fieldName: 'updateTranslationModel',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').is('input.id'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationConfigDS.createResolver("updateTranslationConfig", {
      typeName: 'Mutation',
      fieldName: 'updateTranslationConfig',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(appsync.PrimaryKey.partition('id').is('input.id'), appsync.Values.projecting('input')),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // Delete resolvers

    blogPostDS.createResolver("deleteBlogPost", {
      typeName: 'Mutation',
      fieldName: 'deleteBlogPost',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id', 'input.id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    ratingDS.createResolver("deleteRating", {
      typeName: 'Mutation',
      fieldName: 'deleteRating',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id',  'input.id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    languageDS.createResolver("deleteLanguage", {
      typeName: 'Mutation',
      fieldName: 'deleteLanguage',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('code', 'input.code'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationModelDS.createResolver("deleteTranslationModel", {
      typeName: 'Mutation',
      fieldName: 'deleteTranslationModel',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id',  'input.id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    translationConfigDS.createResolver("deleteTranslationConfig", {
      typeName: 'Mutation',
      fieldName: 'deleteTranslationConfig',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id',  'input.id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // List resolvers

    //from https://repost.aws/questions/QU2yBP6p5SQwuEV_3t4huw_w/appsync-created-with-cdk-query-not-showing-results
    blogPostDS.createResolver("listBlogPosts", {
      typeName: 'Query',
      fieldName: 'listBlogPosts',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan",
      }
    `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        $util.toJson($ctx.result)
      `),
    });

    ratingDS.createResolver("listRatings", {
      typeName: 'Query',
      fieldName: 'listRatings',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan",
      }
    `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        $util.toJson($ctx.result)
      `),
    });

    languageDS.createResolver("listLanguages", {
      typeName: 'Query',
      fieldName: 'listLanguages',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan",
      }
    `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        $util.toJson($ctx.result)
      `),
    });

    translationModelDS.createResolver("listTranslationModels", {
      typeName: 'Query',
      fieldName: 'listTranslationModels',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version" : "2017-02-28",
        "operation" : "Scan",
      }
    `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        $util.toJson($ctx.result)
      `),
    });



    /**
     * This is missing the creation of DynamoDB tables for everything. This can be justified with the fact that we'd have to manually
     * add everything in CDK, after which, modification would be near impossible. However, this generation simply doesnt work.
     */
    const amplifyApp = new amplify.App(this, 'app', {
      sourceCodeProvider:  new amplify.GitHubSourceCodeProvider({
        owner: 'kyonc2022',
        repository: 'awsome-nlp',
        oauthToken: cdk.SecretValue.secretsManager('kyonkey'),
      }),
      environmentVariables: {
        'ENDPOINT': api.graphqlUrl,
        'REGION': this.region,
        'API_KEY': (api.apiKey ? api.apiKey : "null")
      }
    });
    //amplifyApp.addBranch("dev");
    amplifyApp.addBranch("cdk_init");
    
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkInitTsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
