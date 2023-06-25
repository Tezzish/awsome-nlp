# getBlogContent

This directory contains the service that is responsible for web scraping an AWS blog post from a URL input. It parses only the content of the HTML and returns the content as an HTML file, the authors of the blog post and the title of the blog post.  

## Tech Specs
This function uses Python 3.9. It is intended to run using AWS Lambda. The dependencies used by this function are installed in a packages directory and uploaded as a Lambda layer: BeautifulSoup (bs4), urllib.request to carry out the web scraping and HTML refactoring. 

### Testing
This function is tested using unittest. 

#### Deployment
This function should be deployed automatically by CDK, however, if you'd like to deploy this manually, you can build a zip of this function and upload it to a Lambda function on the AWS console with the following specifications:

```     
runtime: Python 3.9,
handler: app.handler
timeout: cdk.Duration.seconds(45)
```

**input**

```
        {

            "url":https://aws.amazon.com/blogs/mobile/export-amplify-backends-to-cdk-and-use-with-existing-deployment-pipelines/
        }
```

**output**

```
{
    "file": (blog post HTML file),
    "title": (Translated Title),
    "authors": [
        (Author 1), 
        (Author 2)
    ]
}
```