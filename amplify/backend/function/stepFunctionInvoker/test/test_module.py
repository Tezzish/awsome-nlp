import json
from unittest import TestCase, mock
import os
import sys

# Navigate to the parent directory
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Add the 'src' directory to sys.path
src_dir = os.path.join(parent_dir, 'src')
sys.path.append(src_dir)

from index import handler


class TestLambdaHandler(TestCase):
    @classmethod
    def setUpClass(cls):
        cls.event = {
            'arguments': {
                'input': {
                    'url': 'https://example.com',
                    'targetLanguage': 'es',
                    'sourceLanguage': 'en',
                    'translationModel': 'custom'
                }
            }
        }
    
    @mock.patch('index.client')
    def test_handler_successful_execution(self, mock_client):
        # Mocking start_execution response
        execution_arn = 'arn:aws:states:eu-west-1:184473660456:execution:applicationWorkflow:12345'
        mock_client.start_execution.return_value = {'executionArn': execution_arn}
        
        # Mocking describe_execution response during SUCCEEDED status
        mock_client.describe_execution.return_value = {
            'status': 'SUCCEEDED',
            'output': json.dumps({
                'body': {
                    'id': '123',
                    'lhs': 'left',
                    'rhs': 'right'
                }
            })
        }
        
        expected_result = {
            'id': '123',
            'lhs': 'left',
            'rhs': 'right'
        }
        
        # Call the handler function
        result = handler(self.event, None)
        
        # Assertions
        mock_client.start_execution.assert_called_once_with(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps({
                'url': self.event['arguments']['input']['url'],
                'targetLanguage': self.event['arguments']['input']['targetLanguage'],
                'sourceLanguage': self.event['arguments']['input']['sourceLanguage'],
                'translationModel': self.event['arguments']['input']['translationModel']
            })
        )
        mock_client.describe_execution.assert_called_once_with(executionArn=execution_arn)
        self.assertEqual(result, expected_result)
    
    @mock.patch('index.client')
    def test_handler_failed_execution(self, mock_client):
        # Mocking start_execution response
        execution_arn = 'arn:aws:states:eu-west-1:184473660456:execution:applicationWorkflow:12345'
        mock_client.start_execution.return_value = {'executionArn': execution_arn}
        
        # Mocking describe_execution response during FAILED status
        mock_client.describe_execution.return_value = {'status': 'FAILED'}
        
        # Call the handler function
        result = handler(self.event, None)
        
        # Assertions
        mock_client.start_execution.assert_called_once_with(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps({
                'url': self.event['arguments']['input']['url'],
                'targetLanguage': self.event['arguments']['input']['targetLanguage'],
                'sourceLanguage': self.event['arguments']['input']['sourceLanguage'],
                'translationModel': self.event['arguments']['input']['translationModel']
            })
        )
        mock_client.describe_execution.assert_called_once_with(executionArn=execution_arn)
        self.assertEqual(result, {'statusCode': 500, 'body': "'body'"})
    
    @mock.patch('index.client')
    def test_handler_client_error(self, mock_client):
        # Mocking start_execution response without raising an error
        mock_client.start_execution.return_value = {'executionArn': 'mock-execution-arn'}

        # Mocking describe_execution response to indicate execution is still in progress
        mock_client.describe_execution.side_effect = [
            {'status': 'RUNNING'},  # First call returns running status
            {'status': 'SUCCEEDED'}  # Second call returns succeeded status
        ]

        # Call the handler function
        result = handler(self.event, None)

        # Assertions
        mock_client.start_execution.assert_called_once_with(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps({
                'url': self.event['arguments']['input']['url'],
                'targetLanguage': self.event['arguments']['input']['targetLanguage'],
                'sourceLanguage': self.event['arguments']['input']['sourceLanguage'],
                'translationModel': self.event['arguments']['input']['translationModel']
            })
        )
        mock_client.describe_execution.assert_called_with(
            executionArn='mock-execution-arn'
        )
        self.assertEqual(result, {'statusCode': 500, 'body': "'body'"})
