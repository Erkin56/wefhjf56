import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import meta from './assets.json';
import {FONT} from './fonts';
import {Audience, Flash, Glitch, H, Heart, Ken, OText, Rings, Robot, Shot, Sprite, Vignette, W, clamp01, easeIn, easeOut, env, img, lerp, pop, ramp, rnd, useT} from './kit';

/* ------------------------------------------------------------ scene 4 */

const D1: React.FC = () => {
	const t = useT();
	return (
		<>
			<Ken
				src={img('k4b.jpg')}
				cams={[
					[45.0, [1.0, 0.5, 0.5]],
					[48.2, [1.2, 0.5, 0.38]],
				]}
				ease={(x) => x}
			/>
			<div
				style={{
					position: 'absolute',
					left: 60,
					top: 170,
					transform: `translateX(${(1 - easeOut(ramp(t, 45.35, 45.75))) * -560}px)`,
					opacity: 1 - ramp(t, 47.8, 48.15),
					background: 'rgba(8,20,60,.84)',
					borderLeft: '10px solid #6495ed',
					borderRadius: '0 18px 18px 0',
					padding: '14px 30px 16px 22px',
					color: '#fff',
					fontFamily: FONT.montserrat,
				}}
			>
				<div style={{fontWeight: 800, fontSize: 44, letterSpacing: 1}}>УНИВЕРСИТЕТ</div>
				<div style={{fontWeight: 600, fontSize: 29, opacity: 0.85}}>Новый уровень: наука</div>
			</div>
			<Flash at={45.0} d={0.32} max={0.9} />
			<Vignette o={0.3} />
		</>
	);
};

const D2: React.FC = () => (
	<>
		<Ken
			src={img('k4d.jpg')}
			cams={[
				[48.2, [1.5, 0.3, 0.47]],
				[51.6, [1.5, 0.7, 0.5]],
			]}
		/>
		<Vignette o={0.3} />
	</>
);

/** The one real development shown in the film (wording checked against the Interspeech 2025 paper). */
export const FactCard: React.FC = () => {
	const t = useT();
	if (t < 50.2 || t >= 55.0) {
		return null;
	}
	const a = pop(t, 50.2, 0.35);
	return (
		<div
			style={{
				position: 'absolute',
				left: 60,
				top: 150,
				width: 960,
				transform: `translateY(${(1 - Math.min(1, a)) * -90}px) scale(${0.9 + 0.1 * a})`,
				opacity: clamp01(a * 1.5) * (1 - ramp(t, 54.75, 55.0)),
				background: 'rgba(255,255,255,.97)',
				borderRadius: 34,
				borderLeft: '14px solid #2f6bff',
				padding: '26px 36px 28px',
				boxSizing: 'border-box',
				boxShadow: '0 18px 50px rgba(0,20,80,.45)',
				color: '#0b1d4d',
			}}
		>
			<div style={{display: 'inline-block', background: '#2f6bff', color: '#fff', fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 24, letterSpacing: 2, padding: '6px 16px', borderRadius: 12}}>РЕАЛЬНАЯ РАЗРАБОТКА</div>
			<div style={{fontFamily: FONT.unbounded, fontWeight: 800, fontSize: 76, lineHeight: 1.1, marginTop: 12}}>GigaAM</div>
			<div style={{fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 38, lineHeight: 1.2, marginTop: 6}}>открытые модели распознавания русской речи</div>
			<div style={{fontFamily: FONT.inter, fontWeight: 600, fontSize: 30, marginTop: 12, color: '#44517a'}}>SaluteDevices, Interspeech 2025</div>
		</div>
	);
};

const Chip: React.FC<{text: string; x: number; y: number; at: number; bg?: string; color?: string; size?: number}> = ({text, x, y, at, bg = '#12306f', color = '#9ffcff', size = 30}) => {
	const t = useT();
	const a = pop(t, at, 0.25);
	if (a <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `scale(${a})`, transformOrigin: '0% 50%', background: bg, color, border: `3px solid ${color}`, borderRadius: 16, padding: '6px 18px', fontFamily: FONT.montserrat, fontWeight: 800, fontSize: size, letterSpacing: 1.5, whiteSpace: 'nowrap'}}>
			{text}
		</div>
	);
};

const Arrow: React.FC<{y: number; at: number}> = ({y, at}) => {
	const t = useT();
	if (t < at) {
		return null;
	}
	return (
		<>
			{[0, 1].map((i) => (
				<div key={i} style={{position: 'absolute', left: 540 - 34, top: y + i * 26, width: 68, height: 30, background: '#7ff6ff', clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 40%, 50% 100%, 0 40%)', opacity: 0.35 + 0.65 * Math.abs(Math.sin(t * 5 - i * 0.9))}} />
			))}
		</>
	);
};

const PHRASE = 'Здравствуйте! Я изучаю русский язык.';

const D3: React.FC = () => {
	const t = useT();
	const typed = PHRASE.slice(0, Math.round(ramp(t, 52.5, 54.2) * PHRASE.length));
	const box = pop(t, 51.95, 0.3);
	const bub = pop(t, 52.35, 0.3);
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #061737 0%, #0b2f78 100%)'}}>
			<AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(127,246,255,.22) 2px, transparent 2.5px)', backgroundSize: '54px 54px', opacity: 0.6}} />
			<Chip text="РЕЧЬ" x={60} y={530} at={51.65} />
			<div style={{position: 'absolute', left: 60, top: 612, width: 132, height: 132, borderRadius: 66, background: 'linear-gradient(135deg, #2f6bff, #7a3cff)', boxShadow: '0 0 30px rgba(80,140,255,.7)'}}>
				<div style={{position: 'absolute', left: 48, top: 24, width: 36, height: 58, borderRadius: 18, background: '#fff'}} />
				<div style={{position: 'absolute', left: 36, top: 56, width: 60, height: 40, borderRadius: '0 0 30px 30px', border: '6px solid #fff', borderTop: 'none', boxSizing: 'border-box'}} />
				<div style={{position: 'absolute', left: 63, top: 94, width: 6, height: 18, background: '#fff'}} />
			</div>
			<div style={{position: 'absolute', left: 226, top: 580, width: 794, height: 196, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				{Array.from({length: 38}, (_, i) => {
					const speech = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.6 + i * 0.21));
					const hgt = 14 + 170 * Math.abs(Math.sin(i * 0.7 + t * 8.5)) * speech * (0.35 + 0.65 * Math.sin((i / 37) * Math.PI));
					return <div key={i} style={{width: 12, height: hgt, borderRadius: 6, background: 'linear-gradient(180deg, #9ffcff, #2f6bff)'}} />;
				})}
			</div>
			<Arrow y={792} at={51.85} />
			<div
				style={{
					position: 'absolute',
					left: 130,
					top: 866,
					width: 820,
					height: 150,
					borderRadius: 30,
					background: 'linear-gradient(135deg, #2f6bff, #7a3cff)',
					boxShadow: '0 0 40px rgba(110,120,255,.7)',
					transform: `scale(${box})`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: FONT.montserrat,
					fontWeight: 800,
					fontSize: 50,
					color: '#fff',
					letterSpacing: 1,
				}}
			>
				РАСПОЗНАВАНИЕ РЕЧИ
			</div>
			<Arrow y={1032} at={52.25} />
			<Chip text="ТЕКСТ" x={60} y={1084} at={52.35} />
			<div style={{position: 'absolute', left: 60, top: 1150, width: 960, height: 130, borderRadius: 28, background: '#fff', transform: `scale(${bub})`, boxShadow: '0 14px 40px rgba(0,10,60,.45)', display: 'flex', alignItems: 'center', padding: '0 34px', boxSizing: 'border-box', fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 41, color: '#0b1d4d', whiteSpace: 'nowrap'}}>
				{typed}
				<span style={{display: 'inline-block', width: 5, height: 50, background: '#2f6bff', marginLeft: 6, opacity: Math.sin(t * 12) > 0 ? 1 : 0}} />
			</div>
			<Chip text="ОБРАБОТКА ЯЗЫКА" x={60} y={1322} at={53.7} bg="#ffe14d" color="#0b1d4d" />
			<Chip text="слова" x={470} y={1322} at={53.95} size={28} />
			<Chip text="падежи" x={640} y={1322} at={54.15} size={28} />
			<Chip text="смысл" x={836} y={1322} at={54.35} size={28} />
			<div style={{position: 'absolute', left: 0, top: 1426, width: W, textAlign: 'center', fontFamily: FONT.inter, fontWeight: 500, fontSize: 26, color: 'rgba(220,235,255,.6)'}}>Схематичная иллюстрация</div>
			<Flash at={51.6} d={0.2} max={0.5} />
		</AbsoluteFill>
	);
};

const LabBlur: React.FC<{a: number; b: number}> = ({a, b}) => (
	<>
		<Ken
			src={img('k4d.jpg')}
			cams={[
				[a, [2.3, 0.5, 0.13]],
				[b, [2.5, 0.5, 0.13]],
			]}
			ease={(x) => x}
			filter="blur(7px) brightness(.82)"
		/>
		<AbsoluteFill style={{background: 'radial-gradient(circle at 42% 40%, rgba(150,225,255,.22), rgba(0,0,0,0) 55%)'}} />
	</>
);

const Paper: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<div style={{position: 'absolute', left: x, top: y, width: 280, height: 350, background: '#fff', borderRadius: 10, boxShadow: '0 8px 22px rgba(0,10,40,.4)', transform: `rotate(${rot}deg)`, padding: '20px 22px', boxSizing: 'border-box'}}>
		<div style={{fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 21, color: '#0b1d4d', letterSpacing: 0.5}}>НАУЧНАЯ СТАТЬЯ</div>
		<div style={{height: 14, background: '#2f6bff', borderRadius: 4, marginTop: 14, width: '86%'}} />
		{[92, 100, 78, 96, 60].map((w, i) => (
			<div key={i} style={{height: 9, background: '#c9d3ea', borderRadius: 4, marginTop: 12, width: `${w}%`}} />
		))}
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 80, marginTop: 20}}>
			{[38, 62, 48, 76].map((h, i) => (
				<div key={i} style={{width: 34, height: h, background: i === 3 ? '#7a3cff' : '#9db8ff', borderRadius: 4}} />
			))}
		</div>
	</div>
);

const D4: React.FC = () => {
	const t = useT();
	const v = env('robot', t);
	return (
		<>
			<LabBlur a={55.0} b={58.95} />
			<Rings x={400} y={836} on={v} r0={36} r1={300} />
			<Robot x={400} y={740} w={620} mood={t < 56.25 ? 'happy' : 'normal'} talk bob={12} tilt={t < 56.25 ? -4 : 3} />
			{Array.from({length: 7}, (_, i) => {
				const at = 57.25 + i * 0.2;
				if (t < at) {
					return null;
				}
				const y = lerp(-420, 1140 - i * 34, easeIn(ramp(t, at, at + 0.22)));
				const bounce = t > at + 0.22 ? Math.sin(ramp(t, at + 0.22, at + 0.5) * Math.PI) * -14 : 0;
				return <Paper key={i} x={650 + (rnd(`px${i}`) - 0.5) * 44} y={y + bounce} rot={(rnd(`pr${i}`) - 0.5) * 16} />;
			})}
			<Flash at={55.0} d={0.15} max={0.35} />
			<Vignette o={0.4} />
		</>
	);
};

const D5: React.FC = () => {
	const t = useT();
	const a = pop(t, 60.3, 0.3);
	return (
		<>
			<Ken
				src={img('k4d_hero.jpg')}
				ih={1920}
				cams={[
					[58.95, [1.0, 0.5, 0.5]],
					[61.6, [1.12, 0.45, 0.36]],
				]}
				ease={(x) => x}
				shake={env('hero', t) * 2.5}
			/>
			{[0, 1].map((i) => (
				<div key={i} style={{position: 'absolute', left: 646 - i * 46 - (22 - i * 8), top: 548 + i * 62 - (22 - i * 8), width: (22 - i * 8) * 2, height: (22 - i * 8) * 2, borderRadius: '50%', background: '#fffdf5', border: '5px solid #2b2118', boxSizing: 'border-box', transform: `scale(${pop(t, 60.18 - i * 0.1, 0.2)})`}} />
			))}
			<div style={{position: 'absolute', left: 590, top: 170, width: 440, transform: `scale(${a})`, transformOrigin: '20% 100%', background: '#fffdf5', borderRadius: 40, border: '6px solid #2b2118', padding: '20px 34px 28px', boxSizing: 'border-box', boxShadow: '0 14px 40px rgba(0,0,0,.35)'}}>
				<div style={{fontFamily: FONT.russoOne, fontSize: 58, color: '#e2572b', textAlign: 'center'}}>МЕНЮ</div>
				{['Борщ', 'Котлета с пюре', 'Компот'].map((s, i) => (
					<div key={s} style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 38, color: '#2b2118', marginTop: 10, whiteSpace: 'nowrap'}}>
						<span style={{width: 18, height: 18, borderRadius: 9, background: ['#c8102e', '#b8742a', '#d94a7a'][i], flexShrink: 0}} />
						{s}
					</div>
				))}
			</div>
			<Vignette o={0.35} />
		</>
	);
};

const D6: React.FC = () => {
	const t = useT();
	return (
		<>
			<LabBlur a={61.6} b={63.2} />
			<Robot x={540} y={820} w={lerp(700, 760, ramp(t, 61.6, 63.2))} mood="ironic" bob={5} tilt={6} />
			{[61.95, 62.25, 62.55].map((at, i) => (
				<div key={i} style={{position: 'absolute', left: 540 + (i - 1) * 88 - 26, top: 330 - 26, width: 52, height: 52, borderRadius: '50%', background: '#fff', boxShadow: '0 6px 0 rgba(10,20,70,.55)', transform: `scale(${pop(t, at, 0.22)})`}} />
			))}
			<Vignette o={0.4} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: ramp(t, 62.9, 63.2)}} />
		</>
	);
};

/* ------------------------------------------------------------ scene 5 */

const E1: React.FC = () => {
	const t = useT();
	const a = ramp(t, 63.35, 63.9) * (1 - ramp(t, 64.85, 65.2));
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<OText text={'НЕСКОЛЬКО ЛЕТ\nСПУСТЯ...'} x={540} y={900} size={88} lh={1.22} sw={0} weight={700} ls={lerp(14, 3, easeOut(ramp(t, 63.35, 64.6)))} fill="#ffffff" opacity={a} />
			<div style={{position: 'absolute', left: 540 - 170 * easeOut(ramp(t, 63.6, 64.4)), top: 1050, width: 340 * easeOut(ramp(t, 63.6, 64.4)), height: 6, borderRadius: 3, background: '#6495ed', opacity: a}} />
		</AbsoluteFill>
	);
};

const SlideTitle: React.FC<{top: string; main: string; sub?: string}> = ({top, main, sub}) => (
	<div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0b1d4d', textAlign: 'center', padding: 30}}>
		<div style={{fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: '#2f6bff'}}>{top}</div>
		<div style={{fontFamily: FONT.unbounded, fontWeight: 800, fontSize: 58, lineHeight: 1.14, marginTop: 16}}>{main}</div>
		{sub ? <div style={{fontFamily: FONT.montserrat, fontWeight: 600, fontSize: 30, marginTop: 16, color: '#44517a'}}>{sub}</div> : null}
	</div>
);

const HallWide: React.FC<{slide: React.ReactNode; heroX: number; walking?: boolean; clap?: number; zoom?: number; children?: React.ReactNode}> = ({slide, heroX, walking, clap = 0, zoom = 1, children}) => {
	const t = useT();
	const bobY = walking ? -Math.abs(Math.sin(t * 9)) * 9 : 0;
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #060a1e 0%, #0e1840 46%, #080c22 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${zoom})`, transformOrigin: '50% 42%'}}>
				{[140, 340, 540, 740, 940].map((x) => (
					<div key={x} style={{position: 'absolute', left: x - 40, top: 90, width: 80, height: 22, borderRadius: 11, background: '#dfe8ff', boxShadow: '0 0 50px 16px rgba(170,200,255,.55)'}} />
				))}
				<div style={{position: 'absolute', left: 110, top: 240, width: 860, height: 560, borderRadius: 14, border: '10px solid #1c2a5a', background: '#f4f8ff', boxShadow: '0 0 130px 34px rgba(120,160,255,.38)', boxSizing: 'border-box', overflow: 'hidden'}}>{slide}</div>
				<div style={{position: 'absolute', left: -40, top: 1010, width: W + 80, height: 250, background: 'linear-gradient(180deg, #2b3270 0%, #171c44 100%)', borderBottom: '8px solid #5b6cff'}} />
				<div style={{position: 'absolute', left: heroX - 230, top: 1128, width: 460, height: 96, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,250,220,.55), rgba(255,250,220,0) 70%)'}} />
				<Sprite name="suit_front" h={430} x={heroX} bottom={1198 + bobY} rot={walking ? Math.sin(t * 9) * 2 : 0} />
				<div style={{position: 'absolute', left: 285, top: 1004, width: 190, height: 214, background: 'linear-gradient(180deg, #4250a6, #1d2452)', clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)'}} />
				<div style={{position: 'absolute', left: 297, top: 1004, width: 166, height: 10, background: '#7f8dff'}} />
				<Audience y={1400} n={9} r={44} color="#1a2350" seed="r1" clap={clap} />
				<Audience y={1590} n={7} r={58} color="#111838" seed="r2" clap={clap} shift={40} />
				<Audience y={1830} n={5} r={82} color="#04060f" seed="r3" clap={clap} shift={-30} />
				{children}
			</div>
			<Vignette o={0.5} />
		</AbsoluteFill>
	);
};

const E2: React.FC = () => {
	const t = useT();
	const walk = ramp(t, 65.3, 67.25);
	return <HallWide slide={<SlideTitle top="НАУЧНАЯ КОНФЕРЕНЦИЯ" main="ИИ И ЯЗЫКИ" sub="Пленарный доклад" />} heroX={lerp(-80, 300, walk)} walking={walk > 0 && walk < 1} zoom={lerp(1, 1.08, ramp(t, 65.2, 67.6))} />;
};

const Backdrop: React.FC<{dark?: number}> = ({dark = 0}) => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 26%, #263c96 0%, #0d1645 55%, #050818 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 120, top: 110, width: 840, height: 560, borderRadius: 30, background: 'linear-gradient(180deg, #e6efff, #8fb0ff)', filter: 'blur(46px)', opacity: 0.5}} />
			{Array.from({length: 16}, (_, i) => {
				const r = 24 + rnd(`bk${i}`) * 60;
				return <div key={i} style={{position: 'absolute', left: rnd(`bx${i}`) * W - r + Math.sin(t * 0.5 + i) * 12, top: rnd(`by${i}`) * 1100 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: i % 3 ? 'rgba(160,195,255,.2)' : 'rgba(255,225,160,.22)', filter: 'blur(5px)'}} />;
			})}
			{dark ? <AbsoluteFill style={{backgroundColor: `rgba(2,3,12,${dark})`}} /> : null}
		</AbsoluteFill>
	);
};

const PodiumShot: React.FC<{h: number; bottom: number; top: number; a: number; b: number}> = ({h, bottom, top, a, b}) => {
	const t = useT();
	const v = env('hero', t);
	const p = ramp(t, a, b);
	return (
		<>
			<Backdrop />
			<Sprite name="suit_smile" h={h * (1 + 0.03 * p)} x={540} bottom={bottom - v * 9} rot={Math.sin(t * 3.1) * 0.7 + v * Math.sin(t * 11) * 0.5} sy={1 + v * 0.012} />
			<div style={{position: 'absolute', left: 90, top, width: 900, height: H - top + 10, background: 'linear-gradient(180deg, #2c377a 0%, #141a40 100%)', borderTop: '12px solid #5b6cff', borderRadius: '28px 28px 0 0', boxShadow: '0 -10px 40px rgba(0,0,0,.45)'}} />
			<div style={{position: 'absolute', left: 742, top: top - 160, width: 12, height: 172, background: '#0a0d1f', transform: 'rotate(-24deg)', transformOrigin: '50% 100%', borderRadius: 6}} />
			<div style={{position: 'absolute', left: 644, top: top - 190, width: 62, height: 62, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #8a93b8, #2a2f4a 60%, #10132a)', boxShadow: '0 6px 14px rgba(0,0,0,.5)'}} />
			<Flash at={a} d={0.12} max={0.3} />
			<Vignette o={0.45} />
		</>
	);
};

const STEPS = ['Речь студента', 'Распознавание речи', 'Анализ ошибок', 'Подсказка и практика'];
const STEP_AT = [69.75, 70.55, 71.45, 72.4];

const E4: React.FC = () => {
	const t = useT();
	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #060a1e 0%, #0e1840 60%, #080c22 100%)', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${lerp(1, 1.05, ramp(t, 69.2, 73.8))})`, transformOrigin: '50% 40%'}}>
				<div style={{position: 'absolute', left: 50, top: 200, width: 980, height: 1150, borderRadius: 20, border: '12px solid #1c2a5a', background: 'linear-gradient(180deg, #f7faff, #e6eeff)', boxShadow: '0 0 140px 40px rgba(120,160,255,.38)', boxSizing: 'border-box', padding: '44px 52px', color: '#0b1d4d'}}>
					<div style={{display: 'inline-block', background: '#2f6bff', color: '#fff', fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 28, letterSpacing: 2, padding: '8px 20px', borderRadius: 14}}>КОНЦЕПТ ИССЛЕДОВАНИЯ</div>
					<div style={{fontFamily: FONT.unbounded, fontWeight: 800, fontSize: 68, lineHeight: 1.08, marginTop: 26}}>ИИ-НАСТАВНИК</div>
					<div style={{fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 50, color: '#2f6bff', marginTop: 8}}>по русскому языку</div>
					<div style={{position: 'relative', marginTop: 44}}>
						<div style={{position: 'absolute', left: 43, top: 84, width: 8, height: 3 * 182 * ramp(t, 69.9, 72.5), background: '#b9c9f5', borderRadius: 4}} />
						{STEPS.map((s, i) => {
							const a = pop(t, STEP_AT[i], 0.3);
							return (
								<div key={s} style={{display: 'flex', alignItems: 'center', gap: 30, height: 182, transform: `scale(${a})`, transformOrigin: '0% 50%', opacity: clamp01(a)}}>
									<div style={{width: 94, height: 94, borderRadius: 47, background: 'linear-gradient(135deg, #2f6bff, #7a3cff)', color: '#fff', fontFamily: FONT.russoOne, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(47,107,255,.4)', position: 'relative'}}>{i + 1}</div>
									<div style={{fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 50, lineHeight: 1.1}}>{s}</div>
								</div>
							);
						})}
					</div>
				</div>
				<Audience y={1650} n={6} r={64} color="#111838" seed="e4a" shift={30} />
				<Audience y={1870} n={4} r={92} color="#04060f" seed="e4b" shift={-40} />
			</div>
			<Flash at={69.2} d={0.12} max={0.3} />
			<Vignette o={0.45} />
		</AbsoluteFill>
	);
};

const E6: React.FC = () => {
	const t = useT();
	return (
		<HallWide slide={<SlideTitle top="ИИ-НАСТАВНИК" main="СПАСИБО ЗА ВНИМАНИЕ!" />} heroX={300} clap={1} zoom={lerp(1.04, 1.12, ramp(t, 75.4, 78.3))}>
			{[0, 1, 2].map((i) => {
				const p = (t * 0.55 + i / 3) % 1;
				return (
					<div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: (1 - p) * ramp(t, 75.9, 76.3)}}>
						<Heart x={770 + Math.sin(p * 6 + i * 2) * 60 + i * 30} y={1330 - p * 330} s={44 + i * 10} color="#ff5c8a" />
					</div>
				);
			})}
			<Robot x={800} y={1500} w={380} mood="happy" bob={24} glow={18} scale={pop(t, 75.6, 0.35)} />
			<div style={{position: 'absolute', left: 615, top: 1228 + Math.sin(t * 2.4) * 20, width: 370, transform: `rotate(-5deg) scale(${pop(t, 75.95, 0.3)})`, background: '#ffd93d', border: '6px solid #0b1d4d', borderRadius: 18, padding: '8px 0 10px', textAlign: 'center', fontFamily: FONT.russoOne, fontSize: 44, color: '#0b1d4d', boxShadow: '0 8px 0 rgba(0,0,0,.35)'}}>МОЙ СТУДЕНТ!</div>
		</HallWide>
	);
};

/* ------------------------------------------------------------ scene 6 */

const F1: React.FC = () => {
	const t = useT();
	const v = env('robot', t);
	const rx = lerp(1500, 805, easeOut(ramp(t, 78.15, 78.75)));
	return (
		<>
			<Backdrop />
			<Sprite name="suit_smile" h={1500} x={330} bottom={1996} rot={-1 + Math.sin(t * 2) * 0.5} />
			<Rings x={rx} y={489} on={v} r0={26} r1={220} />
			<Robot x={rx} y={430} w={420} talk mood={t < 79.6 ? 'happy' : 'normal'} tilt={-5} />
			<Flash at={78.3} d={0.15} max={0.35} />
			<Vignette o={0.45} />
		</>
	);
};

const F2: React.FC = () => {
	const t = useT();
	const v = env('hero', t);
	return (
		<>
			<Backdrop />
			<Sprite name="suit_smile" h={1750} x={580} bottom={2195 - v * 10} rot={2 + v * 1.2} sy={1 + v * 0.012} />
			<Vignette o={0.45} />
		</>
	);
};

const WordChip: React.FC<{text: string; x: number; at: number; bg: string; color: string; rot: number}> = ({text, x, at, bg, color, rot}) => {
	const t = useT();
	const a = pop(t, at, 0.28);
	if (a <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', left: x, top: 1270, transform: `translate(-50%, -50%) rotate(${rot + Math.sin(t * 3 + x) * 1.5}deg) scale(${a})`, background: bg, color, border: '7px solid #fff', borderRadius: 28, padding: '10px 30px 14px', fontFamily: FONT.russoOne, fontSize: 80, lineHeight: 1, whiteSpace: 'nowrap', boxShadow: '0 12px 0 rgba(0,0,0,.35)'}}>
			{text}
		</div>
	);
};

const F3: React.FC = () => {
	const t = useT();
	const v = env('robot', t);
	return (
		<>
			<Backdrop />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, rgba(150,225,255,.22), rgba(0,0,0,0) 55%)'}} />
			<Rings x={540} y={806} on={v} r0={40} r1={320} />
			<Robot x={540} y={700} w={740} mood="ironic" talk tilt={-4 + 8 * ramp(t, 83.9, 84.4)} bob={8} />
			<WordChip text="НАДЕТЬ" x={270} at={84.0} bg="#39e6ff" color="#06224a" rot={-5} />
			<WordChip text="ОДЕТЬ" x={826} at={85.04} bg="#ff4fd8" color="#ffffff" rot={5} />
			<OText text="?" x={552} y={1262} size={150} font={FONT.russoOne} weight={400} fill="#ffd93d" stroke="#0b1d4d" sw={18} depth={8} scale={pop(t, 85.3, 0.25)} rot={Math.sin(t * 8) * 6} />
			<Vignette o={0.45} />
		</>
	);
};

const F4: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const p = ramp(t, 85.7, 87.3);
	const err = t >= 87.0;
	const sh = err ? 14 : 0;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${(rnd(`ex${fr}`) - 0.5) * sh}px, ${(rnd(`ey${fr}`) - 0.5) * sh}px)`}}>
			<Backdrop dark={0.25 + 0.2 * p} />
			<Sprite name="suit_panic" h={lerp(1600, 1800, p)} x={540} bottom={lerp(2010, 2120, p)} />
			{!err && t >= 85.95 ? (
				<>
					<div style={{position: 'absolute', left: 540 - 50, top: 200, width: 100, height: 100, borderRadius: '50%', border: '14px solid rgba(255,255,255,.25)', borderTopColor: '#7ff6ff', boxSizing: 'border-box', transform: `rotate(${t * 420}deg) scale(${pop(t, 85.95, 0.25)})`}} />
					<div style={{position: 'absolute', left: 0, top: 326, width: W, textAlign: 'center', fontFamily: FONT.pressStart2P, fontSize: 26, color: '#fff', textShadow: '0 4px 0 #0b1d4d', opacity: ramp(t, 86.0, 86.15)}}>ЗАГРУЗКА ОТВЕТА{'.'.repeat(1 + (Math.floor(t * 4) % 3))}</div>
				</>
			) : null}
			{err ? (
				<>
					<AbsoluteFill style={{backgroundColor: 'rgba(255,0,40,.28)'}} />
					<div style={{position: 'absolute', left: 190, top: 180, width: 700, background: '#e11d2a', border: '8px solid #fff', borderRadius: 26, padding: '14px 0 20px', textAlign: 'center', fontFamily: FONT.russoOne, fontSize: 112, lineHeight: 1.05, color: '#fff', boxShadow: '0 14px 0 rgba(0,0,0,.4)', transform: `scale(${pop(t, 87.0, 0.16)}) rotate(-3deg)`}}>ОШИБКА</div>
					<Glitch amount={0.75} seed="err" />
				</>
			) : null}
			<Vignette o={0.5} />
		</div>
	);
};

const F6: React.FC = () => {
	const t = useT();
	const a1 = easeOut(ramp(t, 87.5, 87.95));
	const a2 = easeOut(ramp(t, 88.2, 88.65));
	const a3 = ramp(t, 88.75, 89.15);
	const oy = meta.hasLogo ? -150 : 200;
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #17378f 0%, #0a1c58 55%, #050d2e 100%)'}}>
			<div style={{position: 'absolute', left: 44, top: 44, right: 44, bottom: 44, border: '3px solid rgba(100,149,237,.45)', borderRadius: 36}} />
			<div style={{position: 'absolute', left: 60, top: 500 + oy + (1 - a1) * 46, width: 960, textAlign: 'center', opacity: a1, fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 88, lineHeight: 1.14, color: '#fff', letterSpacing: 1}}>
				РУССКИЙ ЯЗЫК
				<br />
				ОТКРЫВАЕТ ПУТЬ
				<br />В НАУКУ
			</div>
			<div style={{position: 'absolute', left: 540 - 210 * a2, top: 852 + oy, width: 420 * a2, height: 8, borderRadius: 4, background: '#6495ed'}} />
			<div style={{position: 'absolute', left: 60, top: 904 + oy + (1 - a2) * 30, width: 960, textAlign: 'center', opacity: a2, fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 50, lineHeight: 1.22, color: '#a9c2ff', letterSpacing: 2}}>
				ДЕСЯТИЛЕТИЕ НАУКИ
				<br />И ТЕХНОЛОГИЙ В РОССИИ
			</div>
			{meta.hasLogo ? (
				<div style={{position: 'absolute', left: 270, top: 1080, width: 540, height: 320, background: '#fff', borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a2}}>
					<Img src={staticFile('logo/dnt-logo.png')} style={{maxWidth: 440, maxHeight: 250}} />
				</div>
			) : null}
			<div style={{position: 'absolute', left: 90, top: 1700, width: 900, textAlign: 'center', opacity: a3 * 0.78, fontFamily: FONT.inter, fontWeight: 500, fontSize: 27, lineHeight: 1.38, color: '#dbe6ff'}}>
				Все персонажи и проект героя вымышлены.
				<br />
				Ролик создан с помощью нейросетей.
			</div>
		</AbsoluteFill>
	);
};

export const Scene456: React.FC = () => (
	<>
		<Shot a={45.0} b={48.2}>
			<D1 />
		</Shot>
		<Shot a={48.2} b={51.6}>
			<D2 />
		</Shot>
		<Shot a={51.6} b={55.0}>
			<D3 />
		</Shot>
		<Shot a={55.0} b={58.95}>
			<D4 />
		</Shot>
		<Shot a={58.95} b={61.6}>
			<D5 />
		</Shot>
		<Shot a={61.6} b={63.2}>
			<D6 />
		</Shot>
		<Shot a={63.2} b={65.2}>
			<E1 />
		</Shot>
		<Shot a={65.2} b={67.6}>
			<E2 />
		</Shot>
		<Shot a={67.6} b={69.2}>
			<PodiumShot h={1150} bottom={1575} top={1400} a={67.6} b={69.2} />
		</Shot>
		<Shot a={69.2} b={73.8}>
			<E4 />
		</Shot>
		<Shot a={73.8} b={75.4}>
			<PodiumShot h={1320} bottom={1700} top={1500} a={73.8} b={75.4} />
		</Shot>
		<Shot a={75.4} b={78.3}>
			<E6 />
		</Shot>
		<Shot a={78.3} b={81.2}>
			<F1 />
		</Shot>
		<Shot a={81.2} b={82.1}>
			<F2 />
		</Shot>
		<Shot a={82.1} b={85.7}>
			<F3 />
		</Shot>
		<Shot a={85.7} b={87.3}>
			<F4 />
		</Shot>
		<Shot a={87.3} b={87.5}>
			<AbsoluteFill style={{backgroundColor: '#000'}} />
		</Shot>
		<Shot a={87.5} b={90.01}>
			<F6 />
		</Shot>
	</>
);
