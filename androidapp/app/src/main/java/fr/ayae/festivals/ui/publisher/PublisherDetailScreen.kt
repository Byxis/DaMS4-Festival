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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Business
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.data.contact.ContactRequest
import fr.ayae.festivals.data.game.GameCreationRequest
import fr.ayae.festivals.data.publisher.PublisherDto
import fr.ayae.festivals.ui.game.GameAddDialog
import fr.ayae.festivals.ui.game.GameList


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublisherDetailScreen(
    publisher: PublisherDto,
    onAddGame : (GameCreationRequest) -> Unit,
    onAddContact: (ContactRequest) -> Unit,
    onUpdateContact: (ContactDto, ContactRequest) -> Unit,
    onDeleteContact: (ContactDto) -> Unit,
    onNavigateBack: () -> Unit
) {
    var showAddGameDialog by remember { mutableStateOf(false) }
    var showContactDialog by remember { mutableStateOf<ContactDto?>(null) } // Pour la modification
    var showAddContactDialog by remember { mutableStateOf(false) } // Pour l'ajout
    var showDeleteContactDialog by remember { mutableStateOf<ContactDto?>(null) }
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
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddGameDialog = true }) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter un jeu")
            }
        }
    ) { paddingValues ->
        if (showAddGameDialog) {
            GameAddDialog(
                publisherId = publisher.id,
                onDismissRequest = { showAddGameDialog = false },
                onSave = { request ->
                    onAddGame(request)
                    showAddGameDialog = false
                }
            )
        }

        if (showAddContactDialog) {
            ContactEditDialog(
                title = "Ajouter un contact",
                onDismissRequest = { showAddContactDialog = false },
                onSave = { request ->
                    onAddContact(request)
                    showAddContactDialog = false
                }
            )
        }

        // Dialogue pour modifier un contact
        showContactDialog?.let { contact ->
            ContactEditDialog(
                title = "Modifier le contact",
                contact = contact,
                onDismissRequest = { showContactDialog = null },
                onSave = { request ->
                    onUpdateContact(contact, request)
                    showContactDialog = null
                }
            )
        }

        // Dialogue pour confirmer la suppression d'un contact
        showDeleteContactDialog?.let { contact ->
            ConfirmContactDeleteDialog(
                itemName = "${contact.name} ${contact.familyName}",
                onDismiss = { showDeleteContactDialog = null },
                onConfirm = {
                    onDeleteContact(contact)
                    showDeleteContactDialog = null
                }
            )
        }

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

            // --- MODIFICATION : AJOUT DU BOUTON "AJOUTER CONTACT" ---
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Contacts (${publisher.contacts.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = { showAddContactDialog = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Ajouter un contact")
                }
            }
            // --- FIN DE LA MODIFICATION ---

            // Section Contacts
            ContactList(
                contacts = publisher.contacts,
                onEditClick = { contact -> showContactDialog = contact },
                onDeleteClick = { contact -> showDeleteContactDialog = contact }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Section Jeux
            GameList(games = publisher.games)
        }
    }
}

@Composable
fun ConfirmContactDeleteDialog(itemName: String, onDismiss: () -> Unit, onConfirm: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Confirmer la suppression") },
        text = { Text("Êtes-vous sûr de vouloir supprimer \"$itemName\" ? Cette action est irréversible.") },
        confirmButton = { Button(onClick = onConfirm) { Text("Supprimer") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Annuler") } }
    )
}
