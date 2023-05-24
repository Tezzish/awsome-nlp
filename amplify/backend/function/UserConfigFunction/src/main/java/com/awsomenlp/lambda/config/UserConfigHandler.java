

package com.awsomenlp.lambda.config;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.awsomenlp.lambda.config.models.TranslationModel;
import com.awsomenlp.lambda.config.objects.Config;
import com.awsomenlp.lambda.config.objects.Text;
import com.awsomenlp.lambda.config.resolvers.AppSyncResolver;
import com.awsomenlp.lambda.config.resolvers.URLResolver;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class UserConfigHandler implements RequestStreamHandler {

    private ObjectMapper objectMapper = new ObjectMapper();
    private AppSyncResolver appSyncResolver = new AppSyncResolver();
    private URLResolver urlResolver = new URLResolver();

    @Override
    public void handleRequest(InputStream input, OutputStream output,
                              Context context) throws IOException {

        /**
         * TODO: Add a way to see where this request is coming from.
         */
        JsonNode rootNode = objectMapper.readTree(input);
        Config config = appSyncResolver.resolveAppSyncInput(rootNode.path("arguments"), objectMapper);

        TranslationModel model = config.getModel();
        Text text = urlResolver.resolve(config.getUrl());

        Text translatedText = model.translate(text, config.getSourceLanguage(), config.getTargetLanguage());

        output.write(appSyncResolver.resolveAppSyncOutPut(translatedText).toString().getBytes(
            StandardCharsets.UTF_8));
    }

}