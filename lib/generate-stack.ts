import { Duration, Stack } from "aws-cdk-lib";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";

import {
  Cors,
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

const PROJECT_NAME = "lambda-apigateway";
const region = "eu-west-1";

export class ApiGatewayLambdaStack extends Stack {
  constructor(scope: Construct) {
    super(scope, `${PROJECT_NAME}-stack`, {
      env: {
        region,
      },
    });
    // create a role for the lambda
    const lambdaRole = new Role(this, `${PROJECT_NAME}-role`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        {
          managedPolicyArn:
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
        },
      ],
    });
    // Create a lambda function to process the queue
    const lambda = new Function(this, `${PROJECT_NAME}-lambda`, {
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.PYTHON_3_8,
      handler: "main.main",
      role: lambdaRole,
      code: Code.fromAsset(path.join(__dirname, `/../lambda`)),
    });

    const api = new RestApi(this, `LambdaApiGateway`, {
      restApiName: `lambda-api`,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    const resultsResource = api.root.addResource("results");
    resultsResource.addMethod("POST", new LambdaIntegration(lambda));
  }
}
