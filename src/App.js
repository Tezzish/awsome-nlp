import React, { useEffect, useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import { Amplify } from "aws-amplify";
import awsExports from './aws-exports';
import { getBlogPostParsed, listLanguages, listTranslationModels, translate } from "./graphql/queries";
import { createRating, updateRating } from "./graphql/mutations";
import "@cloudscape-design/global-styles/index.css"
import Button from "@cloudscape-design/components/button"
import {Alert, Form} from "@cloudscape-design/components";
import TextContent from "@cloudscape-design/components/text-content";
import LanguageSelect from './components/LanguageSelect';
import TranslationModelSelect from './components/TranslationModelSelect';
import URLInput from "./components/URLInput";
import RatingStars from "./components/RatingStars";



/*NOTE: you may have noticed that there appears to be no languages or models for you to select. These must be added manually.
You can add these manually in AppSync and under the Queries Menu.
 */

Amplify.configure(awsExports);

function App() {
  const [languages, setLanguages] = useState([]);
  const [translationModels, setTranslationModels] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [URLValue, setURLValue] = useState();
  const [backendFinished, setBackendFinished] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [translatedContent, setTranslatedContent] = useState({ title: '', authors: '', content: '' });
  const [ratingId] = useState(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  const [ratingBlogPostId, setRatingBlogPostId] = useState(null);

  const handleInputChangeURL = (newValue) => {
    setURLValue(newValue);
  };

  const handleInputChangeLanguage = (selectedOption) => {
    setSelectedLanguage(selectedOption.value);
  };

  const handleInputChangeModel = (selectedOption) => {
    setSelectedModel(selectedOption.value);
  };

  //TODO: Currently we are displaying the same values for the left and right iframes
  const handleButtonClick = (e) => {
    e.preventDefault();
    console.log("Button Clicked");
    const url = URLValue;
    const lang = selectedLanguage;
    const translator = selectedModel;
    try {
      // check if url starts with https://aws.amazon.com/blogs/aws/ then send to backend
      if (isValidURL(url)) {
        sendOriginalToBackend(url);
        sendConfigToBackend(url, lang, translator)
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };


  //TODO: Check if URL is a valid AWS URL.
  // Current implementation only check if it is a URL
  const isValidURL = (str) => {
    try {
      new URL(str);
      if (str.includes("https://aws.amazon.com/blogs/")) {
        return true;
      }
    } catch {
      return false;
    }
  };

  // sends the url of the original blog post to the backend to be parsed
  async function sendOriginalToBackend(url1) {
    console.log('sending original blog post url to backend: URL =' + url1);
    try {
      const response = await API.graphql(graphqlOperation(getBlogPostParsed, { url: url1 }));
      console.log('response from backend: ', response);

      // Parse HTML string into document
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data.getBlogPostParsed.file, 'text/html');

      // Iterate over all elements and remove 'style' attribute
      const elements = doc.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        elements[i].removeAttribute('style');
      }

      // Serialize document back into HTML string
      const serializer = new XMLSerializer();
      const strippedHTML = serializer.serializeToString(doc);

      const leftWindow = document.getElementById('leftWindow');
      leftWindow.innerHTML = strippedHTML;

      return response;
    } catch (error) {
      console.log('Error sending original blog post to backend:', error);
    }
  }


  useEffect(() => {
    const fetchLanguagesAndModels = async () => {
      try {
        const languagesData = await API.graphql(graphqlOperation(listLanguages));
        const modelsData = await API.graphql(graphqlOperation(listTranslationModels));

        console.log("Fetched languages: ", languagesData);
        console.log("Fetched models: ", modelsData);

        setLanguages(languagesData.data.listLanguages.items);
        setTranslationModels(modelsData.data.listTranslationModels.items);
      } catch (error) {
        console.log('Error fetching languages and models:', error);
      }
    };

    fetchLanguagesAndModels();
  }, []);

  const sendConfigToBackend = async (url, language, translationModel) => {
    try {
      const output = await API.graphql(graphqlOperation(translate, {
        input: {
          url: url,
          targetLanguage: { name: "TURKISH", code: "tr" },
          sourceLanguage: { name: "ENGLISH", code: "en" },
          translationModel: { type: "amazonTranslate" }
        }
      }));
      console.log('send successful');
      console.log(JSON.stringify(output))

      const translatedPost = output.data.translate;
      const title = translatedPost.title;
      const authors = translatedPost.authors.join(', ');
      const content = translatedPost.content.join('\n');
      setRatingBlogPostId(translatedPost.id);

      setTranslatedContent({ title, authors, content });
      setBackendFinished(true)
    } catch (error) {
      console.log('Error sending config to backend:', error);
    }
  };

  const [rating, setRating] = useState(0);


  const changeRating = async (newRating, name) => {
    setRating(newRating);
    if (!ratingSubmitted) {
      createRatingFunc(newRating, ratingBlogPostId);
      setRatingSubmitted(true);
    } else {
      mutateRatingFunc(newRating);
    }
  };


  async function createRatingFunc(star, ratingBlogPostId) {
    try {
      const rating = await API.graphql(graphqlOperation(createRating, {
        input: {
          id: ratingId,
          ratingBlogPostId: ratingBlogPostId,
          stars: star
        }
      }));
      console.log(rating);
    } catch (error) {
      console.log("Rating not created:", error)
    }
  }


  async function mutateRatingFunc(star) {
    try {
      const rating = await API.graphql(graphqlOperation(updateRating, {
        input: {
          id: ratingId,
          stars: star
        }
      }));
      console.log(rating);
    } catch (error) {
      console.log("Rating not updated:", error)
    }
  }
  return (
    <div className="App">
      <Form>
        <Alert
            dismissible
            statusIconAriaLabel="Info"
            type="warning"
            header={
              <React.Fragment>Incorrect Link</React.Fragment>
            }
        >
          The link you placed appears to be incorrect. Please
          make sure that this URL is reachable and directs to
          an AWS Blogpost (https://aws.amazon.com/blogs/...).{" "}
        </Alert>
        <div className="dropdown-container">
          <URLInput onChange={handleInputChangeURL} />
          <LanguageSelect languages={languages} onChange={handleInputChangeLanguage} />
          <TranslationModelSelect translationModels={translationModels} onChange={handleInputChangeModel} />
          <div>
            <Button id="translate" onClick={handleButtonClick}>Translate!</Button>
          </div>
        </div>
      </Form>
      <div className="content-container">
        <div className="left-side" id="leftWindow"></div>
        <div className="right-side">
          <TextContent>
          {backendFinished && <RatingStars rating={rating} changeRating={changeRating} />}
          <h2>{translatedContent.title}</h2>
            <h3>{translatedContent.authors}</h3>
            {translatedContent.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </TextContent>
        </div>
      </div>
    </div>
  );
}
export default App;