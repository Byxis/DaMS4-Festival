package fr.ayae.festivals.ui.publisher

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
        factory = PublisherViewModelFactory(LocalContext.current.applicationContext as android.app.Application)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    var showAddDialog by remember { mutableStateOf(false) }
    var showEditDialog by remember { mutableStateOf<PublisherDto?>(null) }
    var showDeleteDialog by remember { mutableStateOf<PublisherDto?>(null) }

    when (val state = uiState) {
        is PublisherUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is PublisherUiState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = state.message, color = MaterialTheme.colorScheme.error)
            }
        }
        is PublisherUiState.Success -> {
            // Si un éditeur est sélectionné, on affiche l'écran de détail
            if (state.selectedPublisher != null) {
                PublisherDetailScreen(
                    publisher = state.selectedPublisher,
                    onNavigateBack = { viewModel.clearSelection() }
                )
            } else {
                // Sinon, on affiche la liste
                Scaffold(
                    snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
                    floatingActionButton = {
                        FloatingActionButton(onClick = { showAddDialog = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Ajouter un éditeur")
                        }
                    }
                ) { paddingValues ->
                    LaunchedEffect(state.errorMessage) {
                        state.errorMessage?.let {
                            snackbarHostState.showSnackbar(it)
                        }
                    }

                    Column(modifier = Modifier.padding(paddingValues)) {
                        LazyColumn(modifier = Modifier.padding(horizontal = 8.dp)) {
                            items(state.publishers, key = { it.id }) { publisher ->
                                PublisherCard(
                                    publisher = publisher,
                                    isFetchingDetails = state.fetchingDetailsForId == publisher.id,
                                    onCardClick = { viewModel.selectPublisher(publisher) },
                                    onEditClick = { showEditDialog = publisher },
                                    onDeleteClick = { showDeleteDialog = publisher }
                                )
                            }
                        }
                    }

                    // --- Dialogues ---
                    if (showAddDialog) {
                        PublisherEditDialog(
                            title = "Ajouter un éditeur",
                            onDismissRequest = { showAddDialog = false },
                            onSave = { name ->
                                viewModel.addPublisher(name)
                                showAddDialog = false
                            }
                        )
                    }
                    showEditDialog?.let { publisher ->
                        PublisherEditDialog(
                            title = "Modifier l'éditeur",
                            initialName = publisher.name,
                            onDismissRequest = { showEditDialog = null },
                            onSave = { newName ->
                                viewModel.editPublisher(publisher.id, newName)
                                showEditDialog = null
                            }
                        )
                    }
                    showDeleteDialog?.let { publisher ->
                        ConfirmDeleteDialog(
                            publisherName = publisher.name,
                            onDismiss = { showDeleteDialog = null },
                            onConfirm = {
                                viewModel.deletePublisher(publisher.id)
                                showDeleteDialog = null
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ConfirmDeleteDialog(publisherName: String, onDismiss: () -> Unit, onConfirm: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Confirmer la suppression") },
        text = { Text("Êtes-vous sûr de vouloir supprimer l'éditeur \"$publisherName\" ? Cette action est irréversible.") },
        confirmButton = {
            Button(
                onClick = {
                    onConfirm()
                    onDismiss()
                }
            ) {
                Text("Supprimer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}
