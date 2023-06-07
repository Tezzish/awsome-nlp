import React, { useEffect, useState } from "react";
import "./App.css";
import { API, graphqlOperation } from 'aws-amplify';
import { Amplify } from "aws-amplify";
import awsExports from './aws-exports';
import { getBlogPostParsed, listLanguages, listTranslationModels, translate } from "./graphql/queries";
import { createRating, updateRating } from "./graphql/mutations";
import StarRatings from 'react-star-ratings';


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

  var ratingid;
  var ratingBlogPostId;



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
      // check if url starts with https://aws.amazon.com/blogs/aws/ then send to backend
      if (isValidURL(url)) {
        sendOriginalToBackend(url);
        sendConfigToBackend(url, lang, translator)
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

  // sends the url of the original blog post to the backend to be parsed
  async function sendOriginalToBackend(url1) {
    console.log('sending original blog post url to backend: URL =' + url1);
    try {
      const response = await API.graphql(graphqlOperation(getBlogPostParsed, { url: url1 }));
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
      ratingBlogPostId = translatedPost.id;

      setTranslatedContent({ title, authors, content });
      setBackendFinished(true)
    } catch (error) {
      console.log('Error sending config to backend:', error);
    }
  };

  const [rating, setRating] = useState(0);


  const changeRating = (newRating, name) => {
    setRating(newRating);
    if (!ratingSubmitted) {
      createRatingFunc(newRating, ratingBlogPostId);
      setRatingSubmitted(true);
    } else {
      mutateRatingFunc(newRating, ratingBlogPostId);
    }
  };


  function createRatingFunc(star, ratingBlogPostId) {
    try {
      ratingid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      const rating = API.graphql(graphqlOperation(createRating, {
        input: {
          id: ratingid, 
          ratingBlogPostId: ratingBlogPostId,
          stars: star
        }
      }));
      console.log(rating);
    } catch (error) {
      console.log("Rating not created:", error)
    }
  }

  
  function mutateRatingFunc(star, ratingid) {
    try {
      const rating = API.graphql(graphqlOperation(updateRating, {
        input: {
          id: ratingid, 
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
        <div className="left-side" id="leftWindow"></div>
        <div className="right-side">
          <div>
            <h2>{translatedContent.title}</h2>
            <h3>{translatedContent.authors}</h3>
            {translatedContent.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {backendFinished && (
            <div className="rating-section">
              <h4>Rate this translation:</h4>
              <StarRatings
                rating={rating}
                starRatedColor="blue"
                changeRating={changeRating}
                numberOfStars={5}
                name='rating'
                starDimension="15px"
                starSpacing="3px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;