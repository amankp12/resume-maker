import * as path from 'path';
import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---------- Backend ----------

    // 1. DynamoDB table. We store one item: the resume (key "resume").
    const table = new dynamodb.Table(this, 'ResumeTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // pay only per request
      removalPolicy: cdk.RemovalPolicy.DESTROY, // "cdk destroy" deletes the data too
    });

    // 2. The Lambda function that reads and writes the resume.
    const apiFunction = new nodejs.NodejsFunction(this, 'ResumeApiFunction', {
      entry: path.join(__dirname, '../lambda/resume.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: table.tableName,
        // Secret needed to save changes. Comes from the WRITE_KEY environment
        // variable on the machine that runs "cdk deploy" (GitHub Actions secret).
        WRITE_KEY: process.env.WRITE_KEY ?? '',
      },
    });
    table.grantReadWriteData(apiFunction); // allow the function to use the table

    // 3. An HTTP API (API Gateway) in front of the function.
    const httpApi = new apigwv2.HttpApi(this, 'ResumeHttpApi');
    httpApi.addRoutes({
      path: '/api/resume',
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.PUT],
      integration: new HttpLambdaIntegration('ResumeIntegration', apiFunction),
    });

    // ---------- Website ----------

    // 4. A private S3 bucket that stores the built website files.
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // lets "cdk destroy" delete it
      autoDeleteObjects: true, // empties the bucket before deleting it
    });

    // 5. CloudFront in front of both the website and the API.
    //    /api/*  -> API Gateway      everything else -> S3 bucket
    //    Because both live on one address, the browser needs no extra settings.
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(
            `${httpApi.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`,
          ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    // 6. Upload frontend/dist into the bucket on every deploy,
    //    then clear CloudFront's cache so visitors see the new version.
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset('../frontend/dist')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 7. Print the website address at the end of the deploy.
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
