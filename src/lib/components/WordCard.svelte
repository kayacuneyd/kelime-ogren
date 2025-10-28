<script>
	import { createEventDispatcher } from 'svelte';

	// Props
	export let word = {
		id: null,
		almanca: '',
		acf_fields: {
			turkce: '',
			ornekler: '',
			emoji: '',
			gorsel: ''
		}
	};

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// State
	let showTranslation = false;

	// Callback functions
	function handleKnown() {
		dispatch('known', { wordId: word.id });
	}

	function handleUnknown() {
		showTranslation = true;
		dispatch('unknown', { wordId: word.id });
	}

	// Reset translation when word changes
	$: if (word) {
		showTranslation = false;
	}

	// Parse examples from string
	function parseExamples(examplesString) {
		if (!examplesString) return [];
		
		// Split by newlines and filter empty strings
		return examplesString
			.split('\n')
			.map(example => example.trim())
			.filter(example => example.length > 0);
	}

	// Get examples array
	$: examples = parseExamples(word.acf_fields?.ornekler || '');
</script>

<div class="word-card">
	<!-- Emoji Section -->
	{#if word.acf_fields?.emoji}
		<div class="emoji-section">
			<span class="emoji">{word.acf_fields.emoji}</span>
		</div>
	{/if}

	<!-- Emoji Section -->
	{#if word.acf_fields?.gorsel}
		<div class="emoji-section">
			<img class="gorsel" src="{word.acf_fields.gorsel}" alt="{word.almanca}">
		</div>
	{/if}

	<!-- German Word -->
	<div class="word-section">
		<h2 class="german-word">{word.almanca}</h2>
	</div>

	<!-- Translation Section (shown when unknown) -->
	{#if showTranslation}
		<div class="translation-section">
			{#if word.acf_fields?.turkce}
				<div class="translation">
					<h3>Türkçe:</h3>
					<p class="turkish-meaning">{word.acf_fields.turkce}</p>
				</div>
			{/if}

			{#if examples.length > 0}
				<div class="examples">
					<h3>Örnekler:</h3>
					<ul class="examples-list">
						{#each examples as example}
							<li class="example-item">{example}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="button-section">
		<button 
			class="unknown-button" 
			on:click={handleUnknown}
			disabled={showTranslation}
		>
			<span class="button-icon">❌</span>
			Bilmiyorum
		</button>
		
		<button 
			class="known-button" 
			on:click={handleKnown}
		>
			<span class="button-icon">✅</span>
			Biliyorum
		</button>
	</div>

	<!-- Progress Indicator -->
	{#if showTranslation}
		<div class="progress-indicator">
			<p>Bu kelimeyi öğrendiniz! Devam etmek için "Biliyorum" butonuna tıklayın.</p>
		</div>
	{/if}
</div>

<style>
	.word-card {
		background: white;
		padding: 32px;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		margin: 0 auto;
		text-align: center;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.word-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}

	.emoji-section {
		margin-bottom: 24px;
	}

	.emoji {
		font-size: 6rem;
		display: block;
		line-height: 1;
	}

	.gorsel{
		height: 100px;
		width: auto;
	}

	.word-section {
		margin-bottom: 32px;
	}

	.german-word {
		font-size: 2.5rem;
		font-weight: 700;
		color: #2d3748;
		margin: 0;
		line-height: 1.2;
	}

	.translation-section {
		background: #f7fafc;
		padding: 24px;
		border-radius: 12px;
		margin-bottom: 32px;
		text-align: left;
		border-left: 4px solid #667eea;
	}

	.translation h3,
	.examples h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #4a5568;
		margin: 0 0 12px 0;
	}

	.turkish-meaning {
		font-size: 1.2rem;
		color: #2d3748;
		font-weight: 500;
		margin: 0 0 20px 0;
		line-height: 1.4;
	}

	.examples {
		margin-top: 20px;
	}

	.examples-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.example-item {
		background: white;
		padding: 12px 16px;
		margin-bottom: 8px;
		border-radius: 8px;
		font-size: 0.95rem;
		color: #4a5568;
		border-left: 3px solid #667eea;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.example-item:last-child {
		margin-bottom: 0;
	}

	.button-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	.unknown-button,
	.known-button {
		padding: 16px 24px;
		border: none;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 56px;
	}

	.unknown-button {
		background-color: #fed7d7;
		color: #c53030;
		border: 2px solid #feb2b2;
	}

	.unknown-button:hover:not(:disabled) {
		background-color: #feb2b2;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(197, 48, 48, 0.3);
	}

	.known-button {
		background-color: #c6f6d5;
		color: #2f855a;
		border: 2px solid #9ae6b4;
	}

	.known-button:hover {
		background-color: #9ae6b4;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(47, 133, 90, 0.3);
	}

	.unknown-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.button-icon {
		font-size: 1.2rem;
	}

	.progress-indicator {
		background: #e6fffa;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid #81e6d9;
	}

	.progress-indicator p {
		margin: 0;
		color: #2c7a7b;
		font-size: 0.95rem;
		font-weight: 500;
	}

	/* Responsive design */
	@media (max-width: 600px) {
		.word-card {
			padding: 24px 20px;
			margin: 0 16px;
		}

		.emoji {
			font-size: 4rem;
		}

		.german-word {
			font-size: 2rem;
		}

		.button-section {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.unknown-button,
		.known-button {
			padding: 14px 20px;
			font-size: 1rem;
		}

		.translation-section {
			padding: 20px;
		}
	}

	@media (max-width: 400px) {
		.word-card {
			padding: 20px 16px;
		}

		.emoji {
			font-size: 3.5rem;
		}

		.german-word {
			font-size: 1.8rem;
		}
	}
</style>
