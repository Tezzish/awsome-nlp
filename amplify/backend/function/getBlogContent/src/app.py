import json
import bs4 as bs
import requests
from urllib.request import urlopen

def handler(event, context):
    # check if the url sends a 404 response code

    # the url to check
    url = event['arguments']['url']

    try:
        response = requests.get(url)
        if response.status_code != 404:
            # if page exists, and has correct response continue
            print("Page exists")
        else:
            # if page doesn't exist
            return False
    except requests.exceptions.RequestException as e:
        # if an error occurs
        print("Error checking if URL exists:", e)
        return False  
    
    # if the url exists, call the parser function  
    response = parser(url)
    return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'file' : response
  }

# changing function called when the url is passed to the lambda function
def parser(url):
    html = urlopen(url).read()
  
    soup = bs.BeautifulSoup(html, 'html.parser')
    title = soup.find('h1', class_='lb-h2 blog-post-title')
    content = soup.find('section', class_='blog-post-content lb-rtxt')
    paragraphs = soup.find_all('p')
    paragraphList = []
    for i in paragraphs:
        paragraphList.append(str(i))
    
    beginning = '''<!DOCTYPE html>
                  <html>
                  <head>
                  </head>
                  <body>
                  '''

    return (beginning + str(title) + str(content) + '\n'.join(paragraphList) + '</body></html>')
    

print(parser("https://aws.amazon.com/blogs/database/cost-effective-bulk-processing-with-amazon-dynamodb/?trk=1921da0f-a305-430a-9bf6-a72d94007afa&sc_channel=el"))