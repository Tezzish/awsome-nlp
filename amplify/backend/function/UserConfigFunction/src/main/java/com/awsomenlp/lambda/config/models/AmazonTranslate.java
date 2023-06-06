package com.awsomenlp.lambda.config.models;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.translate.AmazonTranslateAsync;
import com.amazonaws.services.translate.AmazonTranslateAsyncClient;
import com.amazonaws.services.translate.model.TranslateTextRequest;
import com.amazonaws.services.translate.model.TranslateTextResult;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;


/**
 * Supported Language Codes:
 * https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html .
 *
 * API Reference:
 * https://docs.aws.amazon.com/translate/latest/APIReference/welcome.html .
 */
@JsonTypeName("amazonTranslate")
public class AmazonTranslate extends TranslationModel {

  @JsonIgnore
  private AmazonTranslateAsync translateAsync;

  /**
   * Constructor for AmazonTranslate Object.
   * @param id
   */
  public AmazonTranslate(String id) {
    super(id);
  }

  /**
   * this is required or the whole thing explodes?!?!?!
   */
  public AmazonTranslate() {
    super(null);
  }


  //  TODO ADD CREDENTIALS
  //  TODO ADD REGION
  //  TODO ADD CUSTOM TERMS (SUPPORTED)
  //  TODO ADD TRANSLATING AUTHOR TITLE
  /**
   * @param text
   * @return Translated text or NULL if translation is interrupted or cannot.
   */
  @Override

  public Text translate(Text text, Language sourceLanguage,
                        Language targetLanguage) {

    translateAsync = AmazonTranslateAsyncClient.asyncBuilder()
        .withCredentials(
            DefaultAWSCredentialsProviderChain.getInstance())
        .withRegion(
            Regions.EU_WEST_1) //should be changed to not be hard coded
        .build();

    TranslateTextRequest request = new TranslateTextRequest()
        .withSourceLanguageCode(sourceLanguage.getCode())
        .withTargetLanguageCode(targetLanguage.getCode());

    Scanner scanner = new Scanner(text.getContent());
    scanner.useDelimiter("\r\r\r\r\r");


    List<Future<TranslateTextResult>> resultList = new ArrayList<>();
    while (scanner.hasNext()) {
      request.withText(scanner.next());
      resultList.add(translateAsync.translateTextAsync(request));
    }

    Future<TranslateTextResult> translatedTitle = translateAsync
        .translateTextAsync(request.withText(text.getTitle()));


    Text t = text;
    StringBuilder stringBuilder = new StringBuilder();


    //translates everything paragraph by paragraph

    resultList.forEach(x -> {
      try {
        stringBuilder.append(x.get().getTranslatedText());
        stringBuilder.append("\r\r\r\r\r");
      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      }
    });

    try {
      t.setTitle(translatedTitle.get().getTranslatedText());
    } catch (InterruptedException e) {
      e.printStackTrace();
    } catch (ExecutionException e) {
      e.printStackTrace();
    }

    t.setContent(stringBuilder.toString());
    t.setLanguage(targetLanguage);
    return t;
  }


  public AmazonTranslateAsync getTranslateAsync() {
    return translateAsync;
  }

  public void setTranslateAsync(AmazonTranslateAsync translateAsync) {
    this.translateAsync = translateAsync;
  }
}

