import React, { useEffect, useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import { getBlogPostParsed, listLanguages, listTranslationModels, translate } from "./graphql/queries";
import { createRating, updateRating } from "./graphql/mutations";
import "@cloudscape-design/global-styles/index.css"
import Button from "@cloudscape-design/components/button"
import {Box, Form} from "@cloudscape-design/components";
import Alert from "./components/Alert"
import TextContent from "@cloudscape-design/components/text-content";
import LanguageSelect from './components/LanguageSelect';
import TranslationModelSelect from './components/TranslationModelSelect';
import URLInput from "./components/URLInput";
import RatingStars from "./components/RatingStars";
import ClipLoader from "react-spinners/ClipLoader";
import logo from './logo.png';

/*NOTE: you may have noticed that there appears to be no languages or models for you to select. These must be added manually.
You can add these manually in AppSync and under the Queries Menu.
 */

Amplify.configure(awsExports);

function App() {
  //Form State Declarations
  const [languages, setLanguages] = useState([]);
  const [translationModels, setTranslationModels] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [URLValue, setURLValue] = useState();

  //Rating State Declarations
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingId] = useState(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  const [ratingBlogPostId, setRatingBlogPostId] = useState(null);

  //Alert State Declarations
  const [alertIsVisible, setAlertIsVisible] = useState(false)
  const [alertHeader, setAlertHeader] = useState("");
  const [alertContent, setAlertContent] = useState("");

  //Content State Declarations
  const [backendFinished, setBackendFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedContent, setTranslatedContent] = useState({ title: '', authors: '', content: '' });

  //Handlers
  const handleInputChangeURL = (newValue) => {
    setURLValue(newValue);
  };

  const handleInputChangeLanguage = (selectedOption) => {
    setSelectedLanguage(selectedOption.value);
  };

  const handleInputChangeModel = (selectedOption) => {
    setSelectedModel(selectedOption.value);
  };

  const handleDismiss = () => {
    setAlertIsVisible(false);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    console.log("Button Clicked");
    const url = URLValue;
    const lang = selectedLanguage;
    const translator = selectedModel;

    setIsLoading(true);
    setAlertIsVisible(false)

    if (!isValidURL(url)) {
      console.log("invalid url")
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Incorrect Link</React.Fragment>);
      setAlertContent("The link you placed appears to be incorrect. Please make sure that this URL is reachable and directs to an AWS Blogpost (https://aws.amazon.com/blogs/...).");
      setIsLoading(false);
    }
    else if (lang === "") {
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Language Not Selected</React.Fragment>);
      setAlertContent("Please select a language for the translation.");
      setIsLoading(false);
    }
    else if (translator === "") {
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Translation Model Not Selected</React.Fragment>);
      setAlertContent("Please select a translation model.");
      setIsLoading(false);
    }
    else {
      try {
        // send to backend
        sendOriginalToBackend(url);
        sendConfigToBackend(url, lang, translator)
      } catch (error) {
        console.log("Error:", error);
        setIsLoading(false);
        setAlertIsVisible(true);
        setAlertHeader(<React.Fragment>Failed to Reach Server</React.Fragment>);
        setAlertContent("Failed to reach the server. Please ensure you have put in a proper URL. Try again after a few seconds");
      }
    }
  };

  //Booleans
  const isValidURL = (str) => {
    try {
      new URL(str);
      return str.includes("https://aws.amazon.com/blogs/");
    } catch {
      return false;
    }
  };

  //API communication
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

      // Remove all elements with class 'blog-share-dialog'
      const shareDialogs = Array.from(doc.getElementsByClassName('blog-share-dialog'));
      for (let i = 0; i < shareDialogs.length; i++) {
        shareDialogs[i].parentNode.removeChild(shareDialogs[i]);
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
      setIsLoading(false);
    } catch (error) {
      console.log('Error sending config to backend:', error);
      setIsLoading(false);
    }
  };

  //Rating Functions
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

  //APP
  return (
    <div className="App">
      <div className="icon-container">
        <img src={logo} alt="logo" className={`icon ${alertIsVisible ? 'icon-alert' : ''}`} onClick={() => window.location.reload()}/>
      </div>
      <Form>
        <Alert isVisible={alertIsVisible} handleDismiss={handleDismiss} header={alertHeader} content={alertContent} />
        <div className="dropdown-container">
          <URLInput onChange={handleInputChangeURL} />
          <LanguageSelect languages={languages} onChange={handleInputChangeLanguage} />
          <TranslationModelSelect translationModels={translationModels} onChange={handleInputChangeModel} />
          <div>
            <Button id="translate" onClick={handleButtonClick}>Translate!</Button>
          </div>
        </div>
      </Form>
      <Box className="content-container">
        <TextContent variant="div" className="left-side" id="leftWindow"></TextContent>
        <div className="vertical-divider"></div>
        <Box variant="div" className="right-side">
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent>
                {backendFinished && <RatingStars rating={rating} changeRating={changeRating} />}
                <h2>{translatedContent.title}</h2>
                <h3>{translatedContent.authors}</h3>
                {translatedContent.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
              </TextContent>
          )}
        </Box>
      </Box>
    </div>
  );
}
export default App;