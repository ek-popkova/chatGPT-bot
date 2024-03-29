import { Configuration, OpenAIApi } from 'openai'
import config from 'config';
import { createReadStream } from 'fs';
import { removeFile } from "../helpers/fileHelper.js";

const speachModel = 'whisper-1';
const chatModel = 'gpt-3.5-turbo';

class OpenAIService {
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
            console.log("Successfully retrieted a response from ChatGPT");
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
            console.log("Successfully transcripted a message using openai API");
            removeFile(filepath);
            return response.data.text;
        }
        catch (e) {
            console.log("Error while transcripting the voice from file", filepath, e.message);
        }
    }

    async createImage(description) {
        try {
            const response = await this.openai.createImage({
                prompt: description,
                size: '512x512',
                n: 1
            });
            console.log(response.data.data[0].url);
            return response.data.data[0].url;
        }
        catch (e) {
            console.log("Error while getting an image from chatGPT", e.message);
        }
        
    }
}

export const openaiService = new OpenAIService(config.get('OPENAI_KEY'));
