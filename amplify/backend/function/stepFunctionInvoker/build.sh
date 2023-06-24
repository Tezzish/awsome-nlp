#!/bin/bash
mkdir -p package
pip3 install --target package -r Requirements.txt
cp -r src/* package
cd package
zip -r step_function_invoker.zip .
mv step_function_invoker.zip ../
cd ..
rm -r package
\echo "Deployment package step_function_invoker.zip has been created"
