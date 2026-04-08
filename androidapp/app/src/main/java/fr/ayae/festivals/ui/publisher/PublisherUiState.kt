package fr.ayae.festivals.ui.publisher

import fr.ayae.festivals.data.publisher.PublisherDto

sealed interface PublisherUiState {
    data object Loading : PublisherUiState
    data class Success(
        val publishers: List<PublisherDto>,
        val selectedPublisher: PublisherDto? = null,
        val errorMessage: String? = null,
        val fetchingDetailsForId: Int? = null
    ) : PublisherUiState
    data class Error(val message: String) : PublisherUiState
}
