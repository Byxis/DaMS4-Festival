package fr.ayae.festivals.ui.publisher


import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.R
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.ui.components.InfoRow

@Composable
fun ContactList(
    contacts: List<ContactDto>,
    onEditClick: (ContactDto) -> Unit,
    onDeleteClick: (ContactDto) -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = stringResource(R.string.number_of_contacts, contacts.size),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (contacts.isEmpty()) {
            Text(
                stringResource(R.string.no_contact),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            contacts.forEach { contact ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    InfoRow(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Person,
                        label = "${contact.name} ${contact.familyName.uppercase()}",
                        value = contact.role ?: "N/A"
                    )
                    IconButton(onClick = { onEditClick(contact) }) {
                        Icon(Icons.Default.Edit, contentDescription = stringResource(R.string.edit_contact))
                    }
                    IconButton(onClick = { onDeleteClick(contact) }) {
                        Icon(Icons.Default.Delete, contentDescription = stringResource(R.string.delete_contact), tint = MaterialTheme.colorScheme.error)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}