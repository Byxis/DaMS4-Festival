package fr.ayae.festivals.data.db

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import fr.ayae.festivals.data.Festivals.Festival
import kotlinx.coroutines.flow.Flow

/**
 * DAO for [Festival] entities.
 */
@Dao
interface FestivalDao {

    /** Returns a live stream of a single festival by its ID. */
    @Query("SELECT * FROM festivals WHERE id = :id")
    fun getFestivalById(id: Int): Flow<Festival?>

    /** Returns a live stream of all festivals. */
    @Query("SELECT * FROM festivals")
    fun getAllFestivals(): Flow<List<Festival>>

    /** Insert or replace a festival (upsert). */
    @Upsert
    suspend fun upsertFestival(festival: Festival)

    /** Insert or replace a list of festivals (upsert). */
    @Upsert
    suspend fun upsertAll(festivals: List<Festival>)

    /** Delete all festivals from the local cache. */
    @Query("DELETE FROM festivals")
    suspend fun clearAll()
}
