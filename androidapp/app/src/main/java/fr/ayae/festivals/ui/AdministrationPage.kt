package fr.ayae.festivals.ui

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import fr.ayae.festivals.data.Administration.AdminViewModel
import fr.ayae.festivals.data.Administration.UserAdminPage
import fr.ayae.festivals.data.Login.UserProfile
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton

@SuppressLint("NotConstructor")
@Composable
fun AdministrationPage(adminViewModel: AdminViewModel = viewModel()) {
    // 1. Charger les données dès que l'écran s'affiche
    LaunchedEffect(Unit) {
        adminViewModel.fetchAllUsers()
    }

    val users = adminViewModel.usersList

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

        // 2. Si la liste est vide, on affiche un indicateur de chargement ou un message
        if (users.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp) // Espace entre les cartes
            ) {
                items(users) { user ->
                    UserCard(user)

                    IconButton(onClick = { adminViewModel.deleteAnUser(user.id) }) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Supprimer",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun UserCard(user: UserAdminPage) {
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
                // Affiche le nom s'il existe, sinon l'email
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

            // 4. Petit badge pour le rôle
            Surface(
                color = if (user.role == "admin") Color(0xFFD32F2F) else Color(0xFF1976D2),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = user.role.uppercase(),
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall
                )
            }
        }
    }
}