package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeInfo;


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type")
public abstract class TranslationModel {
    private String ID;
    public abstract Text translate(Text text);

    public String getID() {
        return ID;
    }

    public void setID(String ID) {
        this.ID = ID;
    }
}



