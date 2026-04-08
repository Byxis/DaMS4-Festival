package fr.ayae.festivals.ui.publisher
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Business
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import fr.ayae.festivals.data.publisher.PublisherDto
import fr.ayae.festivals.ui.game.GameList


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublisherDetailScreen(
    publisher: PublisherDto,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(publisher.name, maxLines = 1) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Retour"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(vertical = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                SubcomposeAsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(publisher.logo)
                        .crossfade(true)
                        .build(),
                    loading = {
                        CircularProgressIndicator(
                            modifier = Modifier.size(60.dp)
                        )
                    },
                    error = {
                        Icon(
                            imageVector = Icons.Default.Business,
                            contentDescription = "Logo par défaut",
                            modifier = Modifier.size(60.dp)
                        )
                    },
                    contentDescription = "Logo de ${publisher.name}",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Section Contacts
            ContactList(contacts = publisher.contacts)

            Spacer(modifier = Modifier.height(24.dp))

            // Section Jeux
            GameList(games = publisher.games)
        }
    }
}

