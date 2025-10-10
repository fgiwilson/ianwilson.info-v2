<script lang="ts">
	import { enhance } from '$app/forms';
	import { Turnstile } from 'svelte-turnstile';
	import Calendly from '$lib/components/Calendly.svelte';
	import { page } from '$app/state';

	// Form state
	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let consultingInterest = $state(false);

	let contactMethod = $state('email');
	$inspect(contactMethod);
	// Form validation and submission state
	let formError = $state('');
	let formSuccess = $state(false);
	let isSubmitting = $state(false);
	let siteKey = page.data.siteKey;

	// Reset form after successful submission
	function resetForm() {
		name = '';
		email = '';
		subject = '';
		message = '';
		isSubmitting = false;
	}

	// Form submission handler
	const handleSubmit = () => {
		// Reset error state
		formError = '';

		// Basic validation
		if (!name.trim()) {
			formError = 'Please enter your name';
			return;
		}

		if (!email.trim()) {
			formError = 'Please enter your email address';
			return;
		}

		if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			formError = 'Please enter a valid email address';
			return;
		}

		if (!message.trim()) {
			formError = 'Please enter a message';
			return;
		}

		isSubmitting = true;

		// Return the enhance action
		return async ({ result, update }: { result: any; update: Function }) => {
			if (result.type === 'success') {
				formSuccess = true;
				resetForm();

				// Reset success message after 5 seconds
				setTimeout(() => {
					formSuccess = false;
				}, 5000);
			} else {
				// Check if there's a specific error message from the server
				if (result.type === 'failure' && result.data?.error) {
					formError = result.data.error;
				} else {
					formError = 'There was an error sending your message. Please try again.';
				}
				isSubmitting = false;
			}
		};
	};
</script>

<svelte:head>
	<title>Contact | Ian Wilson</title>
	<meta
		name="description"
		content="Get in touch with Ian Wilson for project inquiries, collaborations, or questions."
	/>
</svelte:head>

<section class="bg-background py-16">
	<div class="container mx-auto px-4">
		<h1 class="mb-8 text-center text-4xl font-bold md:text-5xl">
			<span class="text-primary">Get in </span>
			<span class="text-accent">Touch</span>
		</h1>

		<p class="text-text-light mx-auto mb-12 max-w-3xl text-center text-xl">
			Have a project in mind or want to discuss a collaboration? Fill out the form below or schedule
			a consultation and let's get started!
		</p>

		<section class="">
			<div>
				<ul class="flex justify-center gap-4">
					<li>
						<button
							class="{contactMethod === 'email'
								? 'bg-accent hover:bg-accent/80'
								: 'bg-primary hover:bg-primary/80'} focus:ring-primary inline-flex cursor-pointer items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							onclick={() => (contactMethod = 'email')}>Send an email</button
						>
					</li>
					<li>
						<button
							class="{contactMethod === 'consultation'
								? 'bg-accent hover:bg-accent/80'
								: 'bg-primary hover:bg-primary/80'} focus:ring-primary inline-flex cursor-pointer items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							onclick={() => (contactMethod = 'consultation')}>Schedule a consultation</button
						>
					</li>
				</ul>
			</div>
			{#if contactMethod === 'email'}
				<div class="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg md:p-8">
					{#if formSuccess}
						<div class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg
										class="h-5 w-5 text-green-600"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium">
										Thank you for your message! I'll get back to you as soon as possible.
									</p>
								</div>
							</div>
						</div>
					{/if}

					{#if formError}
						<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg
										class="h-5 w-5 text-red-600"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium">{formError}</p>
								</div>
							</div>
						</div>
					{/if}

					<form method="POST" use:enhance={handleSubmit} class="space-y-6">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<!-- Name -->
							<div>
								<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
									Name
								</label>
								<input
									type="text"
									id="name"
									name="name"
									bind:value={name}
									class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
									placeholder="Your name"
									required
								/>
							</div>

							<!-- Email -->
							<div>
								<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
									Email
								</label>
								<input
									type="email"
									id="email"
									name="email"
									bind:value={email}
									class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
									placeholder="your.email@example.com"
									required
								/>
							</div>
						</div>

						<!-- Subject -->
						<div>
							<label for="subject" class="mb-1 block text-sm font-medium text-gray-700">
								Subject
							</label>
							<input
								type="text"
								id="subject"
								name="subject"
								bind:value={subject}
								class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
								placeholder="What is this regarding?"
								required
							/>
						</div>

						<!-- Message -->
						<div>
							<label for="message" class="mb-1 block text-sm font-medium text-gray-700">
								Message
							</label>
							<textarea
								id="message"
								name="message"
								bind:value={message}
								rows="6"
								class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none"
								placeholder="Your message here..."
								required
							></textarea>
						</div>

						<!-- Consulting Interest Checkbox -->
						<div class="flex items-center">
							<input
								type="checkbox"
								id="consultingInterest"
								name="consultingInterest"
								bind:checked={consultingInterest}
								class="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
							/>
							<label for="consultingInterest" class="ml-2 block text-sm text-gray-700">
								I'm interested in consulting services
							</label>
						</div>

						<Turnstile {siteKey} appearance="always" />
						<!-- Submit Button -->
						<div class="flex justify-end">
							<button
								type="submit"
								disabled={isSubmitting}
								class="bg-primary hover:bg-primary-dark focus:ring-primary inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								{#if isSubmitting}
									<svg
										class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Sending...
								{:else}
									Send Message
								{/if}
							</button>
						</div>
					</form>
				</div>
			{/if}
			{#if contactMethod === 'consultation'}
				<div>
					<Calendly />
				</div>
			{/if}
		</section>
	</div>
</section>
