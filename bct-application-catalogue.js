/* Approved October 16 intake source. Not activated in the portals until the
 * translation, rendering and private-upload integration gates pass. No I/O. */
(function(root){
'use strict';
const options=text=>text.split('|').map((label,index)=>({value:String(index+1),label}));
const yesNo='Yes|No', familiar='Yes|Somewhat|No', independent='Yes, independently|Yes, with assistance|No';
const years='Less than 1 year|1–3 years|4–7 years|8–15 years|More than 15 years';
const experience='Yes, extensive experience|Yes, limited experience|No';
const transportation='Yes, both|Transportation only|Tools only|Neither';
const q=(id,text,choices,type='single',followups=[])=>({id,text,type,required:true,...(choices?{options:options(choices)}:{}),followups});
const detail=(id,text,when)=>({id,text,type:'text',required:true,...(when?{when}:{})});
const multiple=(id,text,choices,when)=>({...q(id,text,choices,'multiple'),...(when?{when}:{})});
const upload=(id,text,when)=>({id,text,type:'document',required:true,category:'credential',...(when?{when}:{})});
const credential=trade=>q('credentials',trade,yesNo+'|Not required for my work/location|Apprentice under supervision','single',[
 detail('credential_details','License/registration/certification name or type, number, issuing authority, and expiration date (or explain if no expiration date applies).',{values:['1']}),
 upload('credential_documents','Upload supporting license, registration, or certification documentation.',{values:['1']}),
 detail('credential_scope','Describe the work and city/state where you believe a credential is not required. BCT must verify before approving assignments.',{values:['3']}),
 detail('credential_supervision','Name your supervisor and describe their relevant credentials and how your work is supervised.',{values:['4']})
]);
const insurance=()=>q('insurance',"Do you carry general liability insurance and workers' compensation coverage, or a valid exemption where applicable?",yesNo,'single',[
 detail('insurance_details','Coverage details and expiration dates.',{values:['1']}),
 {...upload('insurance_documents',"Upload general liability insurance and workers' compensation documentation or a valid exemption.",{values:['1']}),category:'insurance'}
]);
const portfolio=trade=>q('portfolio',`Can you provide photographs of previous ${trade} projects and at least three professional references?`,yesNo,'single',[
 {id:'work_portfolio',type:'portfolio',required:true,text:'Upload 5–10 photographs of your previous work. Each photograph needs a short description and your personal role. Apprentices or assistants may submit supervised work, identifying their responsibilities and supervisor. Apprentices with fewer than five photos may submit for BCT manual review, not automatic approval. Provide three professional references. All files must remain private for authorized BCT Admin review.',minimum:5,maximum:10,references:3,apprenticeManualReview:true}
]);
const agreement=()=>q('bct_procedures',"Are you willing to follow BCT Renovations' assigned-project procedures, approved pricing, safety standards, scheduling requirements, documentation rules, and administrative approval process?",yesNo);
const standard=estimator=>[
 q('service_area','Which cities and states do you serve?',null,'text'),
 q('availability','What is your availability, and when can you start accepting BCT assignments?',null,'text'),
 q('crew',estimator?'Will you work with an assessment team on BCT assignments?':'Will you use a crew on BCT projects?',yesNo,'single',[
  detail('crew_size','How many crew or team members will work on BCT assignments?',{values:['1']}),
  detail('crew_qualifications','Describe their training, experience, licenses or registrations where required, and who supervises them. Confirm members are qualified for their assigned tasks, including apprentices under proper supervision.',{values:['1']}),
  detail('subcontractor_verification','If using subcontractors, explain how you verify their qualifications, required licenses or registrations, and insurance. If none, state that.',{values:['1']})
 ]),
 q('essential_duties',estimator?'Can you perform the essential assessment duties safely, with or without reasonable accommodation?':'Can you perform the essential duties of your assigned work safely, with or without reasonable accommodation?',yesNo)
];
const titles={electrical:'Electrician',plumbing:'Plumber',general_contractor:'Contractor / Renovations',hvac:'HVAC',roofing:'Roofer',drywall:'Drywaller',concrete_masonry:'Concrete / Masonry',flooring:'Flooring',handyman_services:'Handyman',estimator:'Estimator'};
const core={
electrical:[
 q('experience','How many years of professional electrical experience do you have?',years),
 q('qualification','What is your current electrical qualification level?','Apprentice|Journeyman|Master Electrician|Electrical Contractor|Other (please explain)'),
 credential('Do you currently hold an active electrical license or registration where required?'),
 multiple('specialties','What types of electrical work do you specialize in? (Select all that apply.)','Residential|Commercial|Industrial|New construction|Remodeling and renovations|Troubleshooting and repairs'),
 multiple('services','Which electrical services can you competently perform? (Select all that apply.)','Electrical panel replacement/upgrades|Circuit breaker replacement|Wiring and rewiring|Outlet and switch installation|Lighting and ceiling fans|EV charging stations|Generator installation|Electrical inspections and troubleshooting'),
 q('codes','Are you familiar with the National Electrical Code (NEC) and applicable local electrical requirements?',familiar,'single',[detail('code_editions','Which code editions have you worked under?')]),
 q('plans','Can you read and interpret electrical blueprints, wiring diagrams, and construction plans?','Yes, independently|Yes, with some assistance|No'),
 q('diagnostics','Do you have experience diagnosing electrical problems using professional testing equipment?',yesNo,'single',[detail('testing_equipment','Which testing equipment do you regularly use?',{values:['1']})]),
 q('safety','Are you trained in electrical safety procedures, including lockout/tagout and proper personal protective equipment (PPE)?',yesNo,'single',[detail('safety_certifications','List any OSHA or other relevant safety certifications. If none, state that.')]),
 insurance(),
 q('tools','Do you have reliable transportation and the necessary professional electrical tools to complete assigned projects?',transportation),
 q('permits','Are you experienced in obtaining electrical permits and coordinating required inspections?',independent),
 portfolio('electrical'),
 multiple('project_size','What size electrical projects are you qualified and equipped to handle?','Small electrical repairs|Residential service calls|Complete residential rewiring|Electrical panel/service upgrades|Commercial electrical projects|Large electrical installations'),
 q('bct_procedures',"Are you willing to follow BCT Renovations' project requirements, safety standards, scheduling procedures, documentation rules, and assigned-project approval process?",yesNo)
],
plumbing:[
 q('experience','How many years of professional plumbing experience do you have?',years),
 q('qualification','What is your current plumbing qualification level?','Apprentice Plumber|Journeyman Plumber|Plumbing Contractor|Other (please explain)'),
 credential('Do you currently hold an active plumbing license?'),
 multiple('specialties','What types of plumbing projects do you specialize in? (Select all that apply.)','Residential plumbing|Commercial plumbing|New construction|Remodeling and renovations|Plumbing repairs and maintenance|Sewer and drain services'),
 multiple('services','Which plumbing services can you competently perform? (Select all that apply.)','Faucet, toilet, and sink installation|Water heater installation and replacement|Water supply line installation|Drain and sewer line repair|Garbage disposal installation|Shower and bathtub plumbing|Sump pump installation|Whole-house repiping'),
 q('codes','Are you familiar with Indiana plumbing codes and applicable local permit requirements?',familiar),
 q('plans','Can you read and interpret plumbing blueprints, construction drawings, and pipe layout diagrams?',independent),
 q('diagnostics','Do you have experience diagnosing plumbing problems using professional equipment?',yesNo,'single',[
  multiple('testing_equipment','If yes, select equipment used:','Drain cameras|Drain snakes and augers|Hydro-jetting equipment|Leak detection equipment|Pressure testing equipment',{values:['1']})
 ]),
 q('safety','Are you trained in plumbing safety procedures, including proper PPE, water shutoff, and safe equipment operation?',yesNo,'single',[detail('safety_certifications','List applicable safety certifications. If none, state that.')]),
 insurance(),
 q('tools','Do you have reliable transportation and the professional plumbing tools necessary to complete assigned projects?',transportation),
 q('permits','Do you have experience obtaining plumbing permits and coordinating required inspections?',independent),
 portfolio('plumbing'),
 multiple('project_size','What size plumbing projects are you qualified and equipped to complete?','Minor plumbing repairs|Residential service calls|Bathroom and kitchen remodeling|Water heater replacements|Whole-house plumbing installations|Sewer and underground plumbing|Large commercial plumbing projects'),
 q('bct_procedures',"Are you willing to follow BCT Renovations' project requirements, safety standards, scheduling procedures, documentation rules, and assigned-project approval process?",yesNo)
],
general_contractor:[
 q('experience','How many years of professional construction or general contracting experience do you have?',years),
 q('qualification','What best describes your current construction experience?','General Contractor|Residential Remodeling Contractor|Commercial Contractor|Construction Project Manager|Construction Supervisor|Other (please explain)'),
 credential('Do you currently hold an active general contractor license or registration where required?'),
 multiple('specialties','What types of construction projects do you specialize in? (Select all that apply.)','Residential renovations|Commercial renovations|New home construction|Room additions|Kitchen and bathroom remodeling|Exterior renovations|Structural repairs|Property restoration'),
 multiple('services','Which construction services can you competently perform or supervise? (Select all that apply.)','Framing and carpentry|Drywall installation and finishing|Flooring installation|Roofing and siding|Windows and doors|Decks and porches|Concrete and masonry|Painting and finishing|Plumbing and electrical coordination'),
 q('codes','Are you familiar with applicable building codes, permit requirements, and construction regulations?',familiar),
 q('plans','Can you read and interpret construction blueprints, architectural drawings, and project specifications?',independent),
 q('estimating','Do you have experience preparing construction estimates, calculating material quantities, and managing project budgets?',independent),
 q('supervision','Do you have experience managing construction crews and coordinating subcontractors?',experience),
 insurance(),
 q('tools','Do you have reliable transportation, necessary construction equipment, and access to qualified workers for assigned projects?','Yes, all three|Transportation and equipment only|Transportation only|Other (please explain)'),
 q('permits','Do you have experience obtaining building permits, scheduling inspections, and ensuring construction projects meet applicable requirements?',independent),
 portfolio('construction'),
 multiple('project_size','What size construction projects are you qualified and equipped to complete? (Select all that apply.)','Small residential repairs|Single-room renovations|Kitchen and bathroom remodeling|Whole-house renovations|Residential additions|New residential construction|Commercial renovations|Large construction projects'),
 q('bct_procedures',"Are you willing to follow BCT Renovations' project assignments, approved pricing, schedules, safety requirements, documentation procedures, and administrative approval process?",yesNo)
],
hvac:[
 q('experience','How many years of professional HVAC experience do you have?',years),
 q('qualification','What best describes your current HVAC qualification level?','HVAC Apprentice|HVAC Service Technician|HVAC Installer|HVAC Lead Technician|HVAC Contractor / Business Owner|Other (please explain)'),
 credential('Do you currently hold any HVAC licenses, registrations, or professional certifications?'),
 multiple('specialties','What types of HVAC projects do you specialize in? (Select all that apply.)','Residential heating and cooling|Commercial HVAC|New construction installations|HVAC remodeling and retrofits|HVAC repairs and maintenance|Ventilation and indoor air quality'),
 multiple('services','Which HVAC services can you competently perform? (Select all that apply.)','Furnace installation and repair|Central air conditioning installation and repair|Heat pump installation and repair|Mini-split system installation|Ductwork installation and repair|Thermostat installation|Boiler and hydronic heating services|Preventive maintenance and system inspections'),
 q('epa608','Do you currently hold an EPA Section 608 refrigerant certification?','Universal|Type I|Type II|Type III|No certification','single',[upload('epa608_document','If certified, upload documentation.',{values:['1','2','3','4']})]),
 q('plans','Can you read and interpret HVAC blueprints, mechanical drawings, wiring diagrams, and equipment specifications?',independent),
 q('diagnostics','Do you have experience diagnosing HVAC problems using professional testing and diagnostic equipment?',yesNo,'single',[
  multiple('testing_equipment','If yes, select equipment used:','Refrigerant gauges|Multimeters|Manometers|Combustion analyzers|Vacuum pumps and micron gauges|Airflow measurement instruments',{values:['1']})
 ]),
 q('safety','Are you trained in HVAC safety procedures, including electrical safety, refrigerant handling, gas safety, and proper personal protective equipment (PPE)?',familiar,'single',[detail('safety_certifications','List relevant safety training or certifications. If none, state that.')]),
 insurance(),
 q('tools','Do you have reliable transportation and the professional HVAC tools necessary to complete assigned projects?',transportation),
 q('codes','Are you familiar with HVAC installation codes, mechanical permits, equipment requirements, and required inspections?',independent),
 portfolio('HVAC'),
 multiple('project_size','What size HVAC projects are you qualified and equipped to complete? (Select all that apply.)','Minor HVAC repairs|Residential service calls|Furnace and air conditioner replacements|Complete residential HVAC installations|Ductwork replacement and installation|Commercial HVAC installations|Large HVAC system replacements|Multi-unit property HVAC projects'),
 agreement()
],
roofing:[
 q('experience','How many years of professional roofing experience do you have?',years),
 q('qualification','What best describes your current roofing qualification level?','Roofing Apprentice / Helper|Roofing Installer|Experienced Roofer|Lead Roofer / Crew Supervisor|Roofing Contractor / Business Owner|Other (please explain)'),
 credential('Do you currently hold any roofing licenses, registrations, or professional certifications?'),
 multiple('specialties','What types of roofing projects do you specialize in? (Select all that apply.)','Residential roofing|Commercial roofing|New construction roofing|Roof replacements|Roof repairs and maintenance|Storm and hail damage restoration|Flat and low-slope roofing'),
 multiple('materials','Which roofing systems and materials can you competently install or repair? (Select all that apply.)','Asphalt shingles|Metal roofing|Tile roofing|Slate roofing|Wood shingles and shakes|TPO roofing|EPDM rubber roofing|Modified bitumen roofing|Built-up roofing systems'),
 multiple('services','Which roofing services can you competently perform? (Select all that apply.)','Complete roof tear-offs and replacements|Roof leak detection and repair|Roof decking replacement|Flashing installation and repair|Roof ventilation installation|Skylight installation and sealing|Chimney flashing repairs|Roof underlayment installation|Emergency roof tarping'),
 q('plans','Can you read and interpret roofing plans, construction drawings, manufacturer installation instructions, and roof measurements?',independent),
 q('diagnostics','Do you have experience inspecting roofs, identifying damage, and determining necessary repairs?',independent,'single',[
  multiple('inspection_experience','If yes, select applicable experience:','Storm damage inspections|Water leak investigations|Structural decking damage|Flashing failures|Ventilation problems|Roof aging and deterioration',{values:['1','2']})
 ]),
 q('safety','Are you trained in roofing safety procedures, including fall protection, ladder safety, and proper personal protective equipment (PPE)?',familiar,'single',[detail('safety_certifications','List relevant OSHA training or safety certifications. If none, state that.')]),
 insurance(),
 q('tools','Do you have reliable transportation, professional roofing tools, and access to the equipment necessary to complete assigned projects?','Yes, all three|Transportation and tools only|Transportation only|Other (please explain)'),
 q('codes','Are you familiar with applicable roofing building codes, permit requirements, manufacturer specifications, and required inspections?',independent),
 portfolio('roofing'),
 multiple('project_size','What size roofing projects are you qualified and equipped to complete? (Select all that apply.)','Minor roof repairs|Residential roof inspections|Small residential roof replacements|Complete residential roof replacements|Large residential roofing projects|Commercial roofing repairs|Complete commercial roof installations|Multi-building roofing projects'),
 agreement()
],
drywall:[
 q('experience','How many years of professional drywall experience do you have?',years),
 q('qualification','What best describes your current drywall qualification level?','Drywall Apprentice / Helper|Drywall Installer / Hanger|Drywall Finisher / Taper|Experienced Drywall Installer and Finisher|Drywall Crew Leader / Supervisor|Drywall Contractor / Business Owner|Other (please explain)'),
 credential('Do you currently hold any contractor licenses, registrations, or professional certifications applicable to drywall work?'),
 multiple('specialties','What types of drywall projects do you specialize in? (Select all that apply.)','Residential drywall installation|Commercial drywall installation|New construction|Remodeling and renovations|Drywall repairs and patching|Water-damaged drywall replacement|Fire-damaged drywall restoration|Ceiling drywall installation'),
 multiple('installation','Which drywall installation services can you competently perform? (Select all that apply.)','Hanging drywall sheets|Measuring and cutting drywall|Installing moisture-resistant drywall|Installing mold-resistant drywall|Installing fire-rated drywall systems|Ceiling drywall installation|Curved walls and specialty drywall|Soundproof drywall installation|Drywall repairs and patching'),
 multiple('finishing','Which drywall finishing services can you competently perform? (Select all that apply.)','Drywall taping|Applying joint compound|Installing corner bead|Sanding and smoothing|Level 3 drywall finishing|Level 4 drywall finishing|Level 5 drywall finishing|Skim coating|Matching existing wall and ceiling textures'),
 q('codes','Are you familiar with applicable building codes, fire-rated wall assemblies, manufacturer installation instructions, and drywall finishing standards?',familiar),
 q('plans','Can you read and interpret construction blueprints, drywall layout plans, wall measurements, and material specifications?',independent),
 q('diagnostics','Do you have experience identifying and repairing drywall damage?',experience,'single',[
  multiple('damage_types','Which types of damage can you repair? (Select all that apply.)','Water damage|Cracks and settlement damage|Holes and impact damage|Nail pops|Damaged drywall seams|Ceiling damage|Fire-damaged drywall|Drywall damage associated with mold or moisture problems',{values:['1','2']})
 ]),
 q('safety','Are you trained in drywall safety procedures, including dust control, ladder safety, proper lifting techniques, and personal protective equipment (PPE)?',familiar,'single',[
  {...multiple('safety_certifications','List any applicable safety training or certifications:','OSHA 10|OSHA 30|Silica dust awareness|Respiratory protection training|Lead-safe renovation training|Other (please explain)'),required:false}
 ]),
 insurance(),
 q('tools','Do you have reliable transportation and the tools and equipment necessary to complete assigned drywall projects?',transportation,'single',[
  {...multiple('equipment','Which equipment do you have access to? (Select all that apply.)','Drywall screw guns|Drywall lifts|Taping tools|Automatic taping tools|Sanding equipment|Dust extraction equipment|Scaffolding or appropriate work platforms'),required:false}
 ]),
 portfolio('drywall'),
 multiple('project_size','What size drywall projects are you qualified and equipped to complete? (Select all that apply.)','Small drywall patches|Single-room drywall repairs|Bathroom and kitchen remodeling|Whole-house drywall installation|Ceiling drywall installation|Basement finishing|Multi-family residential projects|Commercial drywall installation|Large commercial construction projects'),
 agreement()
],
concrete_masonry:[
 q('experience','How many years of professional concrete or masonry experience do you have?',years),
 q('qualification','What best describes your current qualification level?','Concrete / Masonry Apprentice or Helper|Concrete Finisher|Concrete Form Setter|Bricklayer / Mason|Concrete / Masonry Crew Leader or Supervisor|Concrete / Masonry Contractor / Business Owner|Other (please explain)'),
 credential('Do you currently hold any contractor licenses, registrations, or professional certifications applicable to concrete or masonry work?'),
 multiple('specialties','What types of concrete or masonry projects do you specialize in? (Select all that apply.)','Residential concrete|Commercial concrete|New construction|Concrete repairs and restoration|Brick and block masonry|Decorative and stamped concrete|Structural concrete|Foundation and basement work|Retaining walls and hardscaping'),
 multiple('concrete_services','Which concrete services can you competently perform? (Select all that apply.)','Driveway installation and replacement|Sidewalks and walkways|Patios and concrete slabs|Concrete steps and porches|Garage floors|Concrete foundations and footings|Concrete forming and pouring|Concrete leveling and repairs|Concrete drainage slopes|Reinforced concrete installation'),
 multiple('masonry_services','Which masonry services can you competently perform? (Select all that apply.)','Brick installation and repair|Concrete block (CMU) installation|Stone masonry|Mortar tuckpointing and repointing|Chimney masonry repairs|Brick and stone veneers|Retaining wall construction|Masonry waterproofing|Masonry restoration|Masonry foundation repairs'),
 q('codes','Are you familiar with applicable building codes, concrete installation standards, reinforcement requirements, and local permit regulations?',familiar),
 q('plans','Can you read and interpret construction blueprints, concrete plans, foundation drawings, reinforcement details, and masonry specifications?',independent),
 q('site_preparation','Do you have experience preparing job sites and installing proper concrete forms, reinforcement, and base materials?',experience,'single',[
  multiple('preparation_tasks','Which tasks can you perform? (Select all that apply.)','Excavation and grading|Soil and base preparation|Compaction|Concrete form installation|Rebar installation|Wire mesh reinforcement|Vapor barrier installation|Control and expansion joints|Drainage slope preparation',{values:['1','2']})
 ]),
 q('safety','Are you trained in concrete and masonry safety procedures, including silica dust control, excavation safety, equipment operation, and personal protective equipment (PPE)?',familiar,'single',[
  {...multiple('safety_certifications','List any applicable safety training or certifications:','OSHA 10|OSHA 30|Silica exposure prevention|Excavation and trench safety|Heavy equipment operation|Other (please explain)'),required:false}
 ]),
 insurance(),
 q('tools','Do you have reliable transportation and access to the tools and equipment necessary to complete assigned concrete or masonry projects?','Yes, both|Transportation only|Tools / equipment only|Neither','single',[
  {...multiple('equipment','Which equipment do you have access to? (Select all that apply.)','Concrete mixers|Concrete finishing tools|Power trowels|Concrete saws|Plate compactors|Concrete vibrators|Masonry saws and tools|Excavation equipment|Concrete pumping equipment'),required:false}
 ]),
 portfolio('concrete or masonry'),
 multiple('project_size','What size concrete or masonry projects are you qualified and equipped to complete? (Select all that apply.)','Minor concrete and masonry repairs|Residential sidewalks and walkways|Driveways and patios|Concrete steps and porches|Residential foundations and footings|Basement and garage concrete floors|Brick and block construction|Retaining walls|Commercial concrete installations|Large structural concrete or masonry projects'),
 agreement()
],
flooring:[
 q('experience','How many years of professional flooring experience do you have?',years),
 q('qualification','What best describes your current flooring qualification level?','Flooring Apprentice / Helper|Flooring Installer|Experienced Flooring Installer|Flooring Specialist / Technician|Flooring Crew Leader / Supervisor|Flooring Contractor / Business Owner|Other (please explain)'),
 credential('Do you currently hold any contractor licenses, registrations, or professional flooring certifications?'),
 multiple('specialties','What types of flooring projects do you specialize in? (Select all that apply.)','Residential flooring|Commercial flooring|New construction|Remodeling and renovations|Flooring repairs and restoration|Water-damaged flooring replacement|Decorative and specialty flooring|Large commercial flooring installations'),
 multiple('materials','Which flooring materials can you competently install? (Select all that apply.)','Solid hardwood|Engineered hardwood|Luxury vinyl plank (LVP)|Luxury vinyl tile (LVT)|Laminate flooring|Ceramic tile|Porcelain tile|Natural stone tile|Carpet|Sheet vinyl|Bamboo flooring|Epoxy flooring'),
 multiple('services','Which flooring services can you competently perform? (Select all that apply.)','Flooring removal and replacement|Subfloor preparation and repairs|Hardwood floor installation|Hardwood sanding and refinishing|Vinyl and laminate installation|Tile installation and grouting|Carpet installation and stretching|Stair and landing flooring|Baseboard and transition installation|Waterproof flooring installation|Floor leveling'),
 q('codes','Are you familiar with manufacturer installation requirements, flooring industry standards, building codes, and applicable local regulations?',familiar),
 q('plans','Can you accurately measure flooring areas, calculate material quantities, and interpret construction plans or flooring layout drawings?',independent),
 q('site_preparation','Do you have experience inspecting and preparing subfloors before flooring installation?',experience,'single',[
  multiple('preparation_tasks','Which tasks can you perform? (Select all that apply.)','Subfloor moisture testing|Concrete moisture testing|Subfloor leveling|Subfloor repairs and replacement|Underlayment installation|Vapor barrier installation|Identifying water damage|Correcting uneven surfaces',{values:['1','2']})
 ]),
 q('safety','Are you trained in flooring installation safety procedures, including dust control, tool safety, chemical handling, and proper personal protective equipment (PPE)?',familiar,'single',[
  {...multiple('safety_certifications','List any applicable safety training or certifications:','OSHA 10|OSHA 30|Silica dust safety|Respiratory protection training|Adhesive and chemical handling|Lead-safe renovation training|Other (please explain)'),required:false}
 ]),
 insurance(),
 q('tools','Do you have reliable transportation and access to professional flooring tools and equipment necessary to complete assigned projects?','Yes, both|Transportation only|Tools / equipment only|Neither','single',[
  {...multiple('equipment','Which equipment do you have access to? (Select all that apply.)','Flooring saws and cutting tools|Tile wet saws|Floor sanders and buffers|Flooring nailers and staplers|Carpet stretchers|Floor leveling equipment|Moisture meters|Dust extraction equipment|Floor grinders'),required:false}
 ]),
 portfolio('flooring'),
 multiple('project_size','What size flooring projects are you qualified and equipped to complete? (Select all that apply.)','Minor flooring repairs|Single-room flooring installation|Kitchen and bathroom flooring|Whole-house flooring installation|Hardwood floor refinishing|Multi-family residential flooring|Commercial flooring installation|Large commercial flooring projects|Specialty flooring installations'),
 agreement()
],
handyman_services:[
 q('experience','How many years of professional handyman or home repair experience do you have?',years),
 q('qualification','What best describes your current handyman qualification level?','Handyman Apprentice / Helper|General Handyman|Experienced Handyman|Home Maintenance Technician|Multi-Skilled Handyman|Handyman Business Owner|Other (please explain)'),
 credential('Do you currently hold any contractor licenses, registrations, or professional certifications applicable to the services you perform?'),
 multiple('specialties','What types of handyman projects do you specialize in? (Select all that apply.)','Residential home repairs|Rental property maintenance|Commercial property maintenance|Apartment and condominium repairs|Home improvement projects|Preventive property maintenance|Move-in and move-out repairs|Senior homeowner maintenance services'),
 multiple('services','Which handyman services can you competently perform? (Select all that apply.)','Drywall patching and repairs|Interior and exterior painting|Door and lock repairs|Window hardware and minor repairs|Cabinet and shelving installation|Furniture assembly|Trim and molding installation|Flooring repairs|Caulking and weatherstripping|Gutter cleaning|Deck and fence repairs|Minor plumbing fixture maintenance|Minor electrical fixture maintenance, where legally permitted'),
 multiple('specialized_services','Which specialized repair or installation services can you perform? (Select all that apply.)','TV wall mounting|Ceiling fan installation, where legally permitted|Light fixture replacement, where legally permitted|Faucet replacement, where legally permitted|Toilet repairs, where legally permitted|Garbage disposal replacement, where legally permitted|Appliance installation|Bathroom accessories installation|Pressure washing|Weatherproofing and sealing|Accessibility improvements, such as grab bars'),
 q('codes','Are you familiar with applicable building codes, safety requirements, and the licensing limitations of handyman work?',familiar),
 q('plans','Can you accurately measure work areas, calculate materials, follow installation instructions, and interpret basic construction drawings?',independent),
 q('diagnostics','Do you have experience diagnosing common household maintenance and repair problems?',experience,'single',[
  multiple('problem_types','Which problems can you identify? (Select all that apply.)','Drywall damage|Door and window problems|Water leaks and moisture damage|Damaged flooring|Cabinet and hardware problems|Gutter and drainage problems|Deck and fence deterioration|Caulking and weatherproofing failures',{values:['1','2']})
 ]),
 q('safety','Are you trained in handyman safety procedures, including ladder safety, power tool operation, dust control, and proper personal protective equipment (PPE)?',familiar,'single',[
  {...multiple('safety_certifications','List any applicable safety training or certifications:','OSHA 10|OSHA 30|Ladder safety|Power tool safety|Lead-safe renovation training|Other (please explain)'),required:false}
 ]),
 insurance(),
 q('tools','Do you have reliable transportation and the tools necessary to complete assigned handyman projects?',transportation,'single',[
  {...multiple('equipment','Which equipment do you have access to? (Select all that apply.)','Power drills and drivers|Hand tools|Ladders|Saws and cutting tools|Painting equipment|Drywall repair tools|Flooring repair tools|Measuring and leveling tools|Pressure washing equipment|Other (please explain)'),required:false}
 ]),
 portfolio('handyman'),
 multiple('project_size','What size handyman projects are you qualified and equipped to complete? (Select all that apply.)','Small household repairs|Single-room maintenance projects|Multiple repairs during one service visit|Rental property maintenance|Apartment turnover repairs|Deck and fence repairs|Interior painting and drywall repairs|Small residential improvement projects|Commercial property maintenance|Ongoing property maintenance contracts'),
 q('bct_procedures',"Are you willing to follow BCT Renovations' assigned-project procedures, approved pricing, customer communication standards, safety requirements, scheduling rules, documentation procedures, and administrative approval process?",yesNo)
],
estimator:[
 q('experience','How many years of professional construction estimating or project assessment experience do you have?',years),
 q('qualification','What best describes your current professional qualification level?','Estimator Apprentice / Assistant|Construction Estimator|Residential Estimator|Commercial Estimator|Senior Construction Estimator|Construction Project Manager / Estimator|Independent Estimating Consultant|Other (please explain)'),
 credential('Do you currently hold any professional licenses, certifications, or construction-related credentials?'),
 multiple('specialties','What types of construction projects are you experienced in estimating? (Select all that apply.)','Residential repairs and renovations|Commercial construction and renovations|New home construction|Kitchen and bathroom remodeling|Roofing and siding|Electrical and plumbing|HVAC installations and repairs|Flooring and drywall|Concrete and masonry|Water and storm damage restoration|Structural repairs|Exterior renovations'),
 multiple('responsibilities','Which estimating responsibilities can you competently perform? (Select all that apply.)','On-site project assessments|Construction measurements|Material quantity takeoffs|Labor cost calculations|Material cost calculations|Project scope development|Identifying repair requirements|Photographing and documenting damage|Preparing detailed cost estimates|Preparing written assessment reports|Identifying potential change-order items'),
 multiple('software','Which estimating software or digital tools are you experienced using? (Select all that apply.)','Xactimate|PlanSwift|Bluebeam Revu|STACK|Microsoft Excel|Google Sheets|Buildertrend|Other estimating software (please specify)|No estimating software experience'),
 q('plans','Can you accurately read and interpret construction blueprints, architectural drawings, measurements, and project specifications?',independent),
 q('calculations','How experienced are you in calculating construction labor costs, material quantities, and project expenses?','Extensive experience|Moderate experience|Limited experience|No experience','single',[
  {...multiple('calculation_types','Which calculations can you perform? (Select all that apply.)','Square footage|Linear footage|Cubic yards|Material quantities|Labor hours|Equipment costs|Waste allowances|Subcontractor cost estimates'),required:false}
 ]),
 {...q('diagnostics','Do you have experience conducting on-site property inspections and identifying construction problems?',experience,'single',[
  multiple('issue_types','Which issues can you identify? (Select all that apply.)','Water damage and moisture intrusion|Roof damage|Structural concerns|Drywall and flooring damage|Foundation and concrete deterioration|Plumbing-related damage|Electrical safety concerns|HVAC-related problems|Exterior siding and window damage|Potential mold or moisture concerns',{values:['1','2']})
 ]),help:'Identifying concerns does not authorize an estimator to perform specialized inspections or make professional engineering determinations.'},
 q('safety','Are you familiar with applicable construction codes, permit requirements, safety procedures, and professional property assessment practices?',familiar,'single',[
  {...multiple('safety_certifications','List applicable training or certifications:','OSHA 10|OSHA 30|Construction inspection training|Building code training|Property damage assessment training|Other (please explain)'),required:false}
 ]),
 q('tools','Do you have reliable transportation, a smartphone or tablet, and the equipment necessary to perform assigned property assessments?','Yes, all three|Transportation and smartphone/tablet only|Transportation only|Other (please explain)','single',[
  {...multiple('equipment','Which equipment do you have? (Select all that apply.)','Laser measuring device|Measuring tape|Smartphone camera|Tablet or laptop|Moisture meter|Flashlight|Personal protective equipment (PPE)|Other (please explain)'),required:false}
 ]),
 q('reports','Are you able to prepare and submit detailed project assessment reports through the BCT Estimator Portal?','Yes, independently|Yes, with training|No','single',[
  {...multiple('report_contents','Can you provide the following? (Select all that apply.)','Site measurements|Project photographs|Material quantity estimates|Labor estimates|Detailed work descriptions|Identified safety concerns|Recommended scope of work|Written project notes|Potential unforeseen-condition warnings'),required:false}
 ]),
 {...portfolio('construction assessment or personally estimated'),text:'Can you provide examples of previous estimating or construction assessment work and at least three professional references?',help:'Provide sample estimates or assessment reports where available, with customer information removed. Identify your role and supervisor for supervised work.'},
 multiple('project_size','What size construction projects are you qualified and experienced in estimating? (Select all that apply.)','Minor residential repairs|Small handyman projects|Single-room renovations|Kitchen and bathroom remodeling|Whole-house renovations|Roofing and exterior projects|Water and storm damage restoration|Residential additions|Commercial renovations|New residential construction|Large commercial construction projects'),
 {...q('bct_procedures',"Are you willing to follow BCT Renovations' estimator assignment procedures, project assessment requirements, confidentiality policies, scheduling rules, documentation standards, and administrative approval process?",yesNo),help:'Estimators submit assessments and recommendations. BCT approves final pricing.'}
]
};
// Add conditional explanations for every "Other" option, including follow-ups.
function explainOther(question){
 if(question.options){const other=question.options.filter(o=>/\bOther\b/.test(o.label));if(other.length)question.followups.push(detail('other_explanation','Please explain your other selection.',{values:other.map(o=>o.value)}));}
 for(const followup of question.followups||[])explainOther(followup);
}
const catalogue=Object.entries(core).map(([id,questions])=>({id,title:titles[id],questions:[...questions,...standard(id==='estimator')].map((question,index)=>{explainOther(question);return {...question,number:index+1};})}));
const policy={version:2,languages:['en','es','fr','ht','pt','vi','zh','ar','ru'],photoMinimum:5,photoMaximum:10,professionalReferences:3,photoDescriptionRequired:true,photoRoleRequired:true,apprenticeSupervisorRequired:true,apprenticeUnderMinimum:'manual_review',fileVisibility:'authorized_bct_admin_only',backgroundCheckRequired:true,backgroundCheckIsNotSelfAttested:true,credentialUploadIsNotVerification:true,serviceAreaFields:['city','state'],homeownerChanges:'deferred',liveChanges:false};
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
const api=freeze({catalogue,policy});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BCTApprovedApplicationCatalogue=api;
})(typeof globalThis!=='undefined'?globalThis:this);
