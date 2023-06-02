import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});

// tests if the valid url method works
test('check if valid url is valid', () => {
  expect(isValidURL("https://aws.amazon.com/blogs/")).toBe(true);
}
);