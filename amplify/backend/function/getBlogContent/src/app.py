import json
import bs4 as bs
from urllib.request import urlopen

def handler(event, context):
  # url = event['arguments']['url']
  print('received event:')
  print(event)
  print(event['arguments'])
  a = parser(event['arguments']['url'])
#   print(parser(event['url']))
  # body = parser(event['url'])
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET BINKS'
      },
      'body': a
  }

# # function called when the url is passed to the lambda function
def parser(url):

    # gets the html from the website
    html = urlopen(url).read()
    # print(html)

    soup = bs.BeautifulSoup(html, 'html.parser')
    title = soup.find('h1', class_='lb-h2 blog-post-title')
    content = soup.find('section', class_='blog-post-content lb-rtxt')
    paragraphs = soup.find_all('p')
    print(title)
    print(content)
    print(paragraphs)
    
    
    
    
parser("https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el")