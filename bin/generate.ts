#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { QueuedLambdaStack } from '../lib/generate-stack';

require("dotenv").config();

const app = new cdk.App();
new QueuedLambdaStack(app, `${process.env.PROJECT_NAME || ""}-stack`, {
  env: {
    region: process.env.REGION || "eu-west-1",
  },
});
