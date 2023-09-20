// rollup.config.js
import terser from '@rollup/plugin-terser';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

import { glob } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pkg from "./package.json" assert { type: 'json' };

// https://github.com/d3/d3-interpolate/issues/58
const D3_WARNING = /Circular dependency.*d3-interpolate/

export default [
	{
		input: Object.fromEntries(
			glob.sync('./src/**/*.ts').map(file => [
				// This remove `src/` as well as the file extension from each
				// file, so e.g. src/nested/foo.js becomes nested/foo
				path.relative(
					'src',
					file.slice(0, file.length - path.extname(file).length)
				),
				// This expands the relative paths to absolute paths, so e.g.
				// src/nested/foo becomes /project/src/nested/foo.js
				fileURLToPath(new URL(file, import.meta.url))
			])
		),
		output: [
			{
				dir: 'dist',
				format: 'esm',
				sourcemap: true
			},
			/* {
				file: 'dist/bundle.min.js',
				format: 'iife',
				name: 'version',
				plugins: [terser()]
			} */
		],
		plugins: [
			peerDepsExternal(),
			resolve(),
			commonjs(),
			terser(),
			typescript(),
		],
		onwarn(warning, warn) {
			if (
				warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
				warning.message.includes(`use client`)
			) {
				return;
			}
			if ( D3_WARNING.test(warning.message) ) {
				return;
			}
			warn(warning);
		}
	},

];

/*	
{
		input: "dist/esm/types/index.d.ts",
		output: [{ file: "dist/index.d.ts", format: "esm" }],
		plugins: [dts()],
		external: [/\.(css|less|scss)$/],
	},
	*/