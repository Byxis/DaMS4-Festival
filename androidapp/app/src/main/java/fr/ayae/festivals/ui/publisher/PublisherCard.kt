package fr.ayae.festivals.ui.publisher

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import fr.ayae.festivals.data.publisher.PublisherDto

@Composable
fun PublisherCard(
    publisher: PublisherDto,
    isFetchingDetails: Boolean,
    onCardClick: () -> Unit,
    onEditClick: () -> Unit,
    onDeleteClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isExpanded by rememberSaveable(publisher.id) { mutableStateOf(false) }

    // Si les détails sont chargés, on force l'expansion de la carte
    if (publisher.games.isNotEmpty() || publisher.contacts.isNotEmpty()) {
        isExpanded = true
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onCardClick)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Le bouton pour étendre/réduire
                IconButton(onClick = { isExpanded = !isExpanded }) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.KeyboardArrowRight,
                        contentDescription = if (isExpanded) "Réduire" else "Étendre"
                    )
                }

                SubcomposeAsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(publisher.logo)
                        .crossfade(true)
                        .build(),
                    loading = { CircularProgressIndicator() },
                    error = { Icon(Icons.Default.Business, contentDescription = "Logo par défaut") },
                    contentDescription = "Logo de ${publisher.name}",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                )

                Spacer(modifier = Modifier.width(16.dp))

                Text(
                    text = publisher.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )

                // Affiche un spinner si les détails sont en cours de chargement pour cette carte
                if (isFetchingDetails) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                } else {
                    IconButton(onClick = onEditClick) {
                        Icon(Icons.Default.Edit, contentDescription = "Modifier", tint = MaterialTheme.colorScheme.primary)
                    }
                    IconButton(onClick = onDeleteClick) {
                        Icon(Icons.Default.Delete, contentDescription = "Supprimer", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }

            // Contenu extensible
            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    Divider()
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        "Contacts: ${publisher.contacts.size}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    publisher.contacts.firstOrNull()?.let {
                        Text(
                            "Principal: ${it.name} ${it.familyName}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Jeux: ${publisher.games.size}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}
