import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { AuthorizationType} from 'aws-cdk-lib/aws-appsync';
import * as amplify from '@aws-cdk/aws-amplify-alpha'


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkInitTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /**
     * create code commit report from local
     */

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

    /**
     * This is missing the creation of DynamoDB tables for everything. This can be justified with the fact that we'd have to manually
     * add everything in CDK, after which, modification would be near impossible.
     */
    const amplifyApp = new amplify.App(this, 'app', {
      sourceCodeProvider:  new amplify.GitHubSourceCodeProvider({
        owner: 'Tezzish',
        repository: 'awsome-nlp',
        oauthToken: cdk.SecretValue.secretsManager('ishankey'),
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
