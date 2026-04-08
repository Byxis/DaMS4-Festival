package fr.ayae.festivals.data.Reservation

import kotlinx.serialization.Serializable

@Serializable
data class ZoneTarif(
    val id: Int? = null,
    val festival_id: Int? = null,
    val name: String,
    val price: Double? = 0.0,
    val numberOutlets: Int? = 0,
    val electricalOutletPrice: Double? = 0.0,
    val maxTable: Int? = 0,
    val game_zones: List<ZoneGame>? = null
)

@Serializable
data class AddZoneTarifRequest(
    val name: String,
    val price: Double? = null,
    val numberOutlets: Int? = null,
    val electricalOutletPrice: Double? = null,
    val maxTable: Int? = null
)