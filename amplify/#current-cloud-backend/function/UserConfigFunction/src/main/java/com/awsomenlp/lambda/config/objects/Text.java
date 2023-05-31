package com.awsomenlp.lambda.config.objects;

import java.util.List;

public abstract class Text {
    private Language language;
    private String title;
    private List<Author> authors;
    private String content;

    public Text(Language language, String title,
                List<Author> authors, String content) {
        this.language = language;
        this.title = title;
        this.authors = authors;
        this.content = content;
    }

    public Language getLanguage() {
        return language;
    }

    public String getTitle() {
        return title;
    }

    public List<Author> getAuthors() {
        return authors;
    }

    public String getContent() {
        return content;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAuthors(List<Author> authors) {
        this.authors = authors;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
