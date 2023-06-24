package com.awsomenlp.lambda.config.objects;

import java.util.List;

public class Text {
  /**
   * Fields for Text class.
   */
  private Language language;
  private String title;
  private List<Author> authors;
  private List<String> content;


  /**
   * Constructor for text class, meant to be overridden.
   *
   * @param language
   * @param title
   * @param authors
   * @param content
   */
  public Text(Language language, String title,
              List<Author> authors, List<String> content) {
    this.language = language;
    this.title = title;
    this.authors = authors;
    this.content = content;
  }

  /**
   * Default Constructor.
   */
  public Text() {
  }

  public Language getLanguage() {
    return language;
  }

  public void setLanguage(Language language) {
    this.language = language;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public List<Author> getAuthors() {
    return authors;
  }

  public void setAuthors(List<Author> authors) {
    this.authors = authors;
  }

  public List<String> getContent() {
    return content;
  }

  public void setContent(List<String> content) {
    this.content = content;
  }

  /**
   * @return String Representation of Text object.
   */
  @Override
  public String toString() {
    return "Text{"
        + "language="
        + language
        + ", title='"
        + title
        + '\''
        + ", authors="
        + authors
        + ", content='"
        + content
        + '\''
        + '}';
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Text)) {
      return false;
    }

    Text text = (Text) o;

    if (getLanguage() != text.getLanguage()) {
      return false;
    }
    if (getTitle() != null ? !getTitle().equals(text.getTitle())
        : text.getTitle() != null) {
      return false;
    }
    if (getAuthors() != null ? !getAuthors().equals(text.getAuthors())
        : text.getAuthors() != null) {
      return false;
    }
    return getContent() != null ? getContent().equals(text.getContent())
        : text.getContent() == null;
  }

  @Override
  public int hashCode() {
    int result = getLanguage() != null ? getLanguage().hashCode() : 0;
    result = 31 * result + (getTitle() != null ? getTitle().hashCode() : 0);
    result = 31 * result + (getAuthors() != null ? getAuthors().hashCode() : 0);
    result = 31 * result + (getContent() != null ? getContent().hashCode() : 0);
    return result;
  }
}
