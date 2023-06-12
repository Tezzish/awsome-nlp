import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import App from './App';
import '@testing-library/jest-dom';


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
});
