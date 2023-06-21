package com.awsomenlp.lambda.config.resolvers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Text;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class URLResolverTest {
  private URLResolver urlResolver;
  String url = "https://aws.amazon.com/blogs/deskto"
      + "p-and-application-streaming/network-coverage-delivers-se"
      + "cure-operations-by-utilizing-amazon-end-user-computing-services/";

  @Disabled
  @Test
  public void integrationTest() throws IOException {
    //Prepare input
    urlResolver = new URLResolver();

    //Test
    Text text = urlResolver.resolve(url);

    //Assert
    assertEquals("Network Coverage delivers secure operations "
        + "by utilizing Amazon End User Computing services",  text.getTitle());
    assertNotEquals(0, text.getContent().size());
  }

  @Test
  public void testResolveDocument() throws IOException {
    // Prepare input
    Document mockDocument = mock(Document.class);
    Elements mockTitleElements = mock(Elements.class);
    Element mockTitleElement = mock(Element.class);

    Element element = new Element("Tag")
        .appendText("Test Author");
    Elements elements = new Elements(List.of(element));

    Element paraElement = new Element("Tag").
        appendText("Test Paragraph");
    Elements paraElements = new Elements(List.of(paraElement));

    when(mockDocument.select("h1")).thenReturn(mockTitleElements);
    when(mockTitleElements.first()).thenReturn(mockTitleElement);
    when(mockTitleElement.text()).thenReturn("Test Title");

    when(mockDocument.select("[property=author] [property=name]"))
        .thenReturn(elements);

<<<<<<< HEAD
    when(mockDocument.select("p, h2, li")).thenReturn(paraElements);
=======
    when(mockDocument.select("p, h2")).thenReturn(paraElements);
>>>>>>> dev
    urlResolver = new URLResolver();

    // Perform test
    Text result = urlResolver.resolveDocument(mockDocument);

    // Assert the result
    assertEquals("Test Title", result.getTitle());
    assertEquals(Arrays.asList(new Author("", "", "Test Author")),
        result.getAuthors());
    assertEquals(List.of("Test Paragraph"),
        result.getContent());
  }

}
