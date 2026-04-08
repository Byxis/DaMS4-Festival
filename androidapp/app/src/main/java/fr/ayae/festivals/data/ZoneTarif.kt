package fr.ayae.festivals.data

import kotlinx.serialization.Serializable

@Serializable
data class ZoneTarif(
    val id: Int?,
    val name: String,
    val price: Double,
    val electricalOutlet: Int,
    val electricalOutletPrice: Double,
    val game_zones: List<ZoneGame>?
)