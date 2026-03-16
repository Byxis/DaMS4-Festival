package fr.ayae.festivals.data

import android.content.Context
import android.util.Log
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
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
import javax.net.ssl.KeyManagerFactory



interface APIService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/logout")
    suspend fun logout(): MessageResponse

    @GET("users/me")
    suspend fun getCurrentUser() : UserResponse



}

object RetrofitInstance {
    // 1. On s'arrête au port pour éviter les doublons /api/api/
    private const val BASE_URL = "https://162.38.111.44:4000/api/"

    private var apiService: APIService? = null
    private var cookieJar: PersistentCookieJar? = null

    private var retrofit: Retrofit? = null
    val json = Json {

        ignoreUnknownKeys = true
    }

    // Utilise ton objet json déjà configuré
    private val jsonConfig = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true // Utile si le serveur envoie des nulls
    }

    fun getApi(context: Context): APIService {
        if (retrofit == null) {

            val cookieJar = PersistentCookieJar(SetCookieCache(), SharedPrefsCookiePersistor(context))


            val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            })

            val sslContext = SSLContext.getInstance("SSL")
            sslContext.init(null, trustAllCerts, java.security.SecureRandom())


            val client = OkHttpClient.Builder()
                .sslSocketFactory(sslContext.socketFactory, trustAllCerts[0] as X509TrustManager)
                .hostnameVerifier { _, _ -> true }
                .cookieJar(cookieJar)
                .build()


            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType()))
                .build()
        }
        return retrofit!!.create(APIService::class.java)
    }
}

