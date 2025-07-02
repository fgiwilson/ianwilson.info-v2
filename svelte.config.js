import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create absolute paths to layout files
const blogLayoutPath = path.resolve(__dirname, './src/lib/layouts/BlogLayout.svelte');
const projectLayoutPath = path.resolve(__dirname, './src/lib/layouts/ProjectLayout.svelte');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md', '.svx'],
			layout: {
				blog: blogLayoutPath,
				project: projectLayoutPath
			}
		})
	],
	
	extensions: ['.svelte', '.md', '.svx'],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
