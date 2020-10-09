import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import { ManagedPolicy } from '@aws-cdk/aws-iam';
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import { defaultsDeep } from 'lodash';

export class CdkWorkshopN0310713Stack extends cdk.Stack {
  // Variable to hold Lambda role
  lambdaIAM:iam.Role;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    let properties = defaultsDeep({}, props, {
      tags: {
        "name": "cdk-app",
      }
    });
    super(scope, id, properties);

    this.lambdaIAM = this.getLambdaHandlerIamRole(this);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_12_X, // execution environment
      code: lambda.Code.asset('lambda'), // code loaded from the "lambda directory"
      handler: 'hello.handler', // file is "hello", function is "handler"
      role: this.lambdaIAM // LM Compliant Lambda Role
    });

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
      cloudWatchRole: false,
      proxy: false,
      endpointTypes: [apigw.EndpointType.REGIONAL]
    });

    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: [
        "execute-api:Invoke",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
      ],
      resources: [api.arnForExecuteApi()]
    })

    const proxy = api.root.addProxy({
      defaultIntegration: new apigw.LambdaIntegration(hello)
    });
  }

    /**
     * Method that returns an IAM role with some managed policies on it for lambdas to comply with LM standards
     */
    getLambdaHandlerIamRole(scope:any){
      return new iam.Role(scope, 'cdkWorkshopLambdaHanderRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
        ],
      })
    }  
}
