import { render, fireEvent, waitFor, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getStepFunctionInvoker from './graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';
import { isValidURL, App, sendOriginalAndTranslated } from './App';


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

describe('App', () => {

  // clear the mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

 
  // test('should update state correctly', async () => {
  //   // Mock the API.graphql function
  //   API.graphql.mockResolvedValueOnce({
  //     data: {
  //       getStepFunctionInvoker: {
  //         lhs: '<p>Original post content</p>',
  //         rhs: '<p>Translated post content</p>',
  //         id: 'ratingBlogPostId',
  //       },
  //     },
  //   });

  //   // Set initial state
  //   const setLoading = jest.fn();
  //   const setBackendFinished = jest.fn();
  //   const setOriginalPost = jest.fn();
  //   const setTranslatedPost = jest.fn();
  //   const setRating = jest.fn();
  //   const setRatingSubmitted = jest.fn();
  //   const setRatingBlogPostId = jest.fn();

  //   // Call the function with test values
  //   await sendOriginalAndTranslated(
  //     'https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=el',
  //     { label: 'ENGLISH', value: 'en' },
  //     { label: 'amazonTranslate', value: 'amazonTranslate' },
  //     setLoading,
  //     setBackendFinished,
  //     setOriginalPost,
  //     setTranslatedPost,
  //     setRating,
  //     setRatingSubmitted,
  //     setRatingBlogPostId
  //   );

    // // Assertions
    // expect(API.graphql).toHaveBeenCalledTimes(1);
    // expect(API.graphql).toHaveBeenCalledWith(
    //   graphqlOperation(getStepFunctionInvoker, {
    //     input: {
    //       url: 'https://aws.amazon.com/blogs/aws/learn-how-to-streamline-and-secure-your-saas-applications-at-aws-applications-innovation-day/?trk=b34102c3-e32b-4e8b-8ff6-a5c374bbc252&sc_channel=el',
    //       sourceLanguage: { name: 'ENGLISH', code: 'en' },
    //       targetLanguage: { name: 'TURKISH', code: 'tr' },
    //       translationModel: { type: 'amazonTranslate' },
    //     },
    //   })
    // );

  //   expect(setLoading).toHaveBeenCalledWith(false);
  //   expect(setBackendFinished).toHaveBeenCalledWith(true);
  //   expect(setOriginalPost).toHaveBeenCalledWith('<p>Original post content</p>');
  //   expect(setTranslatedPost).toHaveBeenCalledWith('<p>Translated post content</p>');
  //   expect(setRating).toHaveBeenCalledWith(0);
  //   expect(setRatingSubmitted).toHaveBeenCalledWith(false);
  //   expect(setRatingBlogPostId).toHaveBeenCalledWith('ratingBlogPostId');
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
    fireEvent.click(screen.getByText('Translate!'));

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
  

    


