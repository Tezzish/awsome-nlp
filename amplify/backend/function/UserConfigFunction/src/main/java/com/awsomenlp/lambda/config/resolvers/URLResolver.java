package com.awsomenlp.lambda.config.resolvers;


import com.awsomenlp.lambda.config.objects.AWSBlogPost;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import java.util.List;

public class URLResolver {


    public URLResolver() {
    }

    //TODO
    public Text resolve(String url) {
        return new AWSBlogPost(Language.ENGLISH, "To Kill A Mockingbird",
            List.of(new Author("", "Harper", "Lee")),
            List.of("When he was nearly thirteen, my brother Jem got his arm badly broken at the\n" +
            "elbow. When it healed, and Jem’s fears of never being able to play football were\n" +
            "assuaged, he was seldom self-conscious about his injury. His left arm was\n" +
            "somewhat shorter than his right; when he stood or walked, the back of his hand was\n" +
            "at right angles to his body, his thumb parallel to his thigh. He couldn’t have cared\n" +
            "less, so long as he could pass and punt.", "When enough years had gone by to enable us to look back on them, we\n" +
            "sometimes discussed the events leading to his accident. I maintain that the Ewells\n" +
            "started it all, but Jem, who was four years my senior, said it started long before\n" +
            "that. He said it began the summer Dill came to us, when Dill first gave us the idea\n" +
            "of making Boo Radley come out."));
    }

}
