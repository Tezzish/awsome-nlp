package com.awsomenlp.lambda.config;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Config;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.awsomenlp.lambda.config.resolvers.AppSyncResolver;
import com.awsomenlp.lambda.config.resolvers.URLResolver;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONObject;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;


class UserConfigHandlerTest {

  ObjectMapper objectMapper = new ObjectMapper();
  //I KNOW, TERRIBLE WAY TO STORE IT, BUT IT NEEDS TO BE CHANGED BY HAND
  String apiKey = "da2-o3qctlwtsvcudkwcf7czya63fa";
  String endPoint = "https://nxab62gupfgqle5xouca3ygqp4."
      + "appsync-api.eu-west-1.amazonaws.com/graphql";

  //very flaky! run a couple of times to be sure that it works.
  // it times out when it shouldnt
  @Disabled
  @Test
  void integrationTest() throws IOException {
    //Prepare input
    OkHttpClient client = new OkHttpClient();

    String graphqlQuery =
        "{ \"query\": \"query MyQuery { translate(input: {sourceLanguage:"
            + " {code: \\\"en\\\", name: \\\"ENGLISH\\\"}, targetLanguage:"
            + " {code: \\\"tr\\\", name: \\\"TURKISH\\\"}, translationModel:"
            + " {type: \\\"amazonTranslate\\\"},"
            + " url: \\\"https://aws.amazon.com/blogs/"
            + "desktop-and-application-streaming/network"
            + "-coverage-delivers-secure"
            + "-operations-by-utilizing-amazon"
            + "-end-user-computing-services/\\\"})"
            + " { authors content } }"
            + " }";

    MediaType mediaType = MediaType.parse("application/json");
    RequestBody body = RequestBody.create(mediaType, graphqlQuery);

    Request request = new Request.Builder()
        .url(endPoint)
        .method("POST", body)
        .addHeader("Content-Type", "application/json")
        .addHeader("x-api-key", apiKey)
        .build();

    //Test
    Response response = client.newCall(request).execute();

    //Assert
    assertEquals(200, response.code());
    JsonNode output =
        objectMapper.readTree(response.body().string()).get("data")
            .get("translate");
    JsonNode[] authors =
        objectMapper.convertValue(output.get("authors"), JsonNode[].class);
    //Can't test for titles yet because we don't have that implemented
    assertEquals("Asriel Agronin", authors[0].asText().trim());


    JsonNode[] contents =
        objectMapper.convertValue(output.get("content"), JsonNode[].class);

    assertNotEquals(0, contents.length);
    for (JsonNode paragraph : contents) {
      assertNotEquals(null, paragraph);
      assertNotEquals("", paragraph);
    }
  }

  @Test
  void testHandleRequestNoTitle() throws IOException {
    // Prepare input
    Document doc = mock(Document.class);

    // Mock the Elements and Element classes for title, name and paragraph
    Elements titleElements = mock(Elements.class);
    Elements nameElements = mock(Elements.class);
    Element nameElement = mock(Element.class);
    Elements paraElements = mock(Elements.class);
    Element paraElement = mock(Element.class);

    // Set the behaviors for the mocks
    when(doc.select("h1")).thenReturn(titleElements);
    when(titleElements.isEmpty()).thenReturn(true);

    when(doc.select("[property=author] [property=name]"))
        .thenReturn(nameElements);
    when(nameElements.iterator())
        .thenReturn(Arrays.asList(nameElement).iterator());
    when(nameElement.text()).thenReturn("Test Author");

    when(doc.select("p, h2")).thenReturn(paraElements);
    when(paraElements.iterator())
        .thenReturn(Arrays.asList(paraElement).iterator());
    when(paraElement.text()).thenReturn("Test Paragraph");

    // Prepare the expected result
    Text expectedText = new Text(Language.ENGLISH, "",
        Arrays.asList(new Author("", "", "Test Author")),
        Arrays.asList("Test Paragraph"));

    // Test execution
    URLResolver urlResolver = new URLResolver();
    Text actualText = urlResolver.resolveDocument(doc);

    // Assert
    assertEquals(expectedText, actualText);
  }

  @Test
  public void testHandleRequest() throws IOException {
    //Prepare input
    ObjectMapper objectMapper = mock(ObjectMapper.class);
    AppSyncResolver appSyncResolver = mock(AppSyncResolver.class);
    URLResolver urlResolver = mock(URLResolver.class);

    JsonNode mockNode = mock(JsonNode.class);
    //Return itself because its a mock
    when(mockNode.path("arguments")).thenReturn(mockNode);
    when(objectMapper.readTree(any(InputStream.class))).thenReturn(mockNode);

    Config mockConfig = mock(Config.class);
    when(appSyncResolver
        .resolveAppSyncInput(any(JsonNode.class), any(ObjectMapper.class)))
        .thenReturn(mockConfig);

    Text mockText = mock(Text.class);
    when(urlResolver.resolve(any())).thenReturn(mockText);

    TranslationModel mockModel = mock(TranslationModel.class);
    when(mockConfig.getModel()).thenReturn(mockModel);

    Text mockTranslatedText = mock(Text.class);
    when(mockModel.translate(any(), any(), any()))
        .thenReturn(mockTranslatedText);

    JSONObject mockJsonObject = mock(JSONObject.class);
    when(mockJsonObject.toString()).thenReturn("translated text");
    when(appSyncResolver.resolveAppSyncOutPut(mockTranslatedText))
        .thenReturn(mockJsonObject);


    UserConfigHandler userConfigHandler =
        new UserConfigHandler(objectMapper, appSyncResolver, urlResolver);


    InputStream input = new ByteArrayInputStream("dummy input".getBytes());
    ByteArrayOutputStream output = new ByteArrayOutputStream();

    //Test
    userConfigHandler.handleRequest(input, output, null);

    // Assert the result
    assertEquals("translated text", output.toString());

    // Verify the interaction with the mocks
    verify(objectMapper, times(1)).readTree(any(InputStream.class));
    verify(appSyncResolver, times(1))
        .resolveAppSyncInput(any(JsonNode.class), any(ObjectMapper.class));
    verify(urlResolver, times(1)).resolve(any());
    verify(mockConfig, times(1)).getModel();
    verify(mockModel, times(1)).translate(any(), any(), any());
  }
}
