/** Desc: This is the main component of the application.
* Author: hyfrankl
*/
import React, { useState } from 'react';
import Form from './components/Form';
import { Histogram } from './components/Histogram';
import { highlightKeywords } from './utils/highlightKeywords';

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
  const [wordCounts, setWordCounts] = useState([]);

  // Create a function to clear the input text, query, and response in the form
  // and reset the jaccard similarity to -1 as well as the histogram
  const clearAll = () => {
    if (api !== '') setAPI('');
    if (query !== '') setQuery('');
    setJaccard(-1);
    setWordCounts([]);
    setResponse('Hello from ChatGPT!');
  };

  /** It handles the response to sumbit the form.
  * This function will call other functoins to handle
  * highlighting the keywords and fetching the response.
  */
  const handleSubmit = async () => {
    setWordCounts([]);
    setJaccard(-1);
    if (query && api) {
      setResponse('Loading...');
      try {
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "api": api, "query": query })
        });
        const data = await response.json();
        console.log(data);
        
        setSubmitView(false);
        setResponse(highlightKeywords(data.keywords, data.content));
        setQuery(highlightKeywords(data.keywords, query))
        setJaccard(data.jaccard);
        console.log(data.content);
        const words = data.content.toLowerCase().split(/\s+/);
        const wordLengthsCount = words.map((word) => word.length);
        setWordCounts(wordLengthsCount);
      } catch (error) {
        setResponse('Error: ' + error + " Most likely, the API key is invalid.");
        console.error('Error:', error);
      }
    } else {
      setResponse('Please enter your API key and text to summarize.');
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setQuery('');
    setSubmitView(true);
  };

  return (
    <div className="row">
      {submitView ? (
        <div className="column todoapp stack-large">
          <h1>Simple Summarizer</h1>
          <Form setQuery={setQuery} setAPI={setAPI} onSubmit={handleSubmit} clearAll={clearAll} />
          <div><a href="https://github.com/frankling2020/react-chatgpt">Created by frankling 🐲</a></div>
        </div>
      ) : (
        <div className="column todoapp stack-large scrollable">
          <h1>Original Text</h1>
          <button type="reset" className="btn btn__secondary btn__sm" onClick={handleBack}>&#8701; Back</button>
          <div className="css-fix">{query}</div>
        </div>
      )}
      <div className="column todoapp stack-large scrollable">
        <h1>Summary and Keywords</h1>
        {jaccard !== -1 && <div><em>Jaccard Similarity: {jaccard}</em></div>}
        <div className="css-fix">{response}</div>
        {wordCounts.length > 0 && <div> <Histogram data={wordCounts} width={360} height={360} /> </div>}
      </div>
    </div>
  );
}

export default App;
