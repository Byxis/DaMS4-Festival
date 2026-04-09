package fr.ayae.festivals.data.reservation

import kotlinx.serialization.Serializable

@Serializable
data class ZoneGame(
    val id: Int,
    val tarif_zone_id: Int,
    val name: String,
    val reserved_table: Int = 0,
    val reserved_big_table: Int = 0,
    val reserved_town_table: Int = 0,
    val reserved_electrical_outlets: Int? = null,
    val surface_area: Double? = null
)

@Serializable
data class AddGameZoneRequest(
    val name: String,
    val reserved_table: Int? = null,
    val reserved_big_table: Int? = null,
    val reserved_town_table: Int? = null
)

