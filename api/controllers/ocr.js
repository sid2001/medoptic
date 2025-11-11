const {generateContext, extractContent} = require("../services/gemini");

function parseResult(result) {
  const rawText = result.candidates[0].content.parts[0].text;
    const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  return JSON.parse(cleaned);
}
const ocr = async (req, res) => {
  try{
    console.log(req.file);
    const mimetype = 'image/png';
    const data = req.file.buffer;
    const context = generateContext(mimetype, data);
    const result = await extractContent(context);
    if(result.type === 'error') return res.status(500).json({type:'failed',message:'Something went wrong'});
    
    
    res.status(200).json({type:'success',message:'ocr completed',data: parseResult(result)});
  }catch(err){
    console.error(err);
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

exports.ocr = ocr