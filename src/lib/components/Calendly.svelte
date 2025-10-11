<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://assets.calendly.com/assets/external/widget.js';
		script.async = true;
		document.body.appendChild(script);
	});
</script>

<!-- Calendly inline widget begin -->
<div
	class="calendly-inline-widget w-full pt-4"
	data-url="https://calendly.com/ian-formativestudios/initial-consultation?primary_color=2d5a5c"
	style="min-width:320px;height:700px;"
></div>
<!-- Calendly inline widget end -->
