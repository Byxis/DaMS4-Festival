package fr.ayae.festivals.ui.game

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Casino
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import fr.ayae.festivals.R
import fr.ayae.festivals.data.game.GameDto

@Composable
fun GameCard(game: GameDto, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            SubcomposeAsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(game.logoUrl)
                    .crossfade(true)
                    .build(),
                loading = { CircularProgressIndicator(modifier = Modifier.size(40.dp)) },
                error = { Icon(Icons.Default.Casino, contentDescription = stringResource(R.string.default_pic), modifier = Modifier.size(40.dp)) },
                contentDescription = stringResource(R.string.logo_of, game.name),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(60.dp)
                    .clip(CircleShape)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = game.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                game.minPlayers?.let {
                    game.maxPlayers?.let { it1 ->
                        Text(
                            text = stringResource(R.string.players, it, it1),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
                game.type?.let {
                    Text(
                        text = stringResource(R.string.game_card_type, it),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}