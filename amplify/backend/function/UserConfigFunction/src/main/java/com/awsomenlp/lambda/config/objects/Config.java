package com.awsomenlp.lambda.config.objects;

import com.awsomenlp.lambda.config.models.TranslationModel;


public class Config {
    private String url; //TODO make this AWS URL datatype???
    private Language sourceLanguage;
    private Language targetLanguage;
    private TranslationModel model;


    public Config() {
    }

    /**
     * In order to resolve the model, we need to add type annotations according to this article:
     * https://leoniedermeier.github.io/docs/java/snippets/java_misc/jackson_polymorphic.html
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

