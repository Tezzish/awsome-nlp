# Frontend Code

## Overview

This subdirectory contains the React front-end for our AWS Blogpost Translator.

## Contents

The directory structure is as follows:

- `graphql/` - Contains the GraphQL queries and mutations used in this application.
- `ui-components/` - Contains the App.js subcomponents used in this application.
- `App.css` - This is the CSS file for the React application.
- `App.js` - This is the main file where the React application is defined.
- `App.test.js` - This is the test file for the React application.
- `aws-exports.js` - This is the file that contains the configuration for the AWS services used in this application. Please note that the values on the file are placeholders and need to be replaced with your own values.
- `index.js` - This is the file that renders the React application.
- `logo.png` - This is the logo for the React application.
- `reportWebVitals.js` - This is the file that contains the configuration for the React application.
- `schema.graphql` - This is the file that contains the GraphQL schema for the React application.
- `setupTests.js` - This is the file that contains the configuration for the React application.
- `TUpoweredAWS.png` - This is the logo for the React application.

## Getting Started

Ensure you have the following prerequisites installed:

- Node.js and npm
- AWS Amplify CLI

Once you have these installed, you can initialize the application by running:

```bash
npm install
```

This will install all necessary dependencies for the application.

## Running the Application
To start the application, run:

```bash
npm start
```

You can now view the application in your web browser at localhost:3000.

To build the application for production, run:

```bash
npm run build
```

This will build the application for production in the `build/` folder.

## Development Dependencies
Our project uses several tools to improve the development process and ensure code quality. Here are some key development dependencies (can also be found in `./package.json`):

### Babel

Babel is a JavaScript compiler that allows us to use next generation JavaScript, today. It converts ECMAScript 2015+ code into a backwards compatible version for current and older browsers or environments.

We are currently using the following Babel presets:

- `@babel/core` and `@babel/preset-env` for general JavaScript transpilation.
- `@babel/preset-react` for transpiling JSX.

### Jest

Jest is our chosen testing framework. It's an open-source testing framework built for JavaScript, and is particularly well suited for testing React applications.

- We use `jest` along with `@testing-library/react` for testing our React components.
- `jest-watch-typeahead` provides a watch menu for Jest, making it easier to select the tests you want to run.
- `babel-jest` is used to make use of Babel for transforming JavaScript code within Jest tests.
- `@testing-library/jest-dom` provides custom jest matchers for better assertions in DOM testing.

To run the test suite, you can use the command `npm test`.

```bash
npm test
```




