import React, {useEffect, useState} from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {getBlogPostParsed, listLanguages, listTranslationModels, translate} from "./graphql/queries";


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

  const [translatedContent, setTranslatedContent] = useState({ title: '', authors: '', content: '' });



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
    console.log("Button Clicked");
    const url = URLValue;
    const lang = selectedLanguage;
    const translator = selectedModel;
    try {
      // check if url starts with https://aws.amazon.com/blogs/ then send to backend
      if(isValidURL(url)) {
      sendOriginalToBackend(url);
      sendConfigToBackend(url, lang, translator)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };



  // sends the url of the original blog post to the backend to be parsed
  async function sendOriginalToBackend(url1) {
    console.log('sending original blog post url to backend: URL =' + url1);
    try {
      const response = await API.graphql(graphqlOperation(getBlogPostParsed,{  url: url1 }));
      console.log('response from backend: ', response);
      const leftWindow = document.getElementById('leftWindow');
      leftWindow.innerHTML = response.data.getBlogPostParsed.file;
      return response;
    } catch (error) {
      console.error('Error sending original blog post to backend:', error);
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
        console.error('Error fetching languages and models:', error);
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

      setTranslatedContent({ title, authors, content });
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
          <div
              className="left-side"
              id="leftWindow"
          ></div>
          <div className="right-side">
            <h2>{translatedContent.title}</h2>
            <h3>{translatedContent.authors}</h3>
            {translatedContent.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
  );
}



function isValidURL(url) {  
  if(!url.startsWith("https://aws.amazon.com/blogs/")) return false;
  var request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.send();
  if (request.status === 200) {
      return true;
  }
  else {
      return false;
  }
}

// const urlExists = async url => {
//   // fetches the url and checks if the status code is 200
//   //try {
//     const response = await fetch(url, {
//       method: 'GET',
//       mode: 'no-cors'
//     });
//     return response.status != 404;
//   //}
//   // catch (err) {
//   //   return false;
//   // }
// }


// function isValidURL(url) {
//   if(!url.startsWith("https://aws.amazon.com/blogs/")) return false;
//   var request = new XMLHttpRequest();
//   request.open('GET', url, false);
//   request.send();
//   if (request.status === 200) {
//       return true;
//   }
//   else {
//       return false;
//   }
// }

export { isValidURL };
//export { urlExists };
export default App;

