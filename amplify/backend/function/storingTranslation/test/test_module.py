import pytest
from bs4 import BeautifulSoup

from amplify.backend.function.storingTranslation.src.index import replace_text_with_translation


@pytest.fixture
def lhs_content():
    return {
        'file': '<html><body><h1 class="lb-h2 blog-post-title">Title</h1><p property="name">Author</p><h2 class="lb-h5 blog-title">Blog Title</h2><div class="blog-post-content lb-rtxt" property="articleBody"><p>Content with image <img src="image.jpg"></p><p>Content1</p><p>Content2</p></div></body></html>',
    }



@pytest.fixture
def rhs_content():
    return {
        'title': 'Translated Title',
        'author': ['Translated Author'],
        'content': ['Translated Content', 'Translated Content1', 'Translated Content2']
    }


# Test if the function correctly replaces the title
def test_replace_text_with_translation_title(lhs_content, rhs_content):
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')

    assert soup.find('h1', class_="lb-h2 blog-post-title").string == 'Translated Title'


# Test if the function correctly replaces the author
def test_replace_text_with_translation_author(lhs_content, rhs_content):
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')

    assert soup.find('p', property="name").string == 'Translated Author'


# Test if the function correctly replaces the content
def test_replace_text_with_translation_content(lhs_content, rhs_content):
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')

    assert soup.find('h2', class_="lb-h5 blog-title").string == 'Translated Content'


# Test if the function correctly replaces the Title, Author and Content
def test_replace_text_with_translation(lhs_content, rhs_content):
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')

    assert soup.find('h1', class_="lb-h2 blog-post-title").string == 'Translated Title'
    assert soup.find('p', property="name").string == 'Translated Author'
    assert soup.find('h2', class_="lb-h5 blog-title").string == 'Translated Content'


# Test if the function correctly replaces Author and Content without Title
def test_no_title_in_rhs_content(lhs_content):
    rhs_content = {
        'author': ['Translated Author'],
        'content': ['Translated Content']
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert soup.find('h1', class_="lb-h2 blog-post-title").string == 'Title'  # unchanged title


# Test if the function correctly replaces Title and Content without Author
def test_no_author_in_rhs_content(lhs_content):
    rhs_content = {
        'title': 'Translated Title',
        'content': ['Translated Content']
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert soup.find('p', property="name").string == 'Author'  # unchanged author


# Test if the function correctly replaces Title and Author without Content
def test_no_content_in_rhs_content(lhs_content):
    rhs_content = {
        'title': 'Translated Title',
        'author': ['Translated Author']
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert soup.find('h2', class_="lb-h5 blog-title").string == 'Blog Title'  # unchanged content


# Test if the function handles the case of a mismatch in the length of authors
def test_author_length_mismatch(lhs_content):
    rhs_content = {
        'title': 'Translated Title',
        'author': ['Translated Author1', 'Translated Author2'],  # more authors than in the HTML
        'content': ['Translated Content']
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert soup.find('p', property="name").string == 'Author'  # unchanged author


# Test if the function correctly replaces text within paragraphs that don't contain an image
def test_replace_text_with_translation_img_paragraph(lhs_content, rhs_content):
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')

    # Test if the function correctly replaces the title
    assert soup.find('h1', class_="lb-h2 blog-post-title").string == 'Translated Title'
    # Test if the function correctly replaces the author's name
    assert soup.find('p', property="name").string == 'Translated Author'
    # Test if the function correctly replaces the text of the first paragraph that doesn't contain an image
    assert soup.find('div', class_="blog-post-content lb-rtxt").find_all('p')[1].string == 'Translated Content1'
    # Test if the function correctly replaces the text of the second paragraph that doesn't contain an image
    assert soup.find('div', class_="blog-post-content lb-rtxt").find_all('p')[2].string == 'Translated Content2'


# Test if the function handles the case of no content in the rhs_content
def test_no_first_content_in_rhs_content(lhs_content):
    rhs_content = {
        'title': 'Translated Title',
        'author': ['Translated Author'],
        'content': []  # empty content
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert soup.find('h2', class_="lb-h5 blog-title").string == 'Blog Title'  # unchanged h2 blog title


# Test if the function handles the case of no content section in the lhs_content
def test_no_content_section_in_lhs_content():
    lhs_content = {
        'file': '<html><body><h1 class="lb-h2 blog-post-title">Title</h1><p property="name">Author</p><h2 class="lb-h5 blog-title">Blog Title</h2></body></html>',
    }  # No blog-post-content lb-rtxt in HTML
    rhs_content = {
        'title': 'Translated Title',
        'author': ['Translated Author'],
        'content': ['Translated Content']
    }
    result = replace_text_with_translation(lhs_content, rhs_content)
    soup = BeautifulSoup(result['file'], 'html.parser')
    assert not soup.find(class_="blog-post-content lb-rtxt", property="articleBody")  # No blog-post-content lb-rtxt in HTML




