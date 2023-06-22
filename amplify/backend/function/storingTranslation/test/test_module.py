from unittest.mock import patch, MagicMock
import pytest
import json

with patch('boto3.client'), patch('boto3.resource'):
    from amplify.backend.function.storingTranslation.src import index


def test_handler_exception_from_s3_or_rhs_lambda():
    # We mock the get_item method to return a response that indicates the item does not exist
    index.table.get_item = MagicMock(return_value={'Item': None})

    # We mock the get_html and get_translated methods to return dummy data
    index.get_html = MagicMock(return_value=("Dummy title", "Dummy authors", "Dummy content", "Dummy html"))
    index.get_translated = MagicMock(return_value=("Dummy title", "Dummy authors", "Dummy content"))

    # We mock the put_object method of the s3_connection to raise an exception
    index.s3_connection.put_object = MagicMock(side_effect=Exception())

    # We prepare a test event and context
    event = {
        'url': 'https://example.com',
        'sourceLanguage': {'name': 'English', 'code': 'en'},
        'targetLanguage': {'name': 'Turkish', 'code': 'tr'},
        'translationModel': {'type': 'general'}
    }
    context = {}

    # We call the handler with the test event and context
    response = index.handler(event, context)

    # We assert that the response has a 500 status code and the expected body
    assert response['statusCode'] == 500
    assert response['body'] == 'problem with S3 or RHS lambda'


def test_handler_exception_from_s3_connection():
    # We mock the put_object method of the s3_connection to raise an exception
    index.s3_connection.put_object = MagicMock(side_effect=Exception())

    # Prepare a test event and context
    event = {
        'url': 'https://example.com',
        'sourceLanguage': {'name': 'English', 'code': 'en'},
        'targetLanguage': {'name': 'Turkish', 'code': 'tr'},
        'translationModel': {'type': 'general'}
    }
    context = {}

    # Call the handler with the test event and context
    response = index.handler(event, context)

    # Assert that the response has a 500 status code and the expected body
    assert response['statusCode'] == 500
    assert response['body'] == 'problem with S3 or RHS lambda'
