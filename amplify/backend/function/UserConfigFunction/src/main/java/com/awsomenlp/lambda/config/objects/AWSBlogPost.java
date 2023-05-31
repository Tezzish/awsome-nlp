package com.awsomenlp.lambda.config.objects;

import java.util.List;

/**
 * If they dont mess with delimiters, we can toss in entire blogs to translate
 * and delimit at frontend, however, if they do, we need to find a
 * solution to translate the post piece by piece.
 */

//TODO refactor because the delimiters make no sense
//(such as \r) for paragraph distinction.
public class AWSBlogPost extends Text {

  private List<String> paragraphs;

  /**
   * Constructor for AWS BlogPost Object.
   *
   * @param language
   * @param title
   * @param authors
   * @param paragraphs turns into a single String to delimitted by "\r\r\r\r\r"
   *                   for each paragraph
   */
  public AWSBlogPost(Language language, String title,
                     List<Author> authors, List<String> paragraphs) {
    super(language, title, authors, null);
    this.setParagraphs(paragraphs);
  }


  public List<String> getParagraphs() {
    return paragraphs;
  }

  /**
   * Sets paragraphs to the input string and content to the list of paragraphs,
   * delimited by \r\r\r\r\r.
   *
   * @param paragraphs
   */
  public void setParagraphs(List<String> paragraphs) {
    this.paragraphs = paragraphs;

    StringBuilder stringBuilder = new StringBuilder();
    if (paragraphs != null) {
      for (String paragraph : paragraphs) {
        stringBuilder.append(paragraph);
        stringBuilder.append("\r\r\r\r\r");
      }
    }
    this.setContent(stringBuilder.toString());
  }
}
