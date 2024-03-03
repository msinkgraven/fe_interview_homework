const emoji = [
	'Segoe UI Emoji',
	'Segoe UI Symbol',
	'Segoe UI',
	'Apple Color Emoji',
	'Twemoji Mozilla',
	'Noto Color Emoji',
	'EmojiOne Color',
	'Android Emoji',
	'sans-serif',
];

const fontFamily = [
	'Inter',
	'system-ui',
	'-apple-system',
	'BlinkMacSystemFont',
	'"Segoe UI"',
	'Roboto',
	'"Helvetica Neue"',
	'Arial',
	'"Noto Sans"',
	...emoji,
];

export default {
	content: ['src/**/*.svelte', 'src/**/*.html', 'src/**/*.js', 'src/**/*.ts'],
	// all multiples of 3.5rem
	safelist: [
		'mb-12',
		'min-w-[3.5rem]',
		'min-w-[7rem]',
		'min-w-[10.5rem]',
		'min-w-[14rem]',
		'min-w-[17.5rem]',
		'min-w-[21rem]',
		'min-w-[24.5rem]',
		'min-w-[28rem]',
		'min-w-[31.5rem]',
		'min-w-[35rem]',
		'min-w-[38.5rem]',
		'min-w-[42rem]',
		'max-w-[3.5rem]',
		'max-w-[7rem]',
		'max-w-[10.5rem]',
		'max-w-[14rem]',
		'max-w-[17.5rem]',
		'max-w-[21rem]',
		'max-w-[24.5rem]',
		'max-w-[28rem]',
		'max-w-[31.5rem]',
		'max-w-[35rem]',
		'max-w-[38.5rem]',
		'max-w-[42rem]',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: fontFamily,
			},
		},
	},
};
