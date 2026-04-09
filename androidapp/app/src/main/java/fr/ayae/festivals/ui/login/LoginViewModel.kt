package fr.ayae.festivals.ui.login


import android.content.Context
import android.util.Base64
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import fr.ayae.festivals.data.login.LoginRepository
import fr.ayae.festivals.data.login.LoginRequest
import fr.ayae.festivals.data.login.User
import fr.ayae.festivals.data.login.UserRole

import fr.ayae.festivals.data.RetrofitInstance
import kotlinx.coroutines.delay
import kotlinx.serialization.json.Json
import retrofit2.HttpException


sealed class UiState {
    object Loading : UiState()
    object Empty : UiState()

    data class Success(val user: User) : UiState()
    data class Error(val message: String) : UiState()
}



// utiliser view model au lieu de AndroidViewModel
class LoginViewModel: ViewModel(){
    private val repository = LoginRepository()
    private var lastTokenReceived: String? = null
    private var internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
    val state : State<UiState> = internalState

    var userProfile by mutableStateOf<User?>(null)

    /** Derived role — updated every time [userProfile] changes. */
    val userRole: UserRole
        get() = UserRole.fromString(userProfile?.role)


    fun performLogin(context: Context, passwordValue: String, emailValue: String) {
        viewModelScope.launch {
            internalState.value = UiState.Loading
            try {
                Log.d("AUTH_DEBUG", "Tentative d'envoi -> Email: [$emailValue] | Mdp: [$passwordValue]")
                val request = LoginRequest(email = emailValue, password = passwordValue)
                val response = repository.login( request, context )
                Log.d("AUTH_DEBUG", "Contenu complet de l'user reçu : ${response.user}")
                val userEmail = response.user.email
                val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
                sharedPrefs.edit().putString("current_user_email", userEmail).apply()
                Log.d("AUTH_DEBUG", "email utilisateur connecté enregistré : $userEmail")

                // Set profile directly from response — no delay/JWT-decode needed
                userProfile = response.user
                Log.d("AUTH_DEBUG", "Profil défini depuis réponse API : role=${response.user.role}")

                // Also persist via JWT for auto-login on next app start
                delay(200)
                loadUserProfile(context)

                internalState.value = UiState.Success(response.user)

            } catch (e: HttpException) {
                val errorMessage = when (e.code()) {
                    401 -> "Email ou mot de passe incorrect."
                    403 -> "Votre compte est suspendu."
                    404 -> "Serveur introuvable."
                    500 -> "Erreur serveur, réessayez plus tard."
                    else -> "Une erreur inconnue est survenue (${e.code()})"
                }
                internalState.value = UiState.Error(errorMessage)
            }
        }
    }

    fun performLogout(context: Context, LogoutSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                val response = RetrofitInstance.getApi(context).logout()
                Log.d("AUTH", "Serveur dit : ${response.message}")
            } catch (e: Exception) {
                Log.e("AUTH", "Erreur Logout: ${e.message}")
            } finally {
                val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
                sharedPrefs.edit().clear().apply()

                val cookieJar = com.franmontiel.persistentcookiejar.PersistentCookieJar(
                    com.franmontiel.persistentcookiejar.cache.SetCookieCache(),
                    com.franmontiel.persistentcookiejar.persistence.SharedPrefsCookiePersistor(context)
                )
                cookieJar.clear()

                // Clear local Room cache
                try {
                    val db = fr.ayae.festivals.data.db.AppDatabase.getDatabase(context)
                    db.reservationDao().clearAll()
                    db.festivalDao().clearAll()
                } catch (dbEx: Exception) {
                    Log.e("AUTH", "Erreur clear DB: ${dbEx.message}")
                }

                resetState()
                LogoutSuccess()
            }
        }
    }

    fun resetState(){
        internalState.value = UiState.Empty
    }





    fun loadUserProfile(context: Context) {
        val jwt = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE).getString("access_token", null)
        if (jwt.isNullOrEmpty()) return

        val profile = getUserProfileFromLocalToken(context)
        if (profile != null) {
            userProfile = profile
            Log.d("AUTH", "Profil chargé : ${profile.email}")
        } else {
            // Token was present but failed to decode -> likely corrupted or old format
            // Wipe it to avoid infinite loading loops on Home screen
            Log.e("AUTH", "Échec du chargement du profil ! Nettoyage des tokens corrompus.")
            val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
            sharedPrefs.edit().clear().apply()
            userProfile = null
        }
    }


    private fun getUserProfileFromLocalToken(context: Context): User? {

        val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)


        var jwt = sharedPrefs.getString("access_token", null)

        if (jwt.isNullOrEmpty()) {
            Log.e("AUTH_DEBUG", "Le token est vide dans les prefs !")
            return null
        }

        // Robustness: strip "access_token=" prefix if it exists (legacy bug fix)
        if (jwt.startsWith("access_token=")) {
            jwt = jwt.substringAfter("access_token=")
        }

        return try {
            val parts = jwt.split(".")
            if (parts.size < 2) {
                Log.e("AUTH_DEBUG", "Format JWT invalide (pas assez de parties)")
                return null
            }
            val payload = String(Base64.decode(parts[1], Base64.URL_SAFE))
            Log.d("AUTH_DEBUG", "PAYLOAD DÉCODÉ : $payload")

            val json = Json { ignoreUnknownKeys = true }
            val profile = json.decodeFromString<User>(payload)

            Log.d("AUTH_DEBUG", "PROFIL CRÉÉ : email=${profile.email}, role=${profile.role}")
            profile
        } catch (e: Exception) {
            Log.e("AUTH_DEBUG", "ERREUR DÉCODAGE JWT : ${e.message}")
            e.printStackTrace()
            null
        }
    }




}