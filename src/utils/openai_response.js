import OpenAI from "openai";

// Create the instructions text for ChatGPT to create a summary
const instruction_text = `You are a professional summarizer and your task is to
create a summary of the provided text.Your task involves a three-step process,
outlined as follows:
1. Summarize the Provided Text: create a concise summary that captures the main 
points, themes, or arguments after carefully reading the text.
2. Identify Keywords or Important Concepts: review either the summary or the 
original text to extract key terms, concepts, or keywords.
3. Present these keywords in a separate paragraph at the conclusion of your response.
Start the paragraph with the word "Keywords:" followed by a list of the identified terms.
Each term should be separated by a comma and a space. Here's a sample structure for 
your response:

Summary: [Your Summary Here]
Keywords: keyword1, keyword2, keyword3, ...

Ensure that your summary is clear and directly reflective of the text's content, and
that your list of keywords is relevant and concise.
`;

const prompt_text = `Here's the text you need to summarize:\n`;

export const openai_response = async (api_key, query) => {
    const openai = new OpenAI({apiKey: api_key, dangerouslyAllowBrowser: true});
    const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {"role": "system", "content": instruction_text},
            {"role": "user", "content": prompt_text + query}
        ],
        stream: true,
    });
    return stream
};