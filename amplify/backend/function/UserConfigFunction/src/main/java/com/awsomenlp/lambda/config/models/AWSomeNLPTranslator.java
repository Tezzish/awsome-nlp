package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("AWSomeNLPTranslator")
public class AWSomeNLPTranslator extends TranslationModel {

    /**
     * TODO
     */

    @Override
    public Text translate(Text text) {
        return null;
    }
}
