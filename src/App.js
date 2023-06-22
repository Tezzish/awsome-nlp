// Import all required libraries
import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import { listLanguages, listTranslationModels, getStepFunctionInvoker } from "./graphql/queries";
import { createRating, updateRating } from "./graphql/mutations";

// Import all required CSS styles
import "./App.css";
import "@cloudscape-design/global-styles/index.css";

// Import all required components
import { Box, Form, Button, TextContent } from "@cloudscape-design/components";
import Alert from "./components/Alert";
import LanguageSelect from './components/LanguageSelect';
import TranslationModelSelect from './components/TranslationModelSelect';
import URLInput from "./components/URLInput";
import RatingStars from "./components/RatingStars";

// Import loader from react-spinners
import ClipLoader from "react-spinners/ClipLoader";

// Importing logo image
import logo from './TUpoweredAWS.png';


Amplify.configure(awsExports);

// Application component
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

  //On Change Handlers
  const handleInputChangeURL = (newValue) => {
    setURLValue(newValue);
  };

  const handleInputChangeLanguage = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };

  const handleInputChangeModel = (selectedOption) => {
    setSelectedModel(selectedOption);
  };

  // Alert dismissal handler
  const handleDismiss = () => {
    setAlertIsVisible(false);
  };

  // Main translation action trigger on button click
  const handleButtonClick = (e) => {
    //Inform user that translation is in progress and prevent default action (page reload)
    e.preventDefault();
    console.log("Button Clicked");

    //set url, land, and translator to user values
    const url = URLValue;
    const sourceLanguage = { name: "ENGLISH", code: "en" };
    const targetLanguage = selectedLanguage;
    const translator = selectedModel;

    //set loading and alert states
    setIsLoading(true);
    setAlertIsVisible(false)

    //Check if all fields are filled
    //Check if URL is valid
    if (!isValidURL(url)) {
      console.log("invalid url")
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Incorrect Link</React.Fragment>);
      setAlertContent("The link you placed appears to be incorrect. Please make sure that this URL is reachable and directs to an AWS Blogpost (https://aws.amazon.com/blogs/...).");
      setIsLoading(false);
    }
    //check if a language is selected
    else if (targetLanguage === null) {
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Language Not Selected</React.Fragment>);
      setAlertContent("Please select a language for the translation.");
      setIsLoading(false);
    }
    //check if a translation model is selected
    else if (translator === null) {
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Translation Model Not Selected</React.Fragment>);
      setAlertContent("Please select a translation model.");
      setIsLoading(false);
    }
    else {
      //if all fields are filled, try translation
      sendOriginalAndTranslated(url, sourceLanguage, targetLanguage, translator)
    }
  };

  //Booleans
  //checks if a string is a valid URL and if it is an AWS blog post
  const isValidURL = (str) => {
    try {
      new URL(str);
      return str.includes("https://aws.amazon.com/blogs/");
    } catch {
      return false;
    }
  };

  //API communication
  //fetches languages and translation models from the backend
  useEffect(() => {
    const fetchLanguagesAndModels = async () => {
      try {
        // fetch languages and models from backend
        const languagesData = await API.graphql(graphqlOperation(listLanguages));
        const modelsData = await API.graphql(graphqlOperation(listTranslationModels));

        // log languages and models to console
        console.log("Fetched languages: ", languagesData);
        console.log("Fetched models: ", modelsData);

        // set languages and models in state
        setLanguages(languagesData.data.listLanguages.items);
        setTranslationModels(modelsData.data.listTranslationModels.items);
      } catch (error) {
        // log error to console in case of failure
        console.log('Error fetching languages and models:', error);
      }
    };

    // call fetchLanguagesAndModels function
    fetchLanguagesAndModels();
  }, []);

  // Communicate with backend to get original and translated posts
  const sendOriginalAndTranslated = async (url, sourceLanguage, targetLanguage, translationModel) => {
    try {
      // get original and translated posts from backend
      const output = await API.graphql(graphqlOperation(getStepFunctionInvoker, {
        input: {
          url: url,
          sourceLanguage: { name: "ENGLISH", code: "en" },
          targetLanguage: { name: targetLanguage.label, code: targetLanguage.value },
          translationModel: { type: translationModel.label }
        }
      }));

      // Set original and translated posts
      const original = output.data.getStepFunctionInvoker.lhs;
      const translated = output.data.getStepFunctionInvoker.rhs;
      const id = output.data.getStepFunctionInvoker.id;

      // Set original and translated posts
      setOriginalPost(original);
      setTranslatedPost(translated);

      // Set rating and loading states
      setRating(0);
      setRatingSubmitted(false);
      setIsLoading(false);
      setBackendFinished(true);
      setRatingBlogPostId(id);

    } catch (error) {
      // Log error and set loading state
      console.error('Error sending config to backend:', error);
      console.log("Error:", error);
      setIsLoading(false);
      setAlertIsVisible(true);
      setAlertHeader(<React.Fragment>Failed to Reach Server</React.Fragment>);
      setAlertContent("Failed to reach the server. Please ensure you have put in a proper URL. Try again after a few seconds");
    }
  }


  //Rating Functions
  //changes the rating of the blog post
  const changeRating = async (newRating, name) => {
    setRating(newRating);
    //check if rating has been submitted before
    if (!ratingSubmitted) {
      //create rating
      createRatingFunc(newRating, ratingBlogPostId);
      setRatingSubmitted(true);
    } else {
      //update rating
      mutateRatingFunc(newRating);
    }
  };

  //creates a rating for the blog post
  async function createRatingFunc(star, ratingBlogPostId) {
    try {
      //create rating
      const output = await API.graphql(graphqlOperation(createRating, {
        input: {
          id: ratingId,
          ratingBlogPostId: ratingBlogPostId,
          stars: star
        }
      }));
      setRatingId(output.data.createRating.id)
      console.log(output.data.createRating);
    } catch (error) {
      // log error to console in case of failure
      console.log("Rating not created:", error)
    }
  }

  //updates the rating of the blog post
  async function mutateRatingFunc(star) {
    try {
      //update rating
      const output = await API.graphql(graphqlOperation(updateRating, {
        input: {
          id: ratingId,
          stars: star,
          ratingBlogPostId: ratingBlogPostId,
        }
      }));
      console.log(output);
    } catch (error) {
      // log error to console in case of failure
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
        <Box variant="div" className={`left-side ${isLoading ? 'loading' : ''}`}>
          {isLoading ? (
              <ClipLoader color="#000000" loading={isLoading} size={50} />
          ) : (
              <TextContent variant="div" className="left-side-content">
                <div dangerouslySetInnerHTML={{ __html: originalPost }} />
              </TextContent>
          )}
        </Box>
        <div className="vertical-divider"></div>
        <Box variant="div" className={`right-side ${isLoading ? 'loading' : ''}`}>
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