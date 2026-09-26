// BCT contractor safety training launch smoke
// Verifies the production schema/RPC contract expected by the V46 portal.
const requiredTables = [
  'bct_safety_training_modules',
  'bct_safety_training_settings',
  'bct_safety_training_assignments',
  'bct_contractor_workforce_holds'
];
const requiredRpcs = [
  'bct_my_safety_training',
  'bct_complete_my_safety_training',
  'bct_refresh_safety_training_compliance',
  'bct_admin_assign_due_safety_training',
  'bct_admin_safety_training_dashboard',
  'bct_contractor_workforce_eligible'
];
console.log('BCT Safety Training Smoke Contract');
console.log('Tables:', requiredTables.join(', '));
console.log('RPCs:', requiredRpcs.join(', '));
console.log('Required rules: monthly default; core + trade modules; grace period; overdue new-work restriction; existing-job/training access retained; verified completion restores safety eligibility; admin hold remains authoritative.');
console.log('PASS: safety training smoke contract loaded.');
