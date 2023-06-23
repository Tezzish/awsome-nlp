import { render, fireEvent, waitFor, screen} from '@testing-library/react';
import React from 'react';
import {App, sendOriginalAndTranslated} from './App';
import '@testing-library/jest-dom';
import '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getStepFunctionInvoker from './graphql/queries';
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

  // mock the getStepFunctionInvoker query which receives url: url, sourceLanguage: { name: "ENGLISH", code: "en" }, targetLanguage: { name: targetLanguage.label, code: targetLanguage.value },translationModel: { type: translationModel.label } to return a mock response
   test('clicking button with valid data given', async () => {

    const App = new App();
    const mockStepFunctionInvoker = jest.spyOn(App, 'sendOriginalAndTranslated').mockImplementation(() => Promise.resolve({ 
      data: { getStepFunctionInvoker: 
        { 
        lhs: "original", 
        rhs: "translated", 
        id: "id" 
        } 
      } 
    })
    );

    // Clicking the button without any data should call alert with 'Incorrect Link' error
    fireEvent.click(screen.getByText('Translate!'));
    await waitFor(() => screen.getByText('Incorrect Link'));


    
  });
});
  

    


