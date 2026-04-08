package fr.ayae.festivals.ui.publisher

import android.app.Application
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.RetrofitInstance
import fr.ayae.festivals.data.contact.ContactRequest
import fr.ayae.festivals.data.game.GameCreationRequest
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
                updateErrorState("Erreur de chargement des éditeurs: ${e.message}")
            }
        }
    }

    fun fetchPublisherDetails(publisherId: Int) {
        viewModelScope.launch {
            // Indiquer qu'un chargement de détails est en cours
            _uiState.update { currentState ->
                if (currentState is PublisherUiState.Success) {
                    currentState.copy(fetchingDetailsForId = publisherId)
                } else {
                    currentState
                }
            }

            try {
                val detailedPublisher = repository.getPublisherDetails(publisherId)
                _uiState.update { currentState ->
                    if (currentState is PublisherUiState.Success) {
                        val updatedList = currentState.publishers.map {
                            if (it.id == publisherId) detailedPublisher else it
                        }
                        // L'éditeur sélectionné est maintenant celui avec les détails
                        currentState.copy(
                            publishers = updatedList,
                            selectedPublisher = detailedPublisher,
                            fetchingDetailsForId = null // Fin du chargement
                        )
                    } else {
                        currentState
                    }
                }
            } catch (e: Exception) {
                updateErrorState("Erreur de chargement des détails: ${e.message}")
                // S'assurer de réinitialiser l'état de chargement en cas d'erreur
                _uiState.update { currentState ->
                    if (currentState is PublisherUiState.Success) {
                        currentState.copy(fetchingDetailsForId = null)
                    } else {
                        currentState
                    }
                }
            }
        }
    }

    fun addPublisher(name: String) {
        viewModelScope.launch {
            try {
                repository.addPublisher(name)
                fetchPublishers()
            } catch (e: Exception) {
                updateErrorState("Erreur lors de l'ajout: ${e.message}")
            }
        }
    }

    fun editPublisher(publisherId: Int, newName: String) {
        viewModelScope.launch {
            try {
                repository.editPublisher(publisherId, newName)
                fetchPublishers()
            } catch (e: Exception) {
                updateErrorState("Erreur lors de la modification: ${e.message}")
            }
        }
    }

    fun deletePublisher(publisherId: Int) {
        viewModelScope.launch {
            try {
                repository.deletePublisher(publisherId)
                fetchPublishers()
            } catch (e: Exception) {
                updateErrorState("Erreur lors de la suppression: ${e.message}")
            }
        }
    }

    fun selectPublisher(publisher: PublisherDto) {
        // On charge les détails uniquement si nécessaire
        if (publisher.games.isEmpty() && publisher.contacts.isEmpty()) {
            fetchPublisherDetails(publisher.id)
        } else {
            // Sinon, on sélectionne juste l'éditeur qui est déjà complet
            _uiState.update { currentState ->
                if (currentState is PublisherUiState.Success) {
                    currentState.copy(selectedPublisher = publisher)
                } else {
                    currentState
                }
            }
        }
    }
    fun addGameToPublisher(request: GameCreationRequest) {
        viewModelScope.launch {
            Log.d("ADD_GAME_VM", "🚀 Tentative d'ajout d'un jeu. Requête: $request")
            try {
                val newGame = repository.addGameToPublisher(request)
                Log.d("ADD_GAME_VM", "✅ Jeu ajouté avec succès via le repo. Réponse: $newGame")
                Log.d("ADD_GAME_VM", "🔄 Rafraîchissement des détails pour l'éditeur ID: ${request.publisherId}")
                // Après l'ajout, on rafraîchit les détails de l'éditeur pour voir le nouveau jeu
                fetchPublisherDetails(request.publisherId)
            } catch (e: Exception) {
                Log.e("ADD_GAME_VM", "❌ Erreur dans le ViewModel lors de l'ajout du jeu.", e)
                updateErrorState("Erreur lors de l'ajout du jeu: ${e.message}")
            }
        }
    }

    //Contacts

    fun addContact(publisherId: Int, request: ContactRequest) {
        Log.d("PublisherViewModel", "Tentative d'ajout du contact: ${request.name} pour l'éditeur $publisherId")
        viewModelScope.launch {
            try {
                repository.addContact(publisherId, request)
                Log.d("PublisherViewModel", "Contact ajouté avec succès via l'API. Rafraîchissement des données.")
                // Rafraîchir les détails pour voir le nouveau contact
                fetchPublisherDetails(publisherId)

            } catch (e: Exception) {
                updateErrorState("Erreur lors de l'ajout du contact: ${e.message}")
            }


        }
    }

    fun updateContact(publisherId: Int, contactId: Int, request: ContactRequest) {
        viewModelScope.launch {
            try {
                repository.updateContact(publisherId, contactId, request)
                fetchPublisherDetails(publisherId)
            } catch (e: Exception) {
                updateErrorState("Erreur lors de la modification du contact: ${e.message}")
            }
        }
    }

    fun deleteContact(publisherId: Int, contactId: Int) {
        viewModelScope.launch {
            try {
                repository.deleteContact(publisherId, contactId)
                fetchPublisherDetails(publisherId)
            } catch (e: Exception) {
                updateErrorState("Erreur lors de la suppression du contact: ${e.message}")
            }
        }
    }

    fun clearSelection() {
        _uiState.update { currentState ->
            if (currentState is PublisherUiState.Success) {
                currentState.copy(selectedPublisher = null, errorMessage = null)
            } else {
                currentState
            }
        }
    }

    private fun updateErrorState(message: String) {
        _uiState.update { currentState ->
            if (currentState is PublisherUiState.Success) {
                currentState.copy(errorMessage = message)
            } else {
                PublisherUiState.Error(message)
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
