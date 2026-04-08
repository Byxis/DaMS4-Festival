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
import fr.ayae.festivals.data.ReservationRepository
import fr.ayae.festivals.data.UpdateFestivalRequest
import fr.ayae.festivals.data.UpdateReservationRequest

/**
 * ViewModel for the Festival screen, responsible for managing the festival data
 * and related operations (reservations, zones, etc.).
 */
class FestivalViewModel : ViewModel() {
    private val reservationRepo = ReservationRepository()
    private var appContext: android.content.Context? = null

    private val _uiState = MutableStateFlow<FestivalUiState>(FestivalUiState.Loading)
    val uiState: StateFlow<FestivalUiState> = _uiState.asStateFlow()

    fun loadData(context: android.content.Context, festivalId: Int = 1) {
        appContext = context.applicationContext
        viewModelScope.launch {
            _uiState.update { FestivalUiState.Loading }

            // Try to fetch actual festival
            val fetchedFestival = reservationRepo.getFestival(context, festivalId)

            val festivalData = fetchedFestival ?: Festival(
                id = festivalId,
                name = "",
                location = "",
                start_date = null,
                end_date = null,
                table_count = 0,
                big_table_count = 0,
                town_table_count = 0,
                table_surface = null,
                big_table_surface = null,
                town_table_surface = null,
                logoUrl = null,
                tarif_zones = emptyList()
            )

            // Fetch actual reservations
            val fetchedReservations = reservationRepo.getReservationsForFestival(context, festivalData.id)
            
            // Map fetched reservations to the required pairs. Using Entity ID as name since we don't fetch publishers yet.
            val reservationsList = fetchedReservations?.map {
                (it.entity_name ?: "Éditeur ${it.entity_id}") to it
            } ?: emptyList()

            _uiState.update {
                FestivalUiState.Success(festival = festivalData, reservations = reservationsList)
            }
        }
    }

    fun updateReservationNote(reservationId: Int, newNote: String) {
        viewModelScope.launch {
            val state = _uiState.value
            if (state is FestivalUiState.Success) {
                appContext?.let { ctx ->
                    reservationRepo.updateReservation(
                        ctx, state.festival.id, reservationId,
                        UpdateReservationRequest(note = newNote)
                    )
                }
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) name to res.copy(note = newNote) else name to res
            })
        }
    }

    fun updateReservationStatus(reservationId: Int, newStatus: String) {
        viewModelScope.launch {
            val state = _uiState.value
            if (state is FestivalUiState.Success) {
                appContext?.let { ctx ->
                    reservationRepo.updateReservation(
                        ctx, state.festival.id, reservationId,
                        UpdateReservationRequest(status = newStatus)
                    )
                }
            }
        }
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
        startDate: String,
        endDate: String,
        tableCount: Int,
        bigTableCount: Int,
        townTableCount: Int,
        imageUri: Uri? = null
    ) {
        viewModelScope.launch {
            val state = _uiState.value
            if (state is FestivalUiState.Success) {
                appContext?.let { ctx ->
                    reservationRepo.updateFestival(
                        ctx, state.festival.id,
                        UpdateFestivalRequest(
                            name = name, location = location,
                            start_date = startDate, end_date = endDate,
                            table_count = tableCount, big_table_count = bigTableCount,
                            town_table_count = townTableCount
                        )
                    )
                }
            }
        }
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
                numberOutlets = 1,
                electricalOutletPrice = outletPrice,
                maxTable = 0,
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
                    reserved_table = 0, reserved_big_table = 0, reserved_town_table = 0
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
