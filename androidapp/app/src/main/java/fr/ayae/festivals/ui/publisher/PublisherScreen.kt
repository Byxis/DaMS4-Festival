package fr.ayae.festivals.ui.publisher

import android.app.Application
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.data.publisher.PublisherDto

@Composable
fun PublisherScreen(
    viewModel: PublisherViewModel = viewModel(
        factory = PublisherViewModelFactory(LocalContext.current.applicationContext as Application)
    )
) {

    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {

        when (val state = uiState) {
            is PublisherUiState.Loading -> {
                CircularProgressIndicator()
            }
            is PublisherUiState.Error -> {
                Text(text = state.message, color = MaterialTheme.colorScheme.error)
            }
            is PublisherUiState.Success -> {
                PublisherList(publishers = state.publishers)
            }
        }
    }
}

@Composable
fun PublisherList(publishers: List<PublisherDto>) {
    if (publishers.isEmpty()) {
        Text("Aucun éditeur trouvé.")
        return
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(publishers) { publisher ->
            PublisherItem(publisher = publisher)
        }
    }
}

@Composable
fun PublisherItem(publisher: PublisherDto) {
    Card(modifier = Modifier.fillMaxWidth()) { // Changé pour fillMaxWidth pour un meilleur rendu
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = publisher.name, style = MaterialTheme.typography.titleLarge)
            Text(text = "Contacts: ${publisher.contacts.size}", style = MaterialTheme.typography.bodyMedium)
            Text(text = "Jeux: ${publisher.games.size}", style = MaterialTheme.typography.bodyMedium)
        }
    }
}