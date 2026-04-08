package fr.ayae.festivals.ui.Administration

import android.annotation.SuppressLint
import android.content.Context
import android.widget.Toast
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
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.ui.platform.LocalContext
import fr.ayae.festivals.data.Login.User


@SuppressLint("NotConstructor")
@Composable
fun AdministrationPage(adminViewModel: AdminViewModel = viewModel()) {
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        adminViewModel.fetchAllUsers(context)
    }

    var showUserForm by remember { mutableStateOf(false) }
    var userToEdit by remember { mutableStateOf<User?>(null) }
    var deleteDialog by remember { mutableStateOf(false) }





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

    if (deleteDialog) {
        DeleteConfirmationDialog(
            onConfirm = {

                adminViewModel.deleteAnUser(context, userIdToDelete)
                deleteDialog = false
            },
            onDismiss = {
                deleteDialog = false
            }
        )
    }
    if (showUserForm) {
        UserFormDialog(
            userToEdit = userToEdit,
            onDismiss = { showUserForm = false },
            adminViewModel = adminViewModel
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
                onClick = {

                    userToEdit = null
                    showUserForm = true
                },
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

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {


                        Box(modifier = Modifier.weight(1f)) {
                            UserCard(user)
                        }


                        if (user.email != currentEmail) {
                            IconButton(
                                onClick = {
                                    if (isInternetAvailable(context)) {
                                        userIdToDelete = user.id ?: -1
                                        deleteDialog = true
                                    }else{
                                        Toast.makeText(context, "Impossible de supprimer hors ligne", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Supprimer",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                            IconButton(
                                onClick = {
                                    if (isInternetAvailable(context)) {
                                        userToEdit = user
                                        showUserForm = true
                                    }else{
                                        Toast.makeText(context, "Impossible de modifier hors ligne", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Edit,
                                    contentDescription = "Modifier",
                                    tint = MaterialTheme.colorScheme.primary
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


                    text = when (user.role) {
                        "admin" -> "Administrateur"
                        "guest" -> "Invité"
                        "publisher" -> "Editeur"
                        else -> user.role
                    },
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