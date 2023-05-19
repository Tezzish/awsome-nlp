package com.awsomenlp.lambda.config;

import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Config;
import com.awsomenlp.lambda.config.objects.Language;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * This class functions to deal with the specific way that AppSync sends requests
 * using the VTL resolver.
 */
public class AppSyncResolver {

    /**
     * This function turns the specific JsonNode, formatted like how it came from AppSync
     * into a proper Config object.
     * @param input
     * @param objectMapper
     * @return
     * @throws JsonProcessingException
     */
    public Config resolveAppSyncInput(JsonNode input, ObjectMapper objectMapper) throws JsonProcessingException {

        input = input.path("input");
        Config config = new Config();

        config.setUrl(input.get("url").asText());

        String sl = input.get("sourceLanguage").get("name").asText();
        config.setSourceLanguage(Language.valueOf(sl));

        String tl = input.get("targetLanguage").get("name").asText();
        config.setSourceLanguage(Language.valueOf(tl));

        TranslationModel model = objectMapper.readValue(input.get("translationModel").asText(), TranslationModel.class);
        config.setModel(model);
        return config;
    }
}
