#!/usr/bin/env node
import "source-map-support/register";

import * as cdk from "aws-cdk-lib";

import { ApiGatewayLambdaStack } from "../lib/generate-stack";

require("dotenv").config();

const app = new cdk.App();
new ApiGatewayLambdaStack(app);
