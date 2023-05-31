package com.awsomenlp.lambda.config.objects;

import static org.junit.jupiter.api.Assertions.assertEquals;


import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AWSBlogPostTest {

  private AWSBlogPost blogPost;
  private List<String> paragraphs;

  /**
   * Inspired by SWEET / I THOUGHT YOU WANTED TO DANCE by Tyler, The Creator.
   * Track 10 off CALL ME IF YOU GET LOST.
   * getContent also tests the part of the constructor that includes logic.
   */
  @BeforeEach
  void setUp() {
    paragraphs = List.of("You and I, we fell in love\n"
            + "I ain't read the signs, ain't know what it was\n"
            + "But God gotta know he might have peaked when he made you\n"
            + "The cosmos' only mistake is what they named you"
            + " (What that mean?)",
        "They should call you sugar, you're so sweet\n"
            + "Well, they should call you sugar, 'cause you're so sweet to me\n"
            + "Well, they should call you sugar, sugar, oh, you're so sweet\n"
            +
            "'Cause, baby, you're the sweetest, sweetest,"
            + " sweetest thing I've known\n");
    blogPost =
        new AWSBlogPost(Language.ENGLISH, "SWEET / I THOUGHT YOU WANTED TO "
            + "DANCE", List.of(new Author("Mr.", "Tyler,",
                "the Creator"),
            new Author("Ms.", "Fana", "Hues")), paragraphs);
  }


  @Test
  void getParagraphs() {

    List<String> correctParagraph = List.of("You and I, we fell in love\n"
            + "I ain't read the signs, ain't know what it was\n"
            + "But God gotta know he might have peaked when he made you\n"
            + "The cosmos' only mistake is what they named you"
            + " (What that mean?)",
        "They should call you sugar, you're so sweet\n"
            + "Well, they should call you sugar, 'cause you're so sweet to me\n"
            + "Well, they should call you sugar, sugar, oh, you're so sweet\n"
            + "'Cause, baby, you're the sweetest, sweetest,"
            + " sweetest thing I've known\n");


    assertEquals(correctParagraph, blogPost.getParagraphs());
  }

  @Test
  void getContent() {
    String correctString = "You and I, we fell in love\n"
        + "I ain't read the signs, ain't know what it was\n"
        + "But God gotta know he might have peaked when he made you\n"
        + "The cosmos' only mistake is what they named you (What that mean?)"
        + "\r\r\r\r\r"
        + "They should call you sugar, you're so sweet\n"
        + "Well, they should call you sugar, 'cause you're so sweet to me\n"
        + "Well, they should call you sugar, sugar, oh, you're so sweet\n"
        + "'Cause, baby, you're the sweetest, sweetest, sweetest thing "
        + "I've known\n"
        + "\r\r\r\r\r";

    assertEquals(correctString, blogPost.getContent());
  }

  @Test
  void setParagraphs() {
    List<String> paragraphs = List.of("Even if\n"
            + "You left me out here stranded, my feelings wouldn't change a bit"
            + " (You know how I feel about you, are you ready?)\n"
            + "You know how I feel, baby\n"
            + "Infinite\n"
            + "The love I have for you, a diamond couldn't put a dent in it"
            + " (Uh, go to the bridge thing, okay)",
        "Darling, you're the wind under my wings\n"
            + "My heart beats triple time when I see you\n"
            + "Somethin' I can't control\n"
            + "If I compared you, the sun is a stand-in (Sun)\n"
            + "You got a smile that could light up a planet (Smile), yeah "
            + "(Oh, oh)\n"
            + "And I just wanted you to know (They should call you sugar)");

    String correctContent = "Even if\n"
        +
        "You left me out here stranded, my feelings wouldn't change a bit (You "
        + "know how I feel about you, are you ready?)\n"
        + "You know how I feel, baby\n"
        + "Infinite\n"
        + "The love I have for you, a diamond couldn't put a dent in it (Uh, go"
        + " to the bridge thing, okay)"
        + "\r\r\r\r\r"
        + "Darling, you're the wind under my wings\n"
        + "My heart beats triple time when I see you\n"
        + "Somethin' I can't control\n"
        + "If I compared you, the sun is a stand-in (Sun)\n"
        + "You got a smile that could light up a planet (Smile), yeah"
        + " (Oh, oh)\n"
        + "And I just wanted you to know (They should call "
        + "you sugar)"
        + "\r\r\r\r\r";


    blogPost.setParagraphs(paragraphs);
    assertEquals(correctContent, blogPost.getContent());
  }

  @Test
  void setParagraphsNull() {
    List<String> paragraphs = null;

    blogPost.setParagraphs(paragraphs);
    assertEquals("", blogPost.getContent());
    assertEquals(null, blogPost.getParagraphs());
  }
}
