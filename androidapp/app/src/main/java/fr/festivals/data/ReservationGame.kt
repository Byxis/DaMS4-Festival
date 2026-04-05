package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reservation_games")
data class ReservationGame(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val reservation_id: Int,
    val game_id: Int,
    val amount: Int,
    val table_count: Int,
    val big_table_count: Int,
    val town_table_count: Int,
    val electrical_outlets: Int,
    val status: String,
    val zone_id: Int?,
    val floor_space: Double?
)
