#arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow

import json
import boto3

client = boto3.client('stepfunctions')

def handler(event, context):
  
#   print('received event:')
#   print(event)
    response = client.start_execution(
    stateMachineArn='arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow',
    url = event['url']
  )
#   return {
#       'statusCode': 200,
#       'headers': {
#           'Access-Control-Allow-Headers': '*',
#           'Access-Control-Allow-Origin': '*',
#           'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
#       },
#       'body': json.dumps('Hello from your new Amplify Python lambda!'),
#       'stepFunction': response
#   }