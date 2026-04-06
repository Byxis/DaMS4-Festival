package fr.ayae.festivals.ui.publisher

import fr.ayae.festivals.data.publisher.PublisherDto

sealed interface PublisherUiState {
    data object Loading : PublisherUiState
    data class Error(val message: String) : PublisherUiState
    data class Success(
        val publishers: List<PublisherDto>,
        val selectedPublisher: PublisherDto? = null
    ) : PublisherUiState
}