import {React, useEffect, useState} from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {createTranslationJob} from './graphql/mutations';
import {getBlogPostParsed, listLanguages, listTranslationModels} from "./graphql/queries";



/*NOTE: you may have noticed that there appears to be no languages or models for you to select. These must be added manually.
You can add these manually in AppSync and under the Queries Menu.

If you want to add a Language:
mutation CreateLanguage {
  createLanguage(input: {
    name: "French"
  }) {
    id
    name
  }
}

If you want to add a Translation Model:
mutation CreateTranslationModel {
  createTranslationModel(input: {
    name: "Amazon Translate"
  }) {
    id
    name
  }
}


 */

/*
TODO: Read List Below
* LHS takes the url and spits out the page, this is currently possible for select pages (NOT AWS pages)
* RHS is hardcoded to wikipedia/CSS and is in no way a translation
* No Search Functionality Available
 */


Amplify.configure(awsExports);

function App() {

  const [languages, setLanguages] = useState([]);
  const [translationModels, setTranslationModels] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [URLValue, setURLValue] = useState();

  const [leftIframeSrc, setLeftIframeSrc] = useState();
  const [rightIframeSrc, setRightIframeSrc] = useState();

  const handleInputChangeURL = (e) => {
    setURLValue(e.target.value);
  };

  const handleInputChangeLanguage = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleInputChangeModel = (e) => {
    setSelectedModel(e.target.value);
  };
  
  const handleButtonClick = async(e) => {
    e.preventDefault();
    console.log("IT PRINTS BUTTON CLICKED IT PRINTS");
    try {
      // check if url starts with https://aws.amazon.com/blogs/aws/ then send to backend
      if(isValidURL(URLValue)) {
      sendOriginalToBackend(URLValue);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // sends the url of the original blog post to the backend to be parsed
  async function sendOriginalToBackend(url1) {
    console.log('sending original blog post url to backend: URL =' + url1);

    try {
      
      //url1 = "https://aws.amazon.com/blogs/aws/amazon-translate-now-supports-english-to-japanese-translation/"
      const response = await API.graphql(graphqlOperation(getBlogPostParsed,{  url: url1 }));
      console.log('response from backend: ', response);
      url1 = "https://aws.amazon.com/blogs/aws/amazon-translate-now-supports-english-to-japanese-translation/"
      const leftWindow = document.getElementById('leftWindow');
      leftWindow.innerHTML = response.data.getBlogPostParsed.file;
      return response;
    } catch (error) {
      console.error('Error sending original blog post to backend:', error);
    }
  }

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

  // useEffect(() => {
  //   const fetchLanguagesAndModels = async () => {
  //     try {
  //       const languagesData = await API.graphql(graphqlOperation(listLanguages));
  //       const modelsData = await API.graphql(graphqlOperation(listTranslationModels));

  //       console.log("Fetched languages: ", languagesData);
  //       console.log("Fetched models: ", modelsData);

  //       setLanguages(languagesData.data.listLanguages.items);
  //       setTranslationModels(modelsData.data.listTranslationModels.items);
  //     } catch (error) {
  //       console.error('Error fetching languages and models:', error);
  //     }
  //   };

  //   fetchLanguagesAndModels();
  // }, []);

  // const sendConfigToBackend = async (url, language, translationModel) => {
  //   try {
  //     await API.graphql(graphqlOperation(createTranslationJob, { input: { url, language, translationModel } }));
  //     console.log('send successful');
  //   } catch (error) {
  //     console.error('Error sending config to backend:', error);
  //   }
  // };


  return (
      <div className="App">
        <form>
          <div className="dropdown-container">
            <input id="url" placeholder="AWS Blogpost (URL)" onChange={handleInputChangeURL} />
            <select id="lang" placeholder="Target Language" onChange={handleInputChangeLanguage}>
              {languages.map((language) => (
                  <option key={language.id} value={language.name}>
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
              title="Translated Post"
              id="leftWindow"
          ></div>
          <iframe
              className="right-side"
              title="Translated Post"
              src={rightIframeSrc}
              key={rightIframeSrc}
          ></iframe>
        </div>
      </div>
  );
}

export default App;

