import { keywords_extract } from './keywords_extract';
import { highlightKeywords } from './highlightKeywords';

export const postprocess = (data_content, query) => {
  const data_keywords = keywords_extract(data_content);
  const response_highlighted = highlightKeywords(data_keywords, data_content);
  const query_highlighted = highlightKeywords(data_keywords, query);
  const response_words = new Set(response_highlighted.keywords);
  const query_words = new Set(query_highlighted.keywords);
  const intersection = response_words.intersection(query_words);
  const union = response_words.union(query_words);
  const jaccard_similarity = union.size === 0 ? 0 : intersection.size / union.size;
  const postprocessed_data = {
    "response": response_highlighted.content,
    "query": query_highlighted.content,
    "jaccard_similarity": jaccard_similarity.toFixed(3),
  };
  return postprocessed_data;
};