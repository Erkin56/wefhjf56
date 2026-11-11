import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import meta from './assets.json';
import {FONT} from './fonts';
import {Arena, Confetti, Flash, H, Ken, OText, Rings, Robot, Shot, Sprite, Vignette, W, backOut, clamp01, easeIO, easeIn, easeOut, env, img, lerp, pop, ramp, rnd, useT} from './kit';

/** x (sprite px), y of the tag bottom (sprite px), case name, its questions, colour. */
const TAGS: [number, number, string, string, string][] = [
	[126, 70, 'ИМЕНИТЕЛЬНЫЙ', 'кто? что?', '#ffc83d'],
	[380, 48, 'РОДИТЕЛЬНЫЙ', 'кого? чего?', '#ff6b6b'],
	[640, 2, 'ДАТЕЛЬНЫЙ', 'кому? чему?', '#4be07e'],
	[768, 162, 'ВИНИТЕЛЬНЫЙ', 'кого? что?', '#ff9a2e'],
	[1010, -2, 'ТВОРИТЕЛЬНЫЙ', 'кем? чем?', '#b99bff'],
	[1196, 88, 'ПРЕДЛОЖНЫЙ', 'о ком? о чём?', '#5fe0ea'],
];
const TAG_AT = [29.45, 29.6, 30.0, 30.4, 30.8, 31.1];

const BossBar: React.FC<{hp: number; appear: number}> = ({hp, appear}) => {
	const t = useT();
	const a = pop(t, appear, 0.3);
	if (a <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', left: 90, top: 158, width: 900, transform: `scale(${a})`, opacity: clamp01(a)}}>
			<div style={{fontFamily: FONT.russoOne, fontSize: 40, color: '#fff', textAlign: 'center', textShadow: '0 4px 0 #3a0612, 0 0 18px #ff2a4d', letterSpacing: 1}}>БОСС: РОДИТЕЛЬНЫЙ ПАДЕЖ</div>
			<div style={{marginTop: 10, height: 36, borderRadius: 18, border: '4px solid #fff', background: '#2a0612', overflow: 'hidden', boxShadow: '0 0 22px #ff2a4d', boxSizing: 'border-box'}}>
				<div style={{width: `${hp * 100}%`, height: '100%', background: 'linear-gradient(180deg, #ff8a98, #ff1f45 55%, #b3001e)'}} />
			</div>
		</div>
	);
};

const C1: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const bw = meta.sprites.bosses.w;
	const bh = meta.sprites.bosses.h;
	const zoom = easeIO(ramp(t, 28.9, 29.6));
	const S = lerp(0.78, 1.55, zoom);
	const focus = lerp(bw / 2, 270, zoom) + 800 * easeIO(ramp(t, 29.6, 31.55));
	const lit = ramp(t, 28.0, 28.18);
	const rise = easeOut(ramp(t, 27.3, 27.95));
	const landed = t >= 27.12;
	const heroBottom = landed ? 1890 : lerp(-200, 1890, easeIn(ramp(t, 27.0, 27.12)));
	const squash = landed ? (1 - ramp(t, 27.12, 27.42)) * 0.16 : 0;
	const sh = landed ? (1 - ramp(t, 27.12, 27.5)) * 16 : 0;
	const title = t < 27.35 ? 0 : lerp(3, 1, easeOut(ramp(t, 27.35, 27.52)));
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${(rnd(`c1x${fr}`) - 0.5) * sh}px, ${(rnd(`c1y${fr}`) - 0.5) * sh}px)`}}>
			<Arena dim={(1 - lit) * 0.5} />
			<div style={{position: 'absolute', left: 540 - focus * S, top: 1238 - bh * S + (1 - rise) * 70, width: bw * S, height: bh * S, opacity: rise}}>
				{[126, 380, 618, 768, 973, 1196].map((x, i) => (
					<div key={i} style={{position: 'absolute', left: (x - 110) * S, top: (bh - 22) * S, width: 220 * S, height: 44 * S, borderRadius: '50%', background: 'rgba(0,0,0,.55)', filter: 'blur(8px)'}} />
				))}
				<Img src={img('bosses.png')} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', filter: `brightness(${0.04 + 0.96 * lit})`}} />
				{TAGS.map(([x, y, name, q, c], i) => {
					const a = pop(t, TAG_AT[i], 0.28);
					if (a <= 0) {
						return null;
					}
					return (
						<div key={name} style={{position: 'absolute', left: x * S, top: y * S, transform: `translate(-50%, -100%) scale(${a})`, transformOrigin: '50% 100%'}}>
							<div style={{background: 'rgba(10,2,36,.9)', border: `3px solid ${c}`, borderRadius: 14, padding: '6px 14px 8px', textAlign: 'center', boxShadow: `0 0 18px ${c}99`, whiteSpace: 'nowrap', fontFamily: FONT.montserrat}}>
								<div style={{fontWeight: 800, fontSize: 26, color: c, letterSpacing: 0.5}}>{name}</div>
								<div style={{fontWeight: 700, fontSize: 24, color: '#fff'}}>{q}</div>
							</div>
						</div>
					);
				})}
			</div>
			{landed ? (
				<div
					style={{
						position: 'absolute',
						left: 540 - 300 * easeOut(ramp(t, 27.12, 27.55)),
						top: 1866,
						width: 600 * easeOut(ramp(t, 27.12, 27.55)),
						height: 46,
						borderRadius: '50%',
						border: '6px solid rgba(255,255,255,.8)',
						boxSizing: 'border-box',
						opacity: 1 - ramp(t, 27.12, 27.6),
					}}
				/>
			) : null}
			<Sprite name="hero_back" h={620} x={540} bottom={heroBottom} sx={1 + squash} sy={1 - squash} rot={Math.sin(t * 2) * 0.8} />
			<OText text={'БИТВА\nС ПАДЕЖАМИ'} x={540} y={lerp(340, 290, zoom)} size={116} lh={1.1} font={FONT.russoOne} weight={400} fill="#ffffff" stroke="#2a0a66" sw={20} depth={9} depthColor="#ff2bd6" scale={title * lerp(1, 0.74, zoom)} opacity={1 - ramp(t, 31.4, 31.65)} />
			<Flash at={28.0} d={0.28} max={0.65} />
			<Vignette />
		</div>
	);
};

const C2: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const v = env('boss', t);
	const inn = 0.55 + 0.45 * backOut(ramp(t, 31.7, 32.0));
	const sh = 5 + v * 18;
	return (
		<>
			<Arena mood="red" />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(255,40,70,.5), rgba(0,0,0,0) 62%)', opacity: 0.45 + 0.55 * v}} />
			<Rings x={540} y={900} on={v} color="#ffc2b3" r0={200} r1={800} n={4} speed={1.25} />
			<Sprite name="boss_red" h={1040} x={540 + (rnd(`bx${fr}`) - 0.5) * sh} bottom={1512 + (rnd(`by${fr}`) - 0.5) * sh} sx={inn * (1 + v * 0.05)} sy={inn * (1 + v * 0.07)} rot={Math.sin(t * 9) * 1.5 * v} />
			<OText text="КОГО?" x={298} y={380} size={132} rot={-9} font={FONT.russoOne} weight={400} fill="#ffe14d" stroke="#3a0612" sw={20} depth={9} scale={pop(t, 32.1, 0.25)} />
			<OText text="ЧЕГО?" x={778} y={460} size={132} rot={7} font={FONT.russoOne} weight={400} fill="#ffe14d" stroke="#3a0612" sw={20} depth={9} scale={pop(t, 33.58, 0.25)} />
			<BossBar hp={1} appear={31.95} />
			<Flash at={31.7} d={0.2} max={0.5} color="#ff3050" />
			<Vignette />
		</>
	);
};

const C3: React.FC = () => {
	const t = useT();
	return (
		<>
			<Ken
				src={img('k3d.jpg')}
				cams={[
					[34.4, [1.0, 0.55, 0.45]],
					[36.5, [1.14, 0.6, 0.38]],
				]}
				ease={easeOut}
				shake={(1 - ramp(t, 34.4, 34.85)) * 16 + env('hero', t) * 3}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(255,0,40,.4) 100%)', opacity: 0.55 + 0.45 * Math.sin(t * 10)}} />
			<OText text="?!" x={228} y={430} size={230} rot={-12} font={FONT.russoOne} weight={400} fill="#ffffff" stroke="#3a0612" sw={22} depth={10} scale={pop(t, 34.72, 0.25)} />
			<Vignette />
		</>
	);
};

const C4: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const open = easeOut(ramp(t, 36.55, 36.92));
	const flick = t < 37.15 ? 0.55 + 0.45 * rnd(`fl${fr}`) : 1;
	const l1 = 'НЕТ КОГО?'.slice(0, Math.round(ramp(t, 36.95, 37.4) * 9));
	const n2 = Math.round(ramp(t, 37.5, 38.05) * 9);
	const pulse = 0.6 + 0.4 * Math.sin(t * 9);
	return (
		<>
			<Arena dim={0.4} />
			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: open * 0.55 * flick}}>
				<defs>
					<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#9ffcff" stopOpacity="0.9" />
						<stop offset="1" stopColor="#3fd9ff" stopOpacity="0.15" />
					</linearGradient>
				</defs>
				<polygon points="800,560 840,560 990,740 90,740" fill="url(#cone)" />
			</svg>
			<Robot x={820} y={430} w={330} mood="happy" glow={18} />
			<div
				style={{
					position: 'absolute',
					left: 90,
					top: 730,
					width: 900,
					height: 520,
					transform: `scaleY(${open})`,
					transformOrigin: '50% 0%',
					opacity: flick,
					borderRadius: 24,
					border: '4px solid #7ff6ff',
					background: 'linear-gradient(180deg, rgba(40,210,255,.3), rgba(30,110,255,.2))',
					boxShadow: '0 0 60px rgba(80,230,255,.65), inset 0 0 60px rgba(80,230,255,.25)',
					boxSizing: 'border-box',
					overflow: 'hidden',
				}}
			>
				<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 2px, transparent 2px 8px)'}} />
				<div style={{position: 'absolute', left: 34, top: 22, fontFamily: FONT.jetBrainsMono, fontWeight: 700, fontSize: 30, color: '#9ffcff', letterSpacing: 3}}>ПОДСКАЗКА</div>
				<div style={{position: 'absolute', left: 0, top: 96, width: '100%', textAlign: 'center', fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 104, lineHeight: 1, color: '#fff', textShadow: '0 0 26px rgba(120,240,255,.95)'}}>{l1}</div>
				<div style={{position: 'absolute', left: 0, top: 232, width: '100%', textAlign: 'center', fontFamily: FONT.montserrat, fontWeight: 900, fontSize: 112, lineHeight: 1, color: '#fff', textShadow: '0 0 26px rgba(120,240,255,.95)'}}>
					{'СТУДЕНТ'.slice(0, Math.min(7, n2))}
					{n2 >= 8 ? <span style={{color: '#ffe14d', textShadow: `0 0 ${20 + 26 * pulse}px rgba(255,220,60,.95)`, borderBottom: '10px solid #ffe14d'}}>А</span> : null}
					{n2 >= 9 ? '!' : ''}
				</div>
				<div style={{position: 'absolute', left: 0, top: 404, width: '100%', textAlign: 'center', fontFamily: FONT.montserrat, fontWeight: 700, fontSize: 36, color: '#c9fbff', opacity: ramp(t, 38.1, 38.35)}}>
					Родительный падеж: окончание <span style={{color: '#ffe14d', fontWeight: 900}}>-А</span>
				</div>
			</div>
			<Sprite name="hero_back" h={540} x={300} bottom={1905} rot={Math.sin(t * 2) * 0.8} />
			<Flash at={36.55} d={0.2} max={0.4} color="#7ff6ff" />
			<Vignette />
		</>
	);
};

const C5: React.FC = () => {
	const t = useT();
	const h1 = 39.78;
	const h2 = 40.78;
	const hp = 1 - 0.5 * easeOut(ramp(t, h1, h1 + 0.25)) - 0.5 * easeOut(ramp(t, h2, h2 + 0.3));
	return (
		<>
			<Ken
				src={img('k3f.jpg')}
				cams={[
					[38.9, [1.0, 0.5, 0.42]],
					[41.5, [1.12, 0.5, 0.37]],
				]}
				ease={(x) => x}
				shake={env('hero', t) * 3 + (t > h2 ? (1 - ramp(t, h2, h2 + 0.3)) * 10 : 0)}
			/>
			<BossBar hp={Math.max(0, hp)} appear={38.95} />
			{[h1, h2].map((h, i) => (
				<OText key={i} text={i === 0 ? '-50' : '-50!'} x={i === 0 ? 800 : 860} y={330 - ramp(t, h, h + 0.9) * 70} size={i === 0 ? 76 : 96} rot={i === 0 ? 8 : -6} font={FONT.russoOne} weight={400} fill="#7ff6ff" stroke="#062a4a" sw={14} depth={6} scale={pop(t, h, 0.2)} opacity={1 - ramp(t, h + 0.55, h + 0.9)} />
			))}
			<Flash at={h1} d={0.18} max={0.3} color="#7ff6ff" />
			<Flash at={h2} d={0.22} max={0.45} color="#7ff6ff" />
			<Vignette o={0.35} />
		</>
	);
};

const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЫЭЮЯ';
const PAL = ['#ff6b6b', '#ffd93d', '#ffffff', '#ff9a2e', '#ff8ac0', '#ffb3a0'];

const C6: React.FC = () => {
	const t = useT();
	const fr = useCurrentFrame();
	const boom = 41.95;
	const pre = ramp(t, 41.5, boom);
	const gone = ramp(t, boom, boom + 0.22);
	const sh = t < boom ? 6 + pre * 26 : 0;
	const e = easeOut(ramp(t, boom, boom + 0.6));
	const fade = 1 - ramp(t, 42.95, 43.4);
	return (
		<>
			<Arena mood={t < boom ? 'red' : 'violet'} />
			{gone < 1 ? (
				<Sprite name="boss_red" h={1040} x={540 + (rnd(`gx${fr}`) - 0.5) * sh} bottom={1512 + (rnd(`gy${fr}`) - 0.5) * sh} sx={1 + gone * 0.4 - pre * 0.04} sy={1 + gone * 0.4 + pre * 0.03} opacity={1 - gone} filter={`brightness(${1 + pre * pre * 2.2 + gone * 4}) saturate(${1 - pre * 0.4})`} />
			) : null}
			{t >= boom ? (
				<AbsoluteFill>
					<div
						style={{
							position: 'absolute',
							left: 540 - 520,
							top: 960 - 440,
							width: 1040,
							height: 880,
							borderRadius: '50%',
							background: 'radial-gradient(ellipse, rgba(255,235,240,.5) 0%, rgba(255,150,190,.22) 45%, rgba(255,120,170,0) 70%)',
							transform: `scale(${0.3 + 0.8 * e})`,
							opacity: fade,
						}}
					/>
					{Array.from({length: 74}, (_, i) => {
						const a = rnd(`la${i}`) * Math.PI * 2 + (t - boom) * (0.25 + rnd(`lw${i}`) * 0.4) * (i % 2 ? 1 : -1);
						const R = (120 + rnd(`lr${i}`) * 440) * e;
						const size = 44 + rnd(`ls${i}`) * 76;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: 540 + Math.cos(a) * R,
									top: 960 + Math.sin(a) * R * 0.8 - (t - boom) * 46,
									transform: `translate(-50%, -50%) rotate(${(rnd(`lo${i}`) - 0.5) * 80 + (t - boom) * 70 * (rnd(`lq${i}`) - 0.5)}deg)`,
									fontFamily: FONT.russoOne,
									fontSize: size,
									lineHeight: 1,
									color: PAL[i % PAL.length],
									textShadow: '0.04em 0.05em 0 rgba(60,6,30,.85)',
									opacity: fade * (0.55 + 0.45 * rnd(`lp${i}`)),
								}}
							>
								{ABC[Math.floor(rnd(`lc${i}`) * ABC.length)]}
							</div>
						);
					})}
				</AbsoluteFill>
			) : null}
			<BossBar hp={0} appear={41.0} />
			<Flash at={boom} d={0.32} />
			<Vignette />
		</>
	);
};

const C7: React.FC = () => {
	const t = useT();
	const slam = t < 43.42 ? 0 : lerp(3, 1, easeOut(ramp(t, 43.42, 43.6)));
	const xp = pop(t, 44.0, 0.3);
	const jump = Math.abs(Math.sin(ramp(t, 43.5, 45.0) * Math.PI * 3)) * 46;
	return (
		<>
			<Arena mood="gold" />
			<div
				style={{
					position: 'absolute',
					left: 540 - 1500,
					top: 640 - 1500,
					width: 3000,
					height: 3000,
					background: 'repeating-conic-gradient(rgba(255,240,170,.2) 0deg 9deg, rgba(255,240,170,0) 9deg 18deg)',
					transform: `rotate(${t * 22}deg)`,
					WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,.5) 30%, transparent 62%)',
				}}
			/>
			<Sprite name="hero_front" h={840} x={330} bottom={1908 - jump} />
			<Robot x={800} y={1220} w={370} mood="happy" bob={26} glow={14} />
			<OText text={'УРОВЕНЬ\nПРОЙДЕН!'} x={540} y={420} size={128} lh={1.1} font={FONT.russoOne} weight={400} fill="#ffffff" stroke="#2a0a66" sw={22} depth={10} depthColor="#ff2bd6" scale={slam} />
			<OText text="+100 XP" x={540} y={740} size={150} font={FONT.russoOne} weight={400} fill="#ffd93d" stroke="#5a2a00" sw={22} depth={10} scale={xp * (1 + 0.04 * Math.sin(t * 14))} />
			<Confetti at={43.45} />
			<Flash at={43.4} d={0.25} max={0.8} />
		</>
	);
};

export const Scene3: React.FC = () => (
	<>
		<Shot a={27.0} b={31.7}>
			<C1 />
		</Shot>
		<Shot a={31.7} b={34.4}>
			<C2 />
		</Shot>
		<Shot a={34.4} b={36.5}>
			<C3 />
		</Shot>
		<Shot a={36.5} b={38.9}>
			<C4 />
		</Shot>
		<Shot a={38.9} b={41.5}>
			<C5 />
		</Shot>
		<Shot a={41.5} b={43.4}>
			<C6 />
		</Shot>
		<Shot a={43.4} b={45.0}>
			<C7 />
		</Shot>
	</>
);
