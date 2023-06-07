package com.awsomenlp.lambda.config.resolvers;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


import com.awsomenlp.lambda.config.models.AWSomeNLPTranslator;
import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Config;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AppSyncResolverTest {
  AppSyncResolver appSyncResolver;

  ObjectMapper objectMapper;

  JsonNode jsonNode;

  @BeforeEach
  void setUp() {
    appSyncResolver = new AppSyncResolver();
    objectMapper = mock(ObjectMapper.class);
    jsonNode = mock(JsonNode.class);
  }

  @Test
  void resolveAppSyncInput() throws JsonProcessingException {
    //Prepare input
    JsonNode inputNode = mock(JsonNode.class);
    when(jsonNode.path(anyString())).thenReturn(inputNode);
    when(inputNode.get(anyString())).thenReturn(inputNode);
    when(inputNode.asText()).thenReturn("url", "ENGLISH", "TURKISH");
    when(objectMapper.readValue(anyString(), eq(TranslationModel.class)))
        .thenReturn(new AWSomeNLPTranslator());

    //Test
    Config config = appSyncResolver.resolveAppSyncInput(jsonNode, objectMapper);

    //Assert
    assertEquals("url", config.getUrl());
    assertEquals(Language.ENGLISH, config.getSourceLanguage());
    assertEquals(Language.TURKISH, config.getTargetLanguage());
    assertNotNull(config.getModel());
  }

  @Test
  void resolveAppSyncOutPut() {
    //Prepare Input
    List<Author> authors = (List.of(new Author("Mr.", "Joy", "Again"),
        new Author("Dr.", "Heinz", "Doofenschmirtz")));
    List<String> content = List.of("ketchup");
    String title = "What im listening to on spotify";
    Text text = new Text(Language.ENGLISH, title, authors, content);

    //Test
    JSONObject jsonObject = appSyncResolver.resolveAppSyncOutPut(text);

    //Assert
    assertEquals(Language.ENGLISH.getCode(),
        jsonObject.getString("blogPostLanguageCode"));
    assertEquals("What im listening to on spotify",
        jsonObject.getString("title"));
    assertTrue(jsonObject.getJSONArray("authors").toList()
        .containsAll(List.of("Mr. Joy Again", "Dr. Heinz Doofenschmirtz")));
    assertTrue(jsonObject.getJSONArray("content").toList().contains("ketchup"));
    assertEquals("10", jsonObject.getString("blogPostOriginalPostId"));
    assertEquals("100", jsonObject.getString("id"));
  }
}
