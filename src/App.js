/** Desc: This is the main component of the application.
* Author: hyfrankl
*/
import React, { useState } from 'react';
import Form from './components/Form';
import { Configuration, OpenAIApi } from 'openai';
import { Histogram } from './components/Histogram';

/** The main component of the application
* @return {*} the main component
*/
function App() {
  /** Create state variables for response, submitView, jaccard,
  * query, api, inputText
  */
  // response: the response from the OpenAI API rendered with highlighting
  const [response, setResponse] = useState('Hello from ChatGPT!');
  // submitView: a boolean to determine whether to show the form or the response
  const [submitView, setSubmitView] = useState(true);
  // jaccard: the Jaccard similarity between the query and the response
  const [jaccard, setJaccard] = useState(-1);
  // query: the query that the user inputs
  const [query, setQuery] = useState('');
  // api: the API key that the user inputs
  const [api, setAPI] = useState('');
  // inputText: the text that contains the orignal response
  const [inputText, setInputText] = useState('');

  // Create the instructions text for ChatGPT to create a summary
  const text = `
    Please do the task step-by-step:
    1. summarize the following text.
    2. extract keywords or important concepts from the summary or
    the original text and output those words in a new paragraph
    at the end of the respoonse where each word is separated by
    a comma after "Keywords:".
  `;

  /** Create a function to generate a random pastel color
  * to avoid any dark colors that may be hard to read
  * @return {*} a random pastel color
  */
  const getRandomPastelColor = () => {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}deg, 100%, 90%)`;
  };

  /** Create a function to fetch the response from the OpenAI API
  * using the input text and the API key
  * @return {*} the response from the OpenAI API
  */
  const fetchResponse = async (input, apiKey) => {
    const config = new Configuration({ apiKey });
    const openai = new OpenAIApi(config);
    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: text },
        { role: 'user', content: input }
      ],
    });
  };

  // Create a function to clear the input text, query, and response in the form
  // and reset the jaccard similarity to -1 as well as the histogram
  const clearAll = () => {
    if (api !== '') {
      setAPI('');
    }
    if (query !== '') {
      setQuery('');
    }
    setJaccard(-1);
    setInputText('');
    setResponse('Hello from ChatGPT!');
  };

  // Create a function to handle highlighting the keywords
  // and return the highlighted text
  // implemented with regex and the Jaccard similarity
  const highlightKeywords = (keywords, text, query) => {
    let result = text;
    let q = query;
    let jaccardSim = 0;
    keywords.sort((a, b) => (b.length - a.length || a.localeCompare(b)));
    for (let keyword of keywords) {
      let color = getRandomPastelColor();
      let regWord = new RegExp(`\\b${keyword}\\b`, 'ig');
      if (result.match(regWord) && q.match(regWord)) {
        jaccardSim += 1;
      }
      result = result.replaceAll(
        regWord,
        `<mark style='background: ${color}!important'>$&</mark>`
      );
      q = q.replaceAll(
        regWord,
        `<mark style='background: ${color}!important'>$&</mark>`
      );
    }
    jaccardSim /= keywords.length;
    setJaccard(jaccardSim.toFixed(3));
    return [result, q];
  };

  // Create a function to display the response and
  // set state variables for response, query, and inputText.
  const displayResponse = async (input, api) => {
    const answer = await fetchResponse(input, api);
    let result = answer.data.choices[0].message.content;
    result = result.substring(0, result.length - 1);
    const paragraphs = result.split('\n\n').map((paragraph) => {
      return paragraph.trim().trimEnd('.');
    });
    const keywords = paragraphs[paragraphs.length - 1]
      .split(':')[1].split(',')
      .map((keyword) => {
        return keyword.trim();
      });
    const [r, q] = highlightKeywords(keywords, result, input);
    setResponse(<div dangerouslySetInnerHTML={{ __html: r }} />);
    setQuery(<div dangerouslySetInnerHTML={{ __html: q }} />);
    const words = result.toLowerCase().split(/\s+/);
    const wordLengthsCount = words.map((word) => word.length);
    setInputText(wordLengthsCount);
  };

  /** It handles the response to sumbit the form.
  * This function will call other functoins to handle
  * highlighting the keywords and fetching the response.
  */
  const handleSubmit = async () => {
    setJaccard(-1);
    setInputText('');
    try {
      if (query.length !== 0 && api.length !== 0) {
        setSubmitView(false);
        setResponse('Loading...');
        await displayResponse(query, api);
      } else {
        // Reset query to deal with empty query
        if (query.length !== 0) {
          setQuery(query);
        }
        // Reset api to deal with empty api
        if (api.length !== 0) {
          setAPI(api);
        }
        // Display error message
        setResponse(
          <mark>
            Please enter your API key and text to summarize.
          </mark>
        );
      }
    } catch (error) {
      // Display error message
      setResponse(<mark>{error.message}</mark>);
    }
  };

  // Create a function to show the form view
  const formView = (
    <div className="column todoapp stack-large">
      <h1>Simple Summarizer </h1>
      <h2 className="label-wrapper">
        <label htmlFor="password-input" className="label__lg">
          What needs to be done?
          ({(api !== '') ? 'Key Stored' : <a href="https://platform.openai.com/account/api-keys">Fetch API Key</a>})
        </label>
      </h2>
      <Form
        setQuery={setQuery}
        setAPI={setAPI}
        onSubmit={handleSubmit}
        clearAll={clearAll}
      />
      <div>
        <a href="https://github.com/frankling2020/react-chatgpt">Created by frankling 🐲</a>
      </div>
    </div>
  );

  // Create a function to show the input text view
  const resultView = (
    <div className="column todoapp stack-large scrollable">
      <h1>Original Text</h1>
      <button
        type="reset"
        className="btn btn__secondary btn__sm"
        onClick={(e) => {
          e.preventDefault();
          setQuery('');
          setSubmitView(true);
        }}
      >
        &#8701; Back
      </button>
      <div className="css-fix"> {query} </div>
    </div>
  );

  // Create a function to show the summary view with summary,
  // Jaccard similarity and histogram
  const jaccardView = (<div><em>Jaccard Similarity: {jaccard}</em></div>);
  const summaryView = (
    <div className="column todoapp stack-large scrollable">
      <h1>Summary and Keywords
        <div style={{ fontSize: 'medium', color: 'gray' }}>
          <em>
            For interpretation of analysis and visualization,
            see <a href="https://github.com/frankling2020/react-chatgpt#basic-rules-are">here</a>.
          </em>
        </div>
      </h1>
      {jaccard !== -1 && jaccardView}
      <div className="css-fix">
        {response}
      </div>
      {inputText.length !== 0 &&
        <div>
          <Histogram data={inputText} width={360} height={360} />
        </div>}
    </div>
  );

  // Return the form view if submitView is true, otherwise return
  // the result view
  return (
    <div>
      <div className="row">
        {submitView ? formView : resultView}
        {summaryView}
      </div>
    </div>

  );
}

export default App;
