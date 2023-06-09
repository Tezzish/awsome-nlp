import json
import bs4 as bs
import urllib.request
from urllib.request import urlopen
import requests

def handler(event, context):
  blogUrl = event['arguments']['url']
  
  try:
    response = urllib.request.urlopen(blogUrl)
    if response.status != 404:
      # if page exists, and has correct response continue
      print("Page exists")
    else:
      # if page doesn't exist
        return False
  except:
      # if an error occurs
      print("Error checking if URL exists:")
      return False

  
  postReturned = parser(blogUrl)

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

#print(handler({'arguments': {'url': 'https://aws.amazon.com/blogs/devops/optimize-software-development-with-amazon-codewhisperer/?trk=7a3f46e1-9c31-4493-9807-8174ec76e623&sc_channel=el'}}, None))