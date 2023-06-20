import json
import bs4 as bs
import urllib.request
from urllib.request import urlopen

def handler(event, context):
  
  blogUrl = event['url']

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

  
  # html content of the blog post 
  postReturned = parser(blogUrl)
  # title of the blog post
  postTitle = getTitle(blogUrl)
  # author(s) of the blog post
  postAuthors = getAuthorNames(blogUrl)


  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'file' : postReturned,
      'title' : postTitle,
      'author' : postAuthors
  }

# this function retrieves the title of the blog post
def getTitle(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    title_element = soup.find('h1', class_='lb-h2 blog-post-title')
    if title_element:
        title = title_element.text.strip()
    else:
        title = None
    return title

# this function retrieves the authors of the blog post
def getAuthorNames(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    author_elements = soup.find_all('span', attrs={'property': 'author'})
    author_names = []
    for author_element in author_elements:
        name_element = author_element.find('span', attrs={'property': 'name'})
        if name_element:
            author_names.append(name_element.text.strip())
    return author_names


def parser(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    blog_content = soup.find('div', class_='aws-blog-content').prettify()
    return blog_content

#handler("https://aws.amazon.com/blogs/big-data/aws-glue-data-quality-is-generally-available/?trk=f638223f-ce01-4bcd-8cf1-3d940b44343a&sc_channel=el", None)

# event = {
#     'arguments': {
#         'url': 'https://aws.amazon.com/blogs/big-data/aws-glue-data-quality-is-generally-available/?trk=f638223f-ce01-4bcd-8cf1-3d940b44343a&sc_channel=el'
#     }
# }

# print(handler(event, None))
