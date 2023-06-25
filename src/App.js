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

//Booleans
const isValidURL = (str) => {
  try {
    new URL(str);
    return str.includes("https://aws.amazon.com/blogs/");
  } catch {
    return false;
  }
};

function App() {
  //Form State Declarations
  const [languages, setLanguages] = useState([]);
  const [translationModels, setTranslationModels] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
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
    setSelectedLanguage(selectedOption);
  };

  const handleInputChangeModel = (selectedOption) => {
    setSelectedModel(selectedOption);
  };

  const handleDismiss = () => {
    setAlertIsVisible(false);
  };

  const sendOriginalAndTranslated = async (url, sourceLanguage, targetLanguage, translationModel) => {
    try {
      console.log('sending config to backend');
      console.log('target language: ' + targetLanguage);
      console.log(targetLanguage)
      console.log('translation model: ' + translationModel);
      console.log(translationModel)

      const output = await API.graphql(graphqlOperation(getStepFunctionInvoker, {
        input: {
          url: url,
          sourceLanguage: { name: "ENGLISH", code: "en" },
          targetLanguage: { name: targetLanguage.label, code: targetLanguage.value },
          translationModel: { type: translationModel.label }
        }
      }));

      console.log('send successful');
      console.log(JSON.stringify(output));

      const original = output.data.getStepFunctionInvoker.lhs;
      const translated = output.data.getStepFunctionInvoker.rhs;
      const id = output.data.getStepFunctionInvoker.id;
      console.log(original);

      setRating(0);
      setRatingSubmitted(false);
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
    const targetLanguage = selectedLanguage;
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
    else if (targetLanguage === null) {
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Language Not Selected</React.Fragment>);
      setAlertContent("Please select a language for the translation.");
      setIsLoading(false);
    }
    else if (translator === null) {
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
          <URLInput data-testid='url-input' onChange={handleInputChangeURL} />
          <LanguageSelect data-testid='select-language' languages={languages} onChange={handleInputChangeLanguage} />
          <TranslationModelSelect data-testid='translation-model-select' translationModels={translationModels} onChange={handleInputChangeModel} />
          <div>
            <Button data-testid="translate" onClick={handleButtonClick}>Translate!</Button>
          </div>
        </div>
      </Form>
      <Box className="content-container">
        <Box variant="div" className={`left-side ${isLoading ? 'loading' : ''}`}>
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent variant="div" id='leftSide' className="left-side-content">
                <div dangerouslySetInnerHTML={{ __html: originalPost }} />
              </TextContent>
          )}
        </Box>
        <div className="vertical-divider"></div>
        <Box variant="div" className={`right-side ${isLoading ? 'loading' : ''}`}>
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent variant="div" id='rightSide' className="right-content">
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
export {isValidURL};