#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkWorkshopN0310713Stack } from '../lib/cdk-workshop-n0310713-stack';

const app = new cdk.App();
new CdkWorkshopN0310713Stack(app, 'CdkWorkshopN0310713Stack');
