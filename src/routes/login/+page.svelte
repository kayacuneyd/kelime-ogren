<script>
	import { goto } from '$app/navigation';
	import wordpressClient from '$lib/wordpressClient.js';

	let username = '';
	let password = '';
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	// Form submit handler
	async function handleSubmit(event) {
		event.preventDefault();
		
		// Reset messages
		errorMessage = '';
		successMessage = '';
		
		// Validation
		if (!username.trim()) {
			errorMessage = 'Kullanıcı adı gerekli';
			return;
		}
		
		if (!password.trim()) {
			errorMessage = 'Şifre gerekli';
			return;
		}

		isLoading = true;

		try {
			const result = await wordpressClient.login(username.trim(), password);
			
			if (result.success) {
				successMessage = 'Giriş başarılı! Yönlendiriliyorsunuz...';
				
				// Redirect to home page after short delay
				setTimeout(() => {
					goto('/');
				}, 1000);
			} else {
				errorMessage = result.message || 'Giriş yapılamadı';
			}
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
		} finally {
			isLoading = false;
		}
	}

	// Clear error when user starts typing
	function clearError() {
		if (errorMessage) {
			errorMessage = '';
		}
	}
</script>

<svelte:head>
	<title>Giriş Yap - Kelime Öğren</title>
</svelte:head>

<div class="login-container">
	<div class="login-form">
		<div class="login-header">
			<h1>Kelime Öğren</h1>
			<p>Hesabınıza giriş yapın</p>
		</div>

		<form on:submit={handleSubmit}>
			<div class="form-group">
				<label for="username">Kullanıcı Adı</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					on:input={clearError}
					placeholder="Kullanıcı adınızı girin"
					disabled={isLoading}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Şifre</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					on:input={clearError}
					placeholder="Şifrenizi girin"
					disabled={isLoading}
					required
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="success-message">
					{successMessage}
				</div>
			{/if}

			<button type="submit" disabled={isLoading} class="submit-button">
				{#if isLoading}
					<span class="loading-spinner"></span>
					Giriş yapılıyor...
				{:else}
					Giriş Yap
				{/if}
			</button>
		</form>

		<div class="login-footer">
			<p>Hesabınız yok mu? <a href="/register">Kayıt olun</a></p>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.login-form {
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		width: 100%;
		max-width: 400px;
	}

	.login-header {
		text-align: center;
		margin-bottom: 30px;
	}

	.login-header h1 {
		color: #333;
		font-size: 28px;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.login-header p {
		color: #666;
		font-size: 14px;
		margin: 0;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		color: #333;
		font-weight: 500;
		font-size: 14px;
	}

	.form-group input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #e1e5e9;
		border-radius: 8px;
		font-size: 16px;
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.form-group input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	.error-message {
		background-color: #fee;
		color: #c53030;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		margin-bottom: 20px;
		border: 1px solid #feb2b2;
	}

	.success-message {
		background-color: #f0fff4;
		color: #2f855a;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		margin-bottom: 20px;
		border: 1px solid #9ae6b4;
	}

	.submit-button {
		width: 100%;
		background-color: #667eea;
		color: white;
		border: none;
		padding: 14px 20px;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s ease, transform 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.submit-button:hover:not(:disabled) {
		background-color: #5a67d8;
		transform: translateY(-1px);
	}

	.submit-button:disabled {
		background-color: #a0aec0;
		cursor: not-allowed;
		transform: none;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.login-footer {
		text-align: center;
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #e1e5e9;
	}

	.login-footer p {
		color: #666;
		font-size: 14px;
		margin: 0;
	}

	.login-footer a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	.login-footer a:hover {
		text-decoration: underline;
	}

	/* Responsive design */
	@media (max-width: 480px) {
		.login-container {
			padding: 10px;
		}

		.login-form {
			padding: 30px 20px;
		}

		.login-header h1 {
			font-size: 24px;
		}
	}
</style>
