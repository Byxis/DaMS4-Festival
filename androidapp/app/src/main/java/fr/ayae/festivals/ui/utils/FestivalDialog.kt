package fr.ayae.festivals.ui.utils

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * A standard styled [AlertDialog] for the festival application.
 */
@Composable
fun FestivalDialog(
    title: String,
    onDismissRequest: () -> Unit,
    onSaveRequest: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = {
            Text(text = title)
        },
        text = {
            Box(modifier = Modifier.fillMaxWidth()) {
                content()
            }
        },
        confirmButton = {
            Button(onClick = onSaveRequest) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismissRequest) {
                Text("Annuler")
            }
        },
        modifier = modifier
    )
}
