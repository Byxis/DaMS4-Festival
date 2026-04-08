package fr.ayae.festivals.ui.game

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.game.GameDto

@Composable
fun GameList(games: List<GameDto>) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = "Jeux de l'éditeur (${games.size})",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        if (games.isEmpty()) {
            Text(
                text = "Aucun jeu n'est associé à cet éditeur pour le moment.",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        } else {
            games.forEach { game ->
                GameCard(game = game)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}