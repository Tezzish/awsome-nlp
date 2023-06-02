package com.awsomenlp.lambda.config.models;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import com.amazonaws.services.translate.AmazonTranslateAsync;
import com.amazonaws.services.translate.model.TranslateTextResult;
import com.awsomenlp.lambda.config.objects.Author;
import com.awsomenlp.lambda.config.objects.Language;
import com.awsomenlp.lambda.config.objects.Text;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class AmazonTranslateTest {


  AmazonTranslate amazonTranslate;
  AmazonTranslateAsync translateAsync;


  /**
   * Set up before each.
   */
  @BeforeEach
  public void setup() {
    translateAsync = mock(AmazonTranslateAsync.class);
    amazonTranslate = new AmazonTranslate();
    amazonTranslate.setTranslateAsync(translateAsync);
  }

  /**
   * Tests the translate method by mocking the AmazonTranslateAsync object.
   */
  @Test
  public void testTranslate() {
    // Prepare input
    List<Author> authors = List.of(new Author("Mr.", "Jaden", "Smith"));
    String content = "Come here, mama, I know you want me\n"
        + "Food from the soul, I know you're hungry\n"
        + "Gave you my two cents, ain't got money, but\n"
        + "I'll take you somewhere fun"
        + " and tell you something funny, hey\n"
        + "It's something funny, baby"
        + "\r\r\r\r\r"
        + "She said \"Jaden, you are my soulmate\" (You are my soul)\n"
        + "You only say that when you're lonely (When you’re lonely)\n"
        + "Girl, I'm surprised you even know me, ay\n"
        + "I'm not gon' ____, but we can kick it like we homies, ay\n"
        + "'Cause we just homies, baby"
        + "\r\r\r\r\r";
    Text text = new Text(Language.ENGLISH, "Ninety", authors, content);

    TranslateTextResult paragraph1 = new TranslateTextResult();
    paragraph1.setTranslatedText("sumn translated");
    paragraph1.setSourceLanguageCode("en");
    paragraph1.setTargetLanguageCode("tr");

    TranslateTextResult paragraph2 = new TranslateTextResult();
    paragraph2.setTranslatedText("sumn else translated");
    paragraph2.setSourceLanguageCode("en");
    paragraph2.setTargetLanguageCode("tr");

    TranslateTextResult title = new TranslateTextResult();
    title.setTranslatedText("noventa");
    title.setSourceLanguageCode("en");
    title.setTargetLanguageCode("tr");

    when(translateAsync.translateTextAsync(any())).thenReturn(
        CompletableFuture.completedFuture(paragraph1),
        CompletableFuture.completedFuture(paragraph2),
        CompletableFuture.completedFuture(title)
    );

    // Test
    Text translatedText =
        amazonTranslate.translate(text, Language.ENGLISH, Language.TURKISH);

    // Assert
    Text expectedText =
        new Text(Language.TURKISH, title.getTranslatedText(), authors,
            paragraph1.getTranslatedText() + "\r\r\r\r\r"
                + paragraph2.getTranslatedText() + "\r\r\r\r\r");
    assertEquals(expectedText, translatedText);

    verify(translateAsync, times(3)).translateTextAsync(any());
  }
}
