import json
import boto3
import time

client = boto3.client('stepfunctions')


# Function to invoke Step Function state machine with URL as input
def handler(event, context):
    try:
        # Invoke Step Function state machine with the correct ARN
        response = client.start_execution(
            stateMachineArn='arn:aws:states:eu-west-1:184473660456:stateMachine:applicationWorkflow',
            input=json.dumps({
                'url': event['arguments']['input']['url'],
                'targetLanguage': event['arguments']['input']['targetLanguage'],
                'sourceLanguage': event['arguments']['input']['sourceLanguage'],
                # custom model vs Amazon Translate
                'translationModel': event['arguments']['input']['translationModel']
            })
        )

        execution_arn = response['executionArn']

        # Polling loop to check execution status
        while True:
            execution_details = client.describe_execution(
                executionArn=execution_arn
            )

            status = execution_details['status']

            if status in ['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'ABORTED']:
                # Execution completed
                execution_output = json.loads(execution_details.get('output', '{}'))
                return {
                    'id':  execution_output['body']['id'],
                    'lhs': execution_output['body']['lhs'],
                    'rhs': execution_output['body']['rhs']
                }

            # Wait for a few seconds before the next poll
            time.sleep(2)

    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
