package fr.ayae.festivals.ui.publisher

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.RetrofitInstance
import fr.ayae.festivals.data.publisher.PublisherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class PublisherViewModel(private val repository: PublisherRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<PublisherUiState>(PublisherUiState.Loading)
    val uiState: StateFlow<PublisherUiState> = _uiState.asStateFlow()

    init {
        fetchPublishers()
    }

    fun fetchPublishers() {
        viewModelScope.launch {
            _uiState.value = PublisherUiState.Loading
            try {
                val publishers = repository.getPublishers()
                _uiState.value = PublisherUiState.Success(publishers)
            } catch (e: Exception) {
                _uiState.value = PublisherUiState.Error("Erreur de chargement des éditeurs: ${e.message}")
            }
        }
    }
}

class PublisherViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PublisherViewModel::class.java)) {
            val apiService = RetrofitInstance.getApi(application)
            val repository = PublisherRepository(apiService)
            return PublisherViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}