import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import meta from './assets.json';
import {FONT} from './fonts';
import voice from './voice.json';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const f = (s: number) => Math.round(s * FPS);
/** Global film time in seconds (shots are not nested in sequences, so this is always absolute). */
export const useT = () => useCurrentFrame() / FPS;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 3);
export const easeIO = (x: number) => {
	const p = clamp01(x);
	return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};
export const backOut = (x: number) => {
	const p = clamp01(x) - 1;
	return 1 + 2.70158 * p * p * p + 1.70158 * p * p;
};
/** 0 before `at`, then springs to 1 with a small overshoot. */
export const pop = (t: number, at: number, d = 0.3) => (t < at ? 0 : backOut((t - at) / d));
export const img = (n: string) => staticFile(`img/${n}`);
export const rnd = (seed: string | number) => random(seed);

export type Speaker = keyof typeof voice;
/** Loudness of a voice (0..1) at film time t, measured from the actual takes. */
export const env = (who: Speaker, t: number) => {
	const a = voice[who] as number[];
	const i = Math.max(0, Math.min(a.length - 1, Math.round(t * FPS)));
	return a[i] ?? 0;
};

export const Shot: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => {
	const fr = useCurrentFrame();
	if (fr < f(a) || fr >= f(b)) {
		return null;
	}
	return <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;
};

/** [scale, focus x, focus y]; the focus is given in fractions of the picture. */
export type Cam = [number, number, number];

/** Still picture with an animated camera (keyframes in global seconds). */
export const Ken: React.FC<{
	src: string;
	cams: [number, Cam][];
	ih?: number;
	ease?: (x: number) => number;
	filter?: string;
	shake?: number;
	drift?: number;
	children?: React.ReactNode;
}> = ({src, cams, ih = 1935, ease = easeIO, filter, shake = 0, drift = 0, children}) => {
	const fr = useCurrentFrame();
	const t = fr / FPS;
	let c: Cam = cams[0][1];
	if (t >= cams[cams.length - 1][0]) {
		c = cams[cams.length - 1][1];
	} else {
		for (let i = 0; i < cams.length - 1; i++) {
			const [ta, ca] = cams[i];
			const [tb, cb] = cams[i + 1];
			if (t >= ta && t < tb) {
				const p = ease((t - ta) / (tb - ta));
				c = [lerp(ca[0], cb[0], p), lerp(ca[1], cb[1], p), lerp(ca[2], cb[2], p)];
				break;
			}
		}
	}
	const s = c[0];
	const dx = (shake ? (rnd(`kx${fr}`) - 0.5) * 2 * shake : 0) + (drift ? Math.sin(t * 1.3) * drift : 0);
	const dy = (shake ? (rnd(`ky${fr}`) - 0.5) * 2 * shake : 0) + (drift ? Math.cos(t * 1.7) * drift : 0);
	const x = Math.min(0, Math.max(W - W * s, W / 2 - c[1] * W * s + dx));
	const y = Math.min(0, Math.max(H - ih * s, H / 2 - c[2] * ih * s + dy));
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: W,
					height: ih,
					transformOrigin: '0 0',
					transform: `translate(${x}px, ${y}px) scale(${s})`,
					filter,
				}}
			>
				<Img src={src} style={{width: W, height: ih, display: 'block'}} />
				{children}
			</div>
		</AbsoluteFill>
	);
};

export type SpriteName = keyof typeof meta.sprites;

/** Cut-out character; x is the horizontal centre, bottom is the y of the lower edge. */
export const Sprite: React.FC<{
	name: SpriteName;
	h: number;
	x: number;
	bottom: number;
	flip?: boolean;
	rot?: number;
	sx?: number;
	sy?: number;
	opacity?: number;
	filter?: string;
	origin?: string;
	children?: React.ReactNode;
}> = ({name, h, x, bottom, flip, rot = 0, sx = 1, sy = 1, opacity = 1, filter, origin = '50% 100%', children}) => {
	const m = meta.sprites[name];
	const w = (h * m.w) / m.h;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - w / 2,
				top: bottom - h,
				width: w,
				height: h,
				transformOrigin: origin,
				transform: `rotate(${rot}deg) scale(${flip ? -sx : sx}, ${sy})`,
				opacity,
				filter,
			}}
		>
			<Img src={img(`${name}.png`)} style={{width: '100%', height: '100%', display: 'block'}} />
			{children}
		</div>
	);
};

export type Mood = 'normal' | 'ironic' | 'happy';

/** The robot: hovering sprite with eyelids, growing eyes and a voice light driven by the real voice level. */
export const Robot: React.FC<{
	x: number;
	y: number;
	w: number;
	mood?: Mood;
	talk?: boolean;
	eye?: number;
	tilt?: number;
	bob?: number;
	phase?: number;
	scale?: number;
	opacity?: number;
	glow?: number;
}> = ({x, y, w, mood = 'normal', talk = false, eye = 1, tilt = 0, bob = 14, phase = 0, scale = 1, opacity = 1, glow = 0}) => {
	const fr = useCurrentFrame();
	const t = fr / FPS;
	const m = meta.sprites.robot_front;
	const h = (w * m.h) / m.w;
	const v = talk ? env('robot', t) : 0;
	const yy = y + Math.sin(t * 2.4 + phase) * bob - v * 6;
	const rot = tilt + Math.sin(t * 1.5 + phase) * 2.2;
	const blink = (fr + Math.floor(phase * 20)) % 104 < 3;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - w / 2,
				top: yy - h / 2,
				width: w,
				height: h,
				transform: `rotate(${rot}deg) scale(${scale * (1 + v * 0.025)})`,
				opacity,
				filter: glow ? `drop-shadow(0 0 ${glow}px rgba(120,240,255,.8))` : undefined,
			}}
		>
			<Img src={img('robot_front.png')} style={{width: '100%', height: '100%', display: 'block'}} />
			{meta.robotEyes.map((e, i) => {
				const rx = e.rx * w;
				const ry = e.ry * h;
				const cx = e.cx * w;
				const cy = e.cy * h;
				let lid = mood === 'ironic' ? (i === 0 ? 0.5 : 0.36) : 0;
				if (blink) {
					lid = 1;
				}
				return (
					<React.Fragment key={i}>
						{eye > 1.01 ? (
							<div
								style={{
									position: 'absolute',
									left: cx - rx * eye,
									top: cy - ry * eye,
									width: rx * eye * 2,
									height: ry * eye * 2,
									borderRadius: '50%',
									background: 'radial-gradient(ellipse at 50% 50%, #d6ffff 0%, #77f7fb 45%, #38d8ec 82%, #22bcd8 100%)',
									boxShadow: `0 0 ${rx * 0.6}px ${rx * 0.14}px rgba(90,240,255,.75)`,
								}}
							/>
						) : null}
						<div
							style={{
								position: 'absolute',
								left: cx - rx * 1.5,
								top: cy - ry * 1.5,
								width: rx * 3,
								height: ry * 3,
								borderRadius: '50%',
								overflow: 'hidden',
								WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 78%, transparent 100%)',
							}}
						>
							{lid > 0 ? (
								<div style={{position: 'absolute', left: '-20%', top: 0, width: '140%', height: `${(0.167 + lid * 0.675) * 100}%`, background: '#050807'}} />
							) : null}
							{mood === 'happy' && !blink ? (
								<div
									style={{
										position: 'absolute',
										left: rx * 1.5 - rx * 1.45,
										top: ry * 1.5 - ry * 0.12,
										width: rx * 2.9,
										height: rx * 2.9,
										borderRadius: '50%',
										background: '#050807',
									}}
								/>
							) : null}
						</div>
					</React.Fragment>
				);
			})}
			{talk ? (
				<div
					style={{
						position: 'absolute',
						left: 0.5 * w - w * 0.028 * (1 + v),
						top: 0.655 * h - w * 0.028 * (1 + v),
						width: w * 0.056 * (1 + v),
						height: w * 0.056 * (1 + v),
						borderRadius: '50%',
						background: '#d9ffff',
						opacity: 0.35 + 0.65 * v,
						boxShadow: `0 0 ${w * 0.06 * (0.4 + v)}px ${w * 0.025 * (0.3 + v)}px rgba(98,255,255,.9)`,
					}}
				/>
			) : null}
		</div>
	);
};

/** Expanding sound rings, strength 0..1. */
export const Rings: React.FC<{x: number; y: number; on: number; color?: string; r0?: number; r1?: number; n?: number; speed?: number}> = ({
	x,
	y,
	on,
	color = '#7ff6ff',
	r0 = 30,
	r1 = 240,
	n = 3,
	speed = 1.5,
}) => {
	const t = useT();
	return (
		<>
			{Array.from({length: n}, (_, i) => {
				const p = (t * speed + i / n) % 1;
				const r = lerp(r0, r1, p);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - r,
							top: y - r,
							width: r * 2,
							height: r * 2,
							borderRadius: '50%',
							border: `${lerp(7, 2, p)}px solid ${color}`,
							opacity: (1 - p) * 0.75 * clamp01(on * 1.6),
							boxSizing: 'border-box',
						}}
					/>
				);
			})}
		</>
	);
};

/** Outlined text drawn in SVG (round joins, no spikes). Coordinates are the centre of the text block. */
export const OText: React.FC<{
	text: string;
	x: number;
	y: number;
	size: number;
	fill?: string;
	stroke?: string;
	sw?: number;
	font?: string;
	weight?: number;
	rot?: number;
	scale?: number;
	opacity?: number;
	anchor?: 'start' | 'middle' | 'end';
	ls?: number;
	lh?: number;
	depth?: number;
	depthColor?: string;
}> = ({text, x, y, size, fill = '#fff', stroke = '#000', sw = 12, font = FONT.montserrat, weight = 800, rot = 0, scale = 1, opacity = 1, anchor = 'middle', ls = 0, lh = 1.16, depth = 0, depthColor}) => {
	if (opacity <= 0 || scale <= 0) {
		return null;
	}
	const lines = text.split('\n');
	const common = {
		fontFamily: font,
		fontWeight: weight,
		fontSize: size,
		textAnchor: anchor,
		dominantBaseline: 'central' as const,
		letterSpacing: ls,
		strokeLinejoin: 'round' as const,
		strokeLinecap: 'round' as const,
	};
	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
			<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
				{depth
					? lines.map((ln, i) => (
							<text key={`d${i}`} x={depth} y={(i - (lines.length - 1) / 2) * size * lh + depth} {...common} fill={depthColor ?? stroke} stroke={depthColor ?? stroke} strokeWidth={sw}>
								{ln}
							</text>
						))
					: null}
				{lines.map((ln, i) => (
					<text key={i} x={0} y={(i - (lines.length - 1) / 2) * size * lh} {...common} fill={fill} stroke={stroke} strokeWidth={sw} style={{paintOrder: 'stroke'}}>
						{ln}
					</text>
				))}
			</g>
		</svg>
	);
};

/** Chunky extruded letter or word for the flying alphabet. */
export const Chunk: React.FC<{ch: string; x: number; y: number; size: number; color: string; side: string; rot?: number; opacity?: number; blur?: number}> = ({
	ch,
	x,
	y,
	size,
	color,
	side,
	rot = 0,
	opacity = 1,
	blur = 0,
}) => {
	if (opacity <= 0) {
		return null;
	}
	const shadow =
		Array.from({length: 9}, (_, i) => `${((i + 1) * 0.011).toFixed(3)}em ${((i + 1) * 0.013).toFixed(3)}em 0 ${side}`).join(', ') + ', 0.14em 0.18em 0.1em rgba(0,0,0,.4)';
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${rot}deg)`,
				fontFamily: FONT.russoOne,
				fontSize: size,
				lineHeight: 1,
				color,
				textShadow: shadow,
				whiteSpace: 'nowrap',
				opacity,
				filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
			}}
		>
			{ch}
		</div>
	);
};

/** Size and position of an object moving along the view axis: 1/size changes linearly with time. */
export const fly = (t: number, a: number, b: number, s0: number, s1: number, p0: [number, number], p1: [number, number]) => {
	const p = ramp(t, a, b);
	const size = 1 / lerp(1 / s0, 1 / s1, p);
	const k = (size - s0) / (s1 - s0);
	return {p, size, x: lerp(p0[0], p1[0], k), y: lerp(p0[1], p1[1], k)};
};

export const Flash: React.FC<{at: number; d?: number; color?: string; max?: number}> = ({at, d = 0.25, color = '#fff', max = 1}) => {
	const t = useT();
	if (t < at || t > at + d) {
		return null;
	}
	return <AbsoluteFill style={{backgroundColor: color, opacity: max * (1 - (t - at) / d)}} />;
};

export const Vignette: React.FC<{o?: number}> = ({o = 0.45}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,${o}) 100%)`, pointerEvents: 'none'}} />
);

export const Snow: React.FC<{n?: number; seed?: string; speed?: number; size?: number; opacity?: number; frozen?: number}> = ({n = 70, seed = 's', speed = 1, size = 1, opacity = 0.9, frozen}) => {
	const now = useT();
	const t = frozen ?? now;
	return (
		<AbsoluteFill style={{opacity}}>
			{Array.from({length: n}, (_, i) => {
				const z = 0.35 + rnd(`${seed}z${i}`) * 0.65;
				const y = ((rnd(`${seed}y${i}`) * (H + 80) + t * speed * 260 * z) % (H + 80)) - 40;
				const x = rnd(`${seed}x${i}`) * W + Math.sin(t * 1.1 + i) * 26 * z;
				const r = (3 + 9 * z) * size;
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: '#fff', opacity: 0.35 + 0.6 * z, filter: z > 0.85 ? 'blur(1.5px)' : undefined}} />;
			})}
		</AbsoluteFill>
	);
};

/** Digital glitch overlay, amount 0..1. */
export const Glitch: React.FC<{amount: number; seed?: string}> = ({amount, seed = 'g'}) => {
	const fr = useCurrentFrame();
	if (amount <= 0) {
		return null;
	}
	const n = Math.round(4 + amount * 16);
	return (
		<AbsoluteFill>
			{Array.from({length: n}, (_, i) => {
				const y = rnd(`${seed}y${fr}-${i}`) * H;
				const h = 6 + rnd(`${seed}h${fr}-${i}`) * 90 * amount;
				const col = ['rgba(0,255,255,.75)', 'rgba(255,0,220,.75)', 'rgba(255,255,255,.85)', 'rgba(60,20,160,.9)'][Math.floor(rnd(`${seed}c${fr}-${i}`) * 4)];
				const x = (rnd(`${seed}x${fr}-${i}`) - 0.3) * W;
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: W * (0.3 + rnd(`${seed}w${fr}-${i}`) * 0.9), height: h, background: col, mixBlendMode: 'screen'}} />;
			})}
			<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 3px, transparent 3px 7px)', opacity: amount}} />
		</AbsoluteFill>
	);
};

export const Confetti: React.FC<{at: number; n?: number; seed?: string}> = ({at, n = 90, seed = 'c'}) => {
	const t = useT() - at;
	if (t < 0) {
		return null;
	}
	const colors = ['#ffd93d', '#ff4fd8', '#39e6ff', '#7dff6a', '#ffffff', '#ff8a3d'];
	return (
		<AbsoluteFill>
			{Array.from({length: n}, (_, i) => {
				const x0 = rnd(`${seed}x${i}`) * W;
				const v = 500 + rnd(`${seed}v${i}`) * 700;
				const y = -80 - rnd(`${seed}d${i}`) * 500 + v * t + 180 * t * t;
				const x = x0 + Math.sin(t * 4 + i) * 40;
				const w = 14 + rnd(`${seed}w${i}`) * 16;
				return (
					<div
						key={i}
						style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.55, background: colors[i % colors.length], transform: `rotate(${t * 400 * (rnd(`${seed}r${i}`) - 0.5) + i * 30}deg)`}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export const Heart: React.FC<{x: number; y: number; s: number; color: string}> = ({x, y, s, color}) => (
	<svg width={s} height={s} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y}}>
		<path d="M12 21.3 3.2 12.6C.9 10.3.9 6.6 3.2 4.4c2.2-2.2 5.8-2.2 8 0l.8.8.8-.8c2.2-2.2 5.8-2.2 8 0 2.3 2.2 2.3 5.9 0 8.2L12 21.3z" fill={color} stroke="#16052e" strokeWidth={1.6} strokeLinejoin="round" />
	</svg>
);

/** Neon game arena with a perspective grid floor. */
export const Arena: React.FC<{mood?: 'violet' | 'red' | 'gold'; dim?: number}> = ({mood = 'violet', dim = 0}) => {
	const t = useT();
	const glow = mood === 'red' ? '#ff2a4d' : mood === 'gold' ? '#ffd24a' : '#ff2bd6';
	const wall = mood === 'red' ? 'linear-gradient(180deg, #14010f 0%, #3a0730 38%, #7a1040 60%)' : mood === 'gold' ? 'linear-gradient(180deg, #1a0a45 0%, #4a1aa0 38%, #b05ad0 60%)' : 'linear-gradient(180deg, #0d0128 0%, #23074f 38%, #4a1291 60%)';
	return (
		<AbsoluteFill style={{backgroundColor: '#0a0120', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1152, background: wall}} />
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: W,
					height: 1150,
					backgroundImage: 'repeating-linear-gradient(90deg, rgba(60,230,255,.2) 0 3px, transparent 3px 120px), repeating-linear-gradient(0deg, rgba(60,230,255,.15) 0 3px, transparent 3px 120px)',
					backgroundPosition: '30px 70px',
					WebkitMaskImage: 'linear-gradient(180deg, transparent 5%, #000 75%)',
				}}
			/>
			{[-1, 1].map((d) => (
				<div
					key={d}
					style={{
						position: 'absolute',
						left: 540 + d * 380 - 260,
						top: -120,
						width: 520,
						height: 1500,
						transformOrigin: '50% 0%',
						transform: `rotate(${-d * (15 + Math.sin(t * 0.9 + d) * 5)}deg)`,
						background: 'linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,0) 92%)',
						clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
						filter: 'blur(14px)',
						opacity: 0.55,
					}}
				/>
			))}
			<div style={{position: 'absolute', left: -150, top: 985, width: W + 300, height: 330, background: `radial-gradient(ellipse at 50% 50%, ${glow} 0%, rgba(0,0,0,0) 68%)`, opacity: 0.8, filter: 'blur(26px)'}} />
			<div style={{position: 'absolute', left: 0, top: 1150, width: W, height: 770, perspective: 520, perspectiveOrigin: '50% 0%', overflow: 'hidden', backgroundColor: '#0c0226'}}>
				<div
					style={{
						position: 'absolute',
						left: (W - 9000) / 2,
						bottom: 0,
						width: 9000,
						height: 2400,
						transformOrigin: '50% 100%',
						transform: 'rotateX(74deg)',
						backgroundColor: '#0c0226',
						backgroundImage: 'repeating-linear-gradient(90deg, rgba(40,235,255,.95) 0 6px, transparent 6px 200px), repeating-linear-gradient(0deg, rgba(255,60,220,.9) 0 6px, transparent 6px 200px)',
						backgroundPosition: `100px ${(t * 70) % 200}px`,
					}}
				/>
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 260, background: 'linear-gradient(180deg, rgba(12,2,38,1) 0%, rgba(12,2,38,0) 100%)'}} />
			</div>
			<div style={{position: 'absolute', left: 0, top: 1144, width: W, height: 8, background: glow, boxShadow: `0 0 34px 10px ${glow}`, opacity: 0.9}} />
			{dim ? <AbsoluteFill style={{backgroundColor: `rgba(4,0,16,${dim})`}} /> : null}
		</AbsoluteFill>
	);
};

/** Row of seated silhouettes; with `clap` their hands move. */
export const Audience: React.FC<{y: number; n: number; r: number; color: string; seed: string; clap?: number; shift?: number; hand?: string}> = ({y, n, r, color, seed, clap = 0, shift = 0, hand = '#33427e'}) => {
	const t = useT();
	const gap = W / n;
	return (
		<>
			{Array.from({length: n + 1}, (_, i) => {
				const x = i * gap + shift + (rnd(`${seed}x${i}`) - 0.5) * gap * 0.25;
				const rr = r * (0.9 + rnd(`${seed}r${i}`) * 0.22);
				const yy = y + (rnd(`${seed}y${i}`) - 0.5) * r * 0.35 + Math.sin(t * 2 + i) * 2;
				const ph = rnd(`${seed}p${i}`) * 6.28;
				const open = clap ? (Math.sin(t * 22 + ph) * 0.5 + 0.5) * rr * 0.7 : 0;
				return (
					<React.Fragment key={i}>
						<div style={{position: 'absolute', left: x - rr * 1.75, top: yy + rr * 0.75, width: rr * 3.5, height: rr * 4.6, borderRadius: `${rr * 1.5}px ${rr * 1.5}px 0 0`, background: color}} />
						<div style={{position: 'absolute', left: x - rr, top: yy - rr, width: rr * 2, height: rr * 2.15, borderRadius: '50%', background: color}} />
						{clap ? (
							<>
								<div style={{position: 'absolute', left: x + rr * 1.5 - open - rr * 0.42, top: yy - rr * 0.9 - clap * rr * 0.6, width: rr * 0.5, height: rr * 1.15, borderRadius: rr * 0.25, background: hand, transform: 'rotate(-12deg)'}} />
								<div style={{position: 'absolute', left: x + rr * 1.5 + open, top: yy - rr * 0.9 - clap * rr * 0.6, width: rr * 0.5, height: rr * 1.15, borderRadius: rr * 0.25, background: hand, transform: 'rotate(12deg)'}} />
							</>
						) : null}
					</React.Fragment>
				);
			})}
		</>
	);
};
