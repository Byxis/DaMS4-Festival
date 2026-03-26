package fr.ayae.festivals.ui.reservation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Game
import fr.ayae.festivals.data.ReservationGame
import fr.ayae.festivals.ui.utils.FestivalDialog
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.input.KeyboardType
import fr.ayae.festivals.data.GameType
import fr.ayae.festivals.ui.utils.AutoResizedText

enum class ReservationGameStatusOption(val label: String, val lightColorHex: Long, val darkColorHex: Long) {
    ASKED("Demandé", 0xFFFB9200, 0xFFF4AF4F),         
    CONFIRMED("Confirmé", 0xFF009508, 0xFF37F140),         
    RECEIVED("Reçu", 0xFF60FB00, 0xFF9DF567),           
    CANCELLED("Annulé", 0xFFD81C1C, 0xFFF36161)               
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GamesReservations(
    modifier: Modifier = Modifier,
    games: List<Pair<Game, ReservationGame?>> = emptyList()
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
                "Jeux",
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
            placeholder = { Text("Rechercher un jeu...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Rechercher") },
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
                text = "Afficher les jeux sans statut",
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
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Ajouter")
            }
            OutlinedButton(
                onClick = { showManageGamesDialog = true },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Gérer")
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
                    "Aucun jeu trouvé",
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
                    GameListItem(game = game, reservationGame = reservationGame)
                }
            }
        }
    }

    if (showAddGameDialog) {
        FestivalDialog(
            title = "Ajouter un jeu",
            onDismissRequest = { showAddGameDialog = false },
            onSaveRequest = { showAddGameDialog = false }
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = "",
                    onValueChange = {},
                    label = { Text("Rechercher un jeu à ajouter") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }

    if (showManageGamesDialog) {
        FestivalDialog(
            title = "Gérer les jeux",
            onDismissRequest = { showManageGamesDialog = false },
            onSaveRequest = { showManageGamesDialog = false }
        ) {
            Text("Interface de gestion par lots de l'ensemble des jeux demandés.")
        }
    }
}

@Composable
fun GameListItem(
    game: Game,
    reservationGame: ReservationGame?,
    modifier: Modifier = Modifier
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

            val statusLabel = gameStatusOption?.label ?: "Non défini"
            Column(modifier = Modifier.weight(1f)) {
                AutoResizedText(
                    text = game.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                AutoResizedText(
                    text = game.type.label + " - " + statusLabel,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF2C6869)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))

            // Edit button
            IconButton(onClick = { showEditQuantitiesDialog = true }) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Edit game quantities",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }

    if (showEditQuantitiesDialog) {
        EditGameQuantitiesDialog(
            game = game,
            reservationGame = reservationGame,
            onDismissRequest = { showEditQuantitiesDialog = false },
            onSave = { amount, tables, bigTables, townTables, outlets, floorSpace ->
                showEditQuantitiesDialog = false
            }
        )
    }
}

@Composable
fun EditGameQuantitiesDialog(
    game: Game,
    reservationGame: ReservationGame?,
    onDismissRequest: () -> Unit,
    onSave: (amount: Int, tableCount: Int, bigTableCount: Int,
             townTableCount: Int, electricalOutlets: Int, floorSpace: Double) -> Unit
) {
    var amountText        by rememberSaveable { mutableStateOf(reservationGame?.amount?.toString()            ?: "0") }
    var tableCountText    by rememberSaveable { mutableStateOf(reservationGame?.table_count?.toString()       ?: "0") }
    var bigTableCountText by rememberSaveable { mutableStateOf(reservationGame?.big_table_count?.toString()   ?: "0") }
    var townTableText     by rememberSaveable { mutableStateOf(reservationGame?.town_table_count?.toString()  ?: "0") }
    var outletsText       by rememberSaveable { mutableStateOf(reservationGame?.electrical_outlets?.toString()?: "0") }
    var floorSpaceText    by rememberSaveable { mutableStateOf(reservationGame?.floor_space?.toString()       ?: "0") }

    FestivalDialog(
        title = "Modifier les quantités – ${game.name}",
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            onSave(
                amountText.toIntOrNull()     ?: 0,
                tableCountText.toIntOrNull() ?: 0,
                bigTableCountText.toIntOrNull() ?: 0,
                townTableText.toIntOrNull()  ?: 0,
                outletsText.toIntOrNull()    ?: 0,
                floorSpaceText.toDoubleOrNull() ?: 0.0
            )
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = amountText,
                onValueChange = { amountText = it },
                label = { Text("Quantité d'exemplaires") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            Divider()
            Text("Tables allouées", style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.outline)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = tableCountText,
                    onValueChange = { tableCountText = it },
                    label = { Text("Standards") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = bigTableCountText,
                    onValueChange = { bigTableCountText = it },
                    label = { Text("Grandes") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = townTableText,
                    onValueChange = { townTableText = it },
                    label = { Text("Mairies") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = outletsText,
                    onValueChange = { outletsText = it },
                    label = { Text("Prises élec.") },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                OutlinedTextField(
                    value = floorSpaceText,
                    onValueChange = { floorSpaceText = it },
                    label = { Text("Sol (m²)") },
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
    fr.ayae.festivals.ui.theme.AYAEFestivalsTheme {
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
