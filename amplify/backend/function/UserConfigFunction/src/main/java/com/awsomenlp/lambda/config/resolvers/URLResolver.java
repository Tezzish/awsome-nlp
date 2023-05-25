package com.awsomenlp.lambda.config.resolvers;


import com.awsomenlp.lambda.config.objects.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class URLResolver {


    public URLResolver() {
    }

    //TODO
    public Text resolve(String url) throws IOException {
        Document doc;

        // Retrieve the HTML located at the URL
        doc = Jsoup.connect(url).get();

        //Get Title from blogpost
        Elements titEles = doc.select("h1");
        String title = "";
        if (!titEles.isEmpty())
            title = titEles.first().text();

        //get Authors from blogpost
        Elements authEles = doc.select("[property=author]");
        List<Author> auths = new ArrayList<>();
        for (Element ele : authEles) {
            auths.add(new Author("", "", ele.text()));
        }

        //get headers and paragraphs from blogpost
        Elements paraEles = doc.select("p, h2");
        List<String> paragraphs = new ArrayList<>();
        for (Element ele : paraEles) {
            paragraphs.add(ele.text());
        }

        return new AWSBlogPost(Language.ENGLISH, title, auths, paragraphs);
    }
}
