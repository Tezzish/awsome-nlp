import json
import bs4 as bs
from urllib.request import urlopen

def handler(event, context):
  
  print('received event:')
#   print(event['url'])
#   print(parser(event['url']))
  
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET'
      },
      'body': {
        'file': 'works!'
      }
  }

# # function called when the url is passed to the lambda function
# def parser(url):

#     # gets the html from the website
#     html = urlopen(url)
#     soup = bs.BeautifulSoup(html, 'html.parser')
#     soup = soup.find('section', class_='blog-post-content lb-rtxt')
#     soup = soup.find('lb-h2 blog-post-title')
#     soup = soup.find_all('p')
    