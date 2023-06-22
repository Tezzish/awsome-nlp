import React, { useEffect, useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import { listLanguages, listTranslationModels, getStepFunctionInvoker } from "./graphql/queries";
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
import logo from './TUpoweredAWS.png';


/*NOTE: you may have noticed that there appears to be no languages or models for you to select. These must be added manually.
You can add these manually in AppSync and under the Queries Menu.
 */

Amplify.configure(awsExports);

function App() {
  //Form State Declarations
  const [languages, setLanguages] = useState([]);
  const [translationModels, setTranslationModels] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState([]);
  const [selectedModel, setSelectedModel] = useState([]);
  const [URLValue, setURLValue] = useState();

  //Rating State Declarations
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingId, setRatingId] = useState("");
  const [ratingBlogPostId, setRatingBlogPostId] = useState(null);

  //Alert State Declarations
  const [alertIsVisible, setAlertIsVisible] = useState(false)
  const [alertHeader, setAlertHeader] = useState("");
  const [alertContent, setAlertContent] = useState("");

  //Content State Declarations
  const [backendFinished, setBackendFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalPost, setOriginalPost] = useState(null);
  const [translatedPost, setTranslatedPost] = useState(null);

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

  const sendOriginalAndTranslated = async (url, sourceLanguage, targetLanguage, translationModel) => {
    try {
      console.log('sending config to backend');
      console.log(selectedLanguage);
      const output = await API.graphql(graphqlOperation(getStepFunctionInvoker, {
        input: {
          url: url,
          sourceLanguage: { name: "ENGLISH", code: "en" },
          targetLanguage: { name: "TURKISH", code: "tr" },
          translationModel: { type: "amazonTranslate" }
        }
      }));

      console.log('send successful');
      console.log(JSON.stringify(output));

      const original = output.data.getStepFunctionInvoker.lhs;
      const translated = output.data.getStepFunctionInvoker.rhs;
      const id = output.data.getStepFunctionInvoker.id;
      console.log(original);

      setOriginalPost(original);
      setTranslatedPost(translated);

      setIsLoading(false);
      setBackendFinished(true);
      setRatingBlogPostId(id);
    } catch (error) {
      console.error('Error sending config to backend:', error);
      setIsLoading(false);
    }
  }

  //TODO: Currently we are displaying the same values for the left and right iframes
  const handleButtonClick = (e) => {
    e.preventDefault();
    console.log("Button Clicked");
    const url = URLValue;
    const sourceLanguage = { name: "ENGLISH", code: "en" };
    const targetLanguage = { name: "TURKISH", code: "tr" };
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
    else if (targetLanguage === "") {
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
        // sendOriginalToBackend(url);
        // sendConfigToBackend(url, lang, translator)
        // calls the function to trigger step function
        sendOriginalAndTranslated(url, sourceLanguage, targetLanguage, translator)
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
  // async function sendOriginalToBackend(url1) {
  //   console.log('sending original blog post url to backend: URL =' + url1);
  //   try {
  //     const response = await API.graphql(graphqlOperation(getBlogPostParsed, { url: url1 }));
  //     console.log('response from backend: ', response);

  //     // Parse HTML string into document
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(response.data.getBlogPostParsed.file, 'text/html');

  //     // Iterate over all elements and remove 'style' attribute
  //     const elements = doc.getElementsByTagName('*');
  //     for (let i = 0; i < elements.length; i++) {
  //       elements[i].removeAttribute('style');
  //     }

  //     // Remove all elements with class 'blog-share-dialog'
  //     const shareDialogs = Array.from(doc.getElementsByClassName('blog-share-dialog'));
  //     for (let i = 0; i < shareDialogs.length; i++) {
  //       shareDialogs[i].parentNode.removeChild(shareDialogs[i]);
  //     }

  //     // Serialize document back into HTML string
  //     const serializer = new XMLSerializer();
  //     const strippedHTML = serializer.serializeToString(doc);

  //     const leftWindow = document.getElementById('leftWindow');
  //     leftWindow.innerHTML = strippedHTML;

  //     return response;
  //   } catch (error) {
  //     console.log('Error sending original blog post to backend:', error);
  //   }
  // }


  // const sendConfigToBackend = async (url, language, translationModel) => {
  //   try {
  //     const output = await API.graphql(graphqlOperation(translate, {
  //       input: {
  //         url: url,
  //         targetLanguage: { name: "TURKISH", code: "tr" },
  //         sourceLanguage: { name: "ENGLISH", code: "en" },
  //         translationModel: { type: "amazonTranslate" }
  //       }
  //     }));
  //     console.log('send successful');
  //     console.log(JSON.stringify(output))

  //     const translatedPost = output.data.translate;
  //     const title = translatedPost.title;
  //     const authors = translatedPost.authors.join(', ');
  //     const content = translatedPost.content.join('\n');
  //     setRatingBlogPostId(translatedPost.id);

  //     setTranslatedContent({ title, authors, content });
  //     setBackendFinished(true)
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.log('Error sending config to backend:', error);
  //     setIsLoading(false);
  //   }
  // };

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
      const output = await API.graphql(graphqlOperation(createRating, {
        input: {
          ratingBlogPostId: ratingBlogPostId,
          stars: star
        }
      }));
      setRatingId(output.data.createRating.id)
      console.log(output.data.createRating);
    } catch (error) {
      console.log("Rating not created:", error)
    }
  }

  async function mutateRatingFunc(star) {
    try {
      const output = await API.graphql(graphqlOperation(updateRating, {
        input: {
          id: ratingId,
          stars: star,
          ratingBlogPostId: ratingBlogPostId,
        }
      }));
      console.log(output);
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
        <Box variant="div" className="left-side">
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent variant="div" className="left-side-content">
                <div dangerouslySetInnerHTML={{ __html: originalPost }} />
              </TextContent>
          )}
        </Box>
        <div className="vertical-divider"></div>
        <Box variant="div" className="right-side">
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent variant="div" className="right-content">
                {backendFinished && <RatingStars rating={rating} changeRating={changeRating} />}
                <div dangerouslySetInnerHTML={{ __html: translatedPost }} />
              </TextContent>
          )}
        </Box>
      </Box>
    </div>
  );
}
export default App;