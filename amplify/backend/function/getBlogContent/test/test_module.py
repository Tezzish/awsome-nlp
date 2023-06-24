import unittest
from unittest.mock import patch, MagicMock
import sys
import os


# Navigate to the parent directory
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Add the 'src' directory to sys.path
src_dir = os.path.join(parent_dir, 'src')
sys.path.append(src_dir)
import app

class TestHandler(unittest.TestCase):

    @patch('app.urlopen')
    def test_handler(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.status = 200  # mock a successful response
        mock_response.read.return_value = '<div class="aws-blog-content">Content</div>'  # Mock the HTML content
        mock_urlopen.return_value = mock_response
        print(app)
        event = {'url': 'https://aws.amazon.com/blogs/training-and-certification/5-tips-for-a-successful-online-proctored-aws-certification-exam/'}
        context = {}

        result = app.handler(event, context)

        # assertions will depend on the expected output of your function
        self.assertEqual(result['statusCode'], 200)


class TestGetTitle(unittest.TestCase):

    @patch('app.urlopen')
    def test_get_title(self, mock_urlopen):
        # mock the response from urlopen
        mock_response = MagicMock()
        mock_response.read.return_value = b'<h1 class="lb-h2 blog-post-title" property="name headline">Accelerate time to business insights with the Amazon SageMaker Data Wrangler direct connection to Snowflake</h1>'
        mock_urlopen.return_value = mock_response
        print(mock_response)

        title = app.getTitle('https://aws.amazon.com/blogs/machine-learning/accelerate-time-to-business-insights-with-the-amazon-sagemaker-data-wrangler-direct-connection-to-snowflake/')

        self.assertEqual(title, 'Accelerate time to business insights with the Amazon SageMaker Data Wrangler direct connection to Snowflake')


class TestGetAuthorNames(unittest.TestCase):

    @patch('app.urlopen')
    def test_get_author_names(self, mock_urlopen):
        # mock the response from urlopen
        mock_response = MagicMock()
        mock_response.read.return_value = b'<span property="author" typeof="Person"><span property="name">Tingyi Li</span></span> " and " <span property="author" typeof="Person"><span property="name">Demir Catovic</span></span>'
        mock_urlopen.return_value = mock_response

        author_names = app.getAuthorNames('https://aws.amazon.com/blogs/machine-learning/deploy-a-serverless-ml-inference-endpoint-of-large-language-models-using-fastapi-aws-lambda-and-aws-cdk/')

        self.assertEqual(author_names, ['Tingyi Li', 'Demir Catovic'])


class TestParser(unittest.TestCase):

    @patch('app.urlopen')
    def test_parser(self, mock_urlopen):
        # mock the response from urlopen
        mock_response = MagicMock()
        mock_response.read.return_value = b'<div class="aws-blog-content">Content</div>'
        mock_urlopen.return_value = mock_response

        content = app.parser('https://aws.amazon.com/blogs/training-and-certification/5-tips-for-a-successful-online-proctored-aws-certification-exam/')
        print(content)
        self.assertEqual(content, '<div class="aws-blog-content">\n Content\n</div>\n')


if __name__ == '__main__':
    unittest.main()