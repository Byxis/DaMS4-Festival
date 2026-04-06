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
import kotlinx.coroutines.launch

class PublisherViewModel(private val repository: PublisherRepository) : ViewModel() {

    // StateFlow pour exposer la liste des éditeurs à l'UI
    private val _publishers = MutableStateFlow<List<PublisherDto>>(emptyList())
    val publishers: StateFlow<List<PublisherDto>> = _publishers.asStateFlow()

    // StateFlow pour l'état de chargement
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // StateFlow pour les erreurs
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        // On charge les éditeurs dès l'initialisation du ViewModel
        fetchPublishers()
    }

    fun fetchPublishers() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                // Appel au repository pour récupérer les données
                _publishers.value = repository.getPublishers()
            } catch (e: Exception) {
                // Gestion de l'erreur
                _error.value = "Erreur de chargement des éditeurs: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}

// Factory pour créer une instance de PublisherViewModel avec ses dépendances
class PublisherViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(PublisherViewModel::class.java)) {
            // Création des dépendances nécessaires
            val apiService = RetrofitInstance.getApi(application)
            val repository = PublisherRepository(apiService)
            return PublisherViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
