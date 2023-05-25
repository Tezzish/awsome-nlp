import React, { useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import { createTranslationConfig } from './graphql/mutations';


/*
TODO: Read List Below
* Current Languages are Hard-Coded, these need to be received from available Languages via Backend
* Current Translators are Hard-Coded, these need to be received from available Translators via Backend
* LHS takes the url and spits out the page, this is currently possible for select pages (NOT AWS pages)
* RHS is hardcoded to wikipedia/CSS and is in no way a translation
* Translate button serves no functionality
* No Search Functionality Available
* No communication to backend
 */

function App() {
  const [URLValue, setURLValue] = useState("https://en.wikipedia.org/wiki/HTML");
  const [languageValue, setLanguageValue] = useState("Türkçe");
  const [translatorValue, setTranslatorValue] = useState("None");

  const [leftIframeSrc, setLeftIframeSrc] = useState("https://en.wikipedia.org/wiki/HTML");
  const [rightIframeSrc, setRightIframeSrc] = useState("https://en.wikipedia.org/wiki/HTML");


  const handleInputChangeURL = (e) => {
    setURLValue(e.target.value);
  };
  const handleInputChangeLanguage = (e) => {
    setLanguageValue(e.target.value);
  };
  const handleInputChangeTranslator = (e) => {
    setTranslatorValue(e.target.value);
  };

  //TODO: Currently we are displaying the same values for the left and right iframes
  const handleButtonClick = () => {
    const url = URLValue;
    const lang = languageValue;
    const translator = translatorValue;

    if (isValidURL(url)) {
      setLeftIframeSrc(url);
      setRightIframeSrc(url)
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

  async function sendConfigToBackend(url, language, translator) {
    console.log('sending config to backend: URL = {' + url + '}, Language = {' + language + '}, translator = {' + translator + '}')
    try {
      await API.graphql(graphqlOperation(translate, { input: { url, language, translator } }));
    } catch (error) {
      console.error('Error sending config to backend:', error);
    }
  }


  return (
      <div className="App">
        <div className="dropdown-container">
          <input id="blog" placeholder="AWS Blogpost (URL)" onChange={handleInputChangeURL} />
          <input list="languages" id="lang" placeholder="Target Language" onChange={handleInputChangeLanguage} />
          <datalist id="languages">
            <option value="Turkish - Türkçe" />
            <option value="Option B" />
          </datalist>
          <select id="translator" onChange={handleInputChangeTranslator}>
            <option value="Amazon Translate">Amazon Translate</option>
            <option value="AWSome-NLP">AWSome-NLP</option>
          </select>
          <div>
            <button id="translate" onClick={handleButtonClick}>Translate!</button>
          </div>
        </div>
        <div className="content-container">
          <iframe
              className="left-side"
              title="Left Content"
              src={leftIframeSrc}
          ></iframe>
          <iframe
              className="right-side"
              title="Translated Post"
              src={rightIframeSrc}
          ></iframe>
        </div>
      </div>
  );
}

export default App;
