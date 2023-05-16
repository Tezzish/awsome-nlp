

package com.awsomenlp.lambda.config;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.awsomenlp.lambda.config.objects.AWSBlogPost;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class UserConfigHandler implements RequestStreamHandler {

    private ObjectMapper objectMapper = new ObjectMapper();

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
//            return "error n shit";
//        }
    //    }

    @Override
    public void handleRequest(InputStream input, OutputStream output,
                              Context context) throws IOException {

        Config config = objectMapper.readValue(input, Config.class);
        Text text = new AWSBlogPost(Language.ENGLISH, "Title",
            List.of(new Author("Dr", "firstName", "lastName")), List.of("cheese cheese"));
        String translatedText = config.getModel().translate(text, text.getLanguage(), config.getTargetLanguage()).toString();
        output.write(translatedText.getBytes(StandardCharsets.UTF_8));

    }
}