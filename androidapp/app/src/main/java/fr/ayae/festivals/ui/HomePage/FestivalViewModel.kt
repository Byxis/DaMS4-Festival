package fr.ayae.festivals.ui.HomePage

import android.content.Context
import android.util.Log
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.Festivals.FestivalRepository
import fr.ayae.festivals.data.Login.Festival

import fr.ayae.festivals.data.Login.User
import fr.ayae.festivals.ui.Login.UiState
import kotlinx.coroutines.launch
import retrofit2.HttpException


sealed class festivalState {
    object Loading : festivalState()
    object Empty : festivalState()

    data class Success(val festivals: List<Festival>) : festivalState()
    data class Error(val message: String) : festivalState()
}

class FestivalViewModel: ViewModel() {


    private val repository = FestivalRepository()

    var festivalsList by mutableStateOf<List<Festival>>(emptyList())
        private set
    private var internalState : MutableState<festivalState> = mutableStateOf(festivalState.Loading)
    val state : State<festivalState> = internalState

    fun getAllFestivals(context: Context,) {
        viewModelScope.launch {
            internalState.value = festivalState.Loading
            try {

                val response = repository.getAllFestivals(context)
                internalState.value = festivalState.Success(response)


                Log.d("FESTIVAL_DEBUG", "Nombre de festivals reçus : ${festivalsList.size}")
            } catch (e: HttpException) {
                internalState.value = festivalState.Error(e.message ?: "Erreur")
                Log.e("FESTIVAL_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)
            }
        }
    }
}