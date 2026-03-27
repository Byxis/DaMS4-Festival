package fr.ayae.festivals.ui.Administration

import android.annotation.SuppressLint
import android.content.Context
import android.util.Patterns
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.ui.Administration.AdminViewModel
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.TextButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import fr.ayae.festivals.data.Login.User


@SuppressLint("NotConstructor")
@Composable
fun AdministrationPage(adminViewModel: AdminViewModel = viewModel()) {
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        adminViewModel.fetchAllUsers(context)
    }
    var showDialog by remember { mutableStateOf(false) }

    var showAddUserDialog by remember { mutableStateOf(false) }

    var userIdToDelete by remember { mutableIntStateOf(-1) }

    val users = adminViewModel.usersList

    var searchQuery by remember { mutableStateOf("") }


    val currentEmail = remember {
        context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
            .getString("current_user_email", "") ?: ""
    }







    val filteredUsers = adminViewModel.usersList.filter {
        it.email.contains(searchQuery, ignoreCase = true) ||
                (it.firstName?.contains(searchQuery, ignoreCase = true) ?: false)
    }

    if (showDialog) {
        DeleteConfirmationDialog(
            onConfirm = {

                adminViewModel.deleteAnUser(context, userIdToDelete)
                showDialog = false
            },
            onDismiss = {
                showDialog = false
            }
        )
    }
    if (showAddUserDialog) {
        AddUserForm(
            onDismiss = { showAddUserDialog = false },
            adminViewModel
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Gestion des Utilisateurs",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Rechercher un utilisateur...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )


            FilledIconButton(
                onClick = { showAddUserDialog = true},
                modifier = Modifier.size(56.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Ajouter")
            }
        }


        if (users.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredUsers) { user ->
                    // 1. ON CRÉE UNE LIGNE (Row)
                    Row(
                        modifier = Modifier.fillMaxWidth(), // La ligne prend toute la largeur
                        verticalAlignment = Alignment.CenterVertically // On centre la poubelle verticalement par rapport à la carte
                    ) {

                        // 2. LA CARTE UTILISATEUR
                        // On l'enveloppe dans une Box avec weight(1f) pour qu'elle prenne
                        // tout l'espace disponible, sauf celui réservé au bouton.
                        Box(modifier = Modifier.weight(1f)) {
                            UserCard(user)
                        }

                        // 3. LE BOUTON POUBELLE (ou le texte "Vous")
                        if (user.email != currentEmail) {
                            IconButton(
                                onClick = {
                                    userIdToDelete = user.id ?: -1
                                    showDialog = true
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Supprimer",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                        } else {

                            Box(
                                modifier = Modifier.size(48.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "(Vous)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                }
                    }
                }
            }
        }



@Composable
fun DeleteConfirmationDialog(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = "Supprimer l'utilisateur") 
        },
        text = { 
            Text("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est définitive.")
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
            ) {
                Text("Supprimer", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}

@Composable
fun AddUserForm(
    onDismiss: () -> Unit,
    adminViewModel: AdminViewModel
) {
    val context = LocalContext.current
    var prenom by remember { mutableStateOf("") }
    var nom by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("Administrateur") }
    val roles = listOf("Administrateur", "Editeur", "Editeur de jeu", "Invité")
    val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()
    val showEmailError = email.isNotEmpty() && !isEmailValid
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Ajouter un utilisateur") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = prenom,
                    onValueChange = { prenom = it },
                    label = { Text("Prénom (optionnel)") }
                )
                OutlinedTextField(
                    value = nom,
                    onValueChange = { nom = it },
                    label = { Text("Nom (optionnel") }
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email*") },
                    isError = showEmailError,
                    supportingText = {
                        if (showEmailError) {
                            Text(
                                text = "Format d'email invalide",
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true
                )

                RoleSelector(
                    currentRole = role,
                    onRoleChange = { role = it }
                )

                }

        },
        confirmButton = {
            Button(
                onClick = {

                    val userToCreate = User(
                        email = email.trim(),
                        role = role,
                        firstName = prenom,
                        lastName = nom
                    )


                    adminViewModel.createAnUser(context, userToCreate)


                    onDismiss()
                },
                // Le paramètre 'enabled' se met APRÈS l'accolade du onClick, pas dedans
                enabled = email.isNotBlank() && role.isNotBlank()
            ) {
                // Le texte du bouton
                Text("Enregistrer")
            }

        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
}





@Composable
fun UserCard(user: User) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${user.firstName ?: ""} ${user.lastName ?: ""}".ifBlank { "Utilisateur Sans Nom" },
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }


            Surface(
                color = if (user.role == "admin") Color(0xFFD32F2F) else Color(0xFF1976D2),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(


                    text = if (user.role == "admin") "Administrateur" else user.role.uppercase(),
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall
                )
            }
        }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoleSelector(currentRole: String, onRoleChange: (String) -> Unit) {
    val options = listOf("Administrateur", "Editeur", "Editeur de jeu", "Invité")
    var expanded by remember { mutableStateOf(false) }

    // Le conteneur principal du Select
    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = Modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = currentRole,
            onValueChange = {},
            readOnly = true,
            label = { Text("Rôle*") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
            modifier = Modifier.menuAnchor().fillMaxWidth()
        )


        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { selectionOption ->
                DropdownMenuItem(
                    text = { Text(selectionOption) },
                    onClick = {
                        onRoleChange(selectionOption)
                        expanded = false
                    },
                    contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                )
            }
        }
    }
}