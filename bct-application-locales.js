/* New intake translations are staged separately from the approved old UI.
 * Missing translations are reported, never silently replaced with English. */
(function(root){
'use strict';
const source=typeof module!=='undefined'&&module.exports?require('./bct-application-catalogue.js'):root.BCTApprovedApplicationCatalogue;
const en=[
 'Yes','No','Somewhat','Yes, independently','Yes, with assistance','Yes, with some assistance','Yes, with training',
 'Less than 1 year','1–3 years','4–7 years','8–15 years','More than 15 years',
 'Yes, both','Transportation only','Tools only','Neither','Tools / equipment only',
 'Yes, extensive experience','Yes, limited experience','Other (please explain)',
 'Not required for my work/location','Apprentice under supervision',
 'Which cities and states do you serve?',
 'What is your availability, and when can you start accepting BCT assignments?',
 'Will you use a crew on BCT projects?',
 'Will you work with an assessment team on BCT assignments?',
 'How many crew or team members will work on BCT assignments?',
 'Can you perform the essential duties of your assigned work safely, with or without reasonable accommodation?',
 'Can you perform the essential assessment duties safely, with or without reasonable accommodation?',
 'Please explain your other selection.',
 'BCT approves final pricing.'
];
const translations={
es:[
 'Sí','No','Algo','Sí, de forma independiente','Sí, con ayuda','Sí, con algo de ayuda','Sí, con capacitación',
 'Menos de 1 año','1–3 años','4–7 años','8–15 años','Más de 15 años',
 'Sí, ambos','Solo transporte','Solo herramientas','Ninguno','Solo herramientas / equipos',
 'Sí, amplia experiencia','Sí, experiencia limitada','Otro (explique)',
 'No se requiere para mi trabajo/ubicación','Aprendiz bajo supervisión',
 '¿En qué ciudades y estados presta servicios?',
 '¿Cuál es su disponibilidad y cuándo puede comenzar a aceptar asignaciones de BCT?',
 '¿Utilizará una cuadrilla en los proyectos de BCT?',
 '¿Trabajará con un equipo de evaluación en las asignaciones de BCT?',
 '¿Cuántos miembros de la cuadrilla o del equipo trabajarán en asignaciones de BCT?',
 '¿Puede realizar de forma segura las funciones esenciales del trabajo asignado, con o sin ajustes razonables?',
 '¿Puede realizar de forma segura las funciones esenciales de evaluación, con o sin ajustes razonables?',
 'Explique su selección de otra opción.',
 'BCT aprueba el precio final.'
],
fr:[
 'Oui','Non','En partie','Oui, de façon autonome','Oui, avec de l’aide','Oui, avec un peu d’aide','Oui, avec une formation',
 'Moins d’un an','1–3 ans','4–7 ans','8–15 ans','Plus de 15 ans',
 'Oui, les deux','Transport uniquement','Outils uniquement','Ni l’un ni l’autre','Outils / équipement uniquement',
 'Oui, une grande expérience','Oui, une expérience limitée','Autre (précisez)',
 'Non requis pour mon travail/lieu','Apprenti sous supervision',
 'Dans quelles villes et quels États intervenez-vous ?',
 'Quelles sont vos disponibilités et quand pouvez-vous commencer à accepter des missions BCT ?',
 'Utiliserez-vous une équipe sur les projets BCT ?',
 'Travaillerez-vous avec une équipe d’évaluation pour les missions BCT ?',
 'Combien de membres de votre équipe travailleront sur les missions BCT ?',
 'Pouvez-vous accomplir les fonctions essentielles du travail confié en toute sécurité, avec ou sans aménagement raisonnable ?',
 'Pouvez-vous accomplir les fonctions essentielles d’évaluation en toute sécurité, avec ou sans aménagement raisonnable ?',
 'Précisez votre choix d’une autre option.',
 'BCT approuve le prix final.'
],
ht:[
 'Wi','Non','Yon ti jan','Wi, poukont mwen','Wi, avèk èd','Wi, avèk yon ti èd','Wi, avèk fòmasyon',
 'Mwens pase 1 ane','1–3 ane','4–7 ane','8–15 ane','Plis pase 15 ane',
 'Wi, toude','Transpò sèlman','Zouti sèlman','Okenn ladan yo','Zouti / ekipman sèlman',
 'Wi, anpil eksperyans','Wi, eksperyans limite','Lòt (tanpri eksplike)',
 'Pa obligatwa pou travay mwen/kote mwen','Apranti anba sipèvizyon',
 'Nan ki vil ak eta ou bay sèvis?',
 'Ki disponiblite ou, epi kilè ou ka kòmanse aksepte travay BCT ba ou?',
 'Èske w ap itilize yon ekip sou pwojè BCT yo?',
 'Èske w ap travay ak yon ekip evalyasyon pou travay BCT ba ou yo?',
 'Konbyen manm ekip ou ap travay sou travay BCT ba ou yo?',
 'Èske ou ka fè travay esansyèl yo ba ou yo san danje, avèk oswa san aranjman rezonab?',
 'Èske ou ka fè fonksyon esansyèl evalyasyon yo san danje, avèk oswa san aranjman rezonab?',
 'Tanpri eksplike lòt opsyon ou chwazi a.',
 'BCT apwouve pri final la.'
],
pt:[
 'Sim','Não','Um pouco','Sim, de forma independente','Sim, com ajuda','Sim, com alguma ajuda','Sim, com treinamento',
 'Menos de 1 ano','1–3 anos','4–7 anos','8–15 anos','Mais de 15 anos',
 'Sim, ambos','Somente transporte','Somente ferramentas','Nenhum','Somente ferramentas / equipamentos',
 'Sim, ampla experiência','Sim, experiência limitada','Outro (explique)',
 'Não é exigido para meu trabalho/local','Aprendiz sob supervisão',
 'Em quais cidades e estados você atende?',
 'Qual é sua disponibilidade e quando pode começar a aceitar atribuições da BCT?',
 'Você utilizará uma equipe nos projetos da BCT?',
 'Você trabalhará com uma equipe de avaliação nas atribuições da BCT?',
 'Quantos integrantes da equipe trabalharão nas atribuições da BCT?',
 'Você consegue realizar com segurança as funções essenciais do trabalho atribuído, com ou sem adaptação razoável?',
 'Você consegue realizar com segurança as funções essenciais de avaliação, com ou sem adaptação razoável?',
 'Explique a outra opção selecionada.',
 'A BCT aprova o preço final.'
],
vi:[
 'Có','Không','Biết một phần','Có, độc lập','Có, với sự hỗ trợ','Có, với một chút hỗ trợ','Có, sau khi được đào tạo',
 'Dưới 1 năm','1–3 năm','4–7 năm','8–15 năm','Trên 15 năm',
 'Có, cả hai','Chỉ phương tiện đi lại','Chỉ dụng cụ','Không có cả hai','Chỉ dụng cụ / thiết bị',
 'Có, nhiều kinh nghiệm','Có, kinh nghiệm hạn chế','Khác (vui lòng giải thích)',
 'Không bắt buộc cho công việc/địa điểm của tôi','Học việc có người giám sát',
 'Bạn phục vụ những thành phố và tiểu bang nào?',
 'Bạn có thể làm việc vào thời gian nào và khi nào có thể bắt đầu nhận việc BCT giao?',
 'Bạn có sử dụng đội thợ trong các dự án BCT không?',
 'Bạn có làm việc cùng nhóm đánh giá trong các nhiệm vụ BCT giao không?',
 'Có bao nhiêu thành viên đội hoặc nhóm sẽ làm việc trong các nhiệm vụ BCT giao?',
 'Bạn có thể thực hiện an toàn các nhiệm vụ thiết yếu của công việc được giao, có hoặc không có điều chỉnh hợp lý không?',
 'Bạn có thể thực hiện an toàn các nhiệm vụ đánh giá thiết yếu, có hoặc không có điều chỉnh hợp lý không?',
 'Vui lòng giải thích lựa chọn khác của bạn.',
 'BCT phê duyệt giá cuối cùng.'
],
zh:[
 '是','否','部分了解','是，可以独立完成','是，需要协助','是，需要少量协助','是，经过培训后可以',
 '不到1年','1–3年','4–7年','8–15年','超过15年',
 '是，两者都有','仅有交通工具','仅有工具','两者都没有','仅有工具 / 设备',
 '是，经验丰富','是，经验有限','其他（请说明）',
 '我的工作/所在地无需此资质','在监督下工作的学徒',
 '您服务哪些城市和州？',
 '您何时有空工作，何时可以开始接受BCT分配的任务？',
 '您会在BCT项目中使用施工团队吗？',
 '您会与评估团队一起执行BCT分配的任务吗？',
 '您的施工或评估团队将有多少成员参与BCT任务？',
 '在有或没有合理便利安排的情况下，您能否安全履行所分配工作的基本职责？',
 '在有或没有合理便利安排的情况下，您能否安全履行基本评估职责？',
 '请说明您选择的其他选项。',
 'BCT批准最终价格。'
],
ar:[
 'نعم','لا','إلى حد ما','نعم، بشكل مستقل','نعم، بمساعدة','نعم، ببعض المساعدة','نعم، بعد التدريب',
 'أقل من سنة','1–3 سنوات','4–7 سنوات','8–15 سنة','أكثر من 15 سنة',
 'نعم، كلاهما','وسيلة نقل فقط','أدوات فقط','لا هذا ولا ذاك','أدوات / معدات فقط',
 'نعم، خبرة واسعة','نعم، خبرة محدودة','أخرى (يرجى التوضيح)',
 'غير مطلوب لعملي/موقعي','متدرب تحت الإشراف',
 'ما المدن والولايات التي تقدم فيها خدماتك؟',
 'ما أوقات توافرك ومتى يمكنك البدء بقبول المهام المسندة من BCT؟',
 'هل ستستخدم فريق عمل في مشروعات BCT؟',
 'هل ستعمل مع فريق تقييم في المهام المسندة من BCT؟',
 'كم عدد أعضاء فريق العمل أو التقييم الذين سيعملون في مهام BCT؟',
 'هل يمكنك أداء المهام الأساسية للعمل المسند بأمان، مع توفير ترتيبات تيسيرية معقولة أو بدونها؟',
 'هل يمكنك أداء مهام التقييم الأساسية بأمان، مع توفير ترتيبات تيسيرية معقولة أو بدونها؟',
 'يرجى توضيح الخيار الآخر الذي حددته.',
 'تعتمد BCT السعر النهائي.'
],
ru:[
 'Да','Нет','Частично','Да, самостоятельно','Да, с помощью','Да, с небольшой помощью','Да, после обучения',
 'Менее 1 года','1–3 года','4–7 лет','8–15 лет','Более 15 лет',
 'Да, и то и другое','Только транспорт','Только инструменты','Ни того ни другого','Только инструменты / оборудование',
 'Да, большой опыт','Да, ограниченный опыт','Другое (поясните)',
 'Не требуется для моей работы/местности','Ученик под надзором',
 'В каких городах и штатах вы оказываете услуги?',
 'Когда вы доступны и когда можете начать принимать задания BCT?',
 'Будете ли вы использовать бригаду на проектах BCT?',
 'Будете ли вы работать с командой оценщиков на заданиях BCT?',
 'Сколько членов бригады или команды будут работать на заданиях BCT?',
 'Можете ли вы безопасно выполнять основные обязанности по порученной работе с разумным приспособлением условий или без него?',
 'Можете ли вы безопасно выполнять основные обязанности по оценке с разумным приспособлением условий или без него?',
 'Поясните выбранный вариант «Другое».',
 'BCT утверждает окончательную цену.'
]
};
for(const [lang,rows] of Object.entries(translations))if(rows.length!==en.length||rows.some(text=>!text.trim()))throw new Error('Invalid intake translation table: '+lang);
const tables=Object.fromEntries(Object.entries(translations).map(([lang,rows])=>[lang,Object.fromEntries(en.map((text,i)=>[text,rows[i]]))]));
function strings(){const result=new Set();function walk(value){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){if(['text','title','label','help'].includes(key)&&typeof item==='string')result.add(item);else if(typeof item==='object')walk(item);}}walk(source.catalogue);return [...result];}
function coverage(lang){const total=strings();if(lang==='en')return {language:lang,total:total.length,translated:total.length,missing:[],ready:true};const table=tables[lang]||{};const missing=total.filter(text=>!Object.hasOwn(table,text));return {language:lang,total:total.length,translated:total.length-missing.length,missing,ready:missing.length===0};}
function catalogue(lang){const status=coverage(lang);if(!status.ready){const error=new Error('Intake translation incomplete: '+lang);error.code='TRANSLATION_INCOMPLETE';throw error;}if(lang==='en')return structuredClone(source.catalogue);const table=tables[lang];function walk(value){if(Array.isArray(value))return value.map(walk);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,['text','title','label','help'].includes(key)&&typeof item==='string'?table[item]:walk(item)]));return value;}return walk(source.catalogue);}
const api=Object.freeze({coverage,catalogue});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BCTApplicationLocales=api;
})(typeof globalThis!=='undefined'?globalThis:this);
