package com.awsomenlp.lambda.config.objects;

import com.awsomenlp.lambda.config.models.TranslationModel;

/**
 * Configuration that the user will send to initiate a job.
 */
public class Config {
  private String url;
  private Language sourceLanguage;
  private Language targetLanguage;
  private TranslationModel model;


  /**
   * Default constructor for Config.
   */
  public Config() {
  }

  /**
   * Constructor for Config.
   *
   * @param url
   * @param sourceLanguage
   * @param targetLanguage
   * @param model
   */
  public Config(String url, Language sourceLanguage,
                Language targetLanguage, TranslationModel model) {
    this.url = url;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.model = model;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public Language getSourceLanguage() {
    return sourceLanguage;
  }

  public void setSourceLanguage(Language sourceLanguage) {
    this.sourceLanguage = sourceLanguage;
  }

  public Language getTargetLanguage() {
    return targetLanguage;
  }

  public void setTargetLanguage(Language targetLanguage) {
    this.targetLanguage = targetLanguage;
  }

  public TranslationModel getModel() {
    return model;
  }

  public void setModel(TranslationModel model) {
    this.model = model;
  }
}

