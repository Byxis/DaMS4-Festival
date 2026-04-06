package fr.ayae.festivals.ui.publisher

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import fr.ayae.festivals.ui.utils.FestivalDialog

@Composable
fun PublisherEditDialog(
    title: String,
    initialName: String = "",
    onDismissRequest: () -> Unit,
    onSave: (name: String) -> Unit
) {
    var name by remember(initialName) { mutableStateOf(initialName) }

    FestivalDialog(
        title = title,
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            if (name.isNotBlank()) {
                onSave(name)
            }
        }
    ) {
        Column {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nom de l'éditeur") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }
    }
}
