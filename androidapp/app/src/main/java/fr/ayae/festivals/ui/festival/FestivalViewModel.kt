package fr.ayae.festivals.ui.festival

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import fr.ayae.festivals.FestivalsApplication
import fr.ayae.festivals.R
import fr.ayae.festivals.data.reservation.ReservationRepository
import fr.ayae.festivals.data.festivals.UpdateFestivalRequest
import fr.ayae.festivals.data.reservation.UpdateReservationGameRequest
import fr.ayae.festivals.data.reservation.UpdateReservationRequest
import fr.ayae.festivals.data.reservation.AddGameZoneRequest
import fr.ayae.festivals.data.reservation.AddReservationRequest
import fr.ayae.festivals.data.reservation.AddZoneTarifRequest
import fr.ayae.festivals.data.reservation.Reservation
import fr.ayae.festivals.data.reservation.ZoneGame
import fr.ayae.festivals.data.reservation.ZoneTarif
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.IOException

/**
 * ViewModel for the Festival screen, responsible for managing festival data
 * and related operations (reservations, zones, etc.).
 *
 * Pattern: Room (via [ReservationRepository]) is the single source of truth.
 * [loadData] triggers an API refresh in the background and collects a Room Flow for the UI.
 */
class FestivalViewModel(private val repository: ReservationRepository) : ViewModel() {

    private var festivalId: Int = 1
    private var appContext: android.content.Context? = null

    private val _uiState = MutableStateFlow<FestivalUiState>(FestivalUiState.Loading)
    val uiState: StateFlow<FestivalUiState> = _uiState.asStateFlow()


    // +---------------------------------------------------+
    // |                                                   |
    // |                   Data loading                    |
    // |                                                   |
    // +---------------------------------------------------+

    /**
     * Load festival + reservations.
     * 1. Immediately collects from Room cache (instant offline display).
     * 2. Triggers an API refresh in background (updates Room → triggers Flow → updates UI).
     */
    fun loadData(context: android.content.Context, id: Int = 1) {
        festivalId = id
        appContext = context.applicationContext

        // Collect festival from Room (source of truth)
        viewModelScope.launch {
            repository.getFestivalStream(festivalId).collect { festival ->
                if (festival != null) {
                    _uiState.update { state ->
                        // On utilise 'state' (le dernier état en date) pour ne pas écraser les réservations déjà chargées
                        if (state is FestivalUiState.Success) {
                            state.copy(festival = festival)
                        } else {
                            // Premier chargement réussi
                            FestivalUiState.Success(festival = festival, reservations = emptyList(), isOffline = false)
                        }
                    }
                }
            }
        }

        // Collect reservations from Room
        viewModelScope.launch {
            repository.getReservationsStream(festivalId).collect { reservations ->
                val reservationsList = reservations.map {
                    (it.entity_name ?: "Éditeur ${it.entity_id}") to it
                }
                _uiState.update { state ->
                    if (state is FestivalUiState.Success) {
                        state.copy(reservations = reservationsList)
                    } else state
                }
            }
        }

        // Background API refresh
        viewModelScope.launch {
            try {
                // Fetch main festival data
                val fest = repository.refreshFestival(context, festivalId)
                
                // Fetch reservations (might fail with 403, we ignore that for offline detection)
                try {
                    repository.refreshReservations(context, festivalId)
                } catch (e: Exception) {
                    Log.w("FestivalVM", "Could not refresh reservations: ${e.message}")
                }

                if (fest == null) {
                    _uiState.update { state ->
                        if (state is FestivalUiState.Loading) {
                            FestivalUiState.Error(appContext?.getString(R.string.error_server) ?: "Erreur lors du chargement du festival depuis le serveur.")
                        } else state
                    }
                } else {
                    _uiState.update { state ->
                        if (state is FestivalUiState.Success) {
                            state.copy(isOffline = false)
                        } else state
                    }
                }
            } catch (_: IOException) {
                // Connection error
                _uiState.update { state ->
                    if (state is FestivalUiState.Success) {
                        state.copy(isOffline = true)
                    } else {
                        FestivalUiState.Error(appContext?.getString(R.string.error_server) ?: "Serveur injoignable.")
                    }
                }
            } catch (e: Exception) {
                // Other error (404, etc.) - we stay "online" but data might be old
                Log.e("FestivalVM", "API Refresh Error: ${e.message}")
            }
        }
    }

    // +---------------------------------------------------+
    // |                                                   |
    // |             Reservation mutations                 |
    // |                                                   |
    // +---------------------------------------------------+

    fun updateReservationNote(reservationId: Int, newNote: String) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                repository.updateReservation(ctx, festivalId, reservationId,
                    UpdateReservationRequest(note = newNote))
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
            appContext?.let { ctx ->
                repository.updateReservation(ctx, festivalId, reservationId,
                    UpdateReservationRequest(status = newStatus))
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
        viewModelScope.launch {
            appContext?.let { ctx ->
                repository.updateReservation(ctx, festivalId, reservationId,
                    UpdateReservationRequest(presented_by_them = presented))
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id == reservationId) name to res.copy(presented_by_them = presented) else name to res
            })
        }
    }

    fun updateReservationStock(reservationId: Int, tableCount: Int, bigTableCount: Int, townTableCount: Int, electricalOutlets: Int) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                repository.updateReservation(ctx, festivalId, reservationId,
                    UpdateReservationRequest(
                        table_count = tableCount,
                        big_table_count = bigTableCount,
                        town_table_count = townTableCount,
                        electrical_outlets = electricalOutlets
                    )
                )
            }
        }
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

    fun updateGameInReservation(
        reservationId: Int,
        reservationGameId: Int,
        amount: Int,
        tableCount: Int,
        bigTableCount: Int,
        townTableCount: Int,
        electricalOutlets: Int,
        floorSpace: Double,
        status: String
    ) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                repository.updateReservationGame(
                    ctx, festivalId, reservationId, reservationGameId,
                    UpdateReservationGameRequest(
                        amount = amount,
                        table_count = tableCount,
                        big_table_count = bigTableCount,
                        town_table_count = townTableCount,
                        electrical_outlets = electricalOutlets,
                        floor_space = floorSpace,
                        status = status
                    )
                )
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(reservations = state.reservations.map { (name, res) ->
                if (res.id != reservationId) return@map name to res
                val updatedGames = res.games?.map { game ->
                    if (game.id == reservationGameId) game.copy(
                        amount = amount, table_count = tableCount, big_table_count = bigTableCount,
                        town_table_count = townTableCount, electrical_outlets = electricalOutlets,
                        floor_space = floorSpace, status = status
                    ) else game
                }
                name to res.copy(games = updatedGames)
            })
        }
    }

    fun addEntityReservation(name: String) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = AddReservationRequest(
                    entity_id = 1, // FixMe: need actual entity selection
                    note = "", status = "TO_BE_CONTACTED", presented_by_them = false
                )
                val res = repository.addReservation(ctx, festivalId, request)
                if (res != null) repository.refreshReservations(ctx, festivalId)
            }
        }
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

    // +---------------------------------------------------+
    // |                                                   |
    // |           Festival mutations                      |
    // |                                                   |
    // +---------------------------------------------------+

    fun updateFestivalDetails(
        name: String, location: String, startDate: String, endDate: String,
        tableCount: Int, bigTableCount: Int, townTableCount: Int, imageUri: Uri? = null
    ) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                repository.updateFestival(ctx, festivalId,
                    UpdateFestivalRequest(
                        name = name, location = location,
                        start_date = startDate, end_date = endDate,
                        table_count = tableCount, big_table_count = bigTableCount,
                        town_table_count = townTableCount
                    )
                )
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(
                name = name, location = location, start_date = startDate, end_date = endDate,
                table_count = tableCount, big_table_count = bigTableCount,
                town_table_count = townTableCount,
                logoUrl = imageUri?.toString() ?: state.festival.logoUrl
            ))
        }
    }

    fun updateFestivalSurface(type: String, surface: Double) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = when (type) {
                    "Tables"         -> UpdateFestivalRequest(table_surface = surface.toInt())
                    "Grandes Tables" -> UpdateFestivalRequest(big_table_surface = surface.toInt())
                    else             -> UpdateFestivalRequest(town_table_surface = surface.toInt())
                }
                repository.updateFestival(ctx, festivalId, request)
            }
        }
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

    // +---------------------------------------------------+
    // |                                                   |
    // |            Zone management                        |
    // |                                                   |
    // +---------------------------------------------------+

    fun addZoneTarif(name: String, price: Double, outletPrice: Double) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = AddZoneTarifRequest(name = name, price = price, electricalOutletPrice = outletPrice)
                val res = repository.addZoneTarif(ctx, festivalId, request)
                if (res != null) repository.refreshFestival(ctx, festivalId)
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            val newZone = ZoneTarif(
                id = (state.festival.tarif_zones?.size ?: 0) + 1,
                name = name, price = price, numberOutlets = 1,
                electricalOutletPrice = outletPrice, maxTable = 0, game_zones = emptyList()
            )
            state.copy(festival = state.festival.copy(
                tarif_zones = (state.festival.tarif_zones ?: emptyList()) + newZone))
        }
    }

    fun updateZoneTarif(zoneTarifId: Int, name: String, price: Double, outletPrice: Double) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = AddZoneTarifRequest(name = name, price = price, electricalOutletPrice = outletPrice)
                val res = repository.updateZoneTarif(ctx, festivalId, zoneTarifId, request)
                if (res != null) repository.refreshFestival(ctx, festivalId)
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id == zoneTarifId) zone.copy(name = name, price = price, electricalOutletPrice = outletPrice) else zone
            }))
        }
    }

    fun deleteZoneTarif(zoneTarifId: Int) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val success = repository.deleteZoneTarif(ctx, festivalId, zoneTarifId)
                if (success) repository.refreshFestival(ctx, festivalId)
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(
                tarif_zones = state.festival.tarif_zones?.filter { it.id != zoneTarifId }))
        }
    }

    fun addGameZone(zoneTarifId: Int, name: String) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = AddGameZoneRequest(name = name)
                val res = repository.addGameZone(ctx, festivalId, zoneTarifId, request)
                if (res != null) repository.refreshFestival(ctx, festivalId)
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id != zoneTarifId) return@map zone
                val newGameZone = ZoneGame(
                    id = (zone.game_zones?.size ?: 0) + 1,
                    tarif_zone_id = zoneTarifId, name = name,
                    reserved_table = 0, reserved_big_table = 0, reserved_town_table = 0
                )
                zone.copy(game_zones = (zone.game_zones ?: emptyList()) + newGameZone)
            }))
        }
    }

    fun updateGameZone(zoneTarifId: Int, gameZoneId: Int, name: String) {
        viewModelScope.launch {
            appContext?.let { ctx ->
                val request = AddGameZoneRequest(name = name)
                val res = repository.updateGameZone(ctx, festivalId, zoneTarifId, gameZoneId, request)
                if (res != null) repository.refreshFestival(ctx, festivalId)
            }
        }
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
        viewModelScope.launch {
            appContext?.let { ctx ->
                val success = repository.deleteGameZone(ctx, festivalId, zoneTarifId, gameZoneId)
                if (success) repository.refreshFestival(ctx, festivalId)
            }
        }
        _uiState.update { state ->
            if (state !is FestivalUiState.Success) return@update state
            state.copy(festival = state.festival.copy(tarif_zones = state.festival.tarif_zones?.map { zone ->
                if (zone.id != zoneTarifId) return@map zone
                zone.copy(game_zones = zone.game_zones?.filter { it.id != gameZoneId })
            }))
        }
    }

    // +---------------------------------------------------+
    // |                                                   |
    // |           ViewModelProvider factory               |
    // |                                                   |
    // +---------------------------------------------------+

    companion object {
        /**
         * Factory that injects [ReservationRepository] from [FestivalsApplication].
         * Usage: `viewModel(factory = FestivalViewModel.Factory)`
         */
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val application = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]
                    as FestivalsApplication)
                FestivalViewModel(application.reservationRepository)
            }
        }
    }
}
