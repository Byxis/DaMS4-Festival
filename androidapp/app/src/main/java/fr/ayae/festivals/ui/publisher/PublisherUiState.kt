package fr.ayae.festivals.ui.publisher

import fr.ayae.festivals.data.publisher.PublisherDto

// PublisherUiState.kt
// Represent the UI state for the Publisher screen, including loading, success, and error states.
sealed interface PublisherUiState {
    data class Success(val publishers: List<PublisherDto>) : PublisherUiState

    data object Loading : PublisherUiState

    data class Error(val message: String) : PublisherUiState
}