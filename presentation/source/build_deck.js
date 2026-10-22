// Builds the achievements deck for Mohinur Komolova (StudRussia, nomination "Вдохновленные творчеством").
// usage: node build_deck.js <assets_dir> <out.pptx> <pptx_skill_dir>
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const [ASSETS, OUT, SKILL] = process.argv.slice(2);
const { applyTheme } = require(path.join(SKILL, "scripts/apply_theme.js"));
const M = JSON.parse(fs.readFileSync(path.join(ASSETS, "manifest.json"), "utf8"));

const THEME = {
	name: "Komolova Ikat",
	headFontFace: "Playfair Display",
	bodyFontFace: "Montserrat",
	colors: {
		dk1: "15131A", // ink
		lt1: "FFFFFF",
		dk2: "4A4450", // graphite, secondary text on light
		lt2: "F3EFE9", // card tint on light, soft white on dark
		accent1: "A3172E", // pomegranate crimson
		accent2: "B8924A", // humo gold
		accent3: "24357A", // ikat indigo
		accent4: "D9BF84", // light gold, text on dark
		accent5: "A9A0B0", // muted text on dark
		accent6: "7A7480", // captions on light
		hlink: "24357A",
		folHlink: "7A7480",
	},
};
const HEAD = THEME.headFontFace;
const BODY = THEME.bodyFontFace;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
pres.title = "Комолова Мохинур. Презентация достижений";
pres.author = "Комолова Мохинур Олимбой кизи";
pres.subject = "СтудRussia, СЗФО 2026. Номинация «Вдохновленные творчеством»";
const C = pres.SchemeColor;

// ------------------------------------------------------------------ layouts

const FOOTER = "Мохинур Комолова   ·   «Вдохновленные творчеством»";

function contentLayout(title, dark, frame, titleH = 0.75) {
	const muted = dark ? THEME.colors.accent5 : THEME.colors.accent6;
	pres.defineSlideMaster({
		title,
		background: { color: dark ? THEME.colors.dk1 : THEME.colors.lt1 },
		objects: [
			{
				placeholder: {
					options: {
						name: "kicker", type: "body", x: frame.x, y: 0.52, w: frame.w, h: 0.28, margin: 0,
						fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2.5, valign: "top",
						color: dark ? C.accent4 : C.accent1,
					},
					text: "",
				},
			},
			{
				placeholder: {
					options: {
						name: "title", type: "title", x: frame.x, y: 0.84, w: frame.w, h: titleH, margin: 0,
						fontFace: HEAD, fontSize: 34, valign: "top", align: "left", lineSpacingMultiple: 0.95,
						color: dark ? C.background1 : C.text1,
					},
					text: "",
				},
			},
			{
				text: {
					text: FOOTER,
					options: { x: 0.6, y: 7.0, w: 7.0, h: 0.25, margin: 0, fontFace: BODY, fontSize: 9, charSpacing: 1, color: muted },
				},
			},
		],
		slideNumber: { x: 12.233, y: 6.95, w: 0.5, h: 0.3, margin: 0, fontFace: HEAD, fontSize: 12, color: muted, align: "right" },
	});
}

pres.defineSlideMaster({
	title: "COVER",
	background: { color: THEME.colors.dk1 },
	objects: [
		{
			placeholder: {
				options: {
					name: "title", type: "title", x: 0.55, y: 1.2, w: 7.4, h: 2.65, margin: 0,
					fontFace: HEAD, fontSize: 84, valign: "top", align: "left", lineSpacingMultiple: 0.88, color: C.background1,
				},
				text: "",
			},
		},
	],
});
pres.defineSlideMaster({
	title: "END",
	background: { color: THEME.colors.dk1 },
	objects: [
		{
			placeholder: {
				options: {
					name: "title", type: "title", x: 0.6, y: 3.2, w: 7.2, h: 0.8, margin: 0,
					fontFace: HEAD, fontSize: 40, valign: "top", align: "left", color: C.background1,
				},
				text: "",
			},
		},
	],
});
contentLayout("LIGHT_LEFT", false, { x: 0.6, w: 6.95 });
contentLayout("LIGHT_RIGHT", false, { x: 5.5, w: 7.233 }, 1.3);
contentLayout("LIGHT_WIDE", false, { x: 0.6, w: 12.133 });
contentLayout("DARK_LEFT", true, { x: 0.6, w: 7.0 });
contentLayout("DARK_WIDE", true, { x: 0.6, w: 12.133 });

// ------------------------------------------------------------------ helpers

// Russian typesetting: a one or two letter word, or a number, never ends a line
function nb(t) {
	let prev;
	do {
		prev = t;
		t = t.replace(/(^|[\s«(])([А-Яа-яЁё]{1,2}) /g, "$1$2\u00A0").replace(/(\d) (?=[А-Яа-яЁё])/g, "$1\u00A0");
	} while (t !== prev);
	return t;
}

function text(slide, value, opts) {
	const v = Array.isArray(value) ? value.map((r) => ({ ...r, text: nb(r.text) })) : nb(value);
	slide.addText(v, { isTextBox: true, margin: 0, valign: "top", fontFace: BODY, ...opts });
}

function heading(slide, value, placeholder) {
	slide.addText(nb(value), { placeholder });
}

function photo(slide, key, altText, override = {}) {
	const m = M[key];
	slide.addImage({ path: path.join(ASSETS, m.file), x: m.x, y: m.y, w: m.w, h: m.h, altText, objectName: key, ...override });
}

function swatch(slide, key, x, y, w, name) {
	const [pw, ph] = M[key].px;
	slide.addImage({ path: path.join(ASSETS, M[key].file), x, y, w, h: (w * ph) / pw, altText: "Лоскут ткани икат", objectName: name });
}

// a sewing seam: dashed line between two points
function seam(slide, x1, y1, x2, y2, color, name) {
	slide.addShape(pres.shapes.LINE, {
		x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
		line: { color, width: 1.25, dashType: "dash" }, objectName: name,
	});
}

function dot(slide, cx, cy, d, color, name) {
	slide.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color }, objectName: name });
}

function label(slide, value, x, y, w, color, name, size = 10) {
	text(slide, value, { x, y, w, h: 0.25, fontSize: size, bold: true, charSpacing: 2, color, objectName: name });
}

// ------------------------------------------------------------------ 1. cover

pres.addSection({ title: "О себе" });
{
	const s = pres.addSlide({ masterName: "COVER", sectionTitle: "О себе" });
	photo(s, "cover_photo", "Мохинур Комолова у фотографии образа из коллекции «Хумо» на выставке");
	swatch(s, "swatch_crimson", 7.3, 4.95, 1.6, "Лоскут иката");
	text(s, "СТУДRUSSIA · СЗФО 2026", { x: 0.6, y: 0.55, w: 6.5, h: 0.3, fontSize: 11, bold: true, charSpacing: 3, color: C.accent4, objectName: "Событие" });
	heading(s, "Мохинур\nКомолова", "title");
	text(s, "Комолова Мохинур Олимбой кизи", { x: 0.6, y: 3.9, w: 6.6, h: 0.35, fontSize: 15, charSpacing: 0.5, color: C.background2, objectName: "ФИО" });
	text(s, "Код культуры в современном костюме", { x: 0.6, y: 4.4, w: 6.6, h: 0.45, fontFace: HEAD, italic: true, fontSize: 22, color: C.accent4, objectName: "Девиз" });
	label(s, "НОМИНАЦИЯ", 0.6, 5.45, 3.2, C.accent5, "Подпись номинации");
	text(s, "«Вдохновленные творчеством»", { x: 0.6, y: 5.75, w: 3.3, h: 0.6, fontSize: 13, color: C.background1, objectName: "Номинация" });
	label(s, "ВУЗ", 4.1, 5.45, 3.0, C.accent5, "Подпись вуза");
	text(s, "СПбГУПТД, Институт дизайна костюма", { x: 4.1, y: 5.75, w: 3.0, h: 0.6, fontSize: 13, color: C.background1, objectName: "Вуз" });
	text(s, "Санкт-Петербург · 24-25 октября 2026", { x: 0.6, y: 6.9, w: 5.0, h: 0.3, fontSize: 10, charSpacing: 1, color: C.accent5, objectName: "Дата" });
	s.addNotes(
		"Здравствуйте! Меня зовут Мохинур Комолова, я дизайнер костюма из Узбекистана. " +
		"Учусь в магистратуре Санкт-Петербургского государственного университета промышленных технологий и дизайна. " +
		"Номинация «Вдохновленные творчеством»."
	);
}

// ------------------------------------------------------------------ 2. about

{
	const s = pres.addSlide({ masterName: "LIGHT_LEFT", sectionTitle: "О себе" });
	heading(s, "О СЕБЕ", "kicker");
	heading(s, "Ташкент · Петербург · Милан", "title");
	text(s, "Соединяю узбекское наследие и современный крой", {
		x: 0.6, y: 1.72, w: 6.8, h: 0.4, fontFace: HEAD, italic: true, fontSize: 17, color: C.text2, objectName: "Лид",
	});
	const rows = [
		["ФИО", "Комолова Мохинур Олимбой кизи"],
		["ВУЗ", "СПбГУПТД, Институт дизайна костюма: бакалавриат 2025, сейчас магистратура"],
		["НАПРАВЛЕНИЕ", "Авторский костюм: икат, вышивка, перья"],
		["ОБЩЕСТВЕННАЯ РОЛЬ", "Представитель Союза молодёжи Узбекистана в СЗФО"],
	];
	const rowH = [0.56, 0.78, 0.56, 0.78];
	rows.forEach(([k, v], i) => {
		const y = 2.3 + rowH.slice(0, i).reduce((a, b) => a + b, 0);
		s.addShape(pres.shapes.LINE, { x: 0.6, y, w: 6.8, h: 0, line: { color: C.background2, width: 1 }, objectName: `Линия ${i + 1}` });
		label(s, k, 0.6, y + 0.15, 1.9, C.accent1, `Поле ${i + 1}`, 9);
		text(s, v, { x: 2.55, y: y + 0.11, w: 4.85, h: rowH[i] - 0.14, fontSize: 14, color: C.text1, objectName: `Значение ${i + 1}` });
	});
	const stats = [
		["10+", "конкурсных наград:\nГран-при и первые места"],
		["5", "недель моды,\nвключая Китай"],
		["2", "музея: Эрмитаж\nи Третьяковская галерея"],
	];
	stats.forEach(([n, t], i) => {
		const x = 0.6 + i * 2.3;
		text(s, n, { x, y: 5.3, w: 2.1, h: 0.75, fontFace: HEAD, fontSize: 44, color: C.accent1, objectName: `Цифра ${i + 1}` });
		text(s, t, { x, y: 6.07, w: 2.15, h: 0.6, fontSize: 11, color: C.text2, objectName: `Подпись цифры ${i + 1}` });
	});
	photo(s, "s2_portrait", "Мохинур Комолова в Милане, 2025");
	photo(s, "s2_look1", "Образ из узбекского иката на подиуме");
	photo(s, "s2_look2", "Образ с золотой накидкой из перьев на показе");
	s.addNotes(
		"Мой путь: Ташкент, Петербург, Милан. В 2025 году я окончила бакалавриат Института дизайна костюма СПбГУПТД, сейчас учусь в магистратуре. " +
		"Я создаю авторские костюмы на основе узбекского иката: соединяю традиционные ткани, ручную вышивку и перья с современным кроем. " +
		"Кроме учёбы и творчества, я представляю Союз молодёжи Узбекистана в Северо-Западном федеральном округе. " +
		"За плечами больше десяти конкурсных наград, пять недель моды и показы в Эрмитаже и Третьяковской галерее."
	);
}

// ------------------------------------------------------------------ 3. Behzod code

pres.addSection({ title: "Достижения" });
{
	const s = pres.addSlide({ masterName: "DARK_LEFT", sectionTitle: "Достижения" });
	photo(s, "medallion", "Золотой медальон-шамса, мотив восточной миниатюры");
	heading(s, "ДОСТИЖЕНИЕ 01 · КУЛЬТУРНЫЙ ПРОЕКТ", "kicker");
	heading(s, "«Код Бехзода»", "title");
	text(s, "Всероссийский творческий конкурс", { x: 0.6, y: 1.68, w: 7.0, h: 0.4, fontSize: 18, color: C.background1, objectName: "Подзаголовок" });
	text(s, "Вдохновлён наследием Камолиддина Бехзода, великого мастера восточной миниатюры", {
		x: 0.6, y: 2.12, w: 6.6, h: 0.75, fontFace: HEAD, italic: true, fontSize: 16, color: C.accent4, objectName: "Описание",
	});
	const steps = [
		["01", "ЧТО СДЕЛАЛА", "Придумала и запустила конкурс всероссийского масштаба"],
		["02", "МОЯ РОЛЬ", "Автор идеи и организатор: концепция, партнёры, запуск"],
		["03", "РЕЗУЛЬТАТ", "Новая площадка культурного диалога России и Узбекистана"],
	];
	const sx = [0.6, 2.95, 5.3];
	seam(s, 0.6, 3.22, 7.45, 3.22, C.accent2, "Шов");
	steps.forEach(([n, k, v], i) => {
		dot(s, sx[i] + 0.07, 3.22, 0.14, C.accent4, `Узел ${i + 1}`);
		text(s, n, { x: sx[i], y: 3.42, w: 2.1, h: 0.45, fontFace: HEAD, fontSize: 24, color: C.accent4, objectName: `Номер ${i + 1}` });
		label(s, k, sx[i], 3.95, 2.15, C.accent5, `Этап ${i + 1}`);
		text(s, v, { x: sx[i], y: 4.27, w: 2.15, h: 1.05, fontSize: 14, color: C.background1, objectName: `Текст ${i + 1}` });
	});
	label(s, "ПАРТНЁРЫ КОНКУРСА", 0.6, 5.55, 4.0, C.accent4, "Партнёры");
	["Генеральное консульство Республики Узбекистан в Санкт-Петербурге", "Академия художеств Республики Узбекистан"].forEach((t, i) => {
		const y = 5.9 + i * 0.38;
		dot(s, 0.67, y + 0.13, 0.1, C.accent2, `Маркер партнёра ${i + 1}`);
		text(s, t, { x: 0.9, y, w: 6.7, h: 0.3, fontSize: 12.5, color: C.background1, objectName: `Партнёр ${i + 1}` });
	});
	s.addNotes(
		"Первое достижение: я придумала и запустила Всероссийский творческий конкурс «Код Бехзода». " +
		"Камолиддин Бехзод: великий мастер восточной миниатюры, его называют Рафаэлем Востока. " +
		"Моя роль: автор идеи и организатор. Я разработала концепцию и объединила партнёров: Генеральное консульство Республики Узбекистан в Санкт-Петербурге и Академию художеств Республики Узбекистан. " +
		"Результат: появилась новая площадка культурного диалога России и Узбекистана."
	);
}

// ------------------------------------------------------------------ 4. NABA

{
	const s = pres.addSlide({ masterName: "LIGHT_LEFT", sectionTitle: "Достижения" });
	heading(s, "ДОСТИЖЕНИЕ 02 · МЕЖДУНАРОДНОЕ ОБУЧЕНИЕ", "kicker");
	heading(s, "Стажировка в NABA, Милан", "title");
	text(s, "Nuova Accademia di Belle Arti: одна из крупнейших академий искусства и дизайна Италии", {
		x: 0.6, y: 1.7, w: 6.3, h: 0.75, fontFace: HEAD, italic: true, fontSize: 16, color: C.text2, objectName: "Описание",
	});
	const steps = [
		["ЧТО СДЕЛАЛА", "Прошла летнюю программу Fashion\u00A0Design\u00A02 в Милане"],
		["МОЯ РОЛЬ", "Получила квоту на обучение и прошла программу полностью"],
		["РЕЗУЛЬТАТ", "Сертификат NABA и европейский взгляд на создание коллекции"],
	];
	const ys = [2.85, 4.05, 5.25];
	seam(s, 0.67, ys[0], 0.67, ys[2], C.accent2, "Шов");
	steps.forEach(([k, v], i) => {
		dot(s, 0.67, ys[i], 0.16, C.accent1, `Узел ${i + 1}`);
		label(s, k, 1.05, ys[i] - 0.11, 4.0, C.accent1, `Этап ${i + 1}`);
		text(s, v, { x: 1.05, y: ys[i] + 0.2, w: 5.6, h: 0.8, fontSize: 15, color: C.text1, objectName: `Текст ${i + 1}` });
	});
	photo(s, "s4_cert", "Сертификат NABA: Summer Programme Fashion Design 2, 15-25 июля 2025");
	text(s, "45", { x: 7.35, y: 2.45, w: 2.4, h: 1.05, fontFace: HEAD, fontSize: 66, color: C.accent1, objectName: "Цифра" });
	text(s, "часов занятий\nпо fashion-дизайну", { x: 7.35, y: 3.55, w: 2.45, h: 0.6, fontSize: 13, color: C.text1, objectName: "Подпись цифры" });
	label(s, "15-25 ИЮЛЯ 2025", 7.35, 4.4, 2.45, C.accent1, "Даты");
	text(s, "Summer Programme\nFashion Design 2", { x: 7.35, y: 4.75, w: 2.45, h: 0.65, fontFace: HEAD, italic: true, fontSize: 14, color: C.text2, objectName: "Программа" });
	photo(s, "s4_dress", "Образ в белом на фоне кампуса, Милан, 2025");
	s.addNotes(
		"Второе достижение: стажировка в NABA, Новой академии изящных искусств в Милане. " +
		"Я получила квоту на обучение и прошла летнюю программу Fashion Design 2: 45 часов занятий с 15 по 25 июля 2025 года. " +
		"Результат: сертификат NABA и европейский взгляд на то, как рождается коллекция, от исследования и идеи до готового образа."
	);
}

// ------------------------------------------------------------------ 5. Union of designers

{
	const s = pres.addSlide({ masterName: "LIGHT_RIGHT", sectionTitle: "Достижения" });
	photo(s, "s5_card", "Удостоверение члена Санкт-Петербургского союза дизайнеров");
	heading(s, "ДОСТИЖЕНИЕ 03 · ПРОФЕССИОНАЛЬНОЕ ПРИЗНАНИЕ", "kicker");
	heading(s, "Член Санкт-Петербургского\nсоюза дизайнеров", "title");
	const cards = [
		["01", "ЧТО СДЕЛАЛА", "Представила союзу портфолио авторских коллекций"],
		["02", "МОЯ РОЛЬ", "Автор коллекций на основе узбекского иката"],
		["03", "РЕЗУЛЬТАТ", "Принята в члены союза, получила удостоверение"],
	];
	cards.forEach(([n, k, v], i) => {
		const x = 5.5 + i * 2.483;
		s.addShape(pres.shapes.RECTANGLE, { x, y: 2.5, w: 2.27, h: 2.45, fill: { color: C.background2 }, objectName: `Карточка ${i + 1}` });
		text(s, n, { x: x + 0.22, y: 2.68, w: 1.8, h: 0.45, fontFace: HEAD, fontSize: 22, color: C.accent2, objectName: `Номер ${i + 1}` });
		label(s, k, x + 0.22, 3.2, 1.9, C.accent1, `Этап ${i + 1}`, 9.5);
		text(s, v, { x: x + 0.22, y: 3.5, w: 1.88, h: 1.35, fontSize: 14, color: C.text1, objectName: `Текст ${i + 1}` });
	});
	label(s, "ЧТО ЭТО ДАЁТ", 5.5, 5.35, 4.0, C.accent1, "Подпись итога");
	text(s, "Профессиональная среда Петербурга: выставки, проекты и коллеги по цеху", {
		x: 5.5, y: 5.68, w: 7.2, h: 0.8, fontFace: HEAD, italic: true, fontSize: 19, color: C.text1, objectName: "Итог",
	});
	s.addNotes(
		"Третье достижение: меня приняли в члены Санкт-Петербургского союза дизайнеров. " +
		"Я представила портфолио своих коллекций на основе узбекского иката и получила удостоверение члена союза. " +
		"Для меня это признание профессионального уровня и вход в профессиональную среду Петербурга: выставки, проекты, коллеги по цеху."
	);
}

// ------------------------------------------------------------------ 6. collections and venues

pres.addSection({ title: "Подтверждения" });
{
	const s = pres.addSlide({ masterName: "DARK_WIDE", sectionTitle: "Подтверждения" });
	heading(s, "ПОДТВЕРЖДЕНИЯ · КОЛЛЕКЦИИ И ПОКАЗЫ", "kicker");
	heading(s, "От подиума до музейных залов", "title");
	photo(s, "s6_humo", "Показ коллекции «Хумо» Мохинур Комоловой на сцене");
	text(s, "Коллекция «Хумо», 2025 · икат, ручная вышивка стеклярусом, перья", {
		x: 0.6, y: 6.5, w: 6.75, h: 0.3, fontSize: 10.5, color: C.accent5, objectName: "Подпись фото",
	});
	const venues = [
		["Государственный Эрмитаж", "Главный штаб, форум «Диалог культур»"],
		["Государственная Третьяковская галерея", "экспонирование авторских моделей"],
		["Dalian Fashion Week, Китай", "2025, от имени СПбГУПТД"],
		["MODAM Fashion Weekend", "Санкт-Петербург, 2026 · «Хумо»"],
		["«От ремесла к подиуму», Рязань", "международный фестиваль, 2026 · «Хумо»"],
		["Volga · Don · Estet Fashion Week", "показы авторских коллекций"],
	];
	const vy0 = 2.02, step = 0.745;
	seam(s, 7.97, vy0 + 0.11, 7.97, vy0 + 0.11 + step * (venues.length - 1), C.accent2, "Шов");
	venues.forEach(([t, d], i) => {
		const y = vy0 + i * step;
		dot(s, 7.97, y + 0.11, 0.14, C.accent4, `Узел ${i + 1}`);
		text(s, t, { x: 8.3, y: y - 0.02, w: 4.45, h: 0.3, fontSize: 13, bold: true, color: C.background1, objectName: `Площадка ${i + 1}` });
		text(s, d, { x: 8.3, y: y + 0.28, w: 4.45, h: 0.3, fontSize: 11, color: C.accent5, objectName: `Детали ${i + 1}` });
	});
	s.addNotes(
		"Мои коллекции видели на очень разных площадках. Этническая коллекция была представлена в Главном штабе Эрмитажа на форуме «Диалог культур», модели экспонировались в Третьяковской галерее. " +
		"Я показывала коллекции на Dalian Fashion Week в Китае, на Volga, Don и Estet Fashion Week. " +
		"В 2026 году коллекция «Хумо» вышла на MODAM Fashion Weekend и на фестивале «От ремесла к подиуму» в Рязани. " +
		"Хумо: мифическая птица счастья, а в коллекции узбекский икат, ручная вышивка стеклярусом и перья."
	);
}

// ------------------------------------------------------------------ 7. awards

{
	const s = pres.addSlide({ masterName: "LIGHT_WIDE", sectionTitle: "Подтверждения" });
	heading(s, "ПОДТВЕРЖДЕНИЯ · НАГРАДЫ", "kicker");
	heading(s, "Более 10 конкурсных наград", "title");
	photo(s, "s7_diploma", "Диплом победителя конкурса «Студент года 2025»");
	photo(s, "s7_stage", "Награждение на церемонии «Студент года 2025»");
	text(s, "«Студент года 2025»", { x: 0.6, y: 4.98, w: 6.0, h: 0.5, fontFace: HEAD, fontSize: 25, color: C.text1, objectName: "Главная награда" });
	text(s, "Победитель в номинации «Лучший в художественном творчестве»", {
		x: 0.6, y: 5.5, w: 6.0, h: 0.6, fontSize: 14, color: C.text1, objectName: "Номинация",
	});
	text(s, "Комитет по науке и высшей школе Правительства Санкт-Петербурга", {
		x: 0.6, y: 6.2, w: 6.0, h: 0.3, fontSize: 10, color: C.accent6, objectName: "Организатор",
	});
	const awards = [
		["Гран-при", "«Образы творчества»", "выставка-конкурс, 2025"],
		["1 место", "«Синяя лента», 2025", "женская форма машиниста метро Петербурга"],
		["Победитель", "«Лучший иностранный студент СПбГУПТД»", "номинация «Лучший в творчестве», 2025"],
		["2 и 3 место", "«Пушкинский бал»", "международный конкурс"],
		["3 место", "«Адмиралтейская игла»", "2024, театральный костюм, коллекция «Ertak»"],
		["Спецприз", "«Студенческая весна в Санкт-Петербурге»", "мода с элементами этно"],
	];
	awards.forEach(([rank, name, detail], i) => {
		const col = i % 2, row = Math.floor(i / 2);
		const x = 7.1 + col * 2.913, y = 1.95 + row * 1.6;
		s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.72, h: 1.45, fill: { color: C.background2 }, objectName: `Награда ${i + 1}` });
		text(s, rank, { x: x + 0.18, y: y + 0.12, w: 2.4, h: 0.42, fontFace: HEAD, fontSize: 21, color: C.accent1, objectName: `Место ${i + 1}` });
		text(s, [
			{ text: name, options: { fontSize: 11.5, bold: true, color: C.text1, breakLine: true } },
			{ text: detail, options: { fontSize: 10, color: C.text2, paraSpaceBefore: 3 } },
		], { x: x + 0.18, y: y + 0.56, w: 2.42, h: 0.84, objectName: `Конкурс ${i + 1}` });
	});
	s.addNotes(
		"Мои работы отмечены более чем десятью наградами. Главная: я победитель конкурса «Студент года 2025» в номинации «Лучший в художественном творчестве». " +
		"А ещё Гран-при «Образов творчества», первое место конкурса «Синяя лента» за женскую форму машиниста метро Петербурга, призовые места «Пушкинского бала» и «Адмиралтейской иглы»."
	);
}

// ------------------------------------------------------------------ 8. results and plans

pres.addSection({ title: "Итоги" });
{
	const s = pres.addSlide({ masterName: "LIGHT_WIDE", sectionTitle: "Итоги" });
	heading(s, "ИТОГИ И ПЛАНЫ", "kicker");
	heading(s, "Чему я научилась и куда иду", "title");
	const cols = [
		["ИТОГИ ГОДА", 0.6, [
			"Превращать культурный код в современную форму: икат, вышивка и перья в актуальном крое",
			"Работать в международной среде: Милан, Китай, крупнейшие музеи России",
			"Вести проект от идеи до запуска: «Код Бехзода» с консульством и академией",
		]],
		["ПЛАНЫ", 5.0, [
			"Провести следующий сезон «Кода Бехзода» и выставку работ участников",
			"Завершить магистратуру и создать собственный бренд на основе иката",
			"Показать новую коллекцию на международной неделе моды",
		]],
	];
	cols.forEach(([head, x, items], c) => {
		label(s, head, x, 1.98, 4.0, C.accent1, `Колонка ${c + 1}`, 11);
		items.forEach((t, i) => {
			const y = 2.45 + i * 1.3;
			text(s, String(i + 1).padStart(2, "0"), { x, y, w: 0.6, h: 0.4, fontFace: HEAD, fontSize: 20, color: C.accent2, objectName: `Номер ${c + 1}.${i + 1}` });
			text(s, t, { x: x + 0.62, y: y + 0.04, w: 3.4, h: 1.15, fontSize: 14, color: C.text1, objectName: `Пункт ${c + 1}.${i + 1}` });
		});
	});
	s.addShape(pres.shapes.LINE, { x: 4.75, y: 2.05, w: 0, h: 4.25, line: { color: C.background2, width: 1.25 }, objectName: "Разделитель" });
	photo(s, "s8_parade", "Мохинур Комолова в авторском костюме на городском празднике");
	swatch(s, "swatch_indigo", 9.1, 5.3, 1.3, "Лоскут иката");
	s.addNotes(
		"Чему я научилась за этот год? Переводить культурный код на язык современной моды, работать в международной среде и вести проект от идеи до запуска. " +
		"Мои планы: провести следующий сезон «Кода Бехзода» с выставкой работ участников, завершить магистратуру и создать собственный бренд на основе иката, " +
		"а также показать новую коллекцию на международной неделе моды."
	);
}

// ------------------------------------------------------------------ 9. thanks

{
	const s = pres.addSlide({ masterName: "END", sectionTitle: "Итоги" });
	swatch(s, "swatch_indigo", 8.35, 0.7, 2.55, "Лоскут иката, индиго");
	swatch(s, "swatch_crimson", 10.15, 2.2, 2.45, "Лоскут иката, гранат");
	swatch(s, "swatch_noir", 8.8, 4.2, 2.15, "Лоскут иката, чёрный");
	text(s, "Рахмат!", { x: 0.6, y: 1.45, w: 7.0, h: 1.6, fontFace: HEAD, italic: true, fontSize: 96, color: C.accent4, objectName: "Рахмат" });
	heading(s, "Спасибо за внимание", "title");
	text(s, "Буду рада ответить на ваши вопросы", { x: 0.6, y: 4.1, w: 7.0, h: 0.4, fontSize: 16, color: C.accent5, objectName: "Вопросы" });
	label(s, "МОХИНУР КОМОЛОВА", 0.6, 5.7, 5.0, C.accent4, "Имя", 11);
	text(s, "Дизайнер костюма · «Вдохновленные творчеством»", { x: 0.6, y: 6.02, w: 7.0, h: 0.3, fontSize: 12, color: C.accent5, objectName: "Подпись" });
	s.addNotes("Рахмат! Спасибо за внимание, буду рада ответить на ваши вопросы.");
}

(async () => {
	await pres.writeFile({ fileName: OUT });
	await applyTheme(OUT, THEME);
	console.log("wrote", OUT);
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
