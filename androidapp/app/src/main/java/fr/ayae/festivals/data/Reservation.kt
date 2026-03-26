package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reservations")
data class Reservation(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val festival_id: Int,
    val entity_id: Int,
    val table_count: Int,
    val big_table_count: Int,
    val town_table_count: Int,
    val electrical_outlets: Int,
    val note: String?,
    val status: String,
    val presented_by_them: Boolean? = false,
    val interactions: List<ReservationInteraction>? = null,
    val games: List<ReservationGame>? = null
)
