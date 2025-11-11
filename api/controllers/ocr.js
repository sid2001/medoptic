const {generateContext, extractContent} = require("../services/gemini");
const ocr = async (req, res) => {
  try{
    console.log(req.file);
    const mimetype = "image/png";
    const data = req.file.buffer;
    const context = generateContext(mimetype, data);
    const result = await extractContent(context);
    res.status(200).json({type:'success',message:'ocr completed',data:result});
  }catch(err){
    console.error(err);
    res.status(500).json({type:'failed',message:'Something went wrong'});
  }
}

exports.ocr = ocr