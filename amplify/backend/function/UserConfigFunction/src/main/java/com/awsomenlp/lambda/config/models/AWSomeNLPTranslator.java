package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeName;


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
    return null;
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
