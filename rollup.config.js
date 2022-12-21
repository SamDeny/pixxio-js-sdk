const commonjs = require( '@rollup/plugin-commonjs');
const resolve = require( '@rollup/plugin-node-resolve');
const replace = require( '@rollup/plugin-replace');
const terser = require( '@rollup/plugin-terser');

const svelte = require( 'rollup-plugin-svelte');
const livereload = require( 'rollup-plugin-livereload');
const css = require( 'rollup-plugin-css-only');
const preprocess = require( 'svelte-preprocess');

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}


module.exports = {
	input: 'src/main.js',
	output: [
		{
			file: 'build/esm/index.js',
			format: 'es',
			name: 'app',
			sourcemap: true 
		},
		{
			file: 'build/pixxio.jsdk.min.js',
			format: 'iife',
			name: 'app',
			sourcemap: !production,
		}
	],
	plugins: [
		svelte({
			compilerOptions: {
				dev: !production
			},
			preprocess: preprocess()
		}),

		css({
			output: 'index.css'
		}),

		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': production ? 'production' : 'development'
		}),

		commonjs(),

		resolve({
			browser: true,
			dedupe: ['svelte']
		}),

		!production && serve(),

		!production && livereload('build'),

		production && terser()
	]
};
