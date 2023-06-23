import json
import boto3
import time
from unittest import TestCase
from unittest.mock import patch, MagicMock
from stepFunctionInvoker import handler

class HandlerTestCase(TestCase):
    @patch('your_module.boto3.client')
    @patch('your_module.time.sleep')
    def test_handler_success(self, mock_sleep, mock_client):
        # Mock the necessary objects and methods
        mock_execution_arn = 'mock_execution_arn'
        mock_response = {
            'executionArn': mock_execution_arn,
            'status': 'SUCCEEDED',
            'output': json.dumps({
                'body': {
                    'id': 'test-id',
                    'lhs': 'Original content',
                    'rhs': 'Translated content'
                }
            })
        }
        mock_client.return_value.start_execution.return_value = mock_response
        mock_client.return_value.describe_execution.side_effect = [
            {'status': 'RUNNING'},
            {'status': 'SUCCEEDED', 'output': mock_response['output']}
        ]

        # Prepare the event payload
        event = {
            'arguments': {
                'input': {
                    'url': 'https://example.com',
                    'targetLanguage': 'fr',
                    'sourceLanguage': 'en',
                    'translationModel': 'custom'
                }
            }
        }

        # Invoke the handler function
        result = handler(event, None)

        # Assert the expected result
        expected_result = {
            'id': 'test-id',
            'lhs': 'Original content',
            'rhs': 'Translated content'
        }
        self.assertEqual(result, expected_result)

        # Assert that the necessary methods were called with the correct arguments
        mock_client.return_value.start_execution.assert_called_once_with(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps(event['arguments']['input'])
        )
        mock_client.return_value.describe_execution.assert_called_with(executionArn=mock_execution_arn)
        mock_sleep.assert_called_with(2)

    @patch('your_module.boto3.client')
    def test_handler_failure(self, mock_client):
        # Mock the necessary objects and methods
        mock_error_message = 'Mock error message'
        mock_client.return_value.start_execution.side_effect = Exception(mock_error_message)

        # Prepare the event payload
        event = {
            'arguments': {
                'input': {
                    'url': 'https://example.com',
                    'targetLanguage': 'fr',
                    'sourceLanguage': 'en',
                    'translationModel': 'custom'
                }
            }
        }

        # Invoke the handler function
        result = handler(event, None)

        # Assert the expected result
        expected_result = {
            'statusCode': 500,
            'body': mock_error_message
        }
        self.assertEqual(result, expected_result)

        # Assert that the necessary method was called with the correct arguments
        mock_client.return_value.start_execution.assert_called_once_with(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps(event['arguments']['input'])
        )

if __name__ == '__main__':
    unittest.main()
