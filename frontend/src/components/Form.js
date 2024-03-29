import React from 'react';

/** Create a form with a text input and submit button
* when the form is submitted, call props.onSubmit
* and pass it the current value of the text input
* when the form is reset, call props.onReset
* and pass it the current value of the text input
* when the text input changes, call props.onChange
* and pass it the current value of the text input.
* @param {*} props the props that are passed to the form
* @return {Form} the form with api and text input and submit/reset button
*/
function Form(props) {
  const submitHandler = (e) => {
    e.preventDefault();
    const submit_name = e.nativeEvent.submitter.name;
    props.onSubmit(submit_name === 'stream');
    e.target.reset();
  };

  const handleAPIChange = (e) => {
    props.setAPI(e.target.value);
  };

  const handleQueryChange = (e) => {
    props.setQuery(e.target.value);
  };

  return (
    <form onSubmit={submitHandler}>
      <input
        type="password"
        id="password-input"
        className="input input__lg"
        name="text"
        placeholder="Enter your OpenAI API key here"
        autoComplete="off"
        value={props.api}
        onChange={handleAPIChange}
      />

      <textarea
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        placeholder="Enter your text here"
        rows="16"
        value={props.query}
        onChange={handleQueryChange}
      />
      <span>
        <button name="submit" type="submit" className="btn btn__primary btn__lg">
          Submit
        </button>
        <button name="stream" type="submit" className="btn btn__primary btn__lg">
          Stream
        </button>
        <button
          type="reset"
          className="btn btn__secondary btn__lg"
          onClick={props.clearAll}
        >
          Reset
        </button>
      </span>
    </form>
  );
}

export default Form;
