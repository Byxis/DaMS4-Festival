package fr.ayae.festivals.data.db

import androidx.room.TypeConverter
import fr.ayae.festivals.data.reservation.ReservationGame
import fr.ayae.festivals.data.reservation.ReservationInteraction
import fr.ayae.festivals.data.reservation.ZoneTarif
import kotlinx.serialization.json.Json

private val json = Json { ignoreUnknownKeys = true }

/**
 * Room TypeConverters to serialize/deserialize nested lists as JSON strings.
 */
class Converters {

    // +---------------------------------------------------+
    // |                                                   |
    // |                  ZoneTarif list                   |
    // |                                                   |
    // +---------------------------------------------------+
    @TypeConverter
    fun fromZoneTarifList(value: List<ZoneTarif>?): String =
        json.encodeToString(value ?: emptyList())

    @TypeConverter
    fun toZoneTarifList(value: String): List<ZoneTarif> =
        json.decodeFromString(value)


    // +---------------------------------------------------+
    // |                                                   |
    // |              ReservationGame list                 |
    // |                                                   |
    // +---------------------------------------------------+
    @TypeConverter
    fun fromReservationGameList(value: List<ReservationGame>?): String =
        json.encodeToString(value ?: emptyList())

    @TypeConverter
    fun toReservationGameList(value: String): List<ReservationGame> =
        json.decodeFromString(value)


    // +---------------------------------------------------+
    // |                                                   |
    // |          ReservationInteraction list              |
    // |                                                   |
    // +---------------------------------------------------+
    @TypeConverter
    fun fromReservationInteractionList(value: List<ReservationInteraction>?): String =
        json.encodeToString(value ?: emptyList())

    @TypeConverter
    fun toReservationInteractionList(value: String): List<ReservationInteraction> =
        json.decodeFromString(value)
}
