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
const extraRows=typeof module!=='undefined'&&module.exports?require('./bct-application-translation-rows.js'):(root.BCTApplicationTranslationRows||[]);
for(const row of extraRows){if(row.length!==9||row.some(text=>typeof text!=='string'||!text.trim()))throw new Error('Invalid expanded intake translation row');Object.keys(translations).forEach((lang,index)=>{tables[lang][row[0]]=row[index+1];});}
function selectedCatalogue(id){const selected=id?source.catalogue.filter(item=>item.id===id):source.catalogue;if(!selected.length)throw new Error('Unknown profession');return selected;}
function strings(id){const result=new Set();function walk(value){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){if(['text','title','label','help'].includes(key)&&typeof item==='string')result.add(item);else if(typeof item==='object')walk(item);}}walk(selectedCatalogue(id));return [...result];}
function coverage(lang,id){const total=strings(id);if(lang==='en')return {language:lang,total:total.length,translated:total.length,missing:[],ready:true};const table=tables[lang]||{};const missing=total.filter(text=>!Object.hasOwn(table,text));return {language:lang,total:total.length,translated:total.length-missing.length,missing,ready:missing.length===0};}
function catalogue(lang,id){const status=coverage(lang,id);if(!status.ready){const error=new Error('Intake translation incomplete: '+lang);error.code='TRANSLATION_INCOMPLETE';throw error;}const selected=selectedCatalogue(id);if(lang==='en')return structuredClone(selected);const table=tables[lang];function walk(value){if(Array.isArray(value))return value.map(walk);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,['text','title','label','help'].includes(key)&&typeof item==='string'?table[item]:walk(item)]));return value;}return walk(selected);}
const controlKeys=['localFiles','selectPhotos','description','personalRole','supervisor','reviewSupervisor','reference','name','relationship','contact','background','localPassed','needsAttention','removePhoto','photoCount'];
const controlCopy={
 en:['Files selected here have not been uploaded.','Select up to 10 work photographs','Short work description','Work personally performed or supervised','Supervisor, if apprentice or assistant','Supervisor for apprentice manual review','Professional reference','Name','Professional relationship','Phone or email','I understand BCT requires background screening before approval.','Local checks passed. BCT review, secure upload and screening remain pending.','fields need attention.','Remove photograph','Photographs selected'],
 es:['Los archivos seleccionados aquí no se han subido.','Seleccione hasta 10 fotografías de trabajos','Breve descripción del trabajo','Trabajo realizado o supervisado personalmente','Supervisor, si es aprendiz o asistente','Supervisor para la revisión manual del aprendiz','Referencia profesional','Nombre','Relación profesional','Teléfono o correo electrónico','Entiendo que BCT exige una verificación de antecedentes antes de la aprobación.','Las comprobaciones locales se completaron. La revisión de BCT, la carga segura y la verificación de antecedentes siguen pendientes.','campos requieren atención.','Eliminar fotografía','Fotografías seleccionadas'],
 fr:['Les fichiers sélectionnés ici n’ont pas été téléversés.','Sélectionnez jusqu’à 10 photos de travaux','Brève description du travail','Travail effectué ou supervisé personnellement','Responsable, pour un apprenti ou assistant','Responsable pour l’examen manuel de l’apprenti','Référence professionnelle','Nom','Relation professionnelle','Téléphone ou courriel','Je comprends que BCT exige une vérification des antécédents avant l’approbation.','Contrôles locaux réussis. L’examen BCT, le téléversement sécurisé et la vérification des antécédents restent en attente.','champs nécessitent votre attention.','Supprimer la photo','Photos sélectionnées'],
 ht:['Fichye ou chwazi isit la poko telechaje sou sèvè a.','Chwazi jiska 10 foto travay','Deskripsyon kout travay la','Travay ou fè oswa sipèvize pèsonèlman','Sipèvizè, si ou se apranti oswa asistan','Sipèvizè pou revizyon manyèl apranti a','Referans pwofesyonèl','Non','Relasyon pwofesyonèl','Telefòn oswa imèl','Mwen konprann BCT mande verifikasyon antesedan anvan apwobasyon.','Verifikasyon lokal yo pase. Revizyon BCT, telechajman sekirize ak verifikasyon antesedan toujou annatant.','chan bezwen atansyon.','Retire foto','Foto ou chwazi'],
 pt:['Os arquivos selecionados aqui ainda não foram enviados.','Selecione até 10 fotografias de trabalhos','Breve descrição do trabalho','Trabalho realizado ou supervisionado pessoalmente','Supervisor, se aprendiz ou assistente','Supervisor para análise manual do aprendiz','Referência profissional','Nome','Relação profissional','Telefone ou e-mail','Entendo que a BCT exige verificação de antecedentes antes da aprovação.','Verificações locais concluídas. A análise da BCT, o envio seguro e a verificação de antecedentes continuam pendentes.','campos precisam de atenção.','Remover fotografia','Fotografias selecionadas'],
 vi:['Các tệp được chọn ở đây chưa được tải lên.','Chọn tối đa 10 ảnh công việc','Mô tả ngắn về công việc','Công việc bạn trực tiếp làm hoặc giám sát','Người giám sát, nếu là học việc hoặc trợ lý','Người giám sát để BCT xét duyệt thủ công hồ sơ học việc','Người tham chiếu chuyên môn','Tên','Mối quan hệ công việc','Điện thoại hoặc email','Tôi hiểu BCT yêu cầu kiểm tra lý lịch trước khi phê duyệt.','Đã qua kiểm tra cục bộ. Việc BCT xét duyệt, tải lên an toàn và kiểm tra lý lịch vẫn đang chờ.','trường cần được kiểm tra.','Xóa ảnh','Ảnh đã chọn'],
 zh:['此处选择的文件尚未上传。','选择最多10张工作照片','简要工作说明','您亲自完成或监督的工作','学徒或助理的监督人','学徒人工审核所需的监督人','专业推荐人','姓名','工作关系','电话或电子邮箱','我理解BCT要求在批准前进行背景审查。','本地检查已通过。BCT审核、安全上传和背景审查仍待完成。','个字段需要处理。','移除照片','已选照片'],
 ar:['لم يتم رفع الملفات المحددة هنا بعد.','اختر ما يصل إلى 10 صور للأعمال','وصف موجز للعمل','العمل الذي نفذته أو أشرفت عليه شخصياً','المشرف، إذا كنت متدرباً أو مساعداً','المشرف للمراجعة اليدوية لطلب المتدرب','مرجع مهني','الاسم','العلاقة المهنية','الهاتف أو البريد الإلكتروني','أفهم أن BCT تشترط التحقق من الخلفية قبل الموافقة.','اجتازت البيانات الفحوص المحلية. ما زالت مراجعة BCT والرفع الآمن والتحقق من الخلفية معلقة.','حقول تحتاج إلى مراجعة.','إزالة الصورة','الصور المحددة'],
 ru:['Выбранные здесь файлы еще не загружены.','Выберите до 10 фотографий работ','Краткое описание работы','Работа, выполненная лично или под вашим руководством','Руководитель для ученика или помощника','Руководитель для ручного рассмотрения заявки ученика','Профессиональная рекомендация','Имя','Профессиональная связь','Телефон или электронная почта','Я понимаю, что BCT требует проверку биографии до одобрения.','Локальные проверки пройдены. Рассмотрение BCT, безопасная загрузка и проверка биографии еще не выполнены.','полей требуют внимания.','Удалить фотографию','Выбрано фотографий']
};
function controls(lang){const rows=controlCopy[lang];if(!rows||rows.length!==controlKeys.length)throw new Error('Structured form control translations incomplete: '+lang);return Object.fromEntries(controlKeys.map((key,i)=>[key,rows[i]]));}
const errors={
 answer_required_or_invalid:['Answer this field with a valid value.','Responda este campo con un valor válido.','Renseignez ce champ avec une valeur valide.','Reponn chan sa a ak yon valè valab.','Responda este campo com um valor válido.','Điền giá trị hợp lệ vào trường này.','请填写有效答案。','أجب عن هذا الحقل بقيمة صحيحة.','Введите допустимый ответ.'],
 maximum_10_photos:['Select no more than 10 photographs.','Seleccione un máximo de 10 fotografías.','Sélectionnez au maximum 10 photos.','Chwazi pa plis pase 10 foto.','Selecione no máximo 10 fotografias.','Chọn không quá 10 ảnh.','请选择不超过10张照片。','اختر ما لا يزيد عن 10 صور.','Выберите не более 10 фотографий.'],
 minimum_5_photos:['At least 5 photographs are required.','Se requieren al menos 5 fotografías.','Au moins 5 photos sont requises.','Omwen 5 foto obligatwa.','São necessárias pelo menos 5 fotografias.','Cần ít nhất 5 ảnh.','至少需要5张照片。','يلزم تقديم 5 صور على الأقل.','Требуется не менее 5 фотографий.'],
 image_file_required:['Select a supported, nonempty image file.','Seleccione una imagen compatible que no esté vacía.','Sélectionnez un fichier image pris en charge et non vide.','Chwazi yon fichye imaj ki sipòte epi ki pa vid.','Selecione uma imagem compatível e não vazia.','Chọn tệp ảnh được hỗ trợ và không rỗng.','请选择受支持且非空的图片文件。','اختر ملف صورة مدعوماً وغير فارغ.','Выберите поддерживаемый непустой файл изображения.'],
 duplicate_photo:['Remove the duplicate photograph.','Elimine la fotografía duplicada.','Supprimez la photo en double.','Retire foto ki repete a.','Remova a fotografia duplicada.','Xóa ảnh trùng lặp.','请移除重复照片。','أزل الصورة المكررة.','Удалите повторяющуюся фотографию.'],
 description_required:['Describe each photograph.','Describa cada fotografía.','Décrivez chaque photo.','Dekri chak foto.','Descreva cada fotografia.','Mô tả từng ảnh.','请描述每张照片。','صف كل صورة.','Опишите каждую фотографию.'],
 personal_role_required:['Describe your personal role in the work.','Describa su función personal en el trabajo.','Décrivez votre rôle personnel dans le travail.','Dekri wòl pèsonèl ou nan travay la.','Descreva seu papel pessoal no trabalho.','Mô tả vai trò cá nhân của bạn trong công việc.','请说明您在工作中的个人职责。','صف دورك الشخصي في العمل.','Опишите вашу личную роль в работе.'],
 supervisor_required:['Name the supervisor for this work.','Indique el supervisor de este trabajo.','Nommez le responsable de ce travail.','Bay non sipèvizè travay sa a.','Informe o supervisor deste trabalho.','Nêu tên người giám sát công việc này.','请填写此项工作的监督人。','اذكر اسم المشرف على هذا العمل.','Укажите руководителя этой работы.'],
 supervisor_required_for_manual_review:['Name your supervisor for apprentice manual review.','Indique su supervisor para la revisión manual del aprendiz.','Nommez votre responsable pour l’examen manuel de l’apprenti.','Bay non sipèvizè ou pou revizyon manyèl apranti a.','Informe seu supervisor para análise manual do aprendiz.','Nêu tên người giám sát để xét duyệt thủ công hồ sơ học việc.','请填写学徒人工审核所需的监督人。','اذكر مشرفك للمراجعة اليدوية لطلب المتدرب.','Укажите руководителя для ручного рассмотрения заявки ученика.'],
 three_professional_references_required:['Provide at least three professional references.','Proporcione al menos tres referencias profesionales.','Fournissez au moins trois références professionnelles.','Bay omwen twa referans pwofesyonèl.','Forneça pelo menos três referências profissionais.','Cung cấp ít nhất ba người tham chiếu chuyên môn.','请提供至少三位专业推荐人。','قدم ثلاثة مراجع مهنية على الأقل.','Предоставьте как минимум три профессиональные рекомендации.'],
 reference_details_required:['Complete the reference name, relationship, and contact.','Complete el nombre, relación y contacto de la referencia.','Complétez le nom, la relation et les coordonnées de la référence.','Ranpli non, relasyon ak kontak referans lan.','Complete nome, relação e contato da referência.','Điền tên, quan hệ và thông tin liên hệ của người tham chiếu.','请填写推荐人的姓名、关系和联系方式。','أكمل اسم المرجع وعلاقتك به وبيانات الاتصال.','Укажите имя рекомендателя, профессиональную связь и контакты.'],
 city_and_state_required:['Enter city and state, separated by a comma or a new line.','Ingrese ciudad y estado, separados por coma o nueva línea.','Indiquez la ville et l’État, séparés par une virgule ou un retour à la ligne.','Antre vil ak eta, separe ak vigil oswa yon nouvo liy.','Informe cidade e estado, separados por vírgula ou nova linha.','Nhập thành phố và tiểu bang, cách nhau bằng dấu phẩy hoặc xuống dòng.','请填写城市和州，以逗号或换行分隔。','أدخل المدينة والولاية مفصولتين بفاصلة أو سطر جديد.','Укажите город и штат через запятую или с новой строки.'],
 positive_crew_size_required:['Enter the number of crew members as a positive whole number.','Ingrese el número de miembros como entero positivo.','Indiquez le nombre de membres par un entier positif.','Antre kantite manm ekip la kòm yon nonb antye pozitif.','Informe o número de integrantes como inteiro positivo.','Nhập số thành viên là số nguyên dương.','请以正整数填写团队人数。','أدخل عدد أعضاء الفريق كعدد صحيح موجب.','Укажите число работников положительным целым числом.'],
 no_software_is_exclusive:['Choose no software experience by itself, or select the software you use.','Elija sin experiencia de software solo, o seleccione el software que utiliza.','Choisissez aucune expérience logicielle seule, ou sélectionnez vos logiciels.','Chwazi pa gen eksperyans lojisyèl poukont li, oswa chwazi lojisyèl ou itilize.','Selecione sem experiência em software sozinho, ou escolha os programas usados.','Chọn riêng không có kinh nghiệm phần mềm, hoặc chọn phần mềm bạn dùng.','请单独选择无软件经验，或选择您使用的软件。','اختر لا توجد خبرة برمجية وحدها، أو حدد البرامج التي تستخدمها.','Выберите отсутствие опыта отдельно либо укажите используемые программы.'],
 background_check_acknowledgment_required:['Acknowledge the required background screening.','Confirme que entiende la verificación de antecedentes requerida.','Confirmez avoir compris la vérification des antécédents requise.','Konfime ou konprann verifikasyon antesedan obligatwa a.','Confirme que entende a verificação de antecedentes obrigatória.','Xác nhận đã hiểu yêu cầu kiểm tra lý lịch.','请确认您了解所需的背景审查。','أكد فهمك للتحقق المطلوب من الخلفية.','Подтвердите понимание обязательной проверки биографии.']
};
function errorMessage(lang,code){const index=source.policy.languages.indexOf(lang),row=errors[code];if(index<0||!row?.[index])throw new Error('Missing validation translation');return row[index];}
const api=Object.freeze({coverage,catalogue,controls,errorMessage});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BCTApplicationLocales=api;
})(typeof globalThis!=='undefined'?globalThis:this);
