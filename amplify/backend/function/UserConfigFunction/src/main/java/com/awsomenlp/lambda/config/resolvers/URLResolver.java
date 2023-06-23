package com.awsomenlp.lambda.config.resolvers;


import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;

public class URLResolver {


  /**
   * Default constructor.
   */
  public URLResolver() {
  }


  /**
   * Takes an AWS blogpost URL, scrapes it, and returns a matching
   * Text.
   *
   * @param url
   * @return Text
   * @throws IOException
   */
  public Text resolve(String url) throws IOException {
    Document doc;

    // Retrieve the HTML located at the URL
    doc = Jsoup.connect(url).get();

    return resolveDocument(doc);
  }

  /**
   * Parses and returns all text nodes from an element (HTML element).
   * @param element  HTML element
   * @return List<String> List of text nodes
   */
  public List<String> getTextNodes(Element element) {
    List<String> texts = new ArrayList<>();
    for (Node node : element.childNodes()) {
      if (node instanceof TextNode) {
        texts.add(((TextNode) node).getWholeText());
      } else if (node instanceof Element) {
        Element elemNode = (Element) node;
        // Skip certain tags like 'code', add more tags as required
        if (!"code".equals(elemNode.tagName())) {
          texts.addAll(getTextNodes(elemNode));
        }
      }
    }
    return texts;
  }


  /**
   * Takes an AWSblogpost HTML Document, scrapes it, and returns a matching
   * Text object.
   *
   * @param doc
   * @return Text
   * @throws IOException
   */
  public Text resolveDocument(Document doc) throws IOException {
    // Get Title from blogpost
    Elements titEles = doc.select("h1");
    String title = "";
    if (!titEles.isEmpty()) {
      title = titEles.first().text();
    }

    // Get Authors from blogpost
    Elements nameEles = doc.select("[property=author] [property=name]");
    List<Author> auths = new ArrayList<>();
    for (Element ele : nameEles) {
      auths.add(new Author("", "", ele.text()));
    }
    auths = auths.stream().distinct().collect(Collectors.toList());

    // Get text from blogpost excluding 'code', 'script', etc.
    Element contentDiv = doc.selectFirst("div.aws-blog-content"); // select the specific div

    if (contentDiv == null) {
      throw new IOException("Unable to find expected content div in HTML document.");
    }

    List<String> content = getTextNodes(contentDiv);

    return new Text(Language.ENGLISH, title, auths, content);
  }
}
