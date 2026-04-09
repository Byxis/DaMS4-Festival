package fr.ayae.festivals.ui.publisher

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.R
import fr.ayae.festivals.data.game.GameCreationRequest
import fr.ayae.festivals.ui.utils.FestivalDialog

@Composable
fun GameAddDialog(
    publisherId: Int,
    onDismissRequest: () -> Unit,
    onSave: (GameCreationRequest) -> Unit
) {
    var name by rememberSaveable { mutableStateOf("") }
    var type by rememberSaveable { mutableStateOf("") }
    var minPlayers by rememberSaveable { mutableStateOf("") }
    var maxPlayers by rememberSaveable { mutableStateOf("") }

    FestivalDialog(
        title = stringResource(R.string.game_add),
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            if (name.isNotBlank()) {
                val request = GameCreationRequest(
                    name = name,
                    publisherId = publisherId,
                    type = type,
                    minPlayers = minPlayers.toIntOrNull(),
                    maxPlayers = maxPlayers.toIntOrNull()
                )
                onSave(request)
            }
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.game_name_required)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = type,
                onValueChange = { type = it },
                label = { Text(stringResource(R.string.game_type)) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = minPlayers,
                    onValueChange = { minPlayers = it },
                    label = { Text(stringResource(R.string.min_players)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = maxPlayers,
                    onValueChange = { maxPlayers = it },
                    label = { Text(stringResource(R.string.max_players)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
        }
    }
}
