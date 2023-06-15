import React, {useEffect, useState} from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {getBlogPostParsed, listLanguages, listTranslationModels, translate, getStepFunctionInvoker} from "./graphql/queries";


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

  const [translatedContent, setTranslatedContent] = useState({content: '' });



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

      const originalPost = output.lhs;
      const translatedPost = output.rhs;

      const leftWindow = document.getElementById('leftWindow');
      leftWindow.innerHTML = originalPost;

      const rightWindow = document.getElementById('rightWindow');
      rightWindow.innerHTML = translatedPost;      

      setTranslatedContent({ translatedPost});
    } catch (error) {
      console.error('Error sending config to backend:', error);
    }
  };


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
      console.error("Error:", error);
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
        console.error('Error fetching languages and models:', error);
      }
    };

    fetchLanguagesAndModels();
  }, []);

  


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
export default App;

// {/* <h2>{translatedContent.title}</h2>
//             <h3>{translatedContent.authors}</h3> */} 
//             {/* {translatedContent.content.split('\n').map((paragraph, index) => (
//                 <p key={index}>{paragraph}</p>
//             ))} */}