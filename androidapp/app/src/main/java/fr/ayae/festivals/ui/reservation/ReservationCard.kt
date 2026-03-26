package fr.ayae.festivals.ui.reservation

import android.content.res.Configuration
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Reservation
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Note
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import fr.ayae.festivals.data.Game
import fr.ayae.festivals.data.GameType
import fr.ayae.festivals.data.ReservationGame
import fr.ayae.festivals.data.ReservationInteraction
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme

enum class ReservationStatus(val label: String, val lightColorHex: Long, val darkColorHex: Long) {
    TO_BE_CONTACTED("À contacter", 0xFFD81C1C, 0xFFF36161),
    CONTACTED("Contacté", 0xFFFB9200, 0xFFF4AF4F),         
    IN_DISCUSSION("En discussion", 0xFFF0E400, 0xFFFFF75E),
    FACTURED("Facturé", 0xFF60FB00, 0xFF9DF567),           
    CONFIRMED("Confirmé", 0xFF009508, 0xFF37F140),         
    ABSENT("Absent", 0xFF757575, 0xFFB7B7B7)               
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReservationCard(
    entityName: String,
    reservation: Reservation,
    modifier: Modifier = Modifier,
    hasLogo: Boolean = false,
    warnings: List<String> = emptyList(),
) {
    var isExpanded by rememberSaveable { mutableStateOf(false) }
    var statusMenuExpanded by rememberSaveable { mutableStateOf(false) }
    var noteText by remember(reservation.note) { mutableStateOf(reservation.note ?: "") }
    
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
                    contentDescription = "Expand",
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
                                .clickable { statusMenuExpanded = true }
                                .padding(horizontal = 12.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = statusOption.label, style = MaterialTheme.typography.labelMedium)
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
                                        text = option.label, 
                                        color = optionColor
                                    ) 
                                },
                                onClick = { statusMenuExpanded = false }
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
                            Checkbox(checked = reservation.presented_by_them == true, onCheckedChange = {})
                            Text("Jeux présentés par l'éditeur / entité", style = MaterialTheme.typography.bodyMedium)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Tables section header
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.TableChart, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Stock de tables", style = MaterialTheme.typography.titleMedium)
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            ReservationStockItem("Tables", Icons.Default.TableBar, reservation.table_count)
                            ReservationStockItem("Grandes Tables", Icons.Default.TableRestaurant, reservation.big_table_count)
                            ReservationStockItem("Tables Municipales", Icons.Default.Desk, reservation.town_table_count)
                            ReservationStockItem("Prises électriques", Icons.Default.Power, reservation.electrical_outlets)
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
                            Text("Notes", style = MaterialTheme.typography.titleMedium)
                        }
                        OutlinedTextField(
                            value = noteText,
                            onValueChange = { noteText = it },
                            label = { Text("Notes") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2,
                            maxLines = 5,
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
                                    name = "Jeu ${it.game_id}", 
                                    type = GameType.UNKNOWN,
                                    minimum_number_of_player = 1, 
                                    maximum_number_of_player = 4
                                ), 
                                it
                            ) 
                        } ?: emptyList()
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
    count: Int
) {
    var value by rememberSaveable { mutableStateOf(count.toString()) }

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
                    if (new.all { it.isDigit() }) value = new
                },
                modifier = Modifier.width(72.dp),
                textStyle = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                ),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number
                ),
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
