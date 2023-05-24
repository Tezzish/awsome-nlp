

package com.awsomenlp.lambda.config;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
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

//    @Override
//    public String handleRequest(Config config, Context context) {
//
//        Config config1 = new Config("url",  Language.ENGLISH, Language.TURKISH, new AmazonTranslate("129"));
//        ObjectMapper mapper = new ObjectMapper();
//        Writer writer = new StringWriter();
//        try {
//            mapper.writeValue(writer, config1);
//            return writer.toString();
//        } catch (IOException e) {
//            return "errors";
//        }
    //    }


    @Override
    public void handleRequest(InputStream input, OutputStream output,
                              Context context) throws IOException {

//        Config config = objectMapper.readValue(input, Config.class);
//        Text text = new AWSBlogPost(Language.ENGLISH, "Title",
//            List.of(new Author("Dr", "firstName", "lastName")), List.of("cheese cheese"));
//        //String translatedText = config.getModel().translate(text, text.getLanguage(), config.getTargetLanguage()).toString();
//        String translatedText = new AmazonTranslate().translate(text, text.getLanguage(), Language.TURKISH).toString();
//        output.write(translatedText.getBytes(StandardCharsets.UTF_8));


        //String temp = IOUtils.toString(input);

        //JsonNode rootNode = objectMapper.readTree(input);

        //System.out.println(rootNode.path("arguments"));
        //System.out.println(appSyncResolver.resolveAppSyncInput(rootNode.path("arguments"), objectMapper));


        /**
         * refer to the foreign keys in the output for the issues to properly function
         */

        JSONObject translationModel = new JSONObject();

        JSONArray authors = new JSONArray();
        authors.put("Remi Wolf");
        authors.put("Gutter Girl");

        JSONArray content = new JSONArray();
        content.put("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Integer et ante molestie, lobortis ligula ut, iaculis lectus. Sed " +
            "ultricies consectetur iaculis. Vestibulum venenatis mattis arcu.");
        content.put("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer interdum.");

        JSONObject blogPost = new JSONObject();
        blogPost.put("id", 100);
        blogPost.put("blogPostLanguageCode", "en");
        blogPost.put("blogPostOriginalPostId", "10");
        blogPost.put("title", "Biking");
        blogPost.put("authors", authors);
        blogPost.put("blogPostTranslationModelId", "0");
        blogPost.put("content", content);



        output.write(blogPost.toString().getBytes(StandardCharsets.UTF_8));
    }
}