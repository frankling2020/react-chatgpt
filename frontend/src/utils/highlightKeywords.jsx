import React from 'react';


/** Create a function to generate a random pastel color
* to avoid any dark colors that may be hard to read
* @return {*} a random pastel color
*/
const getRandomPastelColor = () => {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}deg, 100%, 90%)`;
};

// Create a function to handle highlighting the keywords
// and return the highlighted text
// implemented with regex and the Jaccard similarity
export const highlightKeywords = (keywords, text) => {
  let highlightedText = text;
  let seen_words = new Set();
  if (keywords.length > 0) {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'ig');
      if (text.match(regex)) {
        seen_words.add(keyword);
        const color = getRandomPastelColor();
        highlightedText = highlightedText.replaceAll(regex,
          `<mark style='background: ${color}'>$&</mark>`);
      }
    });
  }

  const highlighted_text = <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  return {"content": highlighted_text, "keywords": seen_words}
};