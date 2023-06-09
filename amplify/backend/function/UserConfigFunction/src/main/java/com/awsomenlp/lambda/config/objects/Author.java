package com.awsomenlp.lambda.config.objects;

public class Author {
  private String title;
  private String firstName;
  private String lastName;

  /**
   * Constructor for Author class.
   *
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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Author)) {
      return false;
    }

    Author author = (Author) o;

    if (getTitle() != null ? !getTitle().equals(author.getTitle())
        : author.getTitle() != null) {
      return false;
    }
    if (getFirstName() != null ? !getFirstName().equals(author.getFirstName())
        : author.getFirstName() != null) {
      return false;
    }
    return getLastName() != null ? getLastName().equals(author.getLastName())
        : author.getLastName() == null;
  }

  @Override
  public int hashCode() {
    int result = getTitle() != null ? getTitle().hashCode()
        : 0;
    result =
        31 * result + (getFirstName() != null ? getFirstName().hashCode()
            : 0);
    result =
        31 * result + (getLastName() != null ? getLastName().hashCode()
            : 0);
    return result;
  }
}
