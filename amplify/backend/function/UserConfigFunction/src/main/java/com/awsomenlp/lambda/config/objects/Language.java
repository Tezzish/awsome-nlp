package com.awsomenlp.lambda.config.objects;


public enum Language {
    TURKISH("tr"),
    ENGLISH("en");

    private final String code;

    Language(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
