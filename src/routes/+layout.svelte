<script lang="ts">
	import '../app.css';
	import Header from '../components/Header.svelte';
	import Footer from '../components/Footer.svelte';
	import { page } from '$app/stores';
	import { generateSeoTags, defaultMeta } from '$lib/utils/seo';
	import type { PageData } from './$types';

	// Initialize props with proper typing
	let { data = {}, children } = $props<{ data?: PageData, children: any }>();
	
	// Get the current page path for active navigation highlighting
	let activePage = $derived($page.url.pathname.split('/')[1] || 'home');
	
	// Generate SEO meta tags based on page data
	let seoData = $derived({
		title: data.title || defaultMeta.title,
		description: data.description || defaultMeta.description,
		url: `${defaultMeta.url}${$page.url.pathname}`,
		image: data.image || defaultMeta.image,
		article: data.article,
		noindex: data.noindex,
		nofollow: data.nofollow
	});
	
	// Generate SEO tags
	let seo = $derived(generateSeoTags(seoData));
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as tag}
		<meta {...tag} />
	{/each}
	
	<!-- Canonical URL -->
	<link rel="canonical" href={seoData.url} />
	
	<!-- Structured data if available -->
	{#if data?.jsonLd}
		<script type="application/ld+json">
			{JSON.stringify(data.jsonLd)}
		</script>
	{/if}
	<script defer src="https://analytics.ianwilson.info/script.js" data-website-id="934fd79d-6dc6-499b-b648-f7831a873a91"></script>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Header activePage={activePage} />
	
	<main class="flex-grow">
		{@render children()}
	</main>
	
	<Footer />
</div>
