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
  "beforeMeal": true or false,
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
  "dayMask": "7 character string of 1/0 representing Mon-Sun (generate based on medicineFrequency if possible)",
  "createdAt": "auto",
  "updatedAt": "auto"
}

Example dayMask meanings:
"1111111" = every day
"1111100" = Mon-Fri
"1000001" = Sun & Mon only

Example medicineFrequency meanings:
{
  "morning": 1,
  "afternoon": 1,
  "evening": 1
}

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
