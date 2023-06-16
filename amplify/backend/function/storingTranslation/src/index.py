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

def lambda_handler(event, context):
    # bucket that will be used to store the file
    BUCKET = 'english-turkish-translations-2'
    #get url from event
    URL = event['url']
    #create file name from url (this is our key)
    FILE_NAME = URL.split('/')[-1]
    #pass the url to the lhs lambda to get back html
    try:
        lhs_html = get_html(URL, 'getBlogContent-staging')
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with LHS lambda',
        }
    # store the html in s3
    try:
        s3_connection.put_object(Bucket=BUCKET, Key=FILE_NAME + '-lhs'+'.html', Body=lhs_html.encode())
        rhs_name = FILE_NAME + '-rhs'+'.html'
        with open('/tmp/'+rhs_name, 'w+') as f:
            f.write(translate_text(lhs_html).prettify())
        s3_connection.put_object(Bucket=BUCKET, Key=rhs_name, Body=open('/tmp/'+rhs_name, 'rb'))
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'problem with S3 or RHS lambda',
        }

    #update the db
    #first check if the entry exists in the db
    response = table.get_item(Key={'URL': FILE_NAME})
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
                'average_rating': 0,
                'number_of_ratings': 0,
                'LHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-lhs.html',
                'RHS_s3_loc': 'https://s3.amazonaws.com/' + BUCKET + '/' + FILE_NAME + '-rhs.html'
            }
        )
    return {
        'statusCode': 200,
        'body':'great success',
        'url': URL,
    }

#function to get html from url by calling a lambda
def get_html(url, lambda_name):
    try:
        #sends the url to the lambda that will get the html
        response = lambda_connection.invoke(
            FunctionName=lambda_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(
                {'arguments' : {'url': url}
                })
        )
        #get the html from the response
        response_json = json.load(response['Payload'])
        print(response_json)
    except Exception as e:
        raise e
    return response_json['file']

def translate_text(html):
    soup = bs.BeautifulSoup(html, 'html.parser')
    for t in soup.find_all(string=True):
        if t.parent.name != "script":
            t.replace_with(translate.translate_text(Text=t, SourceLanguageCode="en", TargetLanguageCode="tr")['TranslatedText'])
    return soup

#Given the translations and lhs_html, reconstruct the rhs_html by replacing the lhs_html text elements with the translated text elements
def replace_text_with_translation(lhs, translated):
    # Create a copy of lhs to avoid modifying the original data
    rhs = deepcopy(lhs)

    # Parse the HTML content
    soup = bs(rhs['file'], 'html.parser')

    # Get the first content element and remove it from translated_content
    translated_content = translated.get('content', [])  # provide a default value to prevent key errors
    first_content = translated_content.pop(0) if translated_content else None

    # Replace the blog title with the translated title, if it exists
    blog_title = soup.find('h1', class_="lb-h2 blog-post-title")
    if blog_title and translated.get('title'):
        blog_title.string = translated['title']

    # Replace the authors
    authors = soup.find_all(property="name")
    translated_authors = translated.get('author', [])  # provide a default value to prevent key errors
    if authors and len(authors) == len(translated_authors):
        for author, new_author in zip(authors, translated_authors):
            author.string = new_author

    # Replace the h2 blog-title with the first content element, if it exists
    h2_blog_title = soup.find('h2', class_="lb-h5 blog-title")
    if h2_blog_title and first_content:
        h2_blog_title.string = first_content

    # Get the content section
    content_section = soup.find(class_="blog-post-content lb-rtxt", property="articleBody")
    if content_section:
        # Get all p and h2 tags from the content section, keeping the order they were found
        content_elements = content_section.find_all(['p', 'h2'])

        # Initialize a counter for translated content
        translated_content_counter = 0

        for element in content_elements:
            # Skip 'p' tags that contain 'img' tags
            if element.name == 'p' and element.find('img'):
                continue
            # Check if we have enough translated content to replace
            if translated_content_counter < len(translated_content):
                # Replace the content
                element.string = translated_content[translated_content_counter]
                # Increment the translated content counter
                translated_content_counter += 1

    # Update the file in rhs
    rhs['file'] = str(soup)

    return rhs