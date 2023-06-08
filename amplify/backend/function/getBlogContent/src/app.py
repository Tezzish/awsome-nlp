import json
import bs4 as bs
from urllib.request import urlopen

def handler(event, context):
  # url = event['arguments']['url']
  print('received event:')
  print(event)
  print(event['arguments'])
  response = parser(event['arguments']['url'])
#   print(parser(event['url']))
  # body = parser(event['url'])

  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'file' : response
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
    paragraphList = []
    for i in paragraphs:
        paragraphList.append(str(i))
    # print(title.text + content.text + '\n'.join(paragraphList))
    beginning = '''<!DOCTYPE html>
                  <html>
                  <head>
                  </head>
                  <body>
                  '''

    return (beginning + str(title) + str(content) + '\n'.join(paragraphList) + '</body></html>')
    
    
    
# parser("https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el")
# print(handler({'arguments': {'url': 'https://aws.amazon.com/blogs/aws/new-amazon-aurora-i-o-optimized-cluster-configuration-with-up-to-40-cost-savings-for-i-o-intensive-applications/?trk=f06df17d-71cb-481d-b7b8-8dd14f9b578c&sc_channel=el'}}, 1))
    

# import json
# import bs4 as bs
# import requests
# from urllib.request import urlopen
    
# def handler(event, context):
#     # check if the url sends a 404 response code

#     # try:
#     #     response = requests.get(url)
#     #     if response.status_code != 404:
#     #         # if page exists, and has correct response continue
#     #         print("Page exists")
#     #     else:
#     #         # if page doesn't exist
#     #         return False
#     # except requests.exceptions.RequestException as e:
#     #     # if an error occurs
#     #     print("Error checking if URL exists:", e)
#     #     return False  
    
#     # # if the url exists, call the parser function  
#     response = parser(event['arguments']['url'])
#     return {
#       'statusCode': 200,
#       'headers': {
#           'Access-Control-Allow-Headers': '*',
#           'Access-Control-Allow-Origin': '*',
#           'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
#       },
#       # get the author and title from the url
#       #'author' : response.find('div', class_='aws-blog-meta').find('a').text,
#       #'title' : response.find('h1', class_='aws-blog-title').text,
#       'file' : response
#   }



# # changing function called when the url is passed to the lambda function
# def parser(url):
#     html = urlopen(url).read()
#     soup = bs.BeautifulSoup(html, 'html.parser')
#     blog_content = soup.find('div', class_='aws-blog-content').prettify()
#     return blog_content
# # return the author and title of the blog
# #

# response = parser("https://aws.amazon.com/blogs/database/cost-effective-bulk-processing-with-amazon-dynamodb/?trk=1921da0f-a305-430a-9bf6-a72d94007afa&sc_channel=el")
# #author_list = [item.find('a').text for item in response.find_all('div', class_='aws-blog-meta')]
# title = response.find('h1', class_='aws-blog-title').text

# #print(author_list)
# print(title)
