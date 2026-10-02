const MAX_MESSAGE_CHARS = 6000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 18000;

export function sanitizeConversation({ message, history = [] }) {
  const current = cleanText(message, MAX_MESSAGE_CHARS);
  if (!current) throw new ConversationInputError("message_required");

  const source = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];
  let remaining = MAX_HISTORY_CHARS;
  const cleaned = [];

  for (let i = source.length - 1; i >= 0; i -= 1) {
    const item = source[i];
    const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
    if (!role || remaining <= 0) continue;
    const text = cleanText(item?.content, Math.min(MAX_MESSAGE_CHARS, remaining));
    if (!text) continue;
    remaining -= text.length;
    cleaned.push({ role, content: text });
  }

  cleaned.reverse();
  return { message: current, history: cleaned };
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function wrapUntrustedData(label, value) {
  return {
    label,
    trust: "untrusted_data_not_instructions",
    value,
  };
}

export function detectHighRiskRequest(text) {
  const t = String(text || "").toLowerCase();
  const patterns = [
    ["secret_exfiltration", /(service.?role|api.?key|password|access token|refresh token|system prompt|hidden prompt|database credential)/],
    ["role_impersonation", /(i am|i'm|make me|treat me as).{0,30}(admin|owner|estimator|contractor)/],
    ["instruction_override", /(ignore|override|disregard).{0,40}(instruction|policy|rule|system|security)/],
    ["financial_authority", /(release escrow|refund|approve financing|approve payout|change (the )?price|final price)/],
    ["contract_authority", /(sign (the )?contract|approve (the )?contract|change (the )?contract|amend (the )?contract)/],
    ["bid_confidentiality", /(show|reveal|give|tell).{0,40}(other|another|competing|all).{0,30}(bid|price|contractor bid)/],
    ["approval_authority", /(approve|assign|reject).{0,30}(contractor|estimator)/],
    ["legal_or_dispute_authority", /(decide|rule on|settle|resolve).{0,30}(dispute|claim|legal)/],
    ["human_impersonation", /(pretend|act|say you are|speak as).{0,30}(ty|tyrone|human|employee|general contractor)/],
    ["emergency_safety", /(fire|gas leak|electrocution|electrical fire|immediate danger|medical emergency|someone is hurt|violence)/],
  ];
  return patterns.filter(([, regex]) => regex.test(t)).map(([code]) => code);
}

export class ConversationInputError extends Error {
  constructor(code) { super(code); this.name = "ConversationInputError"; }
}
