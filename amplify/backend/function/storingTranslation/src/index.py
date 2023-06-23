import boto3
import json
import bs4 as bs
from copy import deepcopy

# Get the service resource.
lambda_connection = boto3.client('lambda')
# S3 connection
s3_connection = boto3.client('s3')
# DynamoDB connection
dynamodb_connection = boto3.resource('dynamodb')
# DynamoDB table name
table = dynamodb_connection.Table('translations-aws-blog-posts')

translate = boto3.client('translate')


def handler(event, context):
    # bucket that will be used to store the file
    BUCKET = 'translations-aws-blog-posts-bucket'
    # get url from event
    URL = event['url']
    # create file name from url (this is our key)

    # if url ends with a /, remove it
    if URL[-1] == '/':
        URL = URL[:-1]

    FILE_NAME = URL.split('/')[-1]

    # first check if the entry exists in the db
    response = table.get_item(Key={'URL': FILE_NAME})
    # pass the url to the lhs lambda to get back html
    try:
        if 'Item' not in response:
            lhs_title, lhs_authors, lhs_content, lhs_html = get_html(
                URL, event['sourceLanguage'], event['targetLanguage'],
                event['translationModel'], 'getBlogContent-storagedev'
            )

    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with LHS lambda',
            'exception': e,
        }
    # store the html in s3
    try:
        if 'Item' not in response:
            s3_connection.put_object(Bucket=BUCKET, Key=FILE_NAME + '-lhs'+'.html', Body=lhs_html.encode())
        rhs_name = (
            FILE_NAME + '[translated]-' + event['targetLanguage']['code'] + '-' +
            event['translationModel']['type'] + '-rhs' + '.html'
        )
        rhs_title, rhs_authors, rhs_content = get_translated(
            URL, event['sourceLanguage'], event['targetLanguage'], event['translationModel']
        )

        rhs_html = replace_text_with_translation(lhs_content, rhs_content)['file']
        s3_connection.put_object(Bucket=BUCKET, Key=rhs_name, Body=rhs_html.encode())
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with S3 or RHS lambda',
            'exception': e,
        }

    # update the db

    # # if the file doesn't exist, add it to the db

    # # the db has the following fields:
    # # URL: the url of the file
    # # average_rating: the average rating of the file
    # # number_of_ratings: the number of ratings the file has
    # # ratings, a separate table that contains the ratings for the file
    if 'Item' not in response:
        table.put_item(
            Item={
                'URL': FILE_NAME,
                'authors': rhs_authors,
                'title': lhs_title,
                'language': event['sourceLanguage']['code'],
                'S3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-lhs.html'
            }
        )
    table.put_item(
        Item={
            'URL': FILE_NAME + '[translated]-' + event['targetLanguage']['code'] + '-' + event['translationModel']['type'],
            'originalBlog': FILE_NAME,
            'average_rating': 0,
            'number_of_ratings': 0,
            'authors': rhs_authors,
            'title': rhs_title,
            'LHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-lhs.html',
            'RHS_s3_loc': (
                'https://s3.amazonaws.com/' + BUCKET + '/' +
                FILE_NAME + '[translated]-' + event['targetLanguage']['code'] +
                '-' + event['translationModel']['type'] + '-rhs.html'
            )
        }
    )
    return {
        'statusCode': 200,
        'body': 'great success',
        'url': URL,
        'targetLanguage': event['targetLanguage'],
        'translationModel': event['translationModel']
    }


# function to get html from url by calling a lambda
def get_html(url, sourceLanguage, targetLanguage, translationModel, lambda_name):
    try:
        # sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName=lambda_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(
                {
                    "url":  url,
                    "targetLanguage": {
                        "name": targetLanguage['name'],
                        "code": targetLanguage['code']
                    },
                    "sourceLanguage": {
                        "name": sourceLanguage['name'],
                        "code": sourceLanguage['code']
                    },
                    "translationModel": {
                        "type": translationModel['type']
                    }
                })
        )
        # get the html from the response
        response_json = json.load(response['Payload'])

    except Exception as e:
        raise e
    return response_json['title'], response_json['author'], response_json, response_json['file']


def get_translated(url, sourceLanguage, targetLanguage, translationModel):
    try:
        # sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName="UserConfigFunction-storagedev",
            InvocationType='RequestResponse',
            Payload=json.dumps(
                {
                    "arguments": {
                        "input": {
                            "url": url,
                            "targetLanguage": {
                                "name": targetLanguage['name'],
                                "code": targetLanguage['code']
                            },
                            "sourceLanguage": {
                                "name": sourceLanguage['name'],
                                "code": sourceLanguage['code']
                            },
                            "translationModel": {
                                "type": translationModel['type']
                            }
                        }
                    },
                }
            )
        )
        # get the html from the response
        response_json = json.load(response['Payload'])

    except Exception as e:
        raise e
    return response_json['title'], response_json['authors'], response_json


# Given the translations and lhs_html
# reconstruct the rhs_html by replacing the lhs_html
# text elements with the translated text elements
def replace_text_with_translation(lhs_content, rhs_content):

    # Create a copy of lhs to avoid modifying the original data
    rhs = deepcopy(lhs_content)

    # Parse the HTML content
    soup = bs.BeautifulSoup(rhs['file'], 'html.parser')

    # Get the body element
    translated_content = rhs_content.get('content', [])

    # Get the content section
    content_section = soup.find('div', class_='aws-blog-content')
    if content_section:
        # Iterate over all elements with an id that are not code elements
        for element in content_section.select('[id]:not(code)'):
            id_num = element['id'].split('-')[1]  # get the number part of the id
            # Check if we have the corresponding translated content
            if int(id_num) - 1 < len(translated_content):
                # Replace the content
                new_content = bs.NavigableString(translated_content[int(id_num) - 1])
                element.replace_with(new_content)

    # Update the file in rhs
    rhs['file'] = str(soup)

    return rhs

