const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = {
    async generateResponse(userMessage, systemPrompt) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { 
                        role: 'user', 
                        parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:` }] 
                    }
                ]
            });
            return response.text;
        } catch (error) {
            console.error("Gemini 2.5 API Error:", error);
            return "Oops! I'm having a little trouble thinking right now. Please check #support! 🆘";
        }
    }
};





