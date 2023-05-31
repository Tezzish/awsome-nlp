package com.awsomenlp.lambda.config.objects;

import java.util.List;

/**
 * TODO: Determine whether the models will mess with delimiters (such as \r) for paragraph distinction.
 * If they dont mess with delimiters, we can toss in entire blogs to translate and delimit at
 * frontend, however, if they do, we need to find a solution to translate the post piece by
 * piece.
 */
public class AWSBlogPost extends Text{

    private List<String> paragraphs;

    public AWSBlogPost(Language language, String title,
                       List<Author> authors, List<String> paragraphs) {
        super(language, title, authors, null);
        this.paragraphs = paragraphs;

        StringBuilder stringBuilder = new StringBuilder();
        for (String paragraph: paragraphs) {
            stringBuilder.append(paragraph);
            stringBuilder.append("\r\r\r\r\r");
        }

        this.setContent(stringBuilder.toString());

    }

    public List<String> getParagraphs() {
        return paragraphs;
    }

    public void setParagraphs(List<String> paragraphs) {
        this.paragraphs = paragraphs;
    }
}
