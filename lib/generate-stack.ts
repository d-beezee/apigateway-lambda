import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as path from 'path';

require("dotenv").config();

export class QueuedLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create queue and topic
    const queue = new Queue(this, "Queue");
    const topic = new Topic(this, "sns-topic");
    topic.addSubscription(new SqsSubscription(queue));

    // Create bucket
    const bucket = new Bucket(this, `${process.env.PROJECT_NAME || ""}-bucket`);

    // create a role to allow the lambda to write to the bucket
    const lambdaBucketWriteRole = new Role(
      this,
      `${process.env.PROJECT_NAME || ""}-role`,
      {
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          {
            managedPolicyArn:
              "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          },
        ],
        inlinePolicies: {
          "receipt-bucket-policy": new PolicyDocument({
            statements: [
              new PolicyStatement({
                actions: ["s3:PutObject", "s3:PutObjectAcl"],
                effect: Effect.ALLOW,
                resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
              }),
            ],
          }),
        },
      }
    );
    // Create a lambda function to process the queue
    const lambda = new NodejsFunction(
      this,
      `${process.env.PROJECT_NAME || ""}-lambda`,
      {
        memorySize: 1024,
        timeout: Duration.seconds(5),
        runtime: Runtime.NODEJS_14_X,
        handler: "main",
        role: lambdaBucketWriteRole,
        entry: path.join(__dirname, `/../lambda/index.ts`),
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      }
    );

    // Add the queue as an event source to the lambda that will process messages one at a time
    lambda.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 1,
      })
    );
  }
}
