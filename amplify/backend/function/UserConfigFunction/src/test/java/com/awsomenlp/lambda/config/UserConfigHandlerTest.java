package com.awsomenlp.lambda.config;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;


class UserConfigHandlerTest {

  ObjectMapper objectMapper = new ObjectMapper();
  //I KNOW, TERRIBLE WAY TO STORE IT
  String apiKey = "6ax7j6di7ff47gfx5pxp3uqgae";
  String endPoint = "https://gir7li5d5vbv5dcl7jglhmrgri.appsync-api.eu-west-1."
      + "amazonaws.com/graphql";

  @BeforeEach
  void setUp() {
  }

  @AfterEach
  void tearDown() {
  }

  @Disabled("Disabled until we get new accounts!")
  @Test
  void integrationTest() throws IOException {
    OkHttpClient client = new OkHttpClient();

    Map<String, Object> variables = new HashMap<>();
    Map<String, Object> input = new HashMap<>();
    Map<String, String> targetLanguage = new HashMap<>();
    Map<String, String> sourceLanguage = new HashMap<>();
    Map<String, String> translationModel = new HashMap<>();

    targetLanguage.put("name", "TURKISH");
    targetLanguage.put("code", "tr");

    sourceLanguage.put("name", "ENGLISH");
    sourceLanguage.put("code", "en");

    translationModel.put("type", "amazonTranslate");

    input.put("url",
        "https://aws.amazon.com/blogs/desktop-"
            + "and-application-streaming/network-coverage-"
            + "delivers-secure-operations-by-utilizing-amazon"
            + "-end-user-computing-services/");
    input.put("targetLanguage", targetLanguage);
    input.put("sourceLanguage", sourceLanguage);
    input.put("translationModel", translationModel);

    variables.put("input", input);

    Gson gson = new Gson();
    String jsonVariables = gson.toJson(variables);

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
            + " { authors content } }\", \"variables\": "
            + jsonVariables + " }";

    MediaType mediaType = MediaType.parse("application/json");
    RequestBody body = RequestBody.create(mediaType, graphqlQuery);

    Request request = new Request.Builder()
        .url(endPoint)
        .method("POST", body)
        .addHeader("Content-Type", "application/json")
        .addHeader("x-api-key", apiKey)
        .build();

    Response response = client.newCall(request).execute();

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

    for (JsonNode paragraph : contents) {
      assertNotEquals(null, paragraph);
      assertNotEquals("", paragraph);
    }

  }
}
