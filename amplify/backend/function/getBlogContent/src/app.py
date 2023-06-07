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
        if response.status_code == 200:
            # if page exists, and has correct response continue
            print("Page exists")
        else:
            # if page doesn't exis
            return False
    except requests.exceptions.RequestException as e:
        # if an error occurs
        print("Error checking if URL exists:", e)
        return False  
    
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
    
    
    
