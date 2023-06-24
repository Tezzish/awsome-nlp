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
   * Takes an AWSblogpost HTML Document, scrapes it, and returns a matching
   * Text object.
   *
   * @param doc
   * @return Text
   * @throws IOException
   */
  public Text resolveDocument(Document doc) throws IOException {
    // Get the blog content div
    Element blogContentDiv = doc.select("div.aws-blog-content").first();

    // Collect text lead nodes
    List<String> textLeadNodes = new ArrayList<>();
    collectTextLeadNodes(blogContentDiv, textLeadNodes);

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

    return new Text(Language.ENGLISH, title, auths, textLeadNodes);
  }

  /**
   * Recursively collect text lead nodes from an element.
   * @param node Node to start from
   * @param textLeadNodes List to accumulate text lead nodes
   */
  private void collectTextLeadNodes(Node node, List<String> textLeadNodes) {
    if (node instanceof Element) {
      Element element = (Element) node;
      if (!element.tagName().equals("code") && element.children().isEmpty() && !element.ownText().isEmpty()) {
        textLeadNodes.add(element.text());
      }
      for (Node child : element.childNodes()) {
        collectTextLeadNodes(child, textLeadNodes);
      }
    }
  }
}
