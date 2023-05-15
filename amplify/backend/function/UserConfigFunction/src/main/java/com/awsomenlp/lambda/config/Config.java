package com.awsomenlp.lambda.config;

import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Language;


public class Config {
    private String url; //TODO make this AWS URL datatype???
    private Language sourceLang;
    private Language destinationLang;
    private TranslationModel model;

    /**
     * In order to resolve the model, we need to add type annotations according to this article:
     * https://leoniedermeier.github.io/docs/java/snippets/java_misc/jackson_polymorphic.html
     */
    public Config(String url, Language sourceLang,
                  Language destinationLang, TranslationModel model) {
        this.url = url;
        this.sourceLang = sourceLang;
        this.destinationLang = destinationLang;
        this.model = model;
    }

    public String getUrl() {
        return url;
    }


    public void setUrl(String url) {
        this.url = url;
    }

    public Language getSourceLang() {
        return sourceLang;
    }

    public void setSourceLang(Language sourceLang) {
        this.sourceLang = sourceLang;
    }


    public Language getDestinationLang() {
        return destinationLang;
    }

    public void setDestinationLang(Language destinationLang) {
        this.destinationLang = destinationLang;
    }

    public TranslationModel getModel() {
        return model;
    }

    public void setModel(TranslationModel model) {
        this.model = model;
    }
}

