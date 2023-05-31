package com.awsomenlp.lambda.config.models;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.translate.AmazonTranslateAsync;
import com.amazonaws.services.translate.AmazonTranslateAsyncClient;
import com.amazonaws.services.translate.model.TranslateTextRequest;
import com.amazonaws.services.translate.model.TranslateTextResult;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;


/**
 * Supported Language Codes: https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html
 * API Reference: https://docs.aws.amazon.com/translate/latest/APIReference/welcome.html
 */
@JsonTypeName("amazonTranslate")
public class AmazonTranslate extends TranslationModel {

    @JsonIgnore
    private AmazonTranslateAsync translateAsync;

    public AmazonTranslate(String ID) {
        super(ID);
    }

    /**
     * this is required or the whole thing explodes?!?!?!
     */
    public AmazonTranslate() {
        super(null);
    }


    /**
     * TODO: ADD CREDENTIALS
     * TODO: ADD REGION
     * TODO: ADD CUSTOM TERMS (SUPPORTED)
     * TODO: ADD TRANSLATING AUTHOR TITLE
     * @param text
     * @return Translated text or NULL if translation is interrupted or cannot.
     */
    @Override
    public Text translate(Text text, Language sourceLanguage, Language targetLanguage) {
        translateAsync = AmazonTranslateAsyncClient.asyncBuilder()
            .withRegion(Regions.DEFAULT_REGION)
            .build();

        TranslateTextRequest request = new TranslateTextRequest()
            .withText(text.getContent())
            .withSourceLanguageCode(sourceLanguage.getCode())
            .withTargetLanguageCode(targetLanguage.getCode());

        Future<TranslateTextResult> result = translateAsync.translateTextAsync(request);

        /**
         * since it is a future, it can be interrupted.
         */
        try {
            /**
             * really stupid solution that doesnt change anything except the actual text, and
             * its language.
             */
            Text t = text;
            t.setContent(result.get().getTranslatedText());
            t.setLanguage(targetLanguage);
            return t;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }

        return null;
    }


    public AmazonTranslateAsync getTranslateAsync() {
        return translateAsync;
    }

    public void setTranslateAsync(AmazonTranslateAsync translateAsync) {
        this.translateAsync = translateAsync;
    }
}

