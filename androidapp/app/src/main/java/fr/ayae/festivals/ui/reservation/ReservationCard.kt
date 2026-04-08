package fr.ayae.festivals.ui.reservation

import android.content.res.Configuration
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Note
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Desk
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.TableBar
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.TableRestaurant
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.res.stringResource
import fr.ayae.festivals.R
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Game
import fr.ayae.festivals.data.GameType
import fr.ayae.festivals.data.Reservation.Reservation
import fr.ayae.festivals.data.Reservation.ReservationGame
import fr.ayae.festivals.data.Reservation.ReservationInteraction
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme

/**
 * Possible statuses for a reservation.
 */
enum class ReservationStatus(val labelRes: Int, val lightColorHex: Long, val darkColorHex: Long) {
    TO_BE_CONTACTED(R.string.reservation_status_to_be_contacted, 0xFFD81C1C, 0xFFF36161),
    CONTACTED(R.string.reservation_status_contacted, 0xFFFB9200, 0xFFF4AF4F),         
    IN_DISCUSSION(R.string.reservation_status_in_discussion, 0xFFF0E400, 0xFFFFF75E),
    FACTURED(R.string.reservation_status_factured, 0xFF60FB00, 0xFF9DF567),           
    CONFIRMED(R.string.reservation_status_confirmed, 0xFF009508, 0xFF37F140),         
    ABSENT(R.string.reservation_status_absent, 0xFF757575, 0xFFB7B7B7)               
}


/**
 * Card displaying all details of a reservation, including interactions and associated games.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReservationCard(
    entityName: String,
    reservation: Reservation,
    modifier: Modifier = Modifier,
    hasLogo: Boolean = false,
    warnings: List<String> = emptyList(),
    onNoteChanged: (String) -> Unit = {},
    onStatusChanged: (String) -> Unit = {},
    onPresentedByThemChanged: (Boolean) -> Unit = {},
    onStockChanged: (Int, Int, Int, Int) -> Unit = { _, _, _, _ -> },
    onGameUpdated: (reservationGameId: Int, amount: Int, tables: Int, bigTables: Int, townTables: Int, outlets: Int, floorSpace: Double, status: String) -> Unit = { _, _, _, _, _, _, _, _ -> },
    isOffline: Boolean = false
) {
    var isExpanded by rememberSaveable { mutableStateOf(false) }
    var statusMenuExpanded by rememberSaveable { mutableStateOf(false) }
    
    val statusOption = try { 
        ReservationStatus.valueOf(reservation.status) 
    } catch(_: Exception) {
        ReservationStatus.TO_BE_CONTACTED 
    }
    
    val isDarkTheme = isSystemInDarkTheme()
    val statusColor = Color(if (isDarkTheme) statusOption.darkColorHex else statusOption.lightColorHex)
    val statusBgColor = statusColor.copy(alpha = 0.2f)

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .animateContentSize(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header Row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isExpanded = !isExpanded }
                    .padding(horizontal = 16.dp, vertical = 24.dp)
            ) {
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                
                Spacer(modifier = Modifier.width(12.dp))

                // Publisher Logo & Name
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        if (hasLogo) {
                            //TODO: load real logo
                            Icon(Icons.Default.Image, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        } else {
                            Icon(Icons.Default.Business, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = entityName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Status Button
                Box {
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = statusBgColor,
                        contentColor = statusColor,
                        border = BorderStroke(1.dp, statusColor)
                    ) {
                        Row(
                            modifier = Modifier
                                .clickable { if (!isOffline) statusMenuExpanded = true }
                                .padding(horizontal = 12.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = stringResource(statusOption.labelRes), style = MaterialTheme.typography.labelMedium)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    }
                    
                    DropdownMenu(
                        expanded = statusMenuExpanded,
                        onDismissRequest = { statusMenuExpanded = false }
                    ) {
                        ReservationStatus.entries.forEach { option ->
                            val optionColor = Color(if (isDarkTheme) option.darkColorHex else option.lightColorHex)
                            DropdownMenuItem(
                                text = { 
                                    Text(
                                        text = stringResource(option.labelRes), 
                                        color = optionColor
                                    ) 
                                },
                                onClick = { 
                                    statusMenuExpanded = false 
                                    onStatusChanged(option.name)
                                }
                            )
                        }
                    }
                }
            }

            // Expanded Details
            AnimatedVisibility(visible = isExpanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Divider(modifier = Modifier.padding(bottom = 4.dp))

                    // Tables & content
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.offset(x = (-12).dp)
                        ) {
                            Checkbox(checked = reservation.presented_by_them == true, onCheckedChange = { if(!isOffline) onPresentedByThemChanged(it) }, enabled = !isOffline)
                            Text(stringResource(R.string.reservation_presented_label), style = MaterialTheme.typography.bodyMedium)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Tables section header
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.TableChart, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.festival_stocks_title), style = MaterialTheme.typography.titleMedium)
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            ReservationStockItem(stringResource(R.string.festival_tables_label), Icons.Default.TableBar, reservation.table_count, isOffline) {
                                onStockChanged(it, reservation.big_table_count, reservation.town_table_count, reservation.electrical_outlets)
                            }
                            ReservationStockItem(stringResource(R.string.festival_big_tables_label), Icons.Default.TableRestaurant, reservation.big_table_count, isOffline) {
                                onStockChanged(reservation.table_count, it, reservation.town_table_count, reservation.electrical_outlets)
                            }
                            ReservationStockItem(stringResource(R.string.festival_town_tables_label), Icons.Default.Desk, reservation.town_table_count, isOffline) {
                                onStockChanged(reservation.table_count, reservation.big_table_count, it, reservation.electrical_outlets)
                            }
                            ReservationStockItem(
                                stringResource(R.string.reservation_outlets_label),
                                Icons.Default.Power,
                                reservation.electrical_outlets,
                                isOffline
                            ) {
                                onStockChanged(reservation.table_count, reservation.big_table_count, reservation.town_table_count, it)
                            }
                        }

                        if (warnings.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            warnings.forEach { warning ->
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(warning, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.AutoMirrored.Filled.Note, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.reservation_note_label), style = MaterialTheme.typography.titleMedium)
                        }
                        OutlinedTextField(
                            value = reservation.note ?: "",
                            onValueChange = onNoteChanged,
                            label = { Text(stringResource(R.string.reservation_note_label)) },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2,
                            maxLines = 5,
                            enabled = !isOffline,
                            textStyle = MaterialTheme.typography.bodyMedium
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        InteractionsList(interactions = reservation.interactions)
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                    
                    GamesReservations(
                        games = reservation.games?.map { 
                            Pair(
                                Game(
                                    id = it.game_id, 
                                    name = it.game_name ?: "Jeu ${it.game_id}", 
                                    type = GameType.UNKNOWN,
                                    minimum_number_of_player = 1, 
                                    maximum_number_of_player = 4
                                ), 
                                it
                            ) 
                        } ?: emptyList(),
                        isOffline = isOffline,
                        onGameUpdated = onGameUpdated
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Light Mode")
@Preview(
    showBackground = true,
    showSystemUi = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Mode"
)
@Composable
fun ReservationCardPreview() {
    AYAEFestivalsTheme {
        Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
            ReservationCard(
                entityName = "Gigamic",
                hasLogo = false,
                reservation = Reservation(
                    festival_id = 1,
                    entity_id = 101,
                    table_count = 2,
                    big_table_count = 0,
                    town_table_count = 0,
                    electrical_outlets = 1,
                    status = "CONFIRMED",
                    presented_by_them = true,
                    note = "Besoin d'électricité à proximité.",
                    interactions = listOf(
                        ReservationInteraction(
                            reservation_id = 1,
                            description = "Contrat signé et retourné avec le paiement.",
                            interaction_date = "15/03/2026"
                        ),
                        ReservationInteraction(
                            reservation_id = 1,
                            description = "Premier contact par mail.",
                            interaction_date = "01/03/2026"
                        )
                    ),
                    games = listOf(
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
                            floor_space = null
                        ),
                        ReservationGame(
                            id = 2,
                            reservation_id = 1,
                            game_id = 2,
                            amount = 1,
                            table_count = 0,
                            big_table_count = 0,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "ASKED",
                            zone_id = null,
                            floor_space = null
                        )
                    )
                ),
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun ReservationStockItem(
    label: String,
    icon: ImageVector,
    count: Int,
    isOffline: Boolean = false,
    onCountChanged: (Int) -> Unit = {}
) {
    var value by remember(count) { mutableStateOf(count.toString()) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(MaterialTheme.colorScheme.surface),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            // Left: Icon and label
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                label,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.weight(1f)
            )
            // Right: Numeric input
            OutlinedTextField(
                value = value,
                onValueChange = { new ->
                    if (new.all { it.isDigit() }) {
                        value = new
                        if (new.isNotEmpty()) {
                            onCountChanged(new.toIntOrNull() ?: 0)
                        } else {
                            onCountChanged(0)
                        }
                    }
                },
                modifier = Modifier.width(72.dp),
                textStyle = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                ),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number
                ),
                enabled = !isOffline,
                singleLine = true,
                shape = MaterialTheme.shapes.small,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                )
            )
        }
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Light Mode")
@Preview(
    showBackground = true,
    showSystemUi = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Mode"
)
@Composable
fun ReservationCardWarningPreview() {
    AYAEFestivalsTheme {
        Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
            ReservationCard(
                entityName = "Asmodee",
                reservation = Reservation(
                    festival_id = 1,
                    entity_id = 102,
                    table_count = 4,
                    big_table_count = 0,
                    town_table_count = 0,
                    electrical_outlets = 0,
                    status = "CONTACTED",
                    note = "En attente de signature du contrat.",
                ),
                warnings = listOf("Attention, pas de contrat signé", "Toutes les tables n'ont pas été attribuées : 2/4"),
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}
