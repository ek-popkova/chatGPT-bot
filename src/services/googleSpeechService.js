import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { writeFile } from 'fs/promises'

//absolute path to current directory
const _dirname = dirname(fileURLToPath(import.meta.url));


class GoogleSpeechService {
    //using REST-API, not a specific library
    async getToken() {
        const key = JSON.parse(
            //no async because it's a small local file
            readFileSync(resolve(_dirname, '../../config/google-credentials.json'), 'utf-8')
        );

        const token = jwt.sign(
            {
                iss: key.client_email,
                scope: 'https://www.googleapis.com/auth/cloud-platform',
                aud: 'https://www.googleapis.com/oauth2/v4/token',
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                iat: Math.floor(Date.now() / 1000),
            },
            key.private_key,
            { algorithm: 'RS256' }
        );

        const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token,
            }
        );
        
        return response.data.access_token;
    }

    async textToSpeech(text) {
        try {
            const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';

            const data = {
                input: { text },
                voice: {
                    languageCode: 'ru-RU',
                    name: 'ru-RU-Wavenet-C',
                },
                audioConfig: { audioEncoding: 'MP3' },
            };

            const accessToken = await this.getToken();
            console.log("Successfully got token");
            

            const response = await axios({
                url,
                method: 'POST',
                data,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            console.log("Successfully converted text to speech");
            return Buffer.from(response.data.audioContent, 'base64');            
        }
        catch (e) {
            console.log("Error while converting text to speech", e.message);
        }
    }
}

export const googleSpeechService = new GoogleSpeechService();
