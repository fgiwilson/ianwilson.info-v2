// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				email: string;
				name?: string;
				role: string;
			}
		}
		interface PageData {
			title?: string;
			description?: string;
			image?: string;
			noindex?: boolean;
			nofollow?: boolean;
			article?: {
				publishedTime?: string;
				modifiedTime?: string;
				tags?: string[];
				section?: string;
			};
			jsonLd?: Record<string, any>;
		}
		// interface PageState {}
		// interface Platform {}
	}

	// Add declaration for markdown modules
	declare module '*.md' {
		import type { Component } from 'svelte';
		
		// Define the shape of a markdown module
		const metadata: Record<string, any>;
		export { metadata };
		export default Component;
	}
}

export {};
