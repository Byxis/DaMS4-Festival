package fr.ayae.festivals.ui.festival

import fr.ayae.festivals.data.festivals.Festival
import fr.ayae.festivals.data.reservation.Reservation

/**
 * Represents the different UI states for the Festival screen.
 */
sealed interface FestivalUiState {
    data object Loading : FestivalUiState
    data class Success(
        val festival: Festival,
        val reservations: List<Pair<String, Reservation>>,
        val isOffline: Boolean = false
    ) : FestivalUiState
    data class Error(val message: String) : FestivalUiState
}
