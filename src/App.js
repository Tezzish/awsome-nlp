import React, {useEffect, useState} from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {createTranslationJob} from './graphql/mutations';
import {listLanguages, listTranslationModels, translate} from "./graphql/queries";


/*NOTE: you may have noticed that there appears to be no languages or models for you to select. These must be added manually.
You can add these manually in AppSync and under the Queries Menu.
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
  const [URLValue, setURLValue] = useState("https://en.wikipedia.org/wiki/HTML");

  const [leftIframeSrc, setLeftIframeSrc] = useState("https://en.wikipedia.org/wiki/HTML");
  const [translatedContent, setTranslatedContent] = useState("");


  const handleInputChangeURL = (e) => {
    setURLValue(e.target.value);
  };

  const handleInputChangeLanguage = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleInputChangeModel = (e) => {
    setSelectedModel(e.target.value);
  };

  //TODO: Currently we are displaying the same values for the left and right iframes
  const handleButtonClick = (e) => {
    e.preventDefault();

    const url = URLValue;
    const lang = selectedLanguage;
    const translator = selectedModel;

    if (isValidURL(url)) {
      setLeftIframeSrc(url);
      //setRightIframeSrc(url)  you should update this to handle the translated content
      sendConfigToBackend(url, lang, translator)
    }
  };


  //TODO: Check if URL is a valid AWS URL.
  // Current implementation only check if it is a URL
  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
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

  const sendConfigToBackend = async (url, language, translationModel) => {
    try {
      const output = await API.graphql(graphqlOperation(translate, {
        input: {
          url: "https://aws.amazon.com/blogs/desktop-and-application-streaming/network-coverage-delivers-secure-operations-by-utilizing-amazon-end-user-computing-services/",
          targetLanguage: { name: "TURKISH", code: "tr" },
          sourceLanguage: { name: "ENGLISH", code: "en" },
          translationModel: { type: "amazonTranslate" }
        }
      }));

      console.log('send successful');

// This assumes your output is a string of translated text
      setTranslatedContent(JSON.stringify(output));

    } catch (error) {
      console.error('Error sending config to backend:', error);
    }
  };

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
          <iframe
              className="left-side"
              title="Left Content"
              src={leftIframeSrc}
          ></iframe>
          <div className="right-side" title="Translated Post">{translatedContent}</div>
        </div>
      </div>
  );
}

export default App;