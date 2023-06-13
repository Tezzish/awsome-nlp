import json
import boto3


client = boto3.client('stepfunctions')

# function to invoke step function state machine with url as input
def handler(event, context):

    response = client.start_execution(
    stateMachineArn='arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow',
    input = json.dumps({'url' : event['url']})
  )
    try:
        return json.dumps(response, indent=4, sort_keys=True, default=str)
    except Exception as e:
        print(e)
        return
    