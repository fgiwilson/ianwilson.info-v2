<script lang="ts">
	// Add default export for Svelte 5 compatibility
	export {};

	// Props for the component
	let {
		title = 'Resume',
		description = 'Professional experience and qualifications',
		personalInfo = null,
		skills = null,
		stats = null,
		metadata = {},
		children = () => ''
	} = $props<{
		title?: string;
		description?: string;
		personalInfo?: { id: string; label: string; value: string; order: number }[] | null;
		skills?:
			| { id: string; name: string; percentage: number; category: string | null; order: number }[]
			| null;
		stats?: { id: string; value: string; label: string; order: number }[] | null;
		metadata?: Record<string, any>;
		children?: () => any;
	}>();

	// Group skills by category
	let skillsByCategory = $derived(skills ? groupSkillsByCategory(skills) : null);

	// Function to group skills by category
	function groupSkillsByCategory(
		skills: {
			id: string;
			name: string;
			percentage: number;
			category: string | null;
			order: number;
		}[]
	) {
		const categories = new Map<
			string,
			{ id: string; name: string; percentage: number; category: string | null; order: number }[]
		>();

		// Add 'Uncategorized' for skills without a category
		categories.set('Uncategorized', []);

		// Group skills by their category
		for (const skill of skills) {
			const category = skill.category || 'Uncategorized';

			if (!categories.has(category)) {
				categories.set(category, []);
			}

			categories.get(category)!.push(skill);
		}

		// Convert map to array of category objects
		return Array.from(categories.entries())
			.filter(([_, skills]) => skills.length > 0) // Remove empty categories
			.map(([category, skills]) => ({
				name: category,
				skills: skills.sort((a, b) => a.order - b.order)
			}));
	}
</script>

<article class="container mx-auto px-4 py-8 md:py-12">
	<div class="flex flex-col gap-8 lg:flex-row">
		<!-- Sidebar with personal info and skills -->
		<div class="rounded-lg bg-gray-200 p-6 text-gray-600 shadow-lg lg:w-1/4">
			<!-- Personal Info section -->
			<div class="mb-8">
				<h2 class="mb-4 border-b border-gray-600 pb-2 text-2xl font-bold">Personal Info</h2>
				{#if personalInfo && personalInfo.length > 0}
					<div class="space-y-4">
						{#each personalInfo as info}
							<div>
								<div class="text-sm text-gray-600">{info.label}:</div>
								<div class="font-medium">
									{#if info.label.toLowerCase().includes('email')}
										<a href="mailto:{info.value}" class="text-primary hover:underline"
											>{info.value}</a
										>
									{:else if info.label.toLowerCase().includes('website') || info.label
											.toLowerCase()
											.includes('url')}
										<a
											href={info.value.startsWith('http') ? info.value : `https://${info.value}`}
											target="_blank"
											rel="noopener noreferrer"
											class="text-primary hover:underline">{info.value}</a
										>
									{:else if info.label.toLowerCase().includes('phone')}
										<a
											href="tel:{info.value.replace(/[^0-9+]/g, '')}"
											class="text-primary hover:underline">{info.value}</a
										>
									{:else}
										{info.value}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-400 italic">No personal information available</p>
				{/if}
			</div>
		</div>

		<!-- Main content area -->
		<div class="lg:w-3/4">
			<header class="mb-8">
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 class="text-primary mb-2 text-3xl font-bold md:text-4xl lg:text-5xl">{title}</h1>

						{#if description}
							<p class="text-text-light text-xl">{description}</p>
						{/if}
					</div>

					<!-- Print button -->
					<!--
          <button
            class="self-start md:self-auto bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            onclick={() => window.print()}
            aria-label="Print resume"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
          -->
				</div>
			</header>

			{#if stats && stats.length > 0}
				<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
					{#each stats as stat}
						<div
							class="rounded-lg bg-gray-100 p-4 text-center shadow-sm transition-shadow duration-300 hover:shadow-md"
						>
							<div class="text-primary text-2xl font-bold md:text-3xl">{stat.value}</div>
							<div class="text-sm text-gray-600">{stat.label}</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- No stats available, but don't show a message as it's not critical -->
				<div class="mb-8"></div>
			{/if}

			<div class="prose prose-lg max-w-none">
				<!-- The markdown content will be inserted here -->
				{@render children()}
			</div>
		</div>
	</div>
</article>

<style>
	/* Add any custom styles for the resume layout */

	/* Print-specific styles */
	@media print {
		article {
			padding: 0;
			max-width: 100%;
		}

		/* Hide the print button when printing */

		/*button {
      display: none;
    }*/

		/* Adjust layout for print */
		:global(.flex-col) {
			display: block;
		}

		:global(.lg\:flex-row) {
			display: flex;
		}

		:global(.lg\:w-1\/4) {
			width: 25%;
		}

		:global(.lg\:w-3\/4) {
			width: 75%;
		}

		/* Ensure background colors print */
		:global(*) {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}

		/* Remove shadows in print */
		:global(.shadow-lg),
		:global(.shadow-md),
		:global(.shadow-sm) {
			box-shadow: none !important;
		}

		/* Adjust font sizes for print */
		:global(h1) {
			font-size: 24pt !important;
		}

		:global(h2) {
			font-size: 18pt !important;
		}

		:global(h3) {
			font-size: 14pt !important;
		}

		:global(p, li, div) {
			font-size: 11pt !important;
		}

		/* Ensure page breaks don't occur in the middle of sections */
		:global(.mb-8) {
			page-break-inside: avoid;
		}
	}
</style>
