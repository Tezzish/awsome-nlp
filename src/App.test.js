import { render, screen } from '@testing-library/react';
import App from './App';

//tests for the URL input
test('URL Input', () => {
  render(<App />);
  const app = screen.getByPlaceholderText('AWS Blogpost (URL)');
  expect(app).toBeInTheDocument();
});

//tests for the language input
test('Language Input', () => {
  render(<App />);
  const app = screen.getByPlaceholderText('Target Language');
  expect(app).toBeInTheDocument();
});

//tests for the translate button
test('Translate Button', () => {
  render(<App />);
  const app = screen.getByText('Translate!');
  //checks if it's in the document
  expect(app).toBeInTheDocument();
  //checks if it's enabled
  expect(app).toBeEnabled();
  //checks if it's a button
  expect(app).toBeInstanceOf(HTMLButtonElement);
});

