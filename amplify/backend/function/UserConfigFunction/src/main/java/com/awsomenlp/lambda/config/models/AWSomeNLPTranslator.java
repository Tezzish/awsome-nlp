package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;



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
      String requestBody = createRequestBody(line);

      String translatedLine = null;

      try {  //make the api call
        translatedLine = makePostRequest(requestBody);
      } catch (Exception e) {
        System.out.println("Error making api call");

      //add the translated line to the content of the text
      content.add(translatedLine);
    }
  }

    //set the content of the text to the translated content
    text.setContent(content);

    return text;
}

  /**
   * returns the text for the api call.
   * @param inputData
   * @return String
   */

  public static String createRequestBody(String inputData) {
    return "{\"data\":{\"inputs\":\"" + inputData + "\"}}";
  }


  /**
   * Makes a post request to the api.
   * @param requestBody
   * @return String
   */
  public static String makePostRequest(String requestBody) throws Exception {
      URL apiUrl =
      new URL("https://2c9kzo2ub4.execute-api.eu-west-1.amazonaws.com/dev");
      HttpURLConnection connection =
      (HttpURLConnection) apiUrl.openConnection();

      // Set the request method to POST
      connection.setRequestMethod("POST");

      // Set the request headers
      connection.setRequestProperty("Content-Type", "application/json");

      // Enable input and output streams
      connection.setDoInput(true);
      connection.setDoOutput(true);

      // Write the request body to the output stream
      connection.getOutputStream().write(requestBody.getBytes("UTF-8"));

      // Get the response status code
      int statusCode = connection.getResponseCode();

      // Read the response body
      BufferedReader reader =
      new BufferedReader(
        new InputStreamReader(connection.getInputStream())
        );
      StringBuilder responseBody = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
          responseBody.append(line);
      }
      reader.close();

      // Handle the response based on the status code
      if (statusCode >= 200 && statusCode < 300) {
          // Success response
          return responseBody.toString();
      } else {
          // Error response
          throw new Exception("API request failed with status code: "
          + statusCode);
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
