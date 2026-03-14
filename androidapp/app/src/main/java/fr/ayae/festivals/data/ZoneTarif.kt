package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "festivals")
data class ZoneTarif(
    val id: Int?,
    val name: String,
    val price: Double,
    val electricalOutlet: Int,
    val electricalOutletPrice: Double,
    val game_zones: List<ZoneGame>?
)