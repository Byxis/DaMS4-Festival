package fr.ayae.festivals.data.db

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Update
import androidx.room.Upsert
import fr.ayae.festivals.data.Reservation.Reservation
import kotlinx.coroutines.flow.Flow

/**
 * DAO for [Reservation] entities.
 * Interactions and games are stored as JSON via [Converters].
 */
@Dao
interface ReservationDao {

    /** Returns a live stream of all reservations for a given festival. */
    @Query("SELECT * FROM reservations WHERE festival_id = :festivalId")
    fun getReservationsByFestival(festivalId: Int): Flow<List<Reservation>>

    /** Insert or replace a list of reservations (upsert). */
    @Upsert
    suspend fun upsertAll(reservations: List<Reservation>)

    /** Update a single reservation (e.g. after an API PATCH). */
    @Update
    suspend fun update(reservation: Reservation)

    /** Delete all reservations from the local cache. */
    @Query("DELETE FROM reservations")
    suspend fun clearAll()
}
