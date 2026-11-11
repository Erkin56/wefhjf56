import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {FONT} from './fonts';
import {H, Heart, W, clamp01, pop, ramp, useT} from './kit';
import {Scene12} from './s12';
import {Scene3} from './s3';
import {FactCard, Scene456} from './s456';

/** Burned-in subtitles: [start, end, text]. The text repeats the voice track word for word. */
const SUBS: [number, number, string][] = [
	[10.2, 12.05, 'Я просто хотел учиться!'],
	[14.41, 17.2, 'Спокойно! Я твой\nискусственный интеллект.'],
	[17.33, 19.0, 'Помогу выучить русский!'],
	[19.19, 20.6, 'Даже падежи?'],
	[22.62, 25.15, 'Ну... я же не волшебник!'],
	[32.11, 34.35, 'Кого? Чего?'],
	[34.66, 36.45, 'Меня?! За что?!'],
	[39.28, 41.45, 'Нет кого? Студента!'],
	[45.48, 47.74, 'Сегодня российские\nисследователи развивают'],
	[47.74, 50.9, 'технологии искусственного\nинтеллекта и обработки речи.'],
	[51.14, 53.42, 'Эти разработки открывают\nновые возможности'],
	[53.44, 54.9, 'для изучения языков.'],
	[55.2, 58.9, 'Поздравляю! Теперь ты можешь\nчитать научные статьи!'],
	[59.16, 61.55, 'А можно сначала\nменю в столовой?'],
	[67.78, 69.1, 'Уважаемые коллеги!'],
	[69.26, 71.1, 'Представляю наше исследование:'],
	[71.22, 73.78, 'как искусственный интеллект\nпомогает иностранцам'],
	[73.82, 75.4, 'изучать русский язык!'],
	[78.48, 81.15, 'Поздравляю!\nТолько один вопрос...'],
	[81.34, 81.95, 'Какой?'],
	[82.28, 85.7, 'Объясни разницу между\n«надеть» и «одеть».'],
];

const Subtitles: React.FC = () => {
	const t = useT();
	const cur = SUBS.find(([a, b]) => t >= a && t < b);
	if (!cur) {
		return null;
	}
	const [a, b, text] = cur;
	const lines = text.split('\n');
	const longest = Math.max(...lines.map((l) => l.length));
	const size = Math.min(58, (58 * 25) / longest);
	const lh = size * 1.24;
	const k = clamp01((t - a) / 0.1);
	const o = Math.min(k, clamp01((b - t) / 0.07));
	const base = 1742;
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
			<g transform={`translate(540 ${base + (1 - k) * 14}) scale(${0.96 + 0.04 * k})`}>
				{lines.map((ln, i) => (
					<text
						key={i}
						x={0}
						y={(i - (lines.length - 1)) * lh}
						fontFamily={FONT.montserrat}
						fontWeight={800}
						fontSize={size}
						textAnchor="middle"
						fill="#ffffff"
						stroke="#000000"
						strokeWidth={13}
						strokeLinejoin="round"
						strokeLinecap="round"
						style={{paintOrder: 'stroke', filter: 'drop-shadow(0 5px 6px rgba(0,0,0,.55))'}}
					>
						{ln}
					</text>
				))}
			</g>
		</svg>
	);
};

/** Game interface shown while the hero is inside the "language game". */
const Hud: React.FC = () => {
	const t = useT();
	if (t < 7.4 || t >= 45.0) {
		return null;
	}
	const a = Math.min(1, pop(t, 7.45, 0.3));
	const lives = t < 11.86 ? 3 : 2;
	const xp = Math.round(100 * ramp(t, 44.0, 44.5));
	const label = t < 25.2 ? 'СЛОЖНОСТЬ: МАКС' : 'УРОВЕНЬ 1';
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 140, transform: `translateY(${(1 - a) * -140}px)`}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 150, background: 'linear-gradient(180deg, rgba(10,2,36,.75), rgba(10,2,36,0))'}} />
			{[0, 1, 2].map((i) => (
				<Heart key={i} x={40 + i * 62} y={52} s={54} color={i < lives ? '#ff3b5c' : '#3b2a5a'} />
			))}
			<div style={{position: 'absolute', left: 0, top: 68, width: W, textAlign: 'center', fontFamily: FONT.pressStart2P, fontSize: 21, color: t < 25.2 ? '#ff6b81' : '#ffffff', textShadow: '0 3px 0 #16052e'}}>{label}</div>
			<div style={{position: 'absolute', right: 40, top: 64, fontFamily: FONT.pressStart2P, fontSize: 26, color: '#ffd93d', textShadow: '0 3px 0 #16052e'}}>XP {String(xp).padStart(3, '0')}</div>
		</div>
	);
};

export const Film: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#000'}}>
		<Scene12 />
		<Scene3 />
		<Scene456 />
		<Hud />
		<FactCard />
		<Subtitles />
		<Audio src={staticFile('audio/mix.wav')} />
	</AbsoluteFill>
);
