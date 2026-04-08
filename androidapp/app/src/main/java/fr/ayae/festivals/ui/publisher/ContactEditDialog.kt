package fr.ayae.festivals.ui.publisher

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.data.contact.ContactRequest
import fr.ayae.festivals.ui.utils.FestivalDialog

@Composable
fun ContactEditDialog(
    title: String,
    contact: ContactDto? = null, // Null pour un ajout, non-null pour une modification
    onDismissRequest: () -> Unit,
    onSave: (ContactRequest) -> Unit
) {
    var name by remember { mutableStateOf(contact?.name ?: "") }
    var familyName by remember { mutableStateOf(contact?.familyName ?: "") }
    var role by remember { mutableStateOf(contact?.role ?: "") }
    var telephone by remember { mutableStateOf(contact?.telephone ?: "") }
    var email by remember { mutableStateOf(contact?.email ?: "") }

    FestivalDialog(
        title = title,
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            if (name.isNotBlank() && familyName.isNotBlank()) {
                onSave(
                    ContactRequest(
                        name = name,
                        familyName = familyName,
                        role = role.ifBlank { null },
                        telephone = telephone.ifBlank { null },
                        email = email.ifBlank { null }
                    )
                )
            }
        }
    ) {
        Column {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Prénom") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = familyName, onValueChange = { familyName = it }, label = { Text("Nom de famille") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = role, onValueChange = { role = it }, label = { Text("Rôle") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = telephone, onValueChange = { telephone = it }, label = { Text("Téléphone") }, modifier = Modifier.fillMaxWidth())
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        }
    }
}
