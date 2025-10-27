<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import wordpressClient from '$lib/wordpressClient.js';
	import WordCard from '$lib/components/WordCard.svelte';

	// State
	let words = [];
	let currentIndex = 0;
	let loading = true;
	let error = '';
	let progress = { current: 0, total: 0 };

	// Computed
	$: currentWord = words[currentIndex];
	$: progressText = `${progress.current} / ${progress.total}`;

	// Load deck on mount
	onMount(async () => {
		await loadDeck();
	});

	// Load word deck
	async function loadDeck() {
		loading = true;
		error = '';

		try {
			// Check authentication
			if (!wordpressClient.isLoggedIn()) {
				goto('/login');
				return;
			}

			// Fetch deck
			const result = await wordpressClient.getDeck();
			
			if (result.success) {
				words = result.words || [];
				currentIndex = 0;
				progress = {
					current: 1,
					total: words.length
				};
			} else {
				error = result.message || 'Kelimeler yüklenemedi';
			}
		} catch (err) {
			console.error('Load deck error:', err);
			error = 'Bir hata oluştu. Lütfen tekrar deneyin.';
		} finally {
			loading = false;
		}
	}

	// Handle known word
	async function handleKnown(event) {
		const wordId = event.detail.wordId;
		
		try {
			// Update progress
			await wordpressClient.updateProgress(wordId, true);
			
			// Move to next word
			nextWord();
		} catch (err) {
			console.error('Update progress error:', err);
			error = 'İlerleme kaydedilemedi';
		}
	}

	// Handle unknown word
	async function handleUnknown(event) {
		const wordId = event.detail.wordId;
		
		try {
			// Update progress
			await wordpressClient.updateProgress(wordId, false);
			
			// Note: WordCard will show translation, no immediate navigation
		} catch (err) {
			console.error('Update progress error:', err);
			error = 'İlerleme kaydedilemedi';
		}
	}

	// Move to next word
	function nextWord() {
		if (currentIndex < words.length - 1) {
			currentIndex++;
			progress.current++;
		} else {
			// Deck completed, load new deck
			loadDeck();
		}
	}

	// Logout function
	function logout() {
		wordpressClient.logout();
		goto('/login');
	}

	// Retry loading
	function retry() {
		loadDeck();
	}
</script>

<svelte:head>
	<title>Kelime Öğren - Dashboard</title>
</svelte:head>

<div class="dashboard-container">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="header-content">
			<h1>Kelime Öğren</h1>
			<div class="header-actions">
				<button class="logout-button" on:click={logout}>
					Çıkış Yap
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="dashboard-main">
		{#if loading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Kelimeler yükleniyor...</p>
			</div>
		{:else if error}
			<div class="error-container">
				<div class="error-icon">⚠️</div>
				<h2>Hata</h2>
				<p>{error}</p>
				<button class="retry-button" on:click={retry}>
					Tekrar Dene
				</button>
			</div>
		{:else if words.length === 0}
			<div class="empty-container">
				<div class="empty-icon">📚</div>
				<h2>Kelime Bulunamadı</h2>
				<p>Şu anda öğrenecek kelime bulunmuyor.</p>
				<button class="retry-button" on:click={retry}>
					Yenile
				</button>
			</div>
		{:else if currentWord}
			<!-- Progress Bar -->
			<div class="progress-container">
				<div class="progress-bar">
					<div 
						class="progress-fill" 
						style="width: {(progress.current / progress.total) * 100}%"
					></div>
				</div>
				<div class="progress-text">
					<span class="progress-current">{progress.current}</span>
					<span class="progress-separator">/</span>
					<span class="progress-total">{progress.total}</span>
				</div>
			</div>

			<!-- Word Card -->
			<div class="word-card-container">
				<WordCard 
					word={currentWord}
					on:known={handleKnown}
					on:unknown={handleUnknown}
				/>
			</div>

			<!-- Navigation Help -->
			<div class="navigation-help">
				<p>Kelimeyi biliyorsanız <strong>"Biliyorum"</strong>, bilmiyorsanız <strong>"Bilmiyorum"</strong> butonuna tıklayın.</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.dashboard-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.dashboard-header {
		margin-bottom: 30px;
	}

	.header-content {
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-content h1 {
		color: white;
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.logout-button {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.logout-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}

	.dashboard-main {
		max-width: 600px;
		margin: 0 auto;
	}

	.loading-container {
		text-align: center;
		padding: 60px 20px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e1e5e9;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 20px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-container p {
		color: #666;
		font-size: 1.1rem;
		margin: 0;
	}

	.error-container,
	.empty-container {
		text-align: center;
		padding: 40px 20px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.error-icon,
	.empty-icon {
		font-size: 3rem;
		margin-bottom: 20px;
	}

	.error-container h2,
	.empty-container h2 {
		color: #2d3748;
		font-size: 1.5rem;
		margin: 0 0 12px 0;
	}

	.error-container p,
	.empty-container p {
		color: #666;
		font-size: 1rem;
		margin: 0 0 24px 0;
		line-height: 1.5;
	}

	.retry-button {
		background: #667eea;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.retry-button:hover {
		background: #5a67d8;
		transform: translateY(-1px);
	}

	.progress-container {
		margin-bottom: 30px;
		background: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e1e5e9;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 4px;
		transition: width 0.5s ease;
	}

	.progress-text {
		text-align: center;
		font-size: 1.2rem;
		font-weight: 700;
		color: #2d3748;
	}

	.progress-current {
		color: #667eea;
	}

	.progress-separator {
		color: #a0aec0;
		margin: 0 8px;
	}

	.progress-total {
		color: #4a5568;
	}

	.word-card-container {
		margin-bottom: 30px;
	}

	.navigation-help {
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		padding: 16px 20px;
		border-radius: 12px;
		backdrop-filter: blur(10px);
	}

	.navigation-help p {
		margin: 0;
		color: #4a5568;
		font-size: 0.95rem;
		line-height: 1.4;
	}

	.navigation-help strong {
		color: #2d3748;
		font-weight: 600;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.dashboard-container {
			padding: 16px;
		}

		.header-content {
			flex-direction: column;
			gap: 16px;
			text-align: center;
		}

		.header-content h1 {
			font-size: 1.8rem;
		}

		.progress-container {
			padding: 16px;
		}

		.progress-text {
			font-size: 1.1rem;
		}
	}
</style>
