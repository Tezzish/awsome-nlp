import json
import boto3
import time

client = boto3.client('stepfunctions')

# Function to invoke Step Function state machine with URL as input
def handler(event, context):
    try:
        # Invoke Step Function state machine with the correct ARN
        response = client.start_execution(
            stateMachineArn='arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow',
            input=json.dumps({
                'url': event['arguments']['url'],
                'targetLanguage': event['arguments']['targetLanguage'],
                'sourceLanguage': event['arguments']['sourceLanguage'],
                # custom model vs Amazon Translate
                'translationModel': event['arguments']['translationModel']
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
                    'statusCode': 200,
                    'body': {
                        #'executionOutput': execution_output
                        'lhs': execution_output['body']['lhs'],
                        'rhs': execution_output['body']['rhs']
                    }
                }

            # Wait for a few seconds before the next poll
            time.sleep(2)

    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }


