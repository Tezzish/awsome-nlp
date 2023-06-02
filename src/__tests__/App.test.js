import { render, screen, cleanup } from '@testing-library/react';
import App from '../App'; // Import the isValidURL function from App
import { isValidURL } from '../App';

// test('renders learn react link', () => {
//   render(<App />);
//   // const linkElement = screen.getByText(/learn react/i);
//   // expect(linkElement).toBeInTheDocument();
// });

// tests if the valid url method works
test('test for the validity of the blog post url', () => {
  expect(isValidURL("https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el")).toBe(true);
  }
);




