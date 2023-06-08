import json
import bs4 as bs
from urllib.request import urlopen
import requests

def handler(event, context):

  try:
    response = requests.get(event['arguments']['url'])
    if response.status_code != 404:
      # if page exists, and has correct response continue
      print("Page exists")
    else:
      # if page doesn't exist
        return False
  except:
      # if an error occurs
      print("Error checking if URL exists:")
      return False
  
  postReturned = parser(event['arguments']['url'])

  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'file' : postReturned
  }

def parser(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    blog_content = soup.find('div', class_='aws-blog-content').prettify()
    return blog_content
