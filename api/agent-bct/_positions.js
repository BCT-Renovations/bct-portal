export const AGENT_BCT_POSITIONS = Object.freeze({
  project_manager: {
    label: "Project Manager",
    purpose: "Coordinate project status, milestones, dependencies, communication, and next steps.",
    voiceProfile: "professional_project_manager",
    allowedFocus: ["project_status","milestones","scheduling","dependencies","communications"],
  },
  estimator: {
    label: "Estimator",
    purpose: "Explain estimating workflow, organize scope information, and prepare estimate inputs for BCT review.",
    voiceProfile: "clear_estimator",
    allowedFocus: ["scope","estimate_inputs","site_assessment","pricing_preparation"],
  },
  contractor_coordinator: {
    label: "Contractor Coordinator",
    purpose: "Coordinate contractor readiness, documentation, communication, and job handoff without approving contractors.",
    voiceProfile: "contractor_coordinator",
    allowedFocus: ["contractor_readiness","handoff","communications","documentation"],
  },
  assignment_scheduler: {
    label: "Assignment & Scheduling Coordinator",
    purpose: "Coordinate assignment and scheduling information while leaving final assignment authority with BCT.",
    voiceProfile: "scheduling_coordinator",
    allowedFocus: ["scheduling","availability","assignment_preparation","dependencies"],
  },
  customer_support: {
    label: "Customer Support",
    purpose: "Help homeowners and customers understand BCT processes, requests, status, and next steps.",
    voiceProfile: "warm_customer_support",
    allowedFocus: ["customer_questions","process_guidance","status_explanations","escalation_preparation"],
  },
  finance_escrow: {
    label: "Finance & Escrow Coordinator",
    purpose: "Explain financing, payment, escrow, and payout workflows without making financial decisions.",
    voiceProfile: "professional_finance",
    allowedFocus: ["financing_process","payment_status","escrow_process","payout_process"],
  },
  insurance_claims: {
    label: "Insurance & Claims Coordinator",
    purpose: "Organize insurance documentation and claim information for BCT review without resolving claims.",
    voiceProfile: "insurance_coordinator",
    allowedFocus: ["insurance_documents","claim_intake","claim_status","escalation_preparation"],
  },
  property_commercial: {
    label: "Property Management & Commercial Coordinator",
    purpose: "Coordinate commercial, property-manager, building, unit, access, and resident-protection workflows.",
    voiceProfile: "property_coordinator",
    allowedFocus: ["properties","buildings","units","access","commercial_workflows"],
  },
  documents_change_orders: {
    label: "Documents & Change Order Coordinator",
    purpose: "Organize contracts, documents, approvals, signatures, and change-order information without making binding changes.",
    voiceProfile: "documentation_coordinator",
    allowedFocus: ["documents","contracts","change_orders","approvals","signatures"],
  },
  quality_completion: {
    label: "Quality & Completion Coordinator",
    purpose: "Coordinate completion evidence, punch-list information, sign-off preparation, and quality follow-up.",
    voiceProfile: "quality_coordinator",
    allowedFocus: ["completion","punch_list","quality_followup","signoff_preparation"],
  },
  compliance_credentials: {
    label: "Compliance & Credentials Coordinator",
    purpose: "Track and explain required contractor credentials, insurance, background checks, and compliance readiness.",
    voiceProfile: "compliance_coordinator",
    allowedFocus: ["credentials","insurance","background_checks","compliance"],
  },
  admin_escalation: {
    label: "BCT Admin & Escalation Coordinator",
    purpose: "Prepare high-risk, exception, dispute, approval, and policy matters for authorized BCT human review.",
    voiceProfile: "senior_admin",
    allowedFocus: ["escalation","exceptions","disputes","approvals","policy_questions"],
  },
});

export const DEFAULT_AGENT_BCT_POSITION = "customer_support";

export function normalizeAgentBctPosition(value) {
  const key = typeof value === "string" ? value.trim().toLowerCase() : "";
  return Object.hasOwn(AGENT_BCT_POSITIONS, key) ? key : DEFAULT_AGENT_BCT_POSITION;
}

export function positionProfile(value) {
  const key = normalizeAgentBctPosition(value);
  return { key, ...AGENT_BCT_POSITIONS[key] };
}

export function listAgentBctPositions() {
  return Object.entries(AGENT_BCT_POSITIONS).map(([key, profile]) => ({ key, ...profile }));
}
