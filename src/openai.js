import { Configuration, OpenAIApi } from 'openai'
import config from 'config';
import { createReadStream } from 'fs';
import { removeFile } from "./helpers.js";

const speachModel = 'whisper-1';
const chatModel = 'gpt-3.5-turbo';

class OpenAI {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages) { 
        try {
            const response = await this.openai.createChatCompletion({
                model: chatModel,
                messages
            })
            return response.data.choices[0].message;
        }
        catch (e)
        {
            console.log("Error while getting a response from ChatGPT", e.message);
        }
    }
    
    async transcription(filepath) { 
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filepath),
                speachModel
            );
            removeFile(filepath);
            return response.data.text;
        }
        catch (e) {
            console.log("Error while transcripting the voice from file", filepath, e.message);
        }
    }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'));
