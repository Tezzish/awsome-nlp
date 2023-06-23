import bs4 as bs
import urllib.request
from urllib.request import urlopen


def handler(event, context):

    blogUrl = event['url']

    response = urllib.request.urlopen(blogUrl)
    if response.status != 404:
        # if page exists, and has correct response continue
        print("Page exists")
    else:
        # if page doesn't exist
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
        'file': postReturned,
        'title': postTitle,
        'author': postAuthors
    }


# this function retrieves the title of the blog post
def getTitle(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    # check if there is a title
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
    # check if there are multiple authors
    author_elements = soup.find_all('span', attrs={'property': 'author'})
    author_names = []
    for author_element in author_elements:
        name_element = author_element.find('span', attrs={'property': 'name'})
        if name_element:
            author_names.append(name_element.text.strip())
    return author_names


# this function retrieves the content of the blog post and assigns IDs to each element
def parser(url):
    html = urlopen(url).read()
    soup = bs.BeautifulSoup(html, 'html.parser')
    blog_content_div = soup.find('div', class_='aws-blog-content')

    # Assign an id to each child element
    for i, element in enumerate(blog_content_div, start=1):
        if element.name != 'code':
            element['id'] = f"element-{i}"

    return blog_content_div.prettify()

