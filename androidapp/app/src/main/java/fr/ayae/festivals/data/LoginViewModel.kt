package fr.ayae.festivals.data


import android.app.Application
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import com.franmontiel.persistentcookiejar.PersistentCookieJar
import com.franmontiel.persistentcookiejar.cache.SetCookieCache
import com.franmontiel.persistentcookiejar.persistence.SharedPrefsCookiePersistor
import retrofit2.HttpException


sealed class UiState {
    object Loading : UiState()
    object Empty : UiState()

    data class Success(val user: UserResponse) : UiState()
    data class Error(val message: String) : UiState()
}




class LoginViewModel(application: Application) : AndroidViewModel(application){
    private val repository = LoginRepository()
    private var internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
    val state : State<UiState> = internalState

    fun performLogin(emailValue : String, passwordValue : String) {
        viewModelScope.launch {
            internalState.value = UiState.Loading
            try {
               val request = LoginRequest(email = emailValue, password = passwordValue)
                val response = repository.login(request, getApplication())
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




}