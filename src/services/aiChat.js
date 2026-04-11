// src/services/aiChat.js — AI conversation partner service

import { textToSpeech, textToJyutping } from './api';
import { isAuthenticated } from './auth';
import { jyutpingToDisplay } from '../utils/jyutping';
import { logger } from '../utils/logger';

const SCENARIOS = [
  { id: 'restaurant', title: 'At a restaurant', description: 'Order food, ask for recommendations, get the bill', systemContext: 'You are a friendly Cantonese-speaking waiter at a local Hong Kong cha chaan teng.' },
  { id: 'taxi', title: 'In a taxi', description: 'Give directions, ask about fare, make small talk', systemContext: 'You are a friendly Cantonese-speaking taxi driver in Hong Kong.' },
  { id: 'market', title: 'At the wet market', description: 'Buy groceries, ask prices, bargain', systemContext: 'You are a friendly Cantonese-speaking vendor at a wet market in Hong Kong.' },
  { id: 'school', title: 'School pickup', description: 'Chat with other parents, talk to teachers', systemContext: 'You are a friendly Cantonese-speaking parent at a Hong Kong international school.' },
  { id: 'neighbor', title: 'Meeting a neighbor', description: 'Small talk in the lift or lobby', systemContext: 'You are a friendly Cantonese-speaking neighbor in a Hong Kong apartment building.' },
  { id: 'doctor', title: 'At the clinic', description: 'Describe symptoms, understand instructions', systemContext: 'You are a friendly Cantonese-speaking receptionist at a clinic in Hong Kong.' },
  { id: 'shop', title: 'Shopping for clothes', description: 'Ask about sizes, colors, prices', systemContext: 'You are a friendly Cantonese-speaking shop assistant in a clothing store.' },
];

/**
 * Get all available conversation scenarios.
 * @returns {Object[]}
 */
function getScenarios() {
  return SCENARIOS;
}

/**
 * Build the system prompt for the AI.
 * @param {Object} scenario
 * @returns {string}
 */
function buildSystemPrompt(scenario) {
  return [
    scenario.systemContext,
    'RULES:',
    '- Respond ONLY in colloquial Cantonese (written Cantonese, not Mandarin).',
    '- Keep each response to 1-2 short sentences maximum.',
    '- Use common everyday vocabulary appropriate for a beginner learner.',
    '- Be natural, warm, and encouraging.',
    '- If the user makes a mistake, gently continue the conversation.',
    '- Start with a natural greeting appropriate for the scenario.',
  ].join('\n');
}

/**
 * Send a message to the AI and get a response.
 * This uses a simple fetch to an AI endpoint.
 * @param {Object[]} messages - Conversation history
 * @param {Object} scenario
 * @returns {Promise<{chinese: string, jyutping: string, romanization: string, english: string}>}
 */
async function sendMessage(messages, scenario) {
  // For now, use a simple rule-based response system
  // In production, this would call Claude API or cantonese.ai chatbot
  const response = generateLocalResponse(messages, scenario);

  // Generate Jyutping for the response
  try {
    const jpResult = await textToJyutping(response.chinese);
    if (jpResult.success && jpResult.result) {
      const jp = jpResult.result.map(r => r.jyutping).join(' ');
      response.jyutping = jp;
      response.romanization = jyutpingToDisplay(jp);
    }
  } catch (err) {
    logger.warn('Failed to get jyutping for AI response', err);
  }

  return response;
}

/**
 * Generate TTS audio for an AI response.
 * @param {string} chinese
 * @returns {Promise<Blob|null>}
 */
async function generateResponseAudio(chinese) {
  if (!isAuthenticated()) return null;
  try {
    return await textToSpeech(chinese, {
      language: 'cantonese', speed: 0.9, outputExtension: 'mp3',
      voiceId: '99fb84cf-d081-4df6-8b8a-7165015a2f5d',
    });
  } catch (err) {
    logger.warn('Failed to generate AI response audio', err);
    return null;
  }
}

/**
 * Local response generator (fallback when no AI API).
 * @param {Object[]} messages
 * @param {Object} scenario
 * @returns {Object}
 */
function generateLocalResponse(messages, scenario) {
  const turnCount = messages.filter(m => m.role === 'assistant').length;
  const responses = SCENARIO_RESPONSES[scenario.id] || SCENARIO_RESPONSES.restaurant;
  const idx = Math.min(turnCount, responses.length - 1);
  return { ...responses[idx] };
}

const SCENARIO_RESPONSES = {
  restaurant: [
    { chinese: '你好！歡迎嚟！幾多位？', jyutping: '', romanization: '', english: 'Hello! Welcome! How many people?' },
    { chinese: '好，呢邊坐。想飲咩？', jyutping: '', romanization: '', english: 'Okay, sit here. What would you like to drink?' },
    { chinese: '好嘅！要唔要食嘢？', jyutping: '', romanization: '', english: 'Great! Would you like something to eat?' },
    { chinese: '好，等一陣。', jyutping: '', romanization: '', english: 'Okay, wait a moment.' },
    { chinese: '食得開心！有咩需要叫我。', jyutping: '', romanization: '', english: 'Enjoy your meal! Call me if you need anything.' },
  ],
  taxi: [
    { chinese: '你好！去邊度？', jyutping: '', romanization: '', english: 'Hello! Where to?' },
    { chinese: '好，知道喇。大概十五分鐘。', jyutping: '', romanization: '', english: 'Okay, got it. About 15 minutes.' },
    { chinese: '今日天氣唔錯。', jyutping: '', romanization: '', english: "The weather's nice today." },
    { chinese: '到喇！一共八十五蚊。', jyutping: '', romanization: '', english: "We're here! That's 85 dollars." },
    { chinese: '多謝！拜拜！', jyutping: '', romanization: '', english: 'Thanks! Bye!' },
  ],
  market: [
    { chinese: '靚女！買咩呀？', jyutping: '', romanization: '', english: 'Hey there! What are you buying?' },
    { chinese: '呢啲好新鮮。三十蚊一斤。', jyutping: '', romanization: '', english: 'These are very fresh. 30 dollars per catty.' },
    { chinese: '平啲啦！廿五蚊得唔得？', jyutping: '', romanization: '', english: 'Cheaper! How about 25 dollars?' },
    { chinese: '好啦好啦。仲要啲咩？', jyutping: '', romanization: '', english: 'Okay okay. Anything else?' },
    { chinese: '多謝幫襯！', jyutping: '', romanization: '', english: 'Thanks for your business!' },
  ],
  school: [
    { chinese: '你好呀！你個仔幾年級？', jyutping: '', romanization: '', english: 'Hello! What year is your child in?' },
    { chinese: '噢，同我個女同班呀！', jyutping: '', romanization: '', english: 'Oh, same class as my daughter!' },
    { chinese: '你哋住邊度？', jyutping: '', romanization: '', english: 'Where do you live?' },
    { chinese: '好近呀！得閒一齊飲茶。', jyutping: '', romanization: '', english: "That's close! Let's have tea sometime." },
    { chinese: '好呀！改日再傾。拜拜！', jyutping: '', romanization: '', english: "Sure! Chat later. Bye!" },
  ],
  neighbor: [
    { chinese: '早晨！你好嗎？', jyutping: '', romanization: '', english: 'Good morning! How are you?' },
    { chinese: '幾好呀。今日天氣好好。', jyutping: '', romanization: '', english: "Pretty good. The weather is nice today." },
    { chinese: '係呀！你出去邊度？', jyutping: '', romanization: '', english: "Yes! Where are you heading?" },
    { chinese: '噢，行街呀。開心啲！', jyutping: '', romanization: '', english: "Oh, going shopping. Have fun!" },
    { chinese: '拜拜！下次見！', jyutping: '', romanization: '', english: 'Bye! See you next time!' },
  ],
  doctor: [
    { chinese: '你好！有冇預約？', jyutping: '', romanization: '', english: 'Hello! Do you have an appointment?' },
    { chinese: '好，請坐。等一陣醫生見你。', jyutping: '', romanization: '', english: 'Okay, please sit. The doctor will see you shortly.' },
    { chinese: '邊度唔舒服？', jyutping: '', romanization: '', english: 'Where does it feel uncomfortable?' },
    { chinese: '知道喇。開啲藥俾你。', jyutping: '', romanization: '', english: 'I see. I will prescribe some medicine for you.' },
    { chinese: '飲多啲水，休息下。祝你早日康復！', jyutping: '', romanization: '', english: 'Drink more water and rest. Get well soon!' },
  ],
  shop: [
    { chinese: '歡迎！想搵咩？', jyutping: '', romanization: '', english: 'Welcome! What are you looking for?' },
    { chinese: '呢件幾好睇。你想試吓？', jyutping: '', romanization: '', english: 'This one looks nice. Want to try it on?' },
    { chinese: '有大碼同細碼。你著咩碼？', jyutping: '', romanization: '', english: 'We have large and small. What size do you wear?' },
    { chinese: '好啱你！今日打八折。', jyutping: '', romanization: '', english: 'Looks great on you! 20% off today.' },
    { chinese: '好，幫你包起佢。多謝！', jyutping: '', romanization: '', english: "Okay, I'll wrap it up for you. Thanks!" },
  ],
};

export { getScenarios, buildSystemPrompt, sendMessage, generateResponseAudio };
