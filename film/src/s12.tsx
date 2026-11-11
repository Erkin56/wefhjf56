import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import meta from './assets.json';
import {FONT} from './fonts';
import {Chunk, Flash, Glitch, H, Ken, OText, Rings, Robot, Shot, Snow, Vignette, W, backOut, clamp01, easeOut, env, f, fly, img, lerp, pop, ramp, rnd, useT} from './kit';

const YEL: [string, string] = ['#ffd400', '#b35c00'];
const CYA: [string, string] = ['#3fe9ff', '#0a6fa8'];
const MAG: [string, string] = ['#ff48cf', '#8a0f6b'];

const blurFor = (size: number) => Math.min(16, Math.max(0, (size - 620) / 70));

/* ------------------------------------------------------------ scene 1 */

const A1: React.FC = () => {
	const t = useT();
	const o1 = ramp(t, 0.45, 0.8) * (1 - ramp(t, 2.6, 2.95));
	const o2 = ramp(t, 0.8, 1.15) * (1 - ramp(t, 2.6, 2.95));
	return (
		<>
			<Ken src={img('k1a.jpg')} cams={[[0, [1.0, 0.5, 0.5]], [3.0, [1.2, 0.5, 0.43]]]} ease={(x) => x} />
			<Snow n={60} seed="a1" />
			<Vignette />
			<OText text="РУССКИЙ ЯЗЫК:" x={540} y={250 + (1 - easeOut(ramp(t, 0.45, 0.9))) * 50} size={84} sw={18} weight={900} fill="#ffffff" stroke="#0b1d4d" opacity={o1} />
			<OText text={'МИССИЯ\nНЕВЫПОЛНИМА?'} x={540} y={420} size={98} lh={1.1} sw={20} weight={900} fill="#ffd93d" stroke="#0b1d4d" depth={8} scale={0.85 + 0.15 * backOut(ramp(t, 0.8, 1.2))} opacity={o2} />
			<div
				style={{
					position: 'absolute',
					left: 60,
					top: 1470,
					transform: `translateX(${(1 - easeOut(ramp(t, 1.2, 1.6))) * -720}px)`,
					opacity: ramp(t, 1.2, 1.3) * (1 - ramp(t, 2.6, 2.95)),
					background: 'rgba(8,20,60,.82)',
					borderLeft: '10px solid #6495ed',
					borderRadius: '0 18px 18px 0',
					padding: '14px 30px 16px 22px',
					color: '#fff',
					fontFamily: FONT.montserrat,
				}}
			>
				<div style={{fontWeight: 800, fontSize: 44, letterSpacing: 1}}>САНКТ-ПЕТЕРБУРГ</div>
				<div style={{fontWeight: 600, fontSize: 29, opacity: 0.85}}>Зима. Первый день в России</div>
			</div>
			<AbsoluteFill style={{backgroundColor: '#000', opacity: 1 - ramp(t, 0, 0.45)}} />
		</>
	);
};

const PhoneUI: React.FC = () => {
	const t = useT();
	const p = meta.phone;
	const n1 = pop(t, 4.15, 0.32);
	const n2 = pop(t, 5.05, 0.28);
	const alarm = t >= 5.05;
	const shakeX = alarm ? Math.sin(t * 70) * 5 * (0.3 + 0.7 * (1 - ramp(t, 5.05, 5.7))) : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: p.x - 3,
				top: p.y - 3,
				width: p.w + 6,
				height: p.h + 6,
				borderRadius: p.r + 2,
				overflow: 'hidden',
				background: 'linear-gradient(160deg, #1b2f7a 0%, #0c1440 55%, #2a0f5c 100%)',
				fontFamily: FONT.inter,
				color: '#fff',
			}}
		>
			{alarm ? <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, background: '#ff1a3c', opacity: 0.2 + 0.14 * Math.sin(t * 18)}} /> : null}
			<div style={{position: 'absolute', left: (p.w + 6) / 2 - 82, top: 0, width: 164, height: 34, borderRadius: '0 0 20px 20px', background: '#050507'}} />
			<div style={{position: 'absolute', left: 30, top: 9, fontSize: 17, fontWeight: 700}}>9:41</div>
			<div style={{position: 'absolute', right: 28, top: 12, width: 30, height: 14, border: '2px solid #fff', borderRadius: 4, boxSizing: 'border-box'}}>
				<div style={{position: 'absolute', left: 1, top: 1, bottom: 1, width: 16, background: '#fff', borderRadius: 1}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 74, textAlign: 'center', fontSize: 88, fontWeight: 300, letterSpacing: -2}}>9:41</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 182, textAlign: 'center', fontSize: 19, fontWeight: 500, opacity: 0.85}}>Санкт-Петербург, -14°</div>
			<div
				style={{
					position: 'absolute',
					left: 16,
					top: 248,
					width: p.w - 26,
					transform: `translateY(${(1 - n1) * -60}px) scale(${0.6 + 0.4 * n1})`,
					opacity: clamp01(n1 * 2),
					background: 'rgba(255,255,255,.97)',
					borderRadius: 24,
					padding: '14px 18px 16px',
					boxSizing: 'border-box',
					color: '#0f1a3a',
					boxShadow: '0 10px 30px rgba(0,0,0,.35)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#5b6680', letterSpacing: 0.5}}>
					<div style={{width: 22, height: 22, borderRadius: 6, background: '#2f6bff', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>i</div>
					УВЕДОМЛЕНИЕ
					<span style={{marginLeft: 'auto', fontWeight: 500}}>сейчас</span>
				</div>
				<div style={{fontFamily: FONT.montserrat, fontWeight: 800, fontSize: 24, lineHeight: 1.15, marginTop: 8}}>
					ДОБРО ПОЖАЛОВАТЬ
					<br />В РОССИЮ!
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 16,
					top: 392,
					width: p.w - 26,
					transform: `translateX(${shakeX}px) scale(${0.5 + 0.5 * n2})`,
					opacity: clamp01(n2 * 2),
					background: 'linear-gradient(135deg, #ff2a44, #b3001e)',
					borderRadius: 24,
					padding: '14px 18px 16px',
					boxSizing: 'border-box',
					boxShadow: '0 10px 34px rgba(255,20,60,.6)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, letterSpacing: 0.5}}>
					<div style={{width: 22, height: 22, borderRadius: 11, background: '#ffe14d', color: '#7a0010', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>!</div>
					ВНИМАНИЕ
					<span style={{marginLeft: 'auto', fontWeight: 500}}>сейчас</span>
				</div>
				<div style={{fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 21, marginTop: 8}}>СЛОЖНОСТЬ:</div>
				<div style={{fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 27, lineHeight: 1.1}}>ЭКСТРЕМАЛЬНАЯ</div>
			</div>
		</div>
	);
};

const A3: React.FC = () => {
	const t = useT();
	return (
		<>
			<Ken
				src={img('k1b.jpg')}
				cams={[
					[3.0, [1.75, 0.5, 0.14]],
					[3.42, [1.75, 0.5, 0.489]],
					[6.2, [1.86, 0.5, 0.489]],
				]}
				ease={easeOut}
				shake={t >= 5.05 ? (1 - ramp(t, 5.05, 5.6)) * 9 : 0}
			>
				<PhoneUI />
			</Ken>
			<Snow n={40} seed="a3" speed={0.8} />
			<Vignette />
			{t >= 5.05 ? <AbsoluteFill style={{boxShadow: 'inset 0 0 160px 40px rgba(255,20,60,.55)', opacity: 0.5 + 0.5 * Math.sin(t * 18)}} /> : null}
			<Flash at={3.0} d={0.18} max={0.5} />
		</>
	);
};

const A4: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const g = ramp(t, 6.5, 7.4);
	return (
		<>
			<Ken
				src={img('k1c.jpg')}
				cams={[
					[6.2, [1.3, 0.5, 0.33]],
					[7.4, [1.58, 0.5, 0.29]],
				]}
				ease={(x) => x}
				shake={g * 16}
				filter={g > 0 ? `hue-rotate(${g * 70 * (rnd(`hr${fr}`) > 0.5 ? 1 : -0.4)}deg) saturate(${1 + g * 1.5}) contrast(${1 + g * 0.3})` : undefined}
			/>
			<Snow n={40} seed="a4" />
			<OText text="?" x={830} y={330} size={240} rot={12} font={FONT.russoOne} weight={400} fill="#ffffff" stroke="#0b1d4d" sw={22} depth={9} scale={pop(t, 6.28, 0.25) * (1 - ramp(t, 6.9, 7.1))} />
			<Glitch amount={Math.pow(g, 1.4)} seed="a4" />
			<Vignette />
		</>
	);
};

const A5a: React.FC = () => {
	const t = useT();
	const l = fly(t, 7.5, 8.2, 1900, 110, [1250, 1560], [720, 470]);
	return (
		<>
			<Ken
				src={img('k1e.jpg')}
				cams={[
					[7.4, [1.0, 0.5, 0.5]],
					[8.2, [1.1, 0.5, 0.44]],
				]}
				ease={(x) => x}
				shake={(1 - ramp(t, 7.4, 7.85)) * 12}
			/>
			{t >= 7.5 ? <Chunk ch="Ы" x={l.x} y={l.y} size={l.size} color={YEL[0]} side={YEL[1]} rot={lerp(-22, 8, l.p)} blur={blurFor(l.size)} opacity={1 - ramp(l.p, 0.85, 1)} /> : null}
			<Glitch amount={(1 - ramp(t, 7.4, 7.75)) * 0.8} seed="a5" />
			<Flash at={7.4} d={0.3} />
		</>
	);
};

const A5b: React.FC = () => {
	const t = useT();
	const a = fly(t, 8.2, 8.88, 40, 2600, [560, 640], [-260, 1500]);
	const w = fly(t, 8.42, 9.33, 30, 1500, [540, 720], [330, 1300]);
	return (
		<>
			<Ken
				src={img('k1d.jpg')}
				cams={[
					[8.2, [1.12, 0.5, 0.42]],
					[9.3, [1.3, 0.5, 0.38]],
				]}
				ease={(x) => x}
			/>
			<Chunk ch="ДОСТОПРИМЕЧАТЕЛЬНОСТЬ" x={w.x} y={w.y} size={w.size} color="#ffffff" side="#5a2ad1" rot={lerp(-3, 4, w.p)} blur={blurFor(w.size) * 0.7} opacity={ramp(t, 8.42, 8.52)} />
			<OText text="21 БУКВА!" x={w.x} y={w.y + w.size * 1.5 + 14} size={44} fill="#ffd93d" stroke="#2a0a66" sw={10} font={FONT.russoOne} weight={400} opacity={ramp(t, 8.52, 8.62) * (1 - ramp(t, 8.88, 8.98))} />
			<Chunk ch="Ъ" x={a.x} y={a.y} size={a.size} color={CYA[0]} side={CYA[1]} rot={lerp(10, -25, a.p)} blur={blurFor(a.size)} opacity={t < 8.88 ? ramp(t, 8.2, 8.3) : 0} />
			<Vignette o={0.3} />
		</>
	);
};

const A5c: React.FC = () => {
	const t = useT();
	const l = fly(t, 9.3, 9.98, 2100, 120, [-160, 1560], [370, 450]);
	return (
		<>
			<Sequence from={f(9.3)} durationInFrames={f(10.0) - f(9.3)}>
				<OffthreadVideo src={staticFile('vid/react.mp4')} trimBefore={8} muted style={{width: W, height: H}} />
			</Sequence>
			<Chunk ch="Щ" x={l.x} y={l.y} size={l.size} color={MAG[0]} side={MAG[1]} rot={lerp(20, -8, l.p)} blur={blurFor(l.size)} opacity={1 - ramp(l.p, 0.88, 1)} />
		</>
	);
};

/** Letters that are still in the air when time stops at 12.0. */
const LettersA6: React.FC<{t: number}> = ({t}) => {
	const s = fly(t, 11.3, 12.0, 2600, 330, [-900, 720], [215, 335]);
	const y = fly(t, 11.0, 12.0, 1900, 150, [1560, 1650], [935, 770]);
	const b = fly(t, 10.4, 12.0, 1700, 185, [-380, 1750], [118, 1060]);
	const e = fly(t, 10.02, 10.8, 1800, 80, [1300, 1500], [720, 400]);
	return (
		<>
			{t >= 10.02 && t < 10.85 ? <Chunk ch="Ъ" x={e.x} y={e.y} size={e.size} color={CYA[0]} side={CYA[1]} rot={lerp(-20, 10, e.p)} blur={blurFor(e.size)} opacity={1 - ramp(e.p, 0.8, 1)} /> : null}
			{t >= 10.4 ? <Chunk ch="Ъ" x={b.x} y={b.y} size={b.size} color={CYA[0]} side={CYA[1]} rot={lerp(24, -12, b.p)} blur={blurFor(b.size)} /> : null}
			{t >= 11.0 ? <Chunk ch="Ы" x={y.x} y={y.y} size={y.size} color={YEL[0]} side={YEL[1]} rot={lerp(-25, 9, y.p)} blur={blurFor(y.size)} /> : null}
			{t >= 11.3 ? <Chunk ch="Щ" x={s.x} y={s.y} size={s.size} color={MAG[0]} side={MAG[1]} rot={lerp(26, -10, s.p)} blur={blurFor(s.size)} /> : null}
		</>
	);
};

const A6: React.FC = () => {
	const t = useT();
	return (
		<>
			<Sequence from={f(10.0)} durationInFrames={f(12.0) - f(10.0)}>
				<OffthreadVideo src={staticFile('vid/h1.mp4')} muted style={{width: W, height: H}} />
			</Sequence>
			<LettersA6 t={t} />
			<Flash at={11.86} d={0.14} max={0.45} />
		</>
	);
};

/* ------------------------------------------------------------ scene 2 */

const Sparkles: React.FC<{x: number; y: number; r: number; at: number}> = ({x, y, r, at}) => {
	const t = useT();
	if (t < at) {
		return null;
	}
	return (
		<>
			{Array.from({length: 9}, (_, i) => {
				const a = (i / 9) * Math.PI * 2 + 0.4;
				const d = r * (0.75 + 0.35 * rnd(`sp${i}`)) * easeOut(ramp(t, at, at + 0.4));
				const tw = 0.5 + 0.5 * Math.sin(t * 9 + i * 2);
				const s = (18 + 22 * rnd(`ss${i}`)) * tw * (1 - ramp(t, at + 0.7, at + 1.2));
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x + Math.cos(a) * d - s / 2,
							top: y + Math.sin(a) * d * 0.8 - s / 2,
							width: s,
							height: s,
							background: '#eaffff',
							clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)',
							filter: 'drop-shadow(0 0 8px #7ff6ff)',
						}}
					/>
				);
			})}
		</>
	);
};

const B1: React.FC = () => {
	const t = useT();
	const fz = ramp(t, 12.0, 12.3);
	const rp = pop(t, 13.15, 0.42);
	const wave = ramp(t, 12.0, 12.85);
	const R = easeOut(wave) * 1500;
	return (
		<>
			<Ken
				src={img('h1_last.jpg')}
				ih={1920}
				cams={[
					[12.0, [1.0, 0.5, 0.5]],
					[14.25, [1.07, 0.5, 0.46]],
				]}
				ease={(x) => x}
				filter={`saturate(${1 - 0.72 * fz}) brightness(${1 - 0.18 * fz}) contrast(${1 + 0.08 * fz})`}
			/>
			<AbsoluteFill style={{backgroundColor: 'rgba(36,84,220,.3)', opacity: fz}} />
			<Snow n={46} seed="fz" frozen={12.0} opacity={0.8} />
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${Math.sin(t * 1.2) * 4}px)`, filter: `saturate(${1 - 0.45 * fz})`}}>
				<LettersA6 t={12.0} />
			</div>
			{wave < 1 ? (
				<div style={{position: 'absolute', left: 540 - R, top: 860 - R, width: R * 2, height: R * 2, borderRadius: '50%', border: '12px solid rgba(220,245,255,.9)', boxSizing: 'border-box', opacity: (1 - wave) * 0.85}} />
			) : null}
			<div style={{position: 'absolute', left: 0, top: 176, width: W, textAlign: 'center', opacity: ramp(t, 12.15, 12.3) * (Math.sin(t * 7) > -0.3 ? 1 : 0.35)}}>
				<span style={{display: 'inline-block', width: 16, height: 46, background: '#fff', marginRight: 12, verticalAlign: 'middle'}} />
				<span style={{display: 'inline-block', width: 16, height: 46, background: '#fff', marginRight: 22, verticalAlign: 'middle'}} />
				<span style={{fontFamily: FONT.pressStart2P, fontSize: 30, color: '#fff', verticalAlign: 'middle', textShadow: '0 4px 0 #1a0b4d'}}>ПАУЗА</span>
			</div>
			{t >= 13.1 ? (
				<div
					style={{
						position: 'absolute',
						left: 835 - 420,
						top: 335 - 420,
						width: 840,
						height: 840,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(200,255,255,.95) 0%, rgba(110,240,255,.5) 30%, rgba(110,240,255,0) 66%)',
						transform: `scale(${0.2 + easeOut(ramp(t, 13.1, 13.5)) * 0.9})`,
						opacity: 1 - ramp(t, 13.25, 14.0) * 0.75,
					}}
				/>
			) : null}
			{rp > 0 ? <Robot x={835} y={335 - (1 - Math.min(1, rp)) * 60} w={400} scale={rp} glow={22} mood="happy" /> : null}
			<Sparkles x={835} y={335} r={270} at={13.15} />
			<Flash at={12.0} d={0.24} />
			<Vignette />
		</>
	);
};

const B2: React.FC = () => {
	const t = useT();
	const v = env('robot', t);
	return (
		<>
			<Ken
				src={img('k2b.jpg')}
				cams={[
					[14.25, [1.04, 0.5, 0.46]],
					[17.3, [1.16, 0.5, 0.45]],
					[17.3, [1.42, 0.5, 0.44]],
					[19.0, [1.5, 0.5, 0.44]],
				]}
				ease={(x) => x}
				drift={7}
			>
				<Rings x={532} y={1061} on={v} r0={16} r1={170} n={3} speed={1.7} />
				<div
					style={{
						position: 'absolute',
						left: 532 - 15 * (1 + v),
						top: 1061 - 15 * (1 + v),
						width: 30 * (1 + v),
						height: 30 * (1 + v),
						borderRadius: '50%',
						background: '#e2ffff',
						opacity: 0.25 + 0.75 * v,
						boxShadow: `0 0 ${30 * (0.4 + v)}px ${12 * (0.3 + v)}px rgba(98,255,255,.9)`,
					}}
				/>
			</Ken>
			<Vignette o={0.35} />
			<Flash at={14.25} d={0.15} max={0.35} />
		</>
	);
};

const B3: React.FC = () => (
	<>
		<Sequence from={f(19.0)} durationInFrames={f(20.62) - f(19.0)}>
			<AbsoluteFill style={{transform: 'scale(-1.32, 1.32)', transformOrigin: '50% 41%'}}>
				<OffthreadVideo src={staticFile('vid/h1.mp4')} muted style={{width: W, height: H}} />
			</AbsoluteFill>
		</Sequence>
		<Vignette o={0.35} />
	</>
);

const Dots: React.FC<{x: number; y: number; times: [number, number, number]; r?: number}> = ({x, y, times, r = 26}) => {
	const t = useT();
	return (
		<>
			{times.map((at, i) => {
				const s = pop(t, at, 0.22);
				return <div key={i} style={{position: 'absolute', left: x + (i - 1) * r * 3.4 - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: '#fff', boxShadow: '0 6px 0 rgba(20,10,70,.55)', transform: `scale(${s})`}} />;
			})}
		</>
	);
};

const B45: React.FC = () => {
	const t = useT();
	const pause = t < 22.2;
	const v = env('robot', t);
	const shrug = t >= 23.7 ? Math.sin(ramp(t, 23.7, 24.9) * Math.PI) : 0;
	return (
		<>
			<Ken
				src={img('bg_game_blur.jpg')}
				cams={[
					[20.62, [1.1, 0.5, 0.4]],
					[25.2, [1.26, 0.5, 0.4]],
				]}
				ease={(x) => x}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(120,220,255,.28), rgba(0,0,0,0) 55%)'}} />
			{pause ? (
				<>
					<Robot x={540} y={830} w={lerp(690, 780, ramp(t, 20.62, 22.2))} eye={1 + 0.52 * easeOut(ramp(t, 20.85, 21.75))} bob={5} />
					<Dots x={540} y={330} times={[21.0, 21.35, 21.7]} />
				</>
			) : (
				<>
					<Rings x={540 - shrug * 30} y={938} on={v} r0={40} r1={330} />
					<Robot x={540 - shrug * 30} y={830} w={780} mood="ironic" talk tilt={-3 - shrug * 7} bob={9} />
				</>
			)}
			<Vignette o={0.4} />
		</>
	);
};

const B6: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const s1 = t < 25.25 ? 0 : lerp(3.2, 1, easeOut(ramp(t, 25.25, 25.43)));
	const s2 = t < 25.62 ? 0 : lerp(3.2, 1, easeOut(ramp(t, 25.62, 25.8)));
	const sh = (1 - ramp(t, 25.4, 25.62)) * (t > 25.4 ? 12 : 0) + (1 - ramp(t, 25.78, 26.05)) * (t > 25.78 ? 16 : 0);
	const dx = (rnd(`b6x${fr}`) - 0.5) * sh;
	const dy = (rnd(`b6y${fr}`) - 0.5) * sh;
	return (
		<>
			<Ken
				src={img('k1d.jpg')}
				cams={[
					[25.2, [1.2, 0.5, 0.4]],
					[27.0, [1.34, 0.5, 0.36]],
				]}
				ease={(x) => x}
				filter="brightness(.62) saturate(1.2)"
			/>
			<div style={{position: 'absolute', left: 0, top: 640, width: W, height: 470, background: 'linear-gradient(90deg, rgba(20,4,60,0), rgba(20,4,60,.75) 20%, rgba(20,4,60,.75) 80%, rgba(20,4,60,0))', transform: `scaleX(${easeOut(ramp(t, 25.2, 25.45))})`}} />
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${dx}px, ${dy}px)`}}>
				<OText text="РУССКИЙ ЯЗЫК." x={540} y={770} size={104} font={FONT.russoOne} weight={400} fill="#ffffff" stroke="#2a0a66" sw={20} depth={9} depthColor="#ff2bd6" scale={s1} />
				<OText text="УРОВЕНЬ 1" x={540} y={945} size={134} font={FONT.russoOne} weight={400} fill="#ffd93d" stroke="#2a0a66" sw={22} depth={11} depthColor="#ff2bd6" scale={s2} />
			</div>
			<div style={{position: 'absolute', left: 240, top: 1090, width: 600 * easeOut(ramp(t, 25.85, 26.2)), height: 10, borderRadius: 5, background: '#39e6ff', boxShadow: '0 0 22px #39e6ff'}} />
			<Flash at={25.2} d={0.22} max={0.75} />
			<Vignette />
		</>
	);
};

export const Scene12: React.FC = () => (
	<>
		<Shot a={0} b={3.0}>
			<A1 />
		</Shot>
		<Shot a={3.0} b={6.2}>
			<A3 />
		</Shot>
		<Shot a={6.2} b={7.4}>
			<A4 />
		</Shot>
		<Shot a={7.4} b={8.2}>
			<A5a />
		</Shot>
		<Shot a={8.2} b={9.3}>
			<A5b />
		</Shot>
		<Shot a={9.3} b={10.0}>
			<A5c />
		</Shot>
		<Shot a={10.0} b={12.0}>
			<A6 />
		</Shot>
		<Shot a={12.0} b={14.25}>
			<B1 />
		</Shot>
		<Shot a={14.25} b={19.0}>
			<B2 />
		</Shot>
		<Shot a={19.0} b={20.62}>
			<B3 />
		</Shot>
		<Shot a={20.62} b={25.2}>
			<B45 />
		</Shot>
		<Shot a={25.2} b={27.0}>
			<B6 />
		</Shot>
	</>
);
