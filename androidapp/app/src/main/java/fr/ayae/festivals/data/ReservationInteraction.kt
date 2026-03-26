package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reservation_interactions")
data class ReservationInteraction(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val reservation_id: Int,
    val description: String?,
    val interaction_date: String
)
