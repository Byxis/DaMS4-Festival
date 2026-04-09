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
import fr.ayae.festivals.data.festivals.Festival
import fr.ayae.festivals.data.festivals.UpdateFestivalRequest
import fr.ayae.festivals.data.login.CreationResponse
import fr.ayae.festivals.data.login.LoginRequest
import fr.ayae.festivals.data.login.LoginResponse
import fr.ayae.festivals.data.login.MessageResponse
import fr.ayae.festivals.data.login.RegisterRequest
import fr.ayae.festivals.data.login.User
import fr.ayae.festivals.data.reservation.AddGameZoneRequest
import fr.ayae.festivals.data.reservation.AddReservationRequest
import fr.ayae.festivals.data.reservation.AddZoneTarifRequest
import fr.ayae.festivals.data.reservation.Reservation
import fr.ayae.festivals.data.reservation.ReservationGame
import fr.ayae.festivals.data.reservation.UpdateReservationGameRequest
import fr.ayae.festivals.data.reservation.UpdateReservationRequest
import fr.ayae.festivals.data.reservation.ZoneGame
import fr.ayae.festivals.data.reservation.ZoneTarif
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.data.contact.ContactRequest
import fr.ayae.festivals.data.game.GameCreationRequest
import fr.ayae.festivals.data.game.GameDto
import fr.ayae.festivals.data.publisher.PublisherCreationRequest
import fr.ayae.festivals.data.publisher.PublisherDto

import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path


import javax.net.ssl.TrustManagerFactory


import java.security.KeyStore
import java.security.cert.CertificateFactory


interface APIService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("auth/logout")
    suspend fun logout(): MessageResponse
    @POST("auth/register")
    suspend fun register(@Body request : RegisterRequest) : LoginResponse


    @GET("users")
    suspend fun getAllUsers(): List<User>

    @DELETE("users/{id}")
    suspend fun delete(@Path("id")userID : Int)

    @POST("users/invite")
    suspend fun create(@Body newUser: User): Response<CreationResponse>

    @PUT("users/{id}")
    suspend fun update(
        @Path("id") id: Int,
        @Body userToUpdate: User
    ): Response<LoginResponse>

    @GET("festivals/{festivalId}/reservations")
    suspend fun getReservations(@Path("festivalId") festivalId: Int): List<Reservation>


    // --- Publishers ---
    @GET("publishers")
    suspend fun getAllPublishers(): List<PublisherDto>

    @GET("publishers/{id}")
    suspend fun getPublisherById(@Path("id") publisherId: Int): PublisherDto

    @POST("publishers")
    suspend fun addPublisher(@Body publisherRequest: PublisherCreationRequest)

    @PUT("publishers/{id}")
    suspend fun editPublisher(@Path("id") publisherId: Int, @Body publisherRequest: PublisherCreationRequest)

    @DELETE("publishers/{id}")
    suspend fun deletePublisher(@Path("id") publisherId: Int)

    // --- Contacts ---
    @GET("publishers/{id}/contacts")
    suspend fun getContactsForPublisher(@Path("id") publisherId: Int): List<ContactDto>

    @POST("publishers/{id}/contacts")
    suspend fun addContactToPublisher(@Path("id") publisherId: Int,
        @Body contactRequest: ContactRequest
    ): ContactDto

    @PUT("publishers/{id}/contacts/{contactId}")
    suspend fun updateContact(
        @Path("id") publisherId: Int,
        @Path("contactId") contactId: Int,
        @Body contactRequest: ContactRequest
    ): ContactDto

    @DELETE("publishers/{id}/contacts/{contactId}")
    suspend fun deleteContact(
        @Path("id") publisherId: Int,
        @Path("contactId") contactId: Int
    ): Response<Unit>

    // --- Games ---
    @GET("games/filterByPublisherID/{publisherId}")
    suspend fun getGamesForPublisher(@Path("publisherId") publisherId: Int): List<GameDto>

    @POST("publishers/addGameToPublisher")
    suspend fun addGameToPublisher(@Body gameRequest: GameCreationRequest): GameDto

    @POST("festivals/{festivalId}/reservations")
    suspend fun addReservation(
        @Path("festivalId") festivalId: Int,
        @Body request: AddReservationRequest
    ): Reservation

    @PUT("festivals/{festivalId}/reservations/{reservationId}")
    suspend fun updateReservation(
        @Path("festivalId") festivalId: Int,
        @Path("reservationId") reservationId: Int,
        @Body request: UpdateReservationRequest
    ): Reservation

    @GET("festivals/{festivalId}")
    suspend fun getFestival(@Path("festivalId") festivalId: Int): Festival

    @PUT("festivals/{festivalId}")
    suspend fun updateFestival(
        @Path("festivalId") festivalId: Int,
        @Body request: UpdateFestivalRequest
    ): Festival

    @POST("festivals/{festivalId}/tarif-zones")
    suspend fun addZoneTarif(
        @Path("festivalId") festivalId: Int,
        @Body request: AddZoneTarifRequest
    ): ZoneTarif

    @PUT("festivals/{festivalId}/tarif-zones/{tarifZoneId}")
    suspend fun updateZoneTarif(
        @Path("festivalId") festivalId: Int,
        @Path("tarifZoneId") tarifZoneId: Int,
        @Body request: AddZoneTarifRequest
    ): ZoneTarif

    @DELETE("festivals/{festivalId}/tarif-zones/{tarifZoneId}")
    suspend fun deleteZoneTarif(
        @Path("festivalId") festivalId: Int,
        @Path("tarifZoneId") tarifZoneId: Int
    ): Response<Unit>

    @POST("festivals/{festivalId}/tarif-zones/{tarifZoneId}/game-zones")
    suspend fun addGameZone(
        @Path("festivalId") festivalId: Int,
        @Path("tarifZoneId") tarifZoneId: Int,
        @Body request: AddGameZoneRequest
    ): ZoneGame

    @PUT("festivals/{festivalId}/tarif-zones/{tarifZoneId}/game-zones/{gameZoneId}")
    suspend fun updateGameZone(
        @Path("festivalId") festivalId: Int,
        @Path("tarifZoneId") tarifZoneId: Int,
        @Path("gameZoneId") gameZoneId: Int,
        @Body request: AddGameZoneRequest
    ): ZoneGame

    @DELETE("festivals/{festivalId}/tarif-zones/{tarifZoneId}/game-zones/{gameZoneId}")
    suspend fun deleteGameZone(
        @Path("festivalId") festivalId: Int,
        @Path("tarifZoneId") tarifZoneId: Int,
        @Path("gameZoneId") gameZoneId: Int
    ): Response<Unit>

    @PUT("festivals/{festivalId}/reservations/{reservationId}/games/{reservationGameId}")
    suspend fun updateReservationGame(
        @Path("festivalId") festivalId: Int,
        @Path("reservationId") reservationId: Int,
        @Path("reservationGameId") reservationGameId: Int,
        @Body request: UpdateReservationGameRequest
    ): ReservationGame

    @GET("festivals/")
    suspend fun getAllFestivals():List<Festival>
}

object RetrofitInstance {
    const val BASE_URL = "https://162.38.111.44:4000/api/"
    const val IMAGE_BASE_URL = "https://162.38.111.44:4000/"

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
            OkHttpClient.Builder().build() 
        }

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(APIService::class.java)
    }

    fun getSecureClient(context: Context): OkHttpClient {
        return generateSecureOkHttpClient(context)
    }

    private fun generateSecureOkHttpClient(context: Context): OkHttpClient {
        // Charger le certificat root_ca.pem et non celui du serveur
        val cf = CertificateFactory.getInstance("X.509")
        val caInput = context.resources.openRawResource(R.raw.root_ca)
        val ca = caInput.use { cf.generateCertificate(it) }


        val keyStore = KeyStore.getInstance(KeyStore.getDefaultType()).apply {
            load(null, null)
            setCertificateEntry("ca", ca)
        }


        val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
            init(keyStore)
        }
        val trustManager = tmf.trustManagers[0] as X509TrustManager


        val sslContext = SSLContext.getInstance("TLS").apply {
            init(null, arrayOf(trustManager), java.security.SecureRandom())
        }

        return OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustManager)
            .hostnameVerifier { _, _ -> true }

            .addInterceptor(SaveCookiesInterceptor(context))
            .addInterceptor { chain ->
                val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)

                val savedToken = sharedPrefs.getString("access_token", "") ?: ""

                //ajoute le header pour chaques requetes sortantes
                val request = chain.request().newBuilder()
                    .header("Cookie", "access_token=$savedToken")
                    .build()

                Log.d("AUTH_DEBUG", "🚀 Envoi token : access_token=$savedToken")
                chain.proceed(request)
            }
            .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .build()
    }


}

