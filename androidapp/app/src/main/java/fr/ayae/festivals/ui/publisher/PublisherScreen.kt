package fr.ayae.festivals.ui.publisher

import android.app.Application
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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

    var showAddEditDialog by remember { mutableStateOf(false) }
    var publisherToEdit by remember { mutableStateOf<PublisherDto?>(null) }
    var publisherToDelete by remember { mutableStateOf<PublisherDto?>(null) }

    val onAddClicked = {
        publisherToEdit = null
        showAddEditDialog = true
    }

    val onEditClicked = { publisher: PublisherDto ->
        publisherToEdit = publisher
        showAddEditDialog = true
    }

    val onDeleteClicked = { publisher: PublisherDto ->
        publisherToDelete = publisher
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = onAddClicked) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter un éditeur")
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (val state = uiState) {
                is PublisherUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is PublisherUiState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is PublisherUiState.Success -> {
                    if (state.selectedPublisher != null) {
                        PublisherDetailScreen(
                            publisher = state.selectedPublisher,
                            onNavigateBack = { viewModel.clearSelection() }
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            items(state.publishers) { publisher ->
                                PublisherCard(
                                    publisher = publisher,
                                    onCardClick = { viewModel.selectPublisher(publisher) },
                                    onEditClick = { onEditClicked(publisher) },
                                    onDeleteClick = { onDeleteClicked(publisher) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // --- Dialogues ---

    if (showAddEditDialog) {
        PublisherEditDialog(
            title = if (publisherToEdit == null) "Ajouter un éditeur" else "Modifier l'éditeur",
            initialName = publisherToEdit?.name ?: "",
            onDismissRequest = { showAddEditDialog = false },
            onSave = { name ->
                publisherToEdit?.let {
                    viewModel.editPublisher(it.id, name)
                } ?: viewModel.addPublisher(name)
                showAddEditDialog = false
            }
        )
    }

    publisherToDelete?.let { publisher ->
        AlertDialog(
            onDismissRequest = { publisherToDelete = null },
            title = { Text("Confirmer la suppression") },
            text = { Text("Voulez-vous vraiment supprimer l'éditeur \"${publisher.name}\" ?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deletePublisher(publisher.id)
                        publisherToDelete = null
                    }
                ) {
                    Text("Supprimer")
                }
            },
            dismissButton = {
                TextButton(onClick = { publisherToDelete = null }) {
                    Text("Annuler")
                }
            }
        )
    }
}
