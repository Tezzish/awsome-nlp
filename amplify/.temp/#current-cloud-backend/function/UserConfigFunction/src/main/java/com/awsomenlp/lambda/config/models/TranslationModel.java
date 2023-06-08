package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AmazonTranslate.class, name = "amazonTranslate")
})
public abstract class TranslationModel {
  private String id;

  /**
   * Translate function meant to be overridden.
   * @param text
   * @param sourceLanguage
   * @param destinationLanguage
   * @return Text
   */
  public abstract Text translate(Text text, Language sourceLanguage,
                                 Language destinationLanguage);

  /**
   * Constructor for TranslationModel Object.
   * @param id
   */
  public TranslationModel(String id) {
    this.id = id;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }
}



