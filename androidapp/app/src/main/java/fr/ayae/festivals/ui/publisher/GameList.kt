package fr.ayae.festivals.ui.publisher

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Games
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.game.GameDto
import fr.ayae.festivals.ui.components.InfoRow

@Composable
fun GameList(games: List<GameDto>) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = "Jeux (${games.size})",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (games.isEmpty()) {
            Text(
                "Aucun jeu disponible.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            games.forEach { game ->
                val playerRange = if (game.minPlayers != null && game.maxPlayers != null) {
                    "${game.minPlayers}-${game.maxPlayers} joueurs"
                } else {
                    "N/A"
                }
                InfoRow(
                    icon = Icons.Default.Games,
                    label = game.name,
                    value = playerRange,
                    valueIcon = Icons.Default.People
                )
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}