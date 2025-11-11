const {GoogleGenAI} =  require("@google/genai");

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const context = `templateName: A short name to identify this prescription template.
doctorName: Full name of the doctor in the prescription.
medicineName: Name of the medicine prescribed.
medicineDose: The dosage strength (example: "500mg", "2ml", "10mg/5ml").
medicineFrequency: How often the medicine should be taken (example: "twice a day", "3 times daily").
medicineQuantity:
  morning:
    beforeMeal: true/false (whether to take before meal)
    count: number of tablets/doses in the morning
  afternoon:
    beforeMeal: true/false
    count: number of tablets/doses in the afternoon
  evening:
    beforeMeal: true/false
    count: number of tablets/doses in the evening
expiryDate: The date until the prescription is valid, if mentioned.
notes: Any additional instructions written by the doctor.
`;

function generateContext(mimetype = "text/plain", data) {
    return [
      {text: `${context}\nExtract the following details from the given document/image and output in JSON format in the same sequence.`},
      {
        inlineData: {
          mimetype,
          data
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
