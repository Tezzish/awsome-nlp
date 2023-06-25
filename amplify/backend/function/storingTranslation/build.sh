#!/bin/bash
 mkdir -p package
 pip3 install --target package -r Requirements.txt
cp -r src/* package
cd package
zip -r storing_translation.zip .
mv storing_translation.zip ../
cd ..
rm -r package
\echo "Deployment package storing_translation.zip has been created"
