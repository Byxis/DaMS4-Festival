package fr.ayae.festivals.ui.reservation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Game
import fr.ayae.festivals.data.GameType
import androidx.compose.ui.res.stringResource
import fr.ayae.festivals.R
import fr.ayae.festivals.data.Reservation.ReservationGame
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme
import fr.ayae.festivals.ui.utils.AutoResizedText
import fr.ayae.festivals.ui.utils.FestivalDialog

/**
 * Status options for a game in a reservation.
 */
enum class ReservationGameStatusOption(val labelRes: Int, val lightColorHex: Long, val darkColorHex: Long) {
    ASKED(R.string.reservation_game_status_asked, 0xFFFB9200, 0xFFF4AF4F),         
    CONFIRMED(R.string.reservation_game_status_confirmed, 0xFF009508, 0xFF37F140),         
    RECEIVED(R.string.reservation_game_status_received, 0xFF60FB00, 0xFF9DF567),           
    CANCELLED(R.string.reservation_game_status_cancelled, 0xFFD81C1C, 0xFFF36161)               
}

/**
 * Component displaying a searchable list of games associated with a reservation.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesReservations(
    modifier: Modifier = Modifier,
    games: List<Pair<Game, ReservationGame?>> = emptyList(),
    isOffline: Boolean = false,
    onGameUpdated: (reservationGameId: Int, amount: Int, tables: Int, bigTables: Int, townTables: Int, outlets: Int, floorSpace: Double, status: String) -> Unit = { _, _, _, _, _, _, _, _ -> }
) {
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var showGamesWithNoStatus by rememberSaveable { mutableStateOf(false) }
    var showAddGameDialog by rememberSaveable { mutableStateOf(false) }
    var showManageGamesDialog by rememberSaveable { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth()) {
        // Section header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                Icons.Default.SportsEsports,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                stringResource(R.string.reservation_games_title),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(stringResource(R.string.reservation_game_search_placeholder)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = stringResource(R.string.festival_sort_by)) },
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Checkbox: Show games with no status
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Checkbox(
                checked = showGamesWithNoStatus,
                onCheckedChange = { showGamesWithNoStatus = it }
            )
            Text(
                text = stringResource(R.string.reservation_game_show_no_status),
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { showAddGameDialog = true },
                enabled = !isOffline,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.action_add))
            }
            OutlinedButton(
                onClick = { showManageGamesDialog = true },
                enabled = !isOffline,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.action_edit))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Games list
        val displayedGames = games.filter { (game, reservationGame) ->
            val matchesSearch = game.name.contains(searchQuery, ignoreCase = true)
            val hasStatus = reservationGame?.status?.isNotBlank() == true
            val matchesStatus = if (showGamesWithNoStatus) hasStatus else true
            matchesSearch && matchesStatus
        }

        if (displayedGames.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 32.dp, horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Default.Inbox,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    stringResource(R.string.reservation_game_none_found),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(displayedGames) { (game, reservationGame) ->
                    GameListItem(game = game, reservationGame = reservationGame, isOffline = isOffline, onGameUpdated = onGameUpdated)
                }
            }
        }
    }

    if (showAddGameDialog) {
        FestivalDialog(
            title = stringResource(R.string.reservation_game_add_title),
            onDismissRequest = { showAddGameDialog = false },
            onSaveRequest = { showAddGameDialog = false }
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = "",
                    onValueChange = {},
                    label = { Text(stringResource(R.string.reservation_game_search_placeholder)) },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }

    if (showManageGamesDialog) {
        FestivalDialog(
            title = stringResource(R.string.reservation_game_manage_title),
            onDismissRequest = { showManageGamesDialog = false },
            onSaveRequest = { showManageGamesDialog = false }
        ) {
            Text(stringResource(R.string.reservation_game_manage_desc))
        }
        }
}

/**
 * Individual game item in the [GamesReservations] list.
 */
@Composable
fun GameListItem(
    game: Game,
    reservationGame: ReservationGame?,
    modifier: Modifier = Modifier,
    isOffline: Boolean = false,
    onGameUpdated: (reservationGameId: Int, amount: Int, tables: Int, bigTables: Int, townTables: Int, outlets: Int, floorSpace: Double, status: String) -> Unit = { _, _, _, _, _, _, _, _ -> }
) {
    var showEditQuantitiesDialog by rememberSaveable { mutableStateOf(false) }
    var statusMenuExpanded by rememberSaveable { mutableStateOf(false) }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Logo
            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.size(56.dp)
            ) {
                if (game.logoUrl != null)
                {
                    //TODO: Replace with actual image
                    Icon(
                        imageVector = Icons.Default.Image,
                        contentDescription = "Logo",
                        modifier = Modifier.padding(8.dp),
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
                else
                {
                    Icon(
                        imageVector = Icons.Default.Image,
                        contentDescription = "Logo",
                        modifier = Modifier.padding(8.dp),
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }

            }

            Spacer(modifier = Modifier.width(16.dp))

            // Name + Genre
            val isDarkTheme = androidx.compose.foundation.isSystemInDarkTheme()
            val gameStatusOption = try {
                if (!reservationGame?.status.isNullOrEmpty()) {
                    ReservationGameStatusOption.valueOf(reservationGame.status)
                } else null
            } catch(_: Exception) { null }

            val statusColor = if (gameStatusOption != null) {
                Color(if (isDarkTheme) gameStatusOption.darkColorHex else gameStatusOption.lightColorHex)
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            }
            val statusBgColor = if (gameStatusOption != null) {
                statusColor.copy(alpha = 0.12f)
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            }

            val statusLabel = if (gameStatusOption != null) stringResource(gameStatusOption.labelRes) else stringResource(R.string.reservation_status_undefined)
            Column(modifier = Modifier.weight(1f)) {
                AutoResizedText(
                    text = game.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                AutoResizedText(
                    text = stringResource(game.type.labelRes) + " - " + statusLabel,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF2C6869)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))

            // Edit button
            if (!isOffline) {
                IconButton(onClick = { showEditQuantitiesDialog = true }) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit game quantities",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }

    if (showEditQuantitiesDialog) {
        EditGameQuantitiesDialog(
            game = game,
            reservationGame = reservationGame,
            onDismissRequest = { showEditQuantitiesDialog = false },
            onSave = { amount, tables, bigTables, townTables, outlets, floorSpace, status ->
                showEditQuantitiesDialog = false
                if (reservationGame != null) {
                    onGameUpdated(reservationGame.id, amount, tables, bigTables, townTables, outlets, floorSpace, status)
                }
            }
        )
    }
}

/**
 * Dialog to edit quantities and table allocation for a specific game reservation.
 */
@Composable
fun EditGameQuantitiesDialog(
    game: Game,
    reservationGame: ReservationGame?,
    onDismissRequest: () -> Unit,
    onSave: (amount: Int, tableCount: Int, bigTableCount: Int,
             townTableCount: Int, electricalOutlets: Int, floorSpace: Double, status: String) -> Unit
) {
    var amountText        by rememberSaveable { mutableStateOf(reservationGame?.amount?.toString()            ?: "0") }
    var tableCountText    by rememberSaveable { mutableStateOf(reservationGame?.table_count?.toString()       ?: "0") }
    var bigTableCountText by rememberSaveable { mutableStateOf(reservationGame?.big_table_count?.toString()   ?: "0") }
    var townTableText     by rememberSaveable { mutableStateOf(reservationGame?.town_table_count?.toString()  ?: "0") }
    var outletsText       by rememberSaveable { mutableStateOf(reservationGame?.electrical_outlets?.toString()?: "0") }
    var floorSpaceText    by rememberSaveable { mutableStateOf(reservationGame?.floor_space?.toString()       ?: "0") }
    var status            by rememberSaveable { mutableStateOf(reservationGame?.status ?: "") }
    var statusMenuExpanded by rememberSaveable { mutableStateOf(false) }

    FestivalDialog(
        title = stringResource(R.string.reservation_game_edit_quantities_title, game.name),
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            onSave(
                amountText.toIntOrNull()     ?: 0,
                tableCountText.toIntOrNull() ?: 0,
                bigTableCountText.toIntOrNull() ?: 0,
                townTableText.toIntOrNull()  ?: 0,
                outletsText.toIntOrNull()    ?: 0,
                floorSpaceText.toDoubleOrNull() ?: 0.0,
                status
            )
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = amountText,
                onValueChange = { amountText = it },
                label = { Text(stringResource(R.string.reservation_game_amount_label)) },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            
            // Status Selector
            Text(stringResource(R.string.reservation_game_status_label), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.outline)
            
            Box {
                val gameStatusOption = try { 
                    if (status.isNotBlank()) ReservationGameStatusOption.valueOf(status) else null 
                } catch(_: Exception) { null }
                
                val isDarkTheme = androidx.compose.foundation.isSystemInDarkTheme()
                val statusColor = if (gameStatusOption != null) {
                    Color(if (isDarkTheme) gameStatusOption.darkColorHex else gameStatusOption.lightColorHex)
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                }
                val statusBgColor = if (gameStatusOption != null) {
                    statusColor.copy(alpha = 0.12f)
                } else {
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                }
                
                Surface(
                    onClick = { statusMenuExpanded = true },
                    shape = MaterialTheme.shapes.small,
                    color = statusBgColor,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = if (gameStatusOption != null) stringResource(gameStatusOption.labelRes) else stringResource(R.string.reservation_status_undefined),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = statusColor
                        )
                        Icon(
                            imageVector = Icons.Default.ArrowDropDown,
                            contentDescription = null,
                            tint = statusColor
                        )
                    }
                }
                
                DropdownMenu(
                    expanded = statusMenuExpanded,
                    onDismissRequest = { statusMenuExpanded = false }
                ) {
                    ReservationGameStatusOption.values().forEach { option ->
                        DropdownMenuItem(
                            text = { Text(stringResource(option.labelRes)) },
                            onClick = {
                                status = option.name
                                statusMenuExpanded = false
                            }
                        )
                    }
                }
            }
            Divider()
            Text(stringResource(R.string.reservation_game_tables_allocated), style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.outline)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = tableCountText,
                    onValueChange = { tableCountText = it },
                    label = { Text(stringResource(R.string.reservation_game_standards)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = bigTableCountText,
                    onValueChange = { bigTableCountText = it },
                    label = { Text(stringResource(R.string.festival_big_tables_label)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = townTableText,
                    onValueChange = { townTableText = it },
                    label = { Text(stringResource(R.string.festival_town_tables_label)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = outletsText,
                    onValueChange = { outletsText = it },
                    label = { Text(stringResource(R.string.reservation_game_outlets_short)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = floorSpaceText,
                    onValueChange = { floorSpaceText = it },
                    label = { Text(stringResource(R.string.reservation_game_floor_space)) },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )
            }
        }
    }
}

@Preview(showBackground = true, name = "With games")
@Preview(
    showBackground = true,
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES,
    name = "With games - Dark"
)
@Composable
fun GamesReservationsPreview() {
    AYAEFestivalsTheme {
        Surface(modifier = Modifier.padding(16.dp)) {
            GamesReservations(
                games = listOf(
                    Pair(
                        Game(
                            id = 1,
                            name = "Catan",
                            type = GameType.EXPERTS,
                            minimum_number_of_player = 3,
                            maximum_number_of_player = 4
                        ),
                        ReservationGame(
                            id = 1,
                            reservation_id = 1,
                            game_id = 1,
                            amount = 2,
                            table_count = 1,
                            big_table_count = 0,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "CONFIRMED",
                            zone_id = null,
                            floor_space = 0.0
                        )
                    ),
                    Pair(
                        Game(
                            id = 2,
                            name = "Dixit",
                            type = GameType.PARTY_GAME,
                            minimum_number_of_player = 3,
                            maximum_number_of_player = 6
                        ),
                        null
                    ),
                    Pair(
                        Game(
                            id = 3,
                            name = "Azul",
                            type = GameType.ALL_AUDIENCES,
                            minimum_number_of_player = 2,
                            maximum_number_of_player = 4
                        ),
                        ReservationGame(
                            id = 2,
                            reservation_id = 1,
                            game_id = 3,
                            amount = 1,
                            table_count = 1,
                            big_table_count = 0,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "ASKED",
                            zone_id = null,
                            floor_space = null
                        )
                    ),
                    Pair(
                        Game(
                            id = 4,
                            name = "7 Wonders",
                            type = GameType.INITIATES,
                            minimum_number_of_player = 2,
                            maximum_number_of_player = 7
                        ),
                        ReservationGame(
                            id = 3,
                            reservation_id = 1,
                            game_id = 4,
                            amount = 3,
                            table_count = 2,
                            big_table_count = 0,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "RECEIVED",
                            zone_id = 2,
                            floor_space = null
                        )
                    ),
                    Pair(
                        Game(
                            id = 5,
                            name = "Les Loups-Garous",
                            type = GameType.PARTY_GAME,
                            minimum_number_of_player = 8,
                            maximum_number_of_player = 18
                        ),
                        ReservationGame(
                            id = 4,
                            reservation_id = 1,
                            game_id = 5,
                            amount = 1,
                            table_count = 0,
                            big_table_count = 0,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "",
                            zone_id = null,
                            floor_space = null
                        )
                    )
                )
            )
        }
    }
}
