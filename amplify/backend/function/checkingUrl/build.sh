#!/bin/bash
mkdir -p package

cp -r src/* package
cd package
npm install aws-sdk
zip -r checking_url.zip .
mv checking_url.zip  ../
cd ..
rm -r package
echo "Deployment package checking_url.zip has been created"