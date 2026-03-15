package fr.ayae.festivals.data


import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import retrofit2.HttpException


sealed class UiState {
    object Loading: UiState()
    data class Success(val user: UserResponse): UiState()
    data class Error(val message: String): UiState()
}


class LoginViewModel : ViewModel() {
    private val repository = LoginRepository()
    private var internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
    val state : State<UiState> = internalState

    fun performLogin(emailValue : String, passwordValue : String) {
        viewModelScope.launch {
            internalState.value = UiState.Loading
            try {
               val request = LoginRequest(email = emailValue, password = passwordValue)
                val response = repository.login(request)
                internalState.value = UiState.Success(response.user)
            } catch (e: HttpException) {

                //Identifiants incorrects
                if (e.code() == 401) {
                    internalState.value = UiState.Error("Identifiants incorrects")
                }else {
                    internalState.value = UiState.Error("Echec de connexion " + e.message)
                }
            }
        }
    }



}