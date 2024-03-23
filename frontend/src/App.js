/** Desc: This is the main component of the application.
* Author: hyfrankl
*/
import React, { useState } from 'react';
import Form from './components/Form';
import { Histogram } from './components/Histogram';
import { postprocess } from './utils/postprocess';

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

  /** This function will call the OpenAI API to get the response.
   * @call "POST /api/submit" and "GET /api/result/:task_id"
   * @param {string} api - the API key
   * @param {string} query - the query
   * @return {Promise} the response from the OpenAI API
   * @throws {Error} if the API key is invalid
   */
  const defaultSubmit = async (api, query) => {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "api": api, "query": query })
    });
    const result = await response.json();
    console.log(result);
    const response2 = await fetch(`/api/result/${result.task_id}`);
    const data = await response2.json();
    setSubmitView(false);
    return data.content;
  };

  /** This function will call the OpenAI API to get the response.
   * @call "POST /api/stream"
   * @param {string} api - the API key
   * @param {string} query - the query
   * @return {Promise} the response from the OpenAI API
   */
  const streamSubmit = async (api, query) => {
    const response = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "api": api, "query": query })
    });
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    setSubmitView(false);
    let data = "";
    let done = false;
    do {
      const { value, done: doneReading } = await reader.read();
      if (doneReading) {
        done = true;
      }
      else {
        data += value;
        setResponse(data);
      }
    } while (!done);
    return data;
  };

  /** It handles the response to sumbit the form.
  * This function will call other functoins to handle
  * highlighting the keywords and fetching the response.
  */
  const handleSubmit = async (stream) => {
    setJaccard(-1);
    setWordCounts([]);
    if (query && api) {
      setResponse('Loading...');
      try {
        let data_content = "";
        if (stream) data_content = await streamSubmit(api, query);
        else data_content = await defaultSubmit(api, query);
        setResponse(data_content);

        const postprocessed_data = postprocess(data_content, query);
        setResponse(postprocessed_data.response);
        setQuery(postprocessed_data.query);
        setJaccard(postprocessed_data.jaccard_similarity);
        console.log(data_content);
        const words = data_content.toLowerCase().split(/\s+/);
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
