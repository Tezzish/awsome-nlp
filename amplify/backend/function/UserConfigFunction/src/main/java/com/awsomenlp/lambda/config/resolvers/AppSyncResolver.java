package com.awsomenlp.lambda.config.resolvers;

import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Config;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * This class functions to deal with the specific way that AppSync sends
 * requests using the VTL resolver.
 */
public class AppSyncResolver {

  /**
   * This function turns the specific JsonNode, formatted like how it came
   * from AppSync into a proper Config object.
   *
   * @param input
   * @param objectMapper
   * @return Config
   * @throws JsonProcessingException
   */
  public Config resolveAppSyncInput(JsonNode input, ObjectMapper objectMapper)
      throws JsonProcessingException {

    input = input.path("input");
    Config config = new Config();

    config.setUrl(input.get("url").asText());

    String sl = input.get("sourceLanguage").get("name").asText();
    config.setSourceLanguage(Language.valueOf(sl));

    String tl = input.get("targetLanguage").get("name").asText();
    config.setTargetLanguage(Language.valueOf(tl));

    TranslationModel model = objectMapper
        .readValue(input.get("translationModel").toString(),
            TranslationModel.class);
    config.setModel(model);

    return config;
  }

  /**
   * This function takes a Text object and maps it to a JSON
   * that our current Graphql Schema can understand.
   *
   * @param text
   * @return JSONObject
   */
  public JSONObject resolveAppSyncOutPut(Text text) {
    JSONObject jsonObject = new JSONObject();
    JSONArray authors = new JSONArray();
    text.getAuthors().forEach((x) -> authors.put(x.toString()));


    JSONArray content = new JSONArray();
    for (String paragraph
        :text.getContent()) {
      content.put(paragraph);
    }

    jsonObject.put("blogPostLanguageCode", text.getLanguage().getCode());
    jsonObject.put("blogPostOriginalPostId",
        "10");
    jsonObject.put("title", text.getTitle());
    jsonObject.put("authors", authors);
    jsonObject.put("content", content);
    jsonObject.put("id", "100"); //TODO make this not hardcoded
    return jsonObject;
  }

}
