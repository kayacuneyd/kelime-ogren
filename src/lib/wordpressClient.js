/**
 * WordPress REST API Client
 * JWT Authentication ile WordPress API'ye bağlanır
 */
class WordPressClient {
	constructor() {
		this.baseURL = 'https://kelime.kayacuneyt.com/wp-json';
		this.tokenKey = 'wordpress_jwt_token';
		this.token = this.getStoredToken();
	}

	/**
	 * localStorage'dan JWT token'ı al
	 * @returns {string|null} JWT token veya null
	 */
	getStoredToken() {
		if (typeof window !== 'undefined') {
			return localStorage.getItem(this.tokenKey);
		}
		return null;
	}

	/**
	 * JWT token'ı localStorage'a kaydet
	 * @param {string} token - JWT token
	 */
	setStoredToken(token) {
		if (typeof window !== 'undefined') {
			localStorage.setItem(this.tokenKey, token);
		}
		this.token = token;
	}

	/**
	 * localStorage'dan token'ı sil
	 */
	clearToken() {
		if (typeof window !== 'undefined') {
			localStorage.removeItem(this.tokenKey);
		}
		this.token = null;
	}

	/**
	 * HTTP isteği gönder
	 * @param {string} endpoint - API endpoint
	 * @param {Object} options - Fetch options
	 * @returns {Promise<Object>} API response
	 */
	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`;
		
		const defaultOptions = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			}
		};

		// JWT token varsa Authorization header'ına ekle
		if (this.token) {
			defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
		}

		const finalOptions = {
			...defaultOptions,
			...options,
			headers: {
				...defaultOptions.headers,
				...options.headers
			}
		};

		try {
			const response = await fetch(url, finalOptions);
			
			// Token süresi dolmuşsa temizle
			if (response.status === 401) {
				this.clearToken();
				throw new Error('Token süresi dolmuş. Lütfen tekrar giriş yapın.');
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `HTTP Error: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('API Request Error:', error);
			throw error;
		}
	}

	/**
	 * Kullanıcı girişi yap ve JWT token al
	 * @param {string} username - Kullanıcı adı
	 * @param {string} password - Şifre
	 * @returns {Promise<Object>} Login response
	 */
	async login(username, password) {
		try {
			const response = await this.request('/jwt-auth/v1/token', {
				method: 'POST',
				body: JSON.stringify({
					username,
					password
				})
			});

			if (response.token) {
				this.setStoredToken(response.token);
				return {
					success: true,
					token: response.token,
					user: response.user,
					message: 'Giriş başarılı'
				};
			} else {
				throw new Error(response.message || 'Token alınamadı');
			}
		} catch (error) {
			console.error('Login Error:', error);
			return {
				success: false,
				message: error.message || 'Giriş yapılamadı'
			};
		}
	}

	/**
	 * Çıkış yap
	 */
	logout() {
		this.clearToken();
	}

	/**
	 * Kullanıcı giriş yapmış mı kontrol et
	 * @returns {boolean} Giriş durumu
	 */
	isLoggedIn() {
		return !!this.token;
	}

	/**
	 * 10 kelime getir
	 * @returns {Promise<Object>} Kelime listesi
	 */
	async getDeck() {
		try {
			if (!this.isLoggedIn()) {
				throw new Error('Giriş yapmanız gerekiyor');
			}

			const response = await this.request('/kelime/v1/deck');
			
			return {
				success: true,
				words: response.words || response,
				message: 'Kelimeler başarıyla getirildi'
			};
		} catch (error) {
			console.error('Get Deck Error:', error);
			return {
				success: false,
				message: error.message || 'Kelimeler getirilemedi'
			};
		}
	}

	/**
	 * Kelime ilerlemesini güncelle
	 * @param {number} wordId - Kelime ID'si
	 * @param {boolean} known - Kelime biliniyor mu
	 * @returns {Promise<Object>} Güncelleme sonucu
	 */
	async updateProgress(wordId, known) {
		try {
			if (!this.isLoggedIn()) {
				throw new Error('Giriş yapmanız gerekiyor');
			}

			if (!wordId) {
				throw new Error('Kelime ID gerekli');
			}

			const response = await this.request('/kelime/v1/progress', {
				method: 'POST',
				body: JSON.stringify({
					word_id: wordId,
					known: known
				})
			});

			return {
				success: true,
				data: response,
				message: 'İlerleme başarıyla kaydedildi'
			};
		} catch (error) {
			console.error('Update Progress Error:', error);
			return {
				success: false,
				message: error.message || 'İlerleme kaydedilemedi'
			};
		}
	}

	/**
	 * Kullanıcı profilini getir
	 * @returns {Promise<Object>} Kullanıcı profili
	 */
	async getUserProfile() {
		try {
			if (!this.isLoggedIn()) {
				throw new Error('Giriş yapmanız gerekiyor');
			}

			const response = await this.request('/wp/v2/users/me');
			
			return {
				success: true,
				user: response,
				message: 'Profil başarıyla getirildi'
			};
		} catch (error) {
			console.error('Get User Profile Error:', error);
			return {
				success: false,
				message: error.message || 'Profil getirilemedi'
			};
		}
	}

	/**
	 * Token'ı yenile
	 * @returns {Promise<Object>} Token yenileme sonucu
	 */
	async refreshToken() {
		try {
			if (!this.token) {
				throw new Error('Token bulunamadı');
			}

			const response = await this.request('/jwt-auth/v1/token/validate', {
				method: 'POST'
			});

			if (response.code === 'jwt_auth_valid_token') {
				return {
					success: true,
					message: 'Token geçerli'
				};
			} else {
				this.clearToken();
				throw new Error('Token geçersiz');
			}
		} catch (error) {
			console.error('Refresh Token Error:', error);
			this.clearToken();
			return {
				success: false,
				message: error.message || 'Token yenilenemedi'
			};
		}
	}
}

// Singleton instance oluştur
const wordpressClient = new WordPressClient();

export default wordpressClient;
