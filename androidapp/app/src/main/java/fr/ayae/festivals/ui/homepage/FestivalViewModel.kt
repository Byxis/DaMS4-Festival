package fr.ayae.festivals.ui.homepage

import android.content.Context
import android.util.Log
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.CreationExtras
import fr.ayae.festivals.data.festivals.Festival
import fr.ayae.festivals.data.reservation.ReservationRepository
import kotlinx.coroutines.launch
import java.io.IOException

sealed class festivalState {
    object Loading : festivalState()
    object Empty : festivalState()
    data class Success(val festivals: List<Festival>, val isOffline: Boolean = false) : festivalState()
    data class Error(val message: String) : festivalState()
}

class FestivalViewModel(private val repository: ReservationRepository): ViewModel() {

    private var internalState : MutableState<festivalState> = mutableStateOf(festivalState.Loading)
    val state : State<festivalState> = internalState

    fun getAllFestivals(context: Context) {
        // Get the cached festivals from Room (single source of truth)
        viewModelScope.launch {
            repository.getAllFestivalsStream().collect { festivals ->
                val currentOffline = (internalState.value as? festivalState.Success)?.isOffline ?: false
                if (festivals.isNotEmpty()) {
                    internalState.value = festivalState.Success(festivals, isOffline = currentOffline)
                } else if (internalState.value !is festivalState.Error) {
                    internalState.value = festivalState.Loading
                }
            }
        }

        // Then fetch from API and update Room (cache), handling errors to set offline state
        viewModelScope.launch {
            try {
                repository.refreshAllFestivals(context)
                val currentState = internalState.value
                if (currentState is festivalState.Success) {
                    internalState.value = currentState.copy(isOffline = false)
                }
            } catch (_: IOException) {
                val currentState = internalState.value
                if (currentState is festivalState.Success) {
                    internalState.value = currentState.copy(isOffline = true)
                } else {
                    internalState.value = festivalState.Error("Serveur injoignable (hors-ligne).")
                }
            } catch (e: Exception) {
                Log.e("HomePage", "API Error: ${e.message}")
            }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(
                modelClass: Class<T>,
                extras: CreationExtras
            ): T {
                val application = checkNotNull(extras[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]) as fr.ayae.festivals.FestivalsApplication
                return FestivalViewModel(application.reservationRepository) as T
            }
        }
    }
}