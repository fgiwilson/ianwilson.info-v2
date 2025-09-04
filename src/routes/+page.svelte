<script lang="ts">
	// Import any necessary components or data
	import { onMount } from 'svelte';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	//import { Briefcase, Code, FileText } from 'lucide-svelte';
	import '@awesome.me/kit-b2c306474b/icons/css/all.min.css';

	// Profile image URL (placeholder for now)
	const profileImageUrl = `/images/profile_400_bw.jpg`;

	// Feature cards data
	const featureCards = [
		{
			title: 'Project/Initiatives Management',
			description: 'Strategic planning, execution, and delivery of projects and initiatives.',
			icon: 'briefcase',
			link: '/portfolio?category=initiatives'
		},
		{
			title: 'Web Development',
			description: 'Modern, responsive web applications built with cutting-edge technologies.',
			icon: 'code',
			link: '/portfolio?category=web'
		},
		{
			title: 'Strategic/Technical Consulting',
			description:
				'Delivering value through strategic and technical consulting services, and development of custom solutions.',
			icon: 'document',
			link: '/portfolio?category=consulting'
		}
	];

	// Animation for elements (optional)
	let visible = false;

	onMount(() => {
		// Trigger animations after component mounts
		setTimeout(() => {
			visible = true;
		}, 100);
	});
</script>

<!-- Hero Section -->
<section class="py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="flex flex-col items-center justify-between gap-12 md:flex-row">
			<!-- Hero Content -->
			<div class="space-y-6 text-center md:w-1/2 md:text-left">
				<h1 class="text-4xl font-bold md:text-5xl lg:text-6xl">
					<span class="text-text">Hi, I'm </span>
					<span class="text-primary">Ian </span>
					<span class="text-accent">Wilson</span>
				</h1>

				<p class="text-text-light text-xl leading-relaxed">
					Initiatives, Strategic Operations, Brand Development and Design & Technical Consulting,
					I'm a results-driven professional with a proven track record of delivery. With a strong
					background in Web Development, Operational Project Management and Brand Development, I'm
					passionate about creating innovative solutions that drive business growth and improve
					efficiency.
				</p>

				<div class="flex flex-wrap justify-center gap-4 md:justify-start">
					<a
						href="/portfolio"
						class="btn-primary rounded-lg px-6 py-3 font-medium transition-all duration-200"
					>
						View My Work
					</a>
					<a
						href="/contact"
						class="btn-secondary rounded-lg px-6 py-3 font-medium transition-all duration-200"
					>
						Get In Touch
					</a>
				</div>
			</div>

			<!-- Profile Image -->
			<div class="flex justify-center md:w-1/2 md:justify-end">
				<div class="relative h-64 w-64 md:h-80 md:w-80">
					<!-- Profile image with optimization -->
					<div class="border-accent h-full w-full overflow-hidden rounded-full border-4 shadow-lg">
						<OptimizedImage
							src={profileImageUrl}
							alt="Ian Wilson"
							width={320}
							height={320}
							class="h-full w-full object-cover"
							quality={90}
						/>
					</div>
					<!-- No decorative elements -->
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Feature Cards Section -->
<section class="bg-gradient py-16">
	<div class="container mx-auto px-4">
		<h2 class="mb-12 text-center text-3xl font-bold md:text-4xl">
			<span class="text-primary">What I </span>
			<span class="text-accent">Do</span>
		</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each featureCards as card, i}
				<div
					class="bg-background rounded-lg border border-gray-100 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
				>
					<!-- Card Icon -->
					<div
						class="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full md:mx-0"
					>
						{#if card.icon === 'briefcase'}
							<i class="fa-sharp fa-light fa-briefcase fa-2xl text-primary"></i>
						{:else if card.icon === 'code'}
							<i class="fa-sharp fa-light fa-code-simple fa-2xl text-primary"></i>
						{:else if card.icon === 'document'}
							<i class="fa-sharp fa-light fa-bullseye-arrow fa-2xl text-primary"></i>
						{/if}
					</div>

					<!-- Card Content -->
					<h3 class="mb-3 text-center text-xl font-semibold md:text-left">{card.title}</h3>
					<p class="text-text-light mb-6 text-center md:text-left">{card.description}</p>

					<!-- Card Link -->
					<div class="text-center md:text-left">
						<a
							href={card.link}
							class="text-accent hover:text-accent-dark inline-flex items-center font-medium transition-colors duration-200"
						>
							Learn More
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="ml-2 h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="5" y1="12" x2="19" y2="12"></line>
								<polyline points="12 5 19 12 12 19"></polyline>
							</svg>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Call to Action Section -->
<section class="py-16">
	<div class="container mx-auto px-4 text-center">
		<h2 class="mb-6 text-3xl font-bold md:text-4xl">
			<span class="text-primary">Ready to </span>
			<span class="text-accent">Work Together?</span>
		</h2>
		<p class="text-text-light mx-auto mb-8 max-w-2xl text-xl">
			I'm currently available for freelance projects, full-time positions, and consulting work.
			Let's create something amazing together!
		</p>
		<a
			href="/contact"
			class="btn-primary inline-block rounded-lg px-8 py-3 font-medium transition-all duration-200"
		>
			Contact Me
		</a>
	</div>
</section>
