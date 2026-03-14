package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "festivals")
data class Festival(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val location: String,
    val start_date: Date,
    val end_date: Date,
    val table_count: Int,
    val big_table_count: Int,
    val town_table_count: Int,
    val table_surface: Int?,
    val big_table_surface: Int?,
    val town_table_surface: Int?,
    val logoUrl: String?,
    val tarif_zones: List<ZoneTarif>?
)