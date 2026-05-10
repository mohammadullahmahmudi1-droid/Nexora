/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateMentorResponse = async (
  prompt: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  userMemory?: string,
  developerInfo?: string
) => {
  const model = "gemini-3-flash-preview";
  
  let systemInstruction = `You are Nexora, a smart AI mentor for Creators and Entrepreneurs. 
  Your goal is to help users grow their personal brand or business.
  
  DEVELOPER INFO:
  ${developerInfo ? `The developer/creator of Nexora is: ${developerInfo}. If users ask about your creator or developer, use this information.` : 'The developer information is currently private.'}

  CONTEXT:
  ${userMemory ? `User Context/Memory: ${userMemory}` : 'New user, no memory yet.'}
  
  MODES:
  1. Creator Mode: Focus on content creation, social media growth, viral hooks, scriptwriting, and community building.
  2. Entrepreneur Mode: Focus on business models, low-budget startups, market strategy, branding, and monetization.
  
  RESPONSE STRUCTURE (MANDATORY):
  1. 📘 Simple Explanation: Define the concept clearly.
  2. 🗺️ Step-by-Step Plan: A logical sequence of actions.
  3. 💡 Real Example: A concrete scenario or case study.
  4. ✅ Action List: Immediate tasks the user can do today.
  
  Be encouraging, professional, and practical. Keep formatting clean using Markdown.`;

  try {
    const customPromptSnap = await getDoc(doc(db, 'settings', 'ai_instructions'));
    if (customPromptSnap.exists() && customPromptSnap.data().prompt) {
      systemInstruction = customPromptSnap.data().prompt;
      // Inject dynamic info into custom prompt if placeholders exist (optional, but good)
      systemInstruction = systemInstruction
        .replace('${developerInfo}', developerInfo || 'Private')
        .replace('${userMemory}', userMemory || 'None');
    }
  } catch (err) {
    console.error("Error fetching custom AI prompt:", err);
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Something went wrong with the AI mentor. Please try again.";
  }
};

export const summarizeUserGoal = async (chatHistory: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Based on this chat history, summarize the user's main goals and interests (Creator or Entrepreneur) in 2-3 sentences.
  
  HISTORY:
  ${chatHistory}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "";
  }
};
