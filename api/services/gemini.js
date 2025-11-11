const {GoogleGenAI} =  require("@google/genai");
require('dotenv').config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
// console.log("key ", process.env.GEMINI_API_KEY);
const context = `
Extract the prescription data and return ONLY JSON with NO explanation.
Match this exact schema:

{
  "doctorName": "string",
  "medicineName": "string",
  "beforeMeal": true or false defaults to true,
  "medicineFrequency": {
    "morning": quantity,
    "afternoon": quantity,
    "evening": quantity
  },
  "medicineDose": "string",
  "expiryDate": "YYYY-MM-DD or null",
  "medicineDuration": number (days) or null,
  "notes": "string or null",
  "name": "patient name string or null",
  "email": "patient email string or null",
}

Example medicineFrequency meanings:
{
  "morning": 1,
  "afternoon": 1,
  "evening": 1
}

Example Dose:
Dose: 100mg

Return ONLY JSON. No text. No comments. No backticks.
`;

function generateContext(mimeType = "text/plain", data) {
    return [
      {text: `${context}\nExtract only one medicine data.`},
      {
        inlineData: {
          mimeType,
          data: data.toString('base64')
        }
      }
    ];

}

async function extractContent(contents) {
    return ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    });
}
exports.generateContext = generateContext;
exports.extractContent = extractContent;
