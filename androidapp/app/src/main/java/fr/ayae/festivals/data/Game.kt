package fr.ayae.festivals.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class GameType(val label: String) {
    ALL_AUDIENCES("Tout Public"),
    PARTY_GAME("Ambiance"),
    EXPERTS("Experts"),
    CHILDREN("Enfants"),
    CLASSICS("Classiques"),
    INITIATES("Initiés"),
    ROLE_PLAYING("Jeu de rôle"),
    UNKNOWN("Inconnu")
}

@Entity(tableName = "games")
data class Game(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val logoUrl: String? = null,
    val name: String,
    val editor_name: String? = null,
    val publisher_id: Int? = null,
    val type: GameType,
    val minimum_number_of_player: Int,
    val maximum_number_of_player: Int
)
