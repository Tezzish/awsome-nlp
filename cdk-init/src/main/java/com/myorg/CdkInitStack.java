package com.myorg;


import java.util.Arrays;
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
import software.amazon.awscdk.services.appsync.SchemaFile;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.amazon.awscdk.services.s3.IBucket;
import software.constructs.Construct;

public class CdkInitStack extends Stack {
  public CdkInitStack(final Construct scope, final String id) {
    this(scope, id, null);
  }

  public CdkInitStack(final Construct scope, final String id,
                      final StackProps props) {
    super(scope, id, props);

    Role userConfigFunctionRole = Role.Builder.create(this, "LambdaExecutionRole")
        .assumedBy(new ServicePrincipal("lambda.amazonaws.com"))
        .managedPolicies(Arrays.asList(
            ManagedPolicy.fromAwsManagedPolicyName("TranslateFullAccess"),
            ManagedPolicy.fromAwsManagedPolicyName("IAMFullAccess")))
        .build();


    Function userConfigFunctionCDK =
        Function.Builder.create(this, "UserConfigFunctionCDK")
            .role(userConfigFunctionRole)
            .runtime(Runtime.JAVA_17)
            .code(Code.fromBucket(Bucket.fromBucketName(this, "Bucket", "codejava"), "latest_build.zip"))
            .handler("com.awsomenlp.lambda.config.UserConfigHandler::handleRequest")
            .description("UserConfigLambda")
            .memorySize(256)
            .timeout(Duration.seconds(45))
            .build();

    Function getBlogPostParsedFunction =
        Function.Builder.create(this, "GetBlogPostParsedFunction")
            .runtime(Runtime.PYTHON_3_10)
            .code(Code.fromBucket(Bucket.fromBucketName(this, "Bucket", "codepython"), "get_blog_content.zip"))
            .description("Function to get blog post parsed")
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

    LambdaDataSource translateDS =
        api.addLambdaDataSource("lambdaDS", userConfigFunctionCDK);

    translateDS.createResolver("resolver",
        BaseResolverProps.builder()
            .typeName("Query")
            .requestMappingTemplate(MappingTemplate.lambdaRequest())
            .responseMappingTemplate(MappingTemplate.lambdaRequest())
            .fieldName("translate")
            .build());

    LambdaDataSource blogPostLambdaDataSource =
        api.addLambdaDataSource("blogPostLambdaDS", getBlogPostParsedFunction);

    blogPostLambdaDataSource.createResolver("blogPostResolver",
        BaseResolverProps.builder()
            .typeName("Query")
            .requestMappingTemplate(MappingTemplate.lambdaRequest())
            .responseMappingTemplate(MappingTemplate.lambdaRequest())
            .fieldName("getBlogPostParsed")
            .build());
  }

}
