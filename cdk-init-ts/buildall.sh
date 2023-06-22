#!/bin/bash
cd ../amplify/backend/function
cd getBlogContent
./build.sh
cd ../stepFunctionInvoker
./build.sh
cd ../storingTranslation
./build.sh
