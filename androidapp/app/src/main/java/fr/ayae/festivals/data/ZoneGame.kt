package fr.ayae.festivals.data;

import kotlinx.serialization.Serializable

@Serializable
data class ZoneGame(
    val id: Int,
    val tarif_zone_id: Int,
    val name: String,
    val reserved_table: Int,
    val reserved_big_table: Int,
    val reserved_town_table: Int,
    val reserved_electrical_outlets: Int,
    val surface_area: Double
)

