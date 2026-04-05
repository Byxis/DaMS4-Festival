package fr.ayae.festivals.ui.festival

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.Festival
import fr.ayae.festivals.data.Reservation
import fr.ayae.festivals.data.ZoneGame
import fr.ayae.festivals.data.ZoneTarif
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Date

/**
 * ViewModel for the Festival screen, responsible for managing the festival data
 * and related operations (reservations, zones, etc.).
 */
class FestivalViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<FestivalUiState>(FestivalUiState.Loading)
    val uiState: StateFlow<FestivalUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val mockFestival = Festival(
                id = 1,
                name = "Festival des Jeux 2026",
                location = "Salle des Fêtes, Paris",
                start_date = Date(),
                end_date = Date(),
                table_count = 100,
                big_table_count = 20,
                town_table_count = 5,
                table_surface = null,
                big_table_surface = null,
                town_table_surface = null,
                logoUrl = null,
                tarif_zones = emptyList()
            )
            val mockReservations = listOf(
                "Gigamic" to Reservation(
                    id = 1,
                    festival_id = 1,
                    entity_id = 101,
                    table_count = 45,
                    big_table_count = 10,
                    town_table_count = 5,
                    electrical_outlets = 1,
                    status = "CONFIRMED",
                    presented_by_them = true,
                    note = "Besoin d'électricité à proximité.",
                    interactions = emptyList(),
                    games = emptyList()
                )
            )
            _uiState.update {
                FestivalUiState.Success(festival = mockFestival, reservations = mockReservations)
            }
        }
    }

    fun updateReservationNote(reservationId: Int, newNote: String) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) name to res.copy(note = newNote) else name to res
            })
        }
    }

    fun updateReservationStatus(reservationId: Int, newStatus: String) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) name to res.copy(status = newStatus) else name to res
            })
        }
    }

    fun updateReservationPresented(reservationId: Int, presented: Boolean) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) name to res.copy(presented_by_them = presented) else name to res
            })
        }
    }

    fun updateReservationStock(reservationId: Int, tableCount: Int, bigTableCount: Int, townTableCount: Int, electricalOutlets: Int) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) {
                    name to res.copy(
                        table_count = tableCount,
                        big_table_count = bigTableCount,
                        town_table_count = townTableCount,
                        electrical_outlets = electricalOutlets
                    )
                } else name to res
            })
        }
    }

    fun updateFestivalDetails(
        name: String,
        location: String,
        startDate: Date,
        endDate: Date,
        tableCount: Int,
        bigTableCount: Int,
        townTableCount: Int,
        imageUri: Uri? = null
    ) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(
                name = name,
                location = location,
                start_date = startDate,
                end_date = endDate,
                table_count = tableCount,
                big_table_count = bigTableCount,
                town_table_count = townTableCount,
                logoUrl = imageUri?.toString() ?: state.festival.logoUrl
            ))
        }
    }

    fun updateFestivalSurface(type: String, surface: Double) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            val updated = when (type) {
                "Tables"         -> state.festival.copy(table_surface = surface.toInt())
                "Grandes Tables" -> state.festival.copy(big_table_surface = surface.toInt())
                else             -> state.festival.copy(town_table_surface = surface.toInt())
            }
            state.copy(festival = updated)
        }
    }

    fun addZoneTarif(name: String, price: Double, outletPrice: Double) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            val newZone = ZoneTarif(
                id = (state.festival.tarif_zones?.size ?: 0) + 1,
                name = name,
                price = price,
                electricalOutlet = 1,
                electricalOutletPrice = outletPrice,
                game_zones = emptyList()
            )
            state.copy(festival = state.festival.copy(tarif_zones = (state.festival.tarif_zones ?: emptyList()) + newZone))
        }
    }

    fun addEntityReservation(name: String) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            val newRes = Reservation(
                id = state.reservations.size + 1,
                festival_id = state.festival.id,
                entity_id = state.reservations.size + 1000,
                table_count = 0, big_table_count = 0, town_table_count = 0, electrical_outlets = 0,
                note = "", status = "TO_BE_CONTACTED", presented_by_them = false,
                interactions = emptyList(), games = emptyList()
            )
            state.copy(reservations = state.reservations + (name to newRes))
        }
    }

    fun addGameZone(zoneTarifId: Int, name: String) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id != zoneTarifId) return@map zone
                val newGameZone = ZoneGame(
                    id = (zone.game_zones?.size ?: 0) + 1,
                    tarif_zone_id = zoneTarifId,
                    name = name,
                    reserved_table = 0, reserved_big_table = 0, reserved_town_table = 0,
                    reserved_electrical_outlets = 0, surface_area = 0.0
                )
                zone.copy(game_zones = (zone.game_zones ?: emptyList()) + newGameZone)
            }))
        }
    }

    fun updateZoneTarif(zoneTarifId: Int, name: String, price: Double, outletPrice: Double) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id == zoneTarifId) zone.copy(name = name, price = price, electricalOutletPrice = outletPrice) else zone
            }))
        }
    }

    fun deleteZoneTarif(zoneTarifId: Int) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.filter { it.id != zoneTarifId }))
        }
    }

    fun updateGameZone(zoneTarifId: Int, gameZoneId: Int, name: String) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id != zoneTarifId) return@map zone
                zone.copy(game_zones = zone.game_zones?.map { gz ->
                    if (gz.id == gameZoneId) gz.copy(name = name) else gz
                })
            }))
        }
    }

    fun deleteGameZone(zoneTarifId: Int, gameZoneId: Int) {
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id != zoneTarifId) return@map zone
                zone.copy(game_zones = zone.game_zones?.filter { it.id != gameZoneId })
            }))
        }
    }
}
