import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const must=[
'bctSafetyTrainingPanel','Required Safety Training','workforce_eligible','New work restricted',
'Existing assigned-job access remains available','bctCompleteSafetyTraining',
'bct_complete_my_safety_training','p_assignment_id','p_acknowledged','p_quiz_score',
'You must acknowledge completion before submitting.','Enter a quiz score from 0 to 100.',
'Open Training','quiz_required','passing_score','grace_until','admin_hold',
'separate hold','Safety compliance is required before new jobs or bids are available.',
'No safety-training assignments are currently due.'
];
for(const marker of must){if(!html.includes(marker))throw new Error('Missing contractor safety UI marker: '+marker)}
console.log('BCT contractor safety UI smoke passed: '+must.length+' launch markers verified.');
