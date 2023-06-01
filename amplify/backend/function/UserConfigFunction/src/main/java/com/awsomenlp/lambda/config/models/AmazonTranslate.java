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
 * <p>
 * API Reference:
 * https://docs.aws.amazon.com/translate/latest/APIReference/welcome.html .
 */
@JsonTypeName("amazonTranslate")
public class AmazonTranslate extends TranslationModel {

  @JsonIgnore
  private AmazonTranslateAsync translateAsync;

  /**
   * Constructor for AmazonTranslate Object.
   *
   * @param id
   */
  public AmazonTranslate(String id) {
    super(id);
    translateAsync = buildAsync();
  }

  /**
   * this is required or the whole thing explodes?!?!?!
   */
  public AmazonTranslate() {
    super(null);
    translateAsync = buildAsync();
  }

  protected AmazonTranslateAsync buildAsync() {
    return AmazonTranslateAsyncClient.asyncBuilder()
        .withCredentials(
            DefaultAWSCredentialsProviderChain.getInstance())
        .withRegion(
            Regions.EU_WEST_1) //should be changed to not be hard coded
        .build();
  }


  //  TODO ADD CREDENTIALS
  //  TODO ADD REGION
  //  TODO ADD CUSTOM TERMS (SUPPORTED)
  //  TODO ADD TRANSLATING AUTHOR TITLE

  /**
   * @param text
   * @return Translated text or partially translated text if it was
   * interrupted.
   */
  @Override
  public Text translate(Text text, Language sourceLanguage,
                        Language targetLanguage) {

    TranslateTextRequest request;
    Scanner scanner = new Scanner(text.getContent());
    scanner.useDelimiter("\r\r\r\r\r");


    //get each item in the content and translate individually
    List<Future<TranslateTextResult>> resultList = new ArrayList<>();
    while (scanner.hasNext()) {
      request = new TranslateTextRequest()
          .withSourceLanguageCode(sourceLanguage.getCode())
          .withTargetLanguageCode(targetLanguage.getCode());

      request.withText(scanner.next());
      resultList.add(translateAsync.translateTextAsync(request));
    }

    request = new TranslateTextRequest()
        .withSourceLanguageCode(sourceLanguage.getCode())
        .withTargetLanguageCode(targetLanguage.getCode());
    Future<TranslateTextResult> translatedTitle = translateAsync
        .translateTextAsync(request.withText(text.getTitle()));

    //translates everything paragraph by paragraph
    return getTranslatedText(targetLanguage, resultList, translatedTitle,
        text);
  }

  private Text getTranslatedText(Language targetLanguage,
                                 List<Future<TranslateTextResult>> resultList,
                                 Future<TranslateTextResult> translatedTitle,
                                 Text text) {
    StringBuilder stringBuilder = new StringBuilder();
    //translate the body
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

    //translate the title
    try {
      text.setTitle(translatedTitle.get().getTranslatedText());
    } catch (InterruptedException e) {
      e.printStackTrace();
    } catch (ExecutionException e) {
      e.printStackTrace();
    }

    text.setContent(stringBuilder.toString());
    text.setLanguage(targetLanguage);
    return text;
  }


  public AmazonTranslateAsync getTranslateAsync() {
    return translateAsync;
  }

  public void setTranslateAsync(AmazonTranslateAsync translateAsync) {
    this.translateAsync = translateAsync;
  }
}

