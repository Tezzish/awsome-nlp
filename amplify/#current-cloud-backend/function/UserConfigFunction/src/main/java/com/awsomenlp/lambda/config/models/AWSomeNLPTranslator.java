package com.awsomenlp.lambda.config.models;

import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("AWSomeNLPTranslator")
public class AWSomeNLPTranslator extends TranslationModel {

    /**
     * TODO
     */
    @Override
    public Text translate(Text text, Language sourceLanguage, Language destinationLanguage) {
        return null;
    }

    public AWSomeNLPTranslator(String ID) {
        super(ID);
    }

}
