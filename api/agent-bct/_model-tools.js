export const MODEL_TOOL_SCHEMAS=Object.freeze([
  tool("service_list","List BCT services from the authoritative localized service catalog.",{languageCode:{type:"string",enum:["en","ar","zh","fr","ht","pt","ru","es","vi"]}},[]),
  tool("project_list","List the signed-in homeowner's BCT projects.",{},[]),
  tool("project_status","Get confirmed BCT status for one homeowner project number.",{projectNumber:{type:"string",maxLength:80}},["projectNumber"]),
  tool("notifications","List the signed-in user's BCT notifications.",{},[]),
  tool("project_files","List safe file metadata for an authorized homeowner project.",{projectId:{type:["string","null"],format:"uuid"}},[]),
  tool("project_schedule","List authorized homeowner project schedule events.",{},[]),
  tool("upcoming_schedule","List upcoming authorized homeowner schedule events.",{},[]),
  tool("estimates","List customer-safe estimates visible to the signed-in homeowner.",{},[]),
  tool("contract_summary","Summarize visible homeowner contract counts and totals.",{},[]),
  tool("financing_status","List recorded financing status visible to the signed-in homeowner. This does not approve or guarantee financing.",{},[]),
  tool("escrow_status","List recorded escrow status visible to the signed-in homeowner. This tool cannot release escrow.",{},[]),
  tool("payment_status","List recorded payment status visible to the signed-in homeowner. This tool cannot create, change, refund or approve payments.",{},[]),
  tool("contractor_dashboard","Get the signed-in contractor's own BCT dashboard summary.",{},[]),
]);

const MODEL_TO_INTERNAL=Object.freeze({
  service_list:"service.list",
  project_list:"project.list",
  project_status:"project.status",
  notifications:"notification.list",
  project_files:"project.files",
  project_schedule:"project.schedule",
  upcoming_schedule:"project.schedule.upcoming",
  estimates:"estimate.list",
  contract_summary:"contract.summary",
  financing_status:"financing.list",
  escrow_status:"escrow.list",
  payment_status:"payment.list",
  contractor_dashboard:"contractor.dashboard",
});

function tool(name,description,properties,required){
  return Object.freeze({
    type:"function",
    function:Object.freeze({
      name,description,
      parameters:Object.freeze({type:"object",properties:Object.freeze(properties),required:Object.freeze(required),additionalProperties:false}),
    }),
  });
}
export function internalToolName(modelName){return MODEL_TO_INTERNAL[modelName]||null;}
export function schemasForInternalTools(internalNames){
  const source=Array.isArray(internalNames)?internalNames:[];
  const allowed=new Set(source.filter(x=>typeof x==="string"));
  return MODEL_TOOL_SCHEMAS.filter(schema=>allowed.has(MODEL_TO_INTERNAL[schema.function.name]));
}
