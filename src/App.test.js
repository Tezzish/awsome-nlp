import { render, fireEvent, waitFor, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import '@testing-library/react';
import App from './App';
import { isValidURL } from './App';

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
  test('returns false for invalid URLs', () => {
    expect(isValidURL('https://en.wikipedia.org/wiki/Turkey')).toBe(false);
  });
});

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

 
});
  

    


