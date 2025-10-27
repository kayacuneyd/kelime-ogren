<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	
	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(() => console.log('Service Worker registered'))
				.catch(err => console.log('Service Worker registration failed:', err));
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#667eea" />
	<meta name="description" content="Almanca kelime öğrenme uygulaması" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<slot />
