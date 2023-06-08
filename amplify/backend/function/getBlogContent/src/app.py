import json
import bs4 as bs
from urllib.request import urlopen
import requests

def handler(event, context):
  blogUrl = event['arguments']['url']
  try:
    response = requests.get(blogUrl)
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


# print(handler({'arguments' : { 
#       'url' : 'https://aws.amazon.com/blogs/database/cost-effective-bulk-processing-with-amazon-dynamodb/?trk=1921da0f-a305-430a-9bf6-a72d94007afa&sc_channel=el'
#       }}
#       , None))

#print(parser("https://aws.amazon.com/blogs/database/cost-effective-bulk-processing-with-amazon-dynamodb/?trk=1921da0f-a305-430a-9bf6-a72d94007afa&sc_channel=el"))