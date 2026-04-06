package fr.ayae.festivals.ui.publisher

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.RetrofitInstance
import fr.ayae.festivals.data.publisher.PublisherDto
import fr.ayae.festivals.data.publisher.PublisherRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
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

    fun addPublisher(name: String) {
        viewModelScope.launch {
            try {
                repository.addPublisher(name)
                fetchPublishers() // Recharger la liste après l'ajout
            } catch (e: Exception) {
                _uiState.value = PublisherUiState.Error("Erreur lors de l'ajout de l'éditeur: ${e.message}")
            }
        }
    }

    fun editPublisher(publisherId: Int, newName: String) {
        viewModelScope.launch {
            try {
                repository.editPublisher(publisherId, newName)
                fetchPublishers() // Recharger la liste après la modification
            } catch (e: Exception) {
                _uiState.value = PublisherUiState.Error("Erreur lors de la modification de l'éditeur: ${e.message}")
            }
        }
    }
    fun deletePublisher(publisherId: Int) {
        viewModelScope.launch {
            try {
                repository.deletePublisher(publisherId)
                fetchPublishers() // Recharger la liste après la suppression
            } catch (e: Exception) {
                _uiState.value = PublisherUiState.Error("Erreur lors de la suppression de l'éditeur: ${e.message}")
            }
        }
    }

    fun selectPublisher(publisher: PublisherDto) {
        _uiState.update { currentState ->
            if (currentState is PublisherUiState.Success) {
                currentState.copy(selectedPublisher = publisher)
            } else {
                currentState
            }
        }
    }

    fun clearSelection() {
        _uiState.update { currentState ->
            if (currentState is PublisherUiState.Success) {
                currentState.copy(selectedPublisher = null)
            } else {
                currentState
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