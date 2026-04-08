package fr.ayae.festivals.data.Reservation

import android.content.Context
import android.util.Log
import fr.ayae.festivals.data.Festivals.Festival
import fr.ayae.festivals.data.Festivals.UpdateFestivalRequest
import fr.ayae.festivals.data.RetrofitInstance
import fr.ayae.festivals.data.db.AppDatabase
import kotlinx.coroutines.flow.Flow

/**
 * Repository handling both local Room cache and remote API calls.
 *
 * Strategy:
 * - Read operations return a [Flow] from Room (single source of truth).
 * - On [loadData], we first return the cache, then fetch from API and upsert.
 * - Write operations (update*) call the API first, then update Room on success.
 * - [clearAll] removes all cached data (called on logout).
 */
class ReservationRepository(private val db: AppDatabase) {

    private val festivalDao = db.festivalDao()
    private val reservationDao = db.reservationDao()


    // +---------------------------------------------------+
    // |                                                   |
    // |              Streams (Room -> UI)                 |
    // |                                                   |
    // +---------------------------------------------------+

    /** Live stream of a single festival from cache. */
    fun getFestivalStream(id: Int): Flow<Festival?> =
        festivalDao.getFestivalById(id)

    /** Live stream of all festivals from cache. */
    fun getAllFestivalsStream(): Flow<List<Festival>> =
        festivalDao.getAllFestivals()

    /** Live stream of all reservations for a festival from cache. */
    fun getReservationsStream(festivalId: Int): Flow<List<Reservation>> =
        reservationDao.getReservationsByFestival(festivalId)



    // +---------------------------------------------------+
    // |                                                   |
    // |                Refresh from API                   |
    // |                                                   |
    // +---------------------------------------------------+
    /**
     * Fetches all festivals from the API and upserts them into Room.
     * Returns true on success, false on error (offline/server error).
     */
    suspend fun refreshAllFestivals(context: Context): Boolean {
        try {
            val festivals = RetrofitInstance.getApi(context).getAllFestivals()
            festivalDao.upsertAll(festivals)
            return true
        } catch (e: java.io.IOException) {
            Log.e("Repository", "Network error in refreshAllFestivals: ${e.message}")
            throw e // Rethrow to let ViewModel know it's a network issue
        } catch (e: Exception) {
            Log.e("Repository", "API error in refreshAllFestivals: ${e.message}")
            return false
        }
    }

    /**
     * Fetches the festival from the API and upserts it into Room.
     * Returns the fetched [Festival], or null on error.
     */
    suspend fun refreshFestival(context: Context, festivalId: Int): Festival? {
        try {
            val festival = RetrofitInstance.getApi(context).getFestival(festivalId)
            festivalDao.upsertFestival(festival)
            return festival
        } catch (e: java.io.IOException) {
            throw e
        } catch (e: Exception) {
            Log.e("Repository", "refreshFestival error: ${e.message}")
            return null
        }
    }

    /**
     * Fetches all reservations for a festival from the API and upserts them into Room.
     * Returns the list, or null on error.
     */
    suspend fun refreshReservations(context: Context, festivalId: Int): List<Reservation>? {
        try {
            val reservations = RetrofitInstance.getApi(context).getReservations(festivalId)
            reservationDao.upsertAll(reservations)
            return reservations
        } catch (e: java.io.IOException) {
            throw e
        } catch (e: Exception) {
            Log.e("Repository", "refreshReservations error: ${e.message}")
            return null
        }
    }


    // +---------------------------------------------------+
    // |                                                   |
    // |       Write operations (API + Room sync)          |
    // |                                                   |
    // +---------------------------------------------------+

    suspend fun updateFestival(context: Context, festivalId: Int, request: UpdateFestivalRequest): Festival? {
        return try {
            val updated = RetrofitInstance.getApi(context).updateFestival(festivalId, request)
            festivalDao.upsertFestival(updated)
            updated
        } catch (e: Exception) {
            Log.e("Repository", "updateFestival error: ${e.message}")
            null
        }
    }

    suspend fun updateReservation(context: Context, festivalId: Int, reservationId: Int, request: UpdateReservationRequest): Reservation? {
        return try {
            val updated = RetrofitInstance.getApi(context).updateReservation(festivalId, reservationId, request)
            reservationDao.update(updated)
            updated
        } catch (e: Exception) {
            Log.e("Repository", "updateReservation error: ${e.message}")
            null
        }
    }

    suspend fun updateReservationGame(
        context: Context,
        festivalId: Int,
        reservationId: Int,
        reservationGameId: Int,
        request: UpdateReservationGameRequest
    ): ReservationGame? {
        return try {
            RetrofitInstance.getApi(context).updateReservationGame(festivalId, reservationId, reservationGameId, request)
        } catch (e: Exception) {
            Log.e("Repository", "updateReservationGame error: ${e.message}")
            null
        }
    }

    suspend fun addReservation(context: Context, festivalId: Int, request: AddReservationRequest): Reservation? {
        return try {
            val created = RetrofitInstance.getApi(context).addReservation(festivalId, request)
            reservationDao.upsertAll(listOf(created))
            created
        } catch (e: Exception) {
            Log.e("Repository", "addReservation error: ${e.message}")
            null
        }
    }

    suspend fun addZoneTarif(context: Context, festivalId: Int, request: AddZoneTarifRequest): ZoneTarif? {
        return try {
            RetrofitInstance.getApi(context).addZoneTarif(festivalId, request)
        } catch (e: Exception) {
            Log.e("Repository", "addZoneTarif error: ${e.message}")
            null
        }
    }

    suspend fun updateZoneTarif(context: Context, festivalId: Int, tarifZoneId: Int, request: AddZoneTarifRequest): ZoneTarif? {
        return try {
            RetrofitInstance.getApi(context).updateZoneTarif(festivalId, tarifZoneId, request)
        } catch (e: Exception) {
            Log.e("Repository", "updateZoneTarif error: ${e.message}")
            null
        }
    }

    suspend fun deleteZoneTarif(context: Context, festivalId: Int, tarifZoneId: Int): Boolean {
        return try {
            RetrofitInstance.getApi(context).deleteZoneTarif(festivalId, tarifZoneId).isSuccessful
        } catch (e: Exception) {
            Log.e("Repository", "deleteZoneTarif error: ${e.message}")
            false
        }
    }

    suspend fun addGameZone(context: Context, festivalId: Int, tarifZoneId: Int, request: AddGameZoneRequest): ZoneGame? {
        return try {
            RetrofitInstance.getApi(context).addGameZone(festivalId, tarifZoneId, request)
        } catch (e: Exception) {
            Log.e("Repository", "addGameZone error: ${e.message}")
            null
        }
    }

    suspend fun updateGameZone(context: Context, festivalId: Int, tarifZoneId: Int, gameZoneId: Int, request: AddGameZoneRequest): ZoneGame? {
        return try {
            RetrofitInstance.getApi(context).updateGameZone(festivalId, tarifZoneId, gameZoneId, request)
        } catch (e: Exception) {
            Log.e("Repository", "updateGameZone error: ${e.message}")
            null
        }
    }

    suspend fun deleteGameZone(context: Context, festivalId: Int, tarifZoneId: Int, gameZoneId: Int): Boolean {
        return try {
            RetrofitInstance.getApi(context).deleteGameZone(festivalId, tarifZoneId, gameZoneId).isSuccessful
        } catch (e: Exception) {
            Log.e("Repository", "deleteGameZone error: ${e.message}")
            false
        }
    }


    // +---------------------------------------------------+
    // |                                                   |
    // |                Cache management                   |
    // |                                                   |
    // +---------------------------------------------------+

    /**
     * Deletes all locally cached data. Called on logout.
     */
    suspend fun clearAll() {
        reservationDao.clearAll()
        festivalDao.clearAll()
    }
}
