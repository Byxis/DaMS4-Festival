package fr.ayae.festivals.ui.Administration

import android.util.Log
import android.util.Patterns
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Login.User


@Composable
fun UserFormDialog(
    userToEdit: User? = null,
    onDismiss: () -> Unit,
    adminViewModel: AdminViewModel
) {
    val context = LocalContext.current


    var prenom by remember { mutableStateOf(userToEdit?.firstName ?: "") }
    var nom by remember { mutableStateOf(userToEdit?.lastName ?: "") }
    var email by remember { mutableStateOf(userToEdit?.email ?: "") }
    val roleTraduit = when (userToEdit?.role?.lowercase()) {
        "admin" -> "Administrateur"
        "guest" -> "Invité"
        "publisher" -> "Editeur"
        "editeur de jeu" -> "Editeur de jeu"
        null -> "Administrateur"
        else -> userToEdit.role.replaceFirstChar { it.uppercase() }
    }

    var role by remember { mutableStateOf(roleTraduit) }
    val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()
    val showEmailError = email.isNotEmpty() && !isEmailValid


    val isEditMode = userToEdit != null

    AlertDialog(
        onDismissRequest = onDismiss,

        title = {
            Text(if (isEditMode) "Modifier l'utilisateur" else "Ajouter un utilisateur")
        },
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
                    label = { Text("Nom (optionnel)") }
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email*") },
                    isError = showEmailError,
                    supportingText = {
                        if (showEmailError) {
                            Text(text = "Format d'email invalide", color = MaterialTheme.colorScheme.error)
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
                    if (isInternetAvailable(context)) {
                        val userToSave = User(
                            id = userToEdit?.id ?: 0,
                            email = email.trim(),
                            role = role,
                            firstName = prenom,
                            lastName = nom
                        )


                        if (isEditMode) {
                            Log.d(
                                "ADMIN_DEBUG",
                                " bouton update cliqué! on va modifier l'user ${userToSave.id}"
                            )
                            adminViewModel.updateAnUser(context, userToSave)
                        } else {
                            adminViewModel.createAnUser(context, userToSave)
                        }

                        onDismiss()
                    }else{
                        Toast.makeText(context, "Pas de connexion internet !", Toast.LENGTH_SHORT).show()
                    }
                },
                enabled = email.isNotBlank() && role.isNotBlank() && isEmailValid
            ) {
                Text(if (isEditMode) "Mettre à jour" else "Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Annuler") }
        }
    )
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
