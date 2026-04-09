package fr.ayae.festivals.data.festivals

import androidx.room.Entity
import androidx.room.PrimaryKey
import fr.ayae.festivals.data.reservation.ZoneTarif
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "festivals")
data class Festival(
    @PrimaryKey
    val id: Int = 0,
    val name: String,
    val location: String? = null,
    val start_date: String? = null,
    val end_date: String? = null,
    val table_count: Int? = null,
    val big_table_count: Int = 0,
    val town_table_count: Int = 0,
    val table_surface: Int? = null,
    val big_table_surface: Int? = null,
    val town_table_surface: Int? = null,
    val logoUrl: String? = null,
    val tarif_zones: List<ZoneTarif>? = null
)

@Serializable
data class UpdateFestivalRequest(
    val name: String? = null,
    val location: String? = null,
    val start_date: String? = null,
    val end_date: String? = null,
    val table_count: Int? = null,
    val big_table_count: Int? = null,
    val town_table_count: Int? = null,
    val table_surface: Int? = null,
    val big_table_surface: Int? = null,
    val town_table_surface: Int? = null
)