package com.awsomenlp.lambda.config.models;

import java.io.IOException;
import java.util.ArrayList;

import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import org.apache.commons.text.StringEscapeUtils;





@JsonTypeName("AWSomeNLPTranslator")
public class AWSomeNLPTranslator extends TranslationModel {


  //TODO

  /**
   * @param text
   * @param sourceLanguage
   * @param destinationLanguage
   * @return Text
   */
  @Override
  public Text translate(Text text, Language sourceLanguage,
                        Language destinationLanguage) {
    //create a new text object to store the translated text
    ArrayList<String> content = new ArrayList<String>();

    //translate each line in text.getContent()
    for (String line : text.getContent()) {
      //create the request body for the api call

      String translatedLine = null;

      try {  //make the api call
        translatedLine = makePostRequest(line);
        System.out.println(translatedLine);
      } catch (Exception e) {
        System.out.println("Error making api call");
        translatedLine = "Oopsie Doopsie";
      //add the translated line to the content of the text
      }
    content.add(translatedLine);
  }
  String title = text.getTitle();
  try {
    title = makePostRequest(title);
  } catch (Exception e) {
    System.out.println("Error making api call");
    title = "Oopsie Doopsie";
  }

  //set the content of the text to the translated content
  text.setContent(content);
  text.setLanguage(destinationLanguage);

  return new Text(text.getLanguage(),
    title,
    text.getAuthors(),
    content);
}


  /**
   * Makes a post request to the api.
   * @param sentence the sentence to be translated.
   * @return String
   */
  public static String makePostRequest(String sentence) throws Exception {
      OkHttpClient client = new OkHttpClient().newBuilder()
    .build();
    MediaType mediaType = MediaType.parse("application/json");
    String requestBody = "{\"data\":{\"inputs\":\""
    + sentence
    + "\",\"parameters\":{\"max_length\":256}}}";
    RequestBody body = RequestBody.create(
      mediaType,
      requestBody);

    Request request = new Request.Builder()
    .url(
    "https://2c9kzo2ub4.execute-api.eu-west-1.amazonaws.com/auth/ml-model-api"
    )
    .method("POST", body)
    .addHeader("authorizationToken", "abc123")
    .addHeader("Content-Type", "application/json")
    .build();
    try (Response response = client.newCall(request).execute()) {
      if (!response.isSuccessful()) {
        throw new IOException("Unexpected response code: " + response.code());
      }

      String ret = response.body().string();
      System.out.println(ret);

      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode jsonNode = objectMapper.readTree(ret);
      ret = jsonNode.get(0).get("generated_text").asText();
      ret = ret.replace("``", "").replace("''", "");
      // make sure that ret is first utf-encoded then utf escape decoded
      ret = new String(ret.getBytes("UTF-8"), "UTF-8");
      ret = StringEscapeUtils.unescapeJava(ret);
      return ret;
    } catch (IOException e) {
      e.printStackTrace();
      System.out.println("Error making API call: " + e.getMessage());
      return "Oopsie doopsie: " + e.getMessage();
    }
  }

  /**
   * Constructor for AWSomeNLPTranslator.
   * @param id
   */
  public AWSomeNLPTranslator(String id) {
    super(id);
  }

  /**
   * Empty Constructor.
   */
  public AWSomeNLPTranslator() {
    super(null);
  }
}
