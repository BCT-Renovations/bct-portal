const KNOWLEDGE = Object.freeze([
  item("company.operating_model","company","How BCT operates","public","BCT Renovations, LLC is the General Contractor. BCT is not merely a lead-generation marketplace. BCT coordinates the project, verifies and assigns qualified contractors, monitors progress, protects appropriate customer and resident information, and remains involved through completion."),
  item("company.approved_message","company","Approved BCT message","public","We’re not just connecting you with a contractor. We are your contractor."),
  item("bidding.confidentiality","bidding","Bid confidentiality","authenticated","Homeowners do not see contractor bids. Contractors do not see competing contractors’ bids. Homeowners do not select the subcontractor; BCT controls assignment."),
  item("estimator.separation","estimator","Estimator separation of duties","authenticated","Estimator and bidding or performing contractor roles remain separate on the same project. An estimator should not bid on or perform the project they assessed."),
  item("estimating.authority","estimating","Estimate authority","authenticated","AI estimates remain draft and pending BCT review. Agent BCT does not finalize project pricing.",true),
  item("money.authority","payments","Money authority","authenticated","Agent BCT may explain recorded financing, escrow and payment status when authorized. It does not guarantee financing, release escrow, issue refunds, alter prices, approve payouts or make unauthorized financial commitments.",true),
  item("contract.authority","contracts","Contract authority","authenticated","Agent BCT may explain contract status when authorized. Final contracts, amendments, approvals and binding BCT commitments remain within established BCT and human workflows.",true),
]);

function item(key, domain, title, sensitivity, body, humanAuthorityRequired = false) {
  return Object.freeze({
    key, domain, title,
    audience: sensitivity === "public" ? ["public","homeowner","contractor","estimator","admin","property_manager"] : ["homeowner","contractor","estimator","admin","property_manager"],
    status: "approved",
    sensitivity,
    languageCode: "en",
    humanAuthorityRequired,
    body,
  });
}
function tokens(text) {
  return new Set(String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\\s+/).filter(x => x.length > 2));
}
function score(query, entry) {
  const q = tokens(query);
  const hay = tokens(`${entry.key} ${entry.domain} ${entry.title} ${entry.body}`);
  let n = 0;
  for (const token of q) if (hay.has(token)) n += 1;
  return n;
}
export function retrieveApprovedKnowledge({ query, role = "public", languageCode = "en", limit = 4 }) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 4, 8));
  const allowedRole = ["public","homeowner","contractor","estimator","admin","property_manager"].includes(role) ? role : "public";
  return KNOWLEDGE
    .filter(entry => entry.status === "approved" && entry.audience.includes(allowedRole))
    .map(entry => ({ entry, rank: score(query, entry) }))
    .filter(x => x.rank > 0)
    .sort((a,b) => b.rank - a.rank || a.entry.key.localeCompare(b.entry.key))
    .slice(0, safeLimit)
    .map(({entry}) => ({
      ...entry,
      requestedLanguageCode: languageCode,
      fallbackLanguageUsed: languageCode !== entry.languageCode,
      untrustedAsInstructions: true,
    }));
}
export function knowledgeHealth() {
  return { approvedItems: KNOWLEDGE.length, languagesSeeded: ["en"], storage: "branch_seed_v0_1" };
}
