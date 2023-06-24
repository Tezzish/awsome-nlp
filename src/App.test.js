import { render, fireEvent, waitFor, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getStepFunctionInvoker from './graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';
import App from './App';
import {isValidURL} from './App';

import LanguageSelect from './components/LanguageSelect';

// Mocks for AWS Amplify API and graphqlOperation
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
  API: {
    graphql: jest.fn(),
  },
  graphqlOperation: jest.fn(),
}));



// test the isValidURL function
describe('isValidURL', () => {
  test('returns true for valid URLs', () => {
    expect(isValidURL('https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=ele')).toBe(true);
  });
});

// test the isValidURL function
describe('isValidURL', () => {
  test('returns false for invalid URLs', () => {
    expect(isValidURL('https://en.wikipedia.org/wiki/Turkey')).toBe(false);
  });
});

describe('App', () => {

  // clear the mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });   

  // test('should call sendOriginalAndTranslated and its internal functions', async () => {
  //   // Mock the required dependencies and set initial values
  //   const url = 'https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=el';
  //   const sourceLanguage = { label: 'ENGLISH', value: 'en' };
  //   const targetLanguage = { label: 'TURKISH', value: 'tr' };
  //   const translationModel = { label: 'amazonTranslate', value: 'amazonTranslate' };

  //   // Mock the internal functions
  //   const setRatingMock = jest.fn();
  //   const setRatingSubmittedMock = jest.fn();
  //   const setOriginalPostMock = jest.fn();
  //   const setTranslatedPostMock = jest.fn();
  //   const setIsLoadingMock = jest.fn();
  //   const setBackendFinishedMock = jest.fn();
  //   const setRatingBlogPostIdMock = jest.fn();

  //   // Mock the API.graphql function
  //   const mockedGraphql = jest.fn().mockResolvedValue({
  //     data: {
  //       getStepFunctionInvoker: {
  //         lhs: '<p>Original post content</p>',
  //         rhs: '<p>Translated post content</p>',
  //         id: 'ratingBlogPostId',
  //       },
  //     },
  //   });

  //   // Mock the API object
  //   const mockedAPI = {
  //     graphql: mockedGraphql,
  //   };

  //   // Render the App component
  //   render(<App />);

  //   // Mock the useState hook functions
  //   jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
  //     if (initialValue === 0) return [0, setRatingMock];
  //     if (initialValue === false) return [false, setRatingSubmittedMock];
  //     if (initialValue === '') return ['', setOriginalPostMock];
  //     if (initialValue === '') return ['', setTranslatedPostMock];
  //     if (initialValue === true) return [true, setIsLoadingMock];
  //     if (initialValue === false) return [false, setBackendFinishedMock];
  //     if (initialValue === '') return ['', setRatingBlogPostIdMock];
  //     return jest.requireActual('react').useState(initialValue);
  //   });

  //   // Call the function
  //   await sendOriginalAndTranslated(url, sourceLanguage, targetLanguage, translationModel);

  //   // Assertions
  //   expect(console.log).toHaveBeenCalledWith('sending config to backend');
  //   expect(console.log).toHaveBeenCalledWith('target language: ' + targetLanguage);
  //   expect(console.log).toHaveBeenCalledWith(targetLanguage);
  //   expect(console.log).toHaveBeenCalledWith('translation model: ' + translationModel);
  //   expect(console.log).toHaveBeenCalledWith(translationModel);
  //   expect(mockedGraphql).toHaveBeenCalledTimes(1);
  //   expect(mockedGraphql).toHaveBeenCalledWith({
  //     input: {
  //       url: url,
  //       sourceLanguage: { name: 'ENGLISH', code: 'en' },
  //       targetLanguage: { name: targetLanguage.label, code: targetLanguage.value },
  //       translationModel: { type: translationModel.label },
  //     },
  //   });
  //   expect(console.log).toHaveBeenCalledWith('send successful');
  //   expect(console.log).toHaveBeenCalledWith(JSON.stringify({ data: { getStepFunctionInvoker: { lhs: '<p>Original post content</p>', rhs: '<p>Translated post content</p>', id: 'ratingBlogPostId' } } }));
  //   expect(setRatingMock).toHaveBeenCalledWith(0);
  //   expect(setRatingSubmittedMock).toHaveBeenCalledWith(false);
  //   expect(setOriginalPostMock).toHaveBeenCalledWith('<p>Original post content</p>');
  //   expect(setTranslatedPostMock).toHaveBeenCalledWith('<p>Translated post content</p>');
  //   expect(setIsLoadingMock).toHaveBeenCalledWith(false);
  //   expect(setBackendFinishedMock).toHaveBeenCalledWith(true);
  //   expect(setRatingBlogPostIdMock).toHaveBeenCalledWith('ratingBlogPostId');
  //   expect(console.error).not.toHaveBeenCalled();
  //   expect(setIsLoadingMock).toHaveBeenCalledWith(false);
  // });

  test('renders the app and translates the post', async () => {
    const mockedAPI = API;

    // Mock the API.graphql function
    mockedAPI.graphql.mockResolvedValue({
      data: {
        getStepFunctionInvoker: {
          lhs: '<p>Original post content</p>',
          rhs: '<p>Translated post content</p>',
          id: 'ratingBlogPostId',
        },
      },
    });

    render(<App />);

    // Simulate user input and button click
    const inputElement = screen.getByRole('textbox', { id: 'url-input' });
    fireEvent.change(inputElement, {
    target: { value: 'https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=ele' },
  });
      // Simulate change event on language select
    const languageSelect = screen.getByRole('textbox', { id: 'language-select' });
    fireEvent.change(languageSelect, {
      target: { value: { label: 'TURKISH', value: 'tr' } },
    });

    // Simulate change event on model select
    const modelSelect = screen.getByRole('textbox', { id: 'model-select' });
    fireEvent.change(modelSelect, {
      target: { value: { label: 'amazonTranslate', value: 'amazonTranslate' } },
    });

    // Set the buttons onClick function to a mock function
    const button = screen.getByText('Translate!');
  
  //   fireEvent.click(screen.getByText('Translate!'));

    // Wait for the API call to finish
    await waitFor(() => expect(mockedAPI.graphql).toHaveBeenCalledTimes(2));

    // get the html element with id leftSide and rightSide
    const leftSide = await waitFor(() => document.getElementById('leftSide'));
    const rightSide = await waitFor(() => document.getElementById('rightSide'));

    // Assertions
    expect(mockedAPI.graphql).toHaveBeenCalledTimes(2);
    expect(mockedAPI.graphql).toHaveBeenCalledWith(
      graphqlOperation(getStepFunctionInvoker, {
        input: {
          url: 'https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=el',
          sourceLanguage: { name: 'ENGLISH', code: 'en' },
          targetLanguage: { name: 'TURKISH', code: 'tr' },
          translationModel: { type: 'amazonTranslate' },
        },
      })
    );

    expect(leftSide).toBeInTheDocument();
    expect(rightSide).toBeInTheDocument();
    // expect right side to have Translated post content
    expect(rightSide.innerHTML).toBe('<p>Translated post content</p>');
    // expect left side to have Original post content
    expect(leftSide.innerHTML).toBe('<p>Original post content</p>');
    
  });



  test('renders App component', async () => {
    render(<App />);

    // Ensure that the logo is rendered
    expect(screen.getByAltText('logo')).toBeInTheDocument()

    // Ensure that the form elements are rendered
    expect(screen.getByText('Translate!')).toBeInTheDocument();
  });

  test('handleButtonClick for invalid URL', async () => {
    render(<App />);

    // Clicking the button without any data should call alert with 'Incorrect Link' error
    fireEvent.click(screen.getByText('Translate!'));
    await waitFor(() => screen.getByText('Incorrect Link'));
  });

  test('clicking button with no data given', async () => {
    render(<App />);

    // Clicking the button without any data should call alert with 'Incorrect Link' error
    fireEvent.click(screen.getByText('Translate!'));
    await waitFor(() => screen.getByText('Incorrect Link'));
  });

 
});
  

    


