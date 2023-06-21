import React, { useEffect, useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import { Amplify } from "aws-amplify";
import awsExports from './aws-exports';
import { listLanguages, listTranslationModels, getStepFunctionInvoker } from "./graphql/queries";
import { createRating, updateRating } from "./graphql/mutations";
import StarRatings from 'react-star-ratings';
export default App;

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




  const handleInputChangeURL = (e) => {
    setURLValue(e.target.value);
  };

  const handleInputChangeLanguage = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleInputChangeModel = (e) => {
    setSelectedModel(e.target.value);
  };


  const sendOriginalAndTranslated = async (url, sourceLanguage, targetLanguage, translationModel) => {
    try {
      console.log('sending config to backend')
      console.log(selectedLanguage)
      const output = await API.graphql(graphqlOperation(getStepFunctionInvoker, {
        input: {
          url: url,
          sourceLanguage: { name: "ENGLISH", code: "en" },
          targetLanguage: { name: "TURKISH", code: "tr" },
          translationModel: { type: "amazonTranslate" }
        }
      }));

      console.log('send successful');
      console.log(JSON.stringify(output))

      const originalPost = output.data.getStepFunctionInvoker.lhs;
      const translatedPost = output.data.getStepFunctionInvoker.rhs;

      const leftWindow = document.getElementById('leftWindow');
      leftWindow.innerHTML = originalPost;

      const rightWindow = document.getElementById('rightWindow');
      rightWindow.innerHTML = translatedPost;      

  //     setTranslatedContent({ translatedPost});
     } catch (error) {
       console.error('Error sending config to backend:', error);
     }
  // }}
  }

  //TODO: Currently we are displaying the same values for the left and right iframes
  const handleButtonClick = (e) => {
    e.preventDefault();
    console.log("Button Clicked");
    const url = URLValue;
    const sourceLanguage = { name: "ENGLISH", code: "en" };
    const targetLanguage = { name: "TURKISH", code: "tr" };
    const translator = selectedModel;
    try {
      // check if url starts with https://aws.amazon.com/blogs/aws/ then send to backend
      if(isValidURL(url)) {
      // calls the function to trigger step function 
      sendOriginalAndTranslated(url, sourceLanguage, targetLanguage, translator)
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
      <form>
        <div className="dropdown-container">
          <input id="url" placeholder="AWS Blogpost (URL)" onChange={handleInputChangeURL} />
          <select id="lang" placeholder="Target Language" onChange={handleInputChangeLanguage}>
            {languages.map((language) => (
              <option key={language.code} value={language.name}>
                {language.name}
              </option>
            ))}
          </select>
          <select id="model" onChange={handleInputChangeModel}>
            {translationModels.map((model) => (
              <option key={model.id} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          <div>
            <button id="translate" onClick={handleButtonClick}>Translate!</button>
          </div>
        </div>
        </form>
        <div className="content-container">
          <div
              className="left-side"
              id="leftWindow"
          ></div>
          <div className="right-side"
               id="rightWindow" 
          ></div>
        </div>
      </div>
  );
}
