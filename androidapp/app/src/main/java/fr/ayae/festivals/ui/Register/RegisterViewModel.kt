package fr.ayae.festivals.ui.Register


import android.content.Context
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.lifecycle.ViewModel
import fr.ayae.festivals.data.Login.RegisterRequest
import fr.ayae.festivals.data.Login.User
import fr.ayae.festivals.data.Register.RegisterRepository
import retrofit2.HttpException


sealed class AuthUiState {
    object Loading : AuthUiState()
    object Empty :  AuthUiState()

    data class Success(val user: User) :  AuthUiState()
    data class Error(val message: String) : AuthUiState()
}




class RegisterViewModel: ViewModel(){
    private val repository = RegisterRepository()

    private var internalState : MutableState<AuthUiState> = mutableStateOf(AuthUiState.Loading)
    val state : State<AuthUiState> = internalState




    fun performRegister(context: Context, firstNameValue: String, lastNameValue : String, passwordValue: String, emailValue: String) {
        viewModelScope.launch {
            internalState.value = AuthUiState.Loading
            try {

                val request = RegisterRequest(firstName = firstNameValue,
                lastName = lastNameValue,
                email = emailValue,
                password = passwordValue
                )
                val response = repository.register( request, context )
                Log.d("AUTH_DEBUG", "Contenu complet de l'user reçu apres register : ${response.user}")



                internalState.value = AuthUiState.Success(response.user)

            } catch (e: HttpException) {
                val errorMessage = when (e.code()) {
                    401 -> "Email ou mot de passe incorrect."
                    403 -> "Votre compte est suspendu."
                    404 -> "Serveur introuvable."
                    409 -> "Cet Email est déja utilisé !"
                    500 -> "Erreur serveur, réessayez plus tard."
                    else -> "Une erreur inconnue est survenue (${e.code()})"
                }
                internalState.value = AuthUiState.Error(errorMessage)

            } catch (e: Exception) {
                // 🚨 LE FILET DE SÉCURITÉ MAGIQUE 🚨
                // Attrape TOUT le reste (problème réseau, JSON mal formé, etc.)
                Log.e("REGISTER_DEBUG", "Crash silencieux évité : ${e.message}", e)
                internalState.value = AuthUiState.Error("Impossible de joindre le serveur : ${e.localizedMessage}")
            }
        }
    }



    fun resetState(){
        internalState.value = AuthUiState.Empty
    }










}