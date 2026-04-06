package fr.ayae.festivals.ui.publisher


import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.ui.components.InfoRow

@Composable
fun ContactList(contacts: List<ContactDto>) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Text(
            text = "Contacts (${contacts.size})",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))

        if (contacts.isEmpty()) {
            Text(
                "Aucun contact disponible.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        } else {
            contacts.forEach { contact ->
                InfoRow(
                    icon = Icons.Default.Person,
                    label = "${contact.name} ${contact.familyName.uppercase()}",
                    value = contact.role ?: "N/A"
                )
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}