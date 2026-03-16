package fr.ayae.festivals.data

import android.content.Context
import android.util.Log
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import javax.net.ssl.SSLContext
import javax.net.ssl.X509TrustManager
import com.franmontiel.persistentcookiejar.PersistentCookieJar
import com.franmontiel.persistentcookiejar.cache.SetCookieCache
import com.franmontiel.persistentcookiejar.persistence.SharedPrefsCookiePersistor
import fr.ayae.festivals.R
import retrofit2.http.GET


import javax.net.ssl.TrustManagerFactory


import java.security.KeyStore
import java.security.cert.CertificateFactory

import java.util.concurrent.TimeUnit


interface APIService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/logout")
    suspend fun logout(): MessageResponse

    @GET("users/me")
    suspend fun getCurrentUser() : UserResponse



}

object RetrofitInstance {
    private const val BASE_URL = "https://162.38.111.44:4000/api/"

    @Volatile
    private var apiService: APIService? = null
    private var cookieJar: PersistentCookieJar? = null

    fun getApi(context: Context): APIService {
        return apiService ?: synchronized(this) {
            apiService ?: buildRetrofit(context).also { apiService = it }
        }
    }

    private fun buildRetrofit(context: Context): APIService {
        // Initialisation des cookies
        if (cookieJar == null) {
            cookieJar = PersistentCookieJar(
                SetCookieCache(),
                SharedPrefsCookiePersistor(context.applicationContext)
            )
        }

        val client = try {
            generateSecureOkHttpClient(context)
        } catch (e: Exception) {
            Log.e("RETROFIT_ERROR", "Erreur SSL : ${e.message}")
            OkHttpClient.Builder().build() // Client par défaut pour éviter le crash
        }

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(APIService::class.java)
    }

    private fun generateSecureOkHttpClient(context: Context): OkHttpClient {
        // 1. Charger le certificat RACINE (root_ca.pem) et non celui du serveur
        val cf = CertificateFactory.getInstance("X.509")
        val caInput = context.resources.openRawResource(R.raw.root_ca) // LE FICHIER root_ca.pem
        val ca = caInput.use { cf.generateCertificate(it) }

        // 2. Créer le KeyStore
        val keyStore = KeyStore.getInstance(KeyStore.getDefaultType()).apply {
            load(null, null)
            setCertificateEntry("ca", ca)
        }

        // 3. Créer le TrustManager
        val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
            init(keyStore)
        }
        val trustManager = tmf.trustManagers[0] as X509TrustManager

        // 4. Configurer SSLContext
        val sslContext = SSLContext.getInstance("TLS").apply {
            init(null, arrayOf(trustManager), java.security.SecureRandom())
        }

        return OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustManager)
            .hostnameVerifier { _, _ -> true }
            .cookieJar(cookieJar!!)

            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .build()
                chain.proceed(request)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    fun clearCookies() {
        cookieJar?.clear()
    }
}

