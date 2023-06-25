#!/bin/bash
 mkdir -p package
 pip3 install --target package -r Requirements.txt
cp -r src/* package
cd package
zip -r get_blog_content.zip .
mv get_blog_content.zip ../
cd ..
rm -r package
\echo "Deployment package get_blog_content.zip has been created"
