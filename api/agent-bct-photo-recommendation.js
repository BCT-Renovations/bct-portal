// Isolated Agent BCT photo recommendation endpoint.
// Requires OPENAI_API_KEY to perform external AI analysis. No publication capability exists here.
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).send('Method not allowed');
 if(!process.env.OPENAI_API_KEY)return res.status(503).send('Agent BCT AI provider is not enabled in this isolated test environment.');
 const {imageUrl,metadata={}}=req.body||{};
 if(!imageUrl)return res.status(400).send('Missing private image URL.');
 const prompt=`You are Agent BCT, a private photo teacher/recommender for BCT Renovations Admin. Analyze ONLY the supplied project photo for internal recommendation purposes. Never treat your recommendation as permission, publication approval, or a customer consent decision. Return JSON only with: suggested_category (one of Kitchen, Bathroom, Gutters, Siding, Roofing, Decks, Doors / Windows, Concrete, Interior, Exterior, Before, After, Other), category_confidence (0-100), photo_quality_score (0-100), marketing_value (high|medium|low|not_recommended), before_after_value (high|medium|low), workmanship_visibility (high|medium|low), marketing_recommendation (recommended|possible|not_recommended|review), reason (short explanation). Be conservative when image evidence is unclear. Metadata: ${JSON.stringify(metadata)}`;
 try{
  const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AGENT_BCT_PHOTO_MODEL||'gpt-6-luna',input:[{role:'user',content:[{type:'input_text',text:prompt},{type:'input_image',image_url:imageUrl}]}],text:{format:{type:'json_object'}}})});
  if(!upstream.ok)return res.status(502).send(await upstream.text());
  const data=await upstream.json();const parsed=JSON.parse(data.output_text);
  return res.status(200).json({...parsed,model_name:process.env.AGENT_BCT_PHOTO_MODEL||'gpt-6-luna',model_version:'responses-api',analysis_mode:'ai'});
 }catch(e){return res.status(500).send(e.message||'Agent BCT analysis failed.');}
}