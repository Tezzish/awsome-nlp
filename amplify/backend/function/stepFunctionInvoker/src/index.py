import json
import boto3


client = boto3.client('stepfunctions')

# function to invoke step function state machine with url as input
def handler(event, context):

    # invoke step function state machine with the correct ARN
    response = client.start_execution(
    stateMachineArn='arn:aws:states:eu-west-1:755811905719:stateMachine:applicationWorkflow',
    input = json.dumps({
        # url of the blog post
        'url' : event['url'],
        # target language for translation
        'targetLanguage' : event['targetLanguage'],
        # source language for translation
        'sourceLanguage' : event['sourceLanguage'],
        # translation model to use (AWS Translate or Custom)
        'translationModel': event['translationModel']
        })
  )
    try:
        # ensures the correct response is returned
        return json.dumps(response, indent=4, sort_keys=True, default=str)
    except Exception as e:
        print(e)
        return
    