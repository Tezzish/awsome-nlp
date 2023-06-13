import json
import boto3
#import uuid

client = boto3.client('stepfunctions')

# function to invoke step function state machine with url as input
def handler(event, context):

    #stateMachineId = str(uuid.uuid1())

    response = client.start_execution(
    stateMachineArn='arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow',
    #name = stateMachineId,
    input = json.dumps({'url' : event['url']})
  )
