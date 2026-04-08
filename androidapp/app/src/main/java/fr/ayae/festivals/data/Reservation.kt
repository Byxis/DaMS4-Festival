package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "reservations")
data class Reservation(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val festival_id: Int,
    val entity_id: Int,
    val entity_name: String? = null,
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

@Serializable
data class UpdateReservationRequest(
    val table_count: Int? = null,
    val big_table_count: Int? = null,
    val town_table_count: Int? = null,
    val electrical_outlets: Int? = null,
    val note: String? = null,
    val status: String? = null,
    val presented_by_them: Boolean? = null
)

@Serializable
data class UpdateReservationGameRequest(
    val amount: Int? = null,
    val table_count: Int? = null,
    val big_table_count: Int? = null,
    val town_table_count: Int? = null,
    val electrical_outlets: Int? = null,
    val floor_space: Double? = null,
    val status: String? = null
)

@Serializable
data class AddReservationRequest(
    val entity_id: Int,
    val table_count: Int? = null,
    val big_table_count: Int? = null,
    val town_table_count: Int? = null,
    val note: String? = null,
    val status: String? = null,
    val presented_by_them: Boolean? = null
)
