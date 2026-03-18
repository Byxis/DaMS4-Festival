package fr.ayae.festivals.data


import android.app.Application
import android.content.Context
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import com.franmontiel.persistentcookiejar.PersistentCookieJar
import com.franmontiel.persistentcookiejar.cache.SetCookieCache
import com.franmontiel.persistentcookiejar.persistence.SharedPrefsCookiePersistor
import kotlinx.coroutines.delay
import retrofit2.HttpException


sealed class UiState {
    object Loading : UiState()
    object Empty : UiState()

    data class Success(val user: UserResponse) : UiState()
    data class Error(val message: String) : UiState()
}




class LoginViewModel(application: Application) : AndroidViewModel(application){
    private val repository = LoginRepository()
    private var lastTokenReceived: String? = null
    private var internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
    val state : State<UiState> = internalState

    var userProfile by mutableStateOf<UserProfile?>(null)
    init {
        // Dès que l'app crée ce ViewModel, on essaie de charger le profil
        loadUserProfile()
        android.util.Log.d("AUTH_DEBUG", "ViewModel initialisé : tentative de chargement du profil")
    }

    fun performLogin(emailValue: String, passwordValue: String) {
        viewModelScope.launch {
            internalState.value = UiState.Loading
            try {
                val request = LoginRequest(email = emailValue, password = passwordValue)
                val response = repository.login(request, getApplication())
                delay(200)
                loadUserProfile()
                // On ne lit RIEN ici. Le simple fait d'arriver ici veut dire que
                // l'intercepteur a reçu le cookie.
                internalState.value = UiState.Success(response.user)

            } catch (e: HttpException) {
                internalState.value = UiState.Error("Erreur : ${e.code()}")
            }
        }
    }

    fun performLogout(LogoutSuccess: () -> Unit){
        viewModelScope.launch {
            try {

                val response = RetrofitInstance.getApi(getApplication()).logout()
                Log.d("AUTH", "Serveur dit : ${response.message}")


            } catch (e: Exception) {
                Log.e("AUTH", "Erreur Logout: ${e.message}")
                LogoutSuccess()
            }finally{
                val cookieJar = PersistentCookieJar(
                    SetCookieCache(),
                    SharedPrefsCookiePersistor(getApplication<Application>())
                )

                cookieJar.clear()
                resetState()
                LogoutSuccess()
            }
        }
    }

    fun resetState(){
        internalState.value = UiState.Empty
    }


    fun fetchCurrentUser() {
        val localProfile = getUserProfileFromLocalToken()

        if (localProfile != null) {
            android.util.Log.d("AUTH_SUCCESS", "Profil chargé localement : ${localProfile.email}")
            userProfile = localProfile // Hop, l'affichage se met à jour instantanément !
        } else {
            android.util.Log.e("AUTH_ERROR", "Impossible de charger le profil localement")
        }
    }



    fun loadUserProfile() {
        val profile = getUserProfileFromLocalToken() // Ta fonction de décodage base64
        if (profile != null) {
            userProfile = profile
            Log.d("AUTH", "Profil chargé : ${profile.email}")
        }
    }


    private fun getUserProfileFromLocalToken(): UserProfile? {

        val sharedPrefs = getApplication<Application>().getSharedPreferences("AppCookies", Context.MODE_PRIVATE)


        val jwt = sharedPrefs.getString("access_token", null)

        if (jwt.isNullOrEmpty()) {
            Log.e("AUTH_DEBUG", "Le token est vide dans les prefs !")
            return null
        }

        return try {
            val parts = jwt.split(".")
            val payload = String(android.util.Base64.decode(parts[1], android.util.Base64.URL_SAFE))
            Log.d("AUTH_DEBUG", "PAYLOAD DÉCODÉ : $payload")

            val json = kotlinx.serialization.json.Json { ignoreUnknownKeys = true }
            val profile = json.decodeFromString<UserProfile>(payload)

            Log.d("AUTH_DEBUG", "PROFIL CRÉÉ : ${profile.email}")
            profile
        } catch (e: Exception) {
            Log.e("AUTH_DEBUG", "ERREUR DÉCODAGE : ${e.message}")
            null
        }
    }




}