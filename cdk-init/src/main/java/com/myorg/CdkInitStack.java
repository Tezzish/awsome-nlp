package com.myorg;


import software.amazon.awscdk.Duration;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.appsync.AuthorizationConfig;
import software.amazon.awscdk.services.appsync.AuthorizationMode;
import software.amazon.awscdk.services.appsync.AuthorizationType;
import software.amazon.awscdk.services.appsync.BaseResolverProps;
import software.amazon.awscdk.services.appsync.GraphqlApi;
import software.amazon.awscdk.services.appsync.LambdaDataSource;
import software.amazon.awscdk.services.appsync.MappingTemplate;
import software.amazon.awscdk.services.appsync.PrimaryKey;
import software.amazon.awscdk.services.appsync.SchemaFile;
import software.amazon.awscdk.services.appsync.Values;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.constructs.Construct;

public class CdkInitStack extends Stack {
  public CdkInitStack(final Construct scope, final String id) {
    this(scope, id, null);
  }

  public CdkInitStack(final Construct scope, final String id,
                      final StackProps props) {
    super(scope, id, props);

    // Add IAM permissions to the Lambda function
//        PolicyStatement translateAccessPolicy = PolicyStatement.Builder.create()
//            .effect(Effect.ALLOW)
//            .actions(Actions.translate("*")) // Grants full access to the Translate service
//            .resources("*") // Specifies all resources
//            .build();

    Function
        myLambdaFunction =
        Function.Builder.create(this, "UserConfigFunctionCDK")
            .runtime(Runtime.JAVA_17)
            .code(Code.fromAsset(
                "../amplify/backend/function/UserConfigFunction/build/distributions/latest_build.zip"))
            .handler(
                "com.awsomenlp.lambda.config.UserConfigHandler::handleRequest")
            .description("Initial Attempt at making a lambda with CDK")
            .memorySize(256)
            .timeout(Duration.seconds(45))
            .build();


    GraphqlApi api = GraphqlApi.Builder.create(this, "API")
        .name("my-appsync-api")
        .schema(SchemaFile
            .fromAsset("../amplify/backend/api/awsomenlp/schema.graphql"))
        .authorizationConfig(AuthorizationConfig.builder()
            .defaultAuthorization(AuthorizationMode.builder()
                .authorizationType(AuthorizationType.API_KEY)
                .build())
            .build())
        .build();

    LambdaDataSource lambdaDataSource =
        api.addLambdaDataSource("lambdaDS", myLambdaFunction);
    lambdaDataSource.createResolver("resolver",
        BaseResolverProps.builder()
            .typeName("Query")
            .requestMappingTemplate(MappingTemplate.lambdaRequest())
            .responseMappingTemplate(MappingTemplate.lambdaRequest())
            .fieldName("translate")
            .build());
  }
}
