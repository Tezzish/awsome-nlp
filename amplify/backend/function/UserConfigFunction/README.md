# UserConfigFunction

This directory contains the service that is responsible for interacting with the proper translation model, and sending the result back to the AppSync in proper format, given a URL input.

## Tech Specs
This function uses Java 17 and Gradle as a package manager. It is intended to run on using AWS Lambda.

### Directory Structure

* [Handler](src/main/java/com/awsomenlp/lambda/config/)
* [Objects](src/main/java/com/awsomenlp/lambda/config/objects)
* [Resolvers](src/main/java/com/awsomenlp/lambda/config/resolvers)
* [Models](src/main/java/com/awsomenlp/lambda/config/models)