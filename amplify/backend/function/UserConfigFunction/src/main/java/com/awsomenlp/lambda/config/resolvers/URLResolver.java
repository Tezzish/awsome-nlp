package com.awsomenlp.lambda.config.resolvers;


import com.awsomenlp.lambda.config.objects.AWSBlogPost;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Language;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class URLResolver {


  /**
   * Default constructor.
   */
  public URLResolver() {
  }

  /**
   * Takes an AWS blog post url, scrapes it, and returns a matching
   * AWSBlogPost.
   *
   * @param url
   * @return Text
   * @throws IOException
   */
  public AWSBlogPost resolve(String url) throws IOException {
    Document doc;

    // Retrieve the HTML located at the URL
    doc = Jsoup.connect(url).get();

    //Get Title from blogpost
    Elements titEles = doc.select("h1");
    String title = "";
    if (!titEles.isEmpty()) {
      title = titEles.first().text();
    }

    //get Authors from blogpost
    Elements nameEles = doc.select("[property=author] [property=name]");
    List<Author> auths = new ArrayList<>();
    for (Element ele : nameEles) {
      auths.add(new Author("", "", ele.text()));
    }
    auths = auths.stream().distinct().collect(Collectors.toList());

    //get headers and paragraphs from blogpost
    Elements paraEles = doc.select("p, h2");
    List<String> paragraphs = new ArrayList<>();
    for (Element ele : paraEles) {
      paragraphs.add(ele.text());
    }

    return new AWSBlogPost(Language.ENGLISH, title, auths, paragraphs);
  }
}
