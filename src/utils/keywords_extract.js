export const keywords_extract = (data_content) => {
  const paragraphs = data_content.split('\n\n');
  const keywords = paragraphs[paragraphs.length - 1].trim().trimEnd('.')
    .split(':')[1].split(',')
    .map((keyword) => {
      return keyword.trim();
  });
  return keywords;
};  