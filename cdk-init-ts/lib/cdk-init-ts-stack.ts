import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Function, Runtime, Code, S3Code } from 'aws-cdk-lib/aws-lambda';
import { GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { AuthorizationType} from 'aws-cdk-lib/aws-appsync';
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as ddb from 'aws-cdk-lib/aws-dynamodb'
import * as amplify from '@aws-cdk/aws-amplify-alpha'
import values from './exports';
import * as sf from 'aws-cdk-lib/aws-stepfunctions'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { StateMachineInput } from 'aws-cdk-lib/aws-codepipeline-actions';
import { CfnJob } from 'aws-cdk-lib/aws-databrew';
import { S3 } from 'aws-cdk-lib/aws-ses-actions';
export class CdkInitTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // Define an S3 bucket
    //  const bucket = new cdk.aws_s3.CfnBucket(this, 'tscodebucket', {
    //   bucketName: 'tscodebucket',
    //   // autoDeleteObjects: true,
    //   // removalPolicy: cdk.RemovalPolicy.DESTROY
    // });

    // const translationBucket = new cdk.aws_s3.Bucket(this, 'translations-aws-blog-posts-bucket', {
    //   bucketName: 'translations-aws-blog-posts-bucket',
    // });
    
  

    // //Deploy S3 resources
    // const deployment = new s3deploy.BucketDeployment(this, 'DeploymentBucket', {
    //   sources: [s3deploy.Source.asset('../amplify/backend/function/UserConfigFunction/build/distributions/user_config_latest.zip'),
    //     s3deploy.Source.asset('../amplify/backend/function/getBlogContent/get_blog_content.zip'),
    //     s3deploy.Source.asset('../amplify/backend/function/stepFunctionInvoker/step_function_invoker.zip'),
    //     s3deploy.Source.asset('../amplify/backend/function/storingTranslation/storing_translation.zip'),
    //     s3deploy.Source.asset('../amplify/backend/function/checkingUrl/checking_url.zip'),
    //   ],

    //     metadata: {'key': "userconfiglatest", 'key2': "userconfiglatest2" },
    //   destinationBucket: bucket,
    //   extract: false,
    // });


    // Define Lambda Execution Roles
    const userConfigFunctionRole = new Role(this, 'userConfigFunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('TranslateFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess')
      ]
    });

    const checkingURLRole = new Role(this, 'checkingURLRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
      ]
    });

    const storageTranslationRole = new Role(this, 'storageTranslationRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
      ]
    });

    const stepFunctionInvokerRole = new Role(this, 'stepFunctionInvokerRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        ManagedPolicy.fromAwsManagedPolicyName('AWSStepFunctionsFullAccess')
      ]
    });



    // Define UserConfigFunction
    const userConfigFunction = new Function(this, 'UserConfigFunction', { 
      role: userConfigFunctionRole,
      runtime: Runtime.JAVA_17,
      code: S3Code.fromAsset("../amplify/backend/function/UserConfigFunction/build/distributions/user_config_latest.zip"), //idk how to change the names :sob:
      handler: 'com.awsomenlp.lambda.config.UserConfigHandler::handleRequest',
      description: 'UserConfigLambda',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(45)
    });


    // Define GetBlogPostParsedFunction
    const getBlogPostParsedFunction = new Function(this, 'GetBlogPostParsedFunction', {
      runtime: Runtime.PYTHON_3_10,
      code: S3Code.fromAsset("../amplify/backend/function/getBlogContent/get_blog_content.zip"),
      handler: 'app.handler',
      description: 'Function to get blog post parsed',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(45)
    });
    
    // Define CheckingURLFunction
    const checkingURLFunction = new Function(this, 'CheckingURLFunction', {
      runtime: Runtime.NODEJS_18_X,
      role: checkingURLRole,
      code: S3Code.fromAsset("../amplify/backend/function/checkingUrl/checking_url.zip"),
      handler: 'index.handler',
      description: 'For a given URL, ensure it is a valid AWS blogpost URL.',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(45)
    })

    // Define StorageTranslationFunction
    const storageTranslationFunction = new Function(this, 'StorageTranslationFunction', {
      runtime: Runtime.PYTHON_3_10,
      role: storageTranslationRole,
      code: S3Code.fromAsset("../amplify/backend/function/storingTranslation/storing_translation.zip"),
      handler: 'index.handler',
      description: 'For a given blog post, check if it and its translation are stored in the database. Return it if so, otherwise, create it, and return that.',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(45)
    })

    // Define stepFunctionInvoker
    const stepFunctionInvokerFunction = new Function(this, 'StepFunctionInvokerFunction', {
      runtime: Runtime.PYTHON_3_10,
      role: stepFunctionInvokerRole,
      code: S3Code.fromAsset("../amplify/backend/function/stepFunctionInvoker/step_function_invoker.zip"),
      handler: 'index.handler',
      description: 'Invokes the step function',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(75)
    })


    const kvm = {
      "Comment": "A description of my state machine",
      "StartAt": "Checking Database",
      "States": {
        "Checking Database": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "OutputPath": "$.Payload",
          "Parameters": {
            "Payload.$": "$",
            "FunctionName": checkingURLFunction.functionArn
          },
          "Retry": [
            {
              "ErrorEquals": [
                "Lambda.ServiceException",
                "Lambda.AWSLambdaException",
                "Lambda.SdkClientException",
                "Lambda.TooManyRequestsException"
              ],
              "IntervalSeconds": 2,
              "MaxAttempts": 6,
              "BackoffRate": 2
            }
          ]
        },
        "Choice": {
          "Type": "Choice",
          "Choices": [
            {
              "Variable": "$.urlPresent",
              "BooleanEquals": true,
              "Next": "Success"
            },
            {
              "Variable": "$.urlPresent",
              "BooleanEquals": false,
              "Next": "Storing Translation"
            }
          ]
        },
        "Storing Translation": {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke",
          "OutputPath": "$.Payload",
          "Parameters": {
            "Payload.$": "$",
            "FunctionName": storageTranslationFunction.functionArn
          },
          "Retry": [
            {
              "ErrorEquals": [
                "Lambda.ServiceException",
                "Lambda.AWSLambdaException",
                "Lambda.SdkClientException",
                "Lambda.TooManyRequestsException"
              ],
              "IntervalSeconds": 2,
              "MaxAttempts": 6,
              "BackoffRate": 2
            }
          ],
          "Next": "Checking Database"
        },
        "Success": {
          "Type": "Succeed"
        }
      }
    }


    // States      
    const sucessState = new sf.Succeed(this, 'Success', {
      comment:kvm.States.Success.Type
    })


    const storingTranslationState = new tasks.LambdaInvoke(this, 'Storing Translation', {
      lambdaFunction: storageTranslationFunction,
      outputPath: kvm.States['Storing Translation'].OutputPath,
    });

    const checkingDbState = new tasks.LambdaInvoke(this, 'Checking Database', {
      lambdaFunction: checkingURLFunction,
      outputPath: kvm.States['Checking Database'].OutputPath,
    });

    const choiceState = new sf.Choice(this, "choice")
  
    // Create Statemachine
    const stateMachine = new sf.StateMachine(this, 'StateMachine', {
      definition: sf.Chain.start(checkingDbState.next(choiceState
        .when(sf.Condition.booleanEquals('$.urlPresent', true), sucessState)
        .otherwise(storingTranslationState.next(checkingDbState))
        )),
      timeout: cdk.Duration.minutes(2),
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
    const translateDS = api.addLambdaDataSource('lambdaDS', userConfigFunction);

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

    // Define Lambda Data source for Step Function Invoker 
    const stepFunctionDS = api.addLambdaDataSource('stepFunctionInvokerDS', stepFunctionInvokerFunction);

    stepFunctionDS.createResolver('stepFunctionInvoker', {
      typeName: 'Query',
      fieldName: 'getStepFunctionInvoker'
    })


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

    // const translationTable = new ddb.Table(this, 'translations-aws-blog-posts', {
    //   partitionKey: {name: 'URL', type: ddb.AttributeType.STRING}
    // })


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

    const environmentVariables = {
      'ENDPOINT': api.graphqlUrl,
      'REGION': this.region,
      'API_KEY': (api.apiKey ? api.apiKey : "null"),
      'STEP_FUNCTION_ARN': stateMachine.stateMachineArn,
      'USER_CONFIG_NAME': userConfigFunction.functionName,
      'GET_BLOG_CONTENT_NAME': getBlogPostParsedFunction.functionName
    };
    
    storageTranslationFunction.addEnvironment('USER_CONFIG_NAME', environmentVariables.USER_CONFIG_NAME)
    storageTranslationFunction.addEnvironment('GET_BLOG_CONTENT_NAME', environmentVariables.GET_BLOG_CONTENT_NAME )

    stepFunctionInvokerFunction.addEnvironment('STEP_FUNCTION_ARN', environmentVariables.STEP_FUNCTION_ARN)
    
    const amplifyApp = new amplify.App(this, 'app', {
      sourceCodeProvider:  new amplify.GitHubSourceCodeProvider({
        owner: values.owner,
        repository: values.repository,
        oauthToken: cdk.SecretValue.secretsManager(values.keyname),
      }),
      environmentVariables: environmentVariables
    });
    amplifyApp.addBranch("main");
    amplifyApp.addBranch("dev");
  }
}
