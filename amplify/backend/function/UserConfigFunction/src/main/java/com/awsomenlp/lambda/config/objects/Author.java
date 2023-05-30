package com.awsomenlp.lambda.config.objects;

public class Author {
  private String title;
  private String firstName;
  private String lastName;

  /**
   * Constructor for Author class.
   * @param title
   * @param firstName
   * @param lastName
   */
  public Author(String title, String firstName, String lastName) {
    this.title = title;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  @Override
  public String toString() {
    return title + " " + firstName + " " + lastName;
  }
}
