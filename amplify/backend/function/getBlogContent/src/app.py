import json
import bs4 as bs
from urllib.request import urlopen

def handler(event, context):

  print('received event:')
  print(event)
  print(event['arguments'])
  response = parser(event['arguments']['url'])

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
    
    
    
