import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { isValidURL } from './App';



test('checks if frontend can handle URL input change', () => {
  const { getByPlaceholderText } = render(<App />);
  const urlInput = getByPlaceholderText('AWS Blogpost (URL)');

  fireEvent.change(urlInput, { target: { value: 'https://aws.amazon.com/blogs/big-data/peloton-embraces-amazon-redshift-to-unlock-the-power-of-data-during-changing-times/?trk=8b240572-0a9d-4795-b939-48b67bb5f511&sc_channel=el' } });

  expect(urlInput.value).toBe('https://aws.amazon.com/blogs/big-data/peloton-embraces-amazon-redshift-to-unlock-the-power-of-data-during-changing-times/?trk=8b240572-0a9d-4795-b939-48b67bb5f511&sc_channel=el');
});


test('checks if the translation button works correctly on click', () => {
  const { getByText } = render(<App />);
  const translateButton = getByText('Translate!');

  fireEvent.click(translateButton);
});


// // tests the blog post url's validity
// test('test for the validity of the blog post url', () => {
//   expect(isValidURL("https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el")).toBe(true);
//   }
// );


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

//test for checking the url input - blog post url
test('URL Input', () => {
  expect(isValidURL('https://aws.amazon.com/blogs/aws/new-for-aws-lambda-container-image-support/')).toBe(true);
});
https://en.wikipedia.org/wiki/HTML

// //test for checking the url input - not a blog post url
// test('URL Input1', () => {
//   expect(isValidURL('https://en.wikipedia.org/wiki/HTML')).toBe(false);
// });


