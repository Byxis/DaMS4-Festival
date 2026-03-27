package fr.ayae.festivals.ui.Register


import android.app.Application
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
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import com.franmontiel.persistentcookiejar.PersistentCookieJar
import com.franmontiel.persistentcookiejar.cache.SetCookieCache
import com.franmontiel.persistentcookiejar.persistence.SharedPrefsCookiePersistor
import fr.ayae.festivals.data.Login.LoginRepository
import fr.ayae.festivals.data.Login.LoginRequest
import fr.ayae.festivals.data.Login.RegisterRequest
import fr.ayae.festivals.data.Login.User
import fr.ayae.festivals.data.Login.UserProfile
import fr.ayae.festivals.data.Register.RegisterRepository
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




class RegisterViewModel: ViewModel(){
    private val repository = RegisterRepository()

    private var internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
    val state : State<UiState> = internalState




    fun performRegister(context: Context, firstNameValue: String, lastNameValue : String, passwordValue: String, emailValue: String) {
        viewModelScope.launch {
            internalState.value = UiState.Loading
            try {

                val request = RegisterRequest(firstNameValue ,lastNameValue,  passwordValue, emailValue)
                val response = repository.register( request, context )
                Log.d("AUTH_DEBUG", "Contenu complet de l'user reçu apres register : ${response.user}")



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



    fun resetState(){
        internalState.value = UiState.Empty
    }










}