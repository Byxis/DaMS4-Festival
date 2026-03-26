package fr.ayae.festivals.ui.festival

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.KeyboardType.Companion.Number
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.ui.reservation.ReservationCard
import fr.ayae.festivals.data.Festival
import fr.ayae.festivals.data.Reservation
import fr.ayae.festivals.data.ReservationGame
import fr.ayae.festivals.data.ReservationInteraction
import fr.ayae.festivals.data.ZoneGame
import fr.ayae.festivals.data.ZoneTarif
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme
import fr.ayae.festivals.ui.utils.DatePickerField
import fr.ayae.festivals.ui.utils.FestivalDialog
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FestivalScreen(
    data: Festival,
    reservations: List<Pair<String, Reservation>>,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    var showImportEntityDialog by rememberSaveable { mutableStateOf(false) }
    var showAddEntityDialog by rememberSaveable { mutableStateOf(false) }
    var showEditFestivalDialog by rememberSaveable { mutableStateOf(false) }
    var showAddZoneDialog by rememberSaveable { mutableStateOf(false) }
    var editingSurfaceType by rememberSaveable { mutableStateOf<String?>(null) }

    Scaffold(
        floatingActionButton = {
            Column(horizontalAlignment = Alignment.End) {
                ExtendedFloatingActionButton(
                    onClick = { showImportEntityDialog = true },
                    icon = { Icon(Icons.Default.FileUpload, contentDescription = null) },
                    text = { Text("Importer une entité") },
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                )
                Spacer(modifier = Modifier.height(16.dp))
                ExtendedFloatingActionButton(
                    onClick = { showAddEntityDialog = true },
                    icon = { Icon(Icons.Default.Add, contentDescription = null) },
                    text = { Text("Ajouter une entité") },
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(24.dp)
        ) {
            // SECTION 1: Top Info - Stacked for Mobile
            Column(modifier = Modifier.fillMaxWidth()) {
                
                // Logo Section
                Surface(
                    modifier = Modifier.fillMaxWidth().height(150.dp).padding(bottom = 16.dp),
                    shape = MaterialTheme.shapes.medium,
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        if (data.logoUrl != null) {
                            Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        } else {
                            Icon(Icons.Default.ImageNotSupported, contentDescription = null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Aucune image", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                // Info Section
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = data.name,
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(onClick = { showEditFestivalDialog = true }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Festival", tint = MaterialTheme.colorScheme.primary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Event, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Date :", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                            val format = SimpleDateFormat("dd MMM yyyy", Locale.FRANCE)
                            val dateStr = "${format.format(data.start_date)} - ${format.format(data.end_date)}"
                            Text(dateStr, style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Lieu :", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                            Text(data.location, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                Divider(modifier = Modifier.padding(vertical = 24.dp))

                Text("Espace de table", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))
                
                val standardReserved = reservations.sumOf { it.second.table_count }
                val bigReserved = reservations.sumOf { it.second.big_table_count }
                val townReserved = reservations.sumOf { it.second.town_table_count }

                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    StockItem("Tables", Icons.Default.TableBar, Pair(standardReserved, data.table_count), data.table_surface?.toString() ?: "4", onSurfaceClick = { editingSurfaceType = "Tables" })
                    StockItem("Grandes Tables", Icons.Default.TableRestaurant, Pair(bigReserved, data.big_table_count), data.big_table_surface?.toString() ?: "4", onSurfaceClick = { editingSurfaceType = "Grandes Tables" })
                    StockItem("Tables Municipales", Icons.Default.Desk, Pair(townReserved, data.town_table_count), data.town_table_surface?.toString() ?: "4", onSurfaceClick = { editingSurfaceType = "Tables Municipales" })
                }
            }

            Divider(modifier = Modifier.padding(vertical = 24.dp))

            // SECTION 2: Tarifs & Zones (Placeholder for tarif-zones-list)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Zones tarifaires", style = MaterialTheme.typography.titleLarge)
                IconButton(onClick = { showAddZoneDialog = true }) {
                    Icon(Icons.Default.AddCircleOutline, contentDescription = "Ajouter une zone", tint = MaterialTheme.colorScheme.primary)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            ZonesTarifairesList(zones = data.tarif_zones ?: emptyList())

            Divider(modifier = Modifier.padding(vertical = 32.dp))

            // SECTION 3: Reservations
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Réservation", style = MaterialTheme.typography.titleLarge)

                    IconButton(onClick = { /*TODO*/ }) {
                        Icon(Icons.Default.Sort, contentDescription = "Trier par")
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                reservations.forEach { (publisherName, res) ->
                    ReservationCard(
                        entityName = publisherName,
                        hasLogo = false,
                        reservation = res,
                        warnings = emptyList(),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(80.dp))
        }
    }

    if (showImportEntityDialog) {
        AddReservationDialog(
            onDismissRequest = { showImportEntityDialog = false },
            onSave = { entityId ->
                showImportEntityDialog = false
            }
        )
    }

    if (showAddEntityDialog) {
        AddReservationDialog(
            onDismissRequest = { showAddEntityDialog = false },
            onSave = { entityId ->
                showAddEntityDialog = false
            }
        )
    }

    if (showEditFestivalDialog) {
        EditFestivalDialog(
            festival = data,
            onDismissRequest = { showEditFestivalDialog = false },
            onSave = { name, location, startDate, endDate,
                       tableCount, bigTableCount, townTableCount ->
                showEditFestivalDialog = false
            }
        )
    }

    if (showAddZoneDialog) {
        EditZoneTarifDialog(
            zone = null,
            onDismissRequest = { showAddZoneDialog = false },
            onSave = { name, price, electricalOutletPrice ->
                showAddZoneDialog = false
            }
        )
    }

    editingSurfaceType?.let { type ->
        EditSurfaceDialog(
            label = type,
            currentValue = when (type) {
                "Tables"           -> data.table_surface?.toString() ?: "4"
                "Grandes Tables"   -> data.big_table_surface?.toString() ?: "4"
                else               -> data.town_table_surface?.toString() ?: "4"
            },
            onDismissRequest = { editingSurfaceType = null },
            onSave = { surface ->
                editingSurfaceType = null
            }
        )
    }
}

@Composable
fun AddReservationDialog(
    onDismissRequest: () -> Unit,
    onSave: (entityId: Int) -> Unit
) {
    var entityIdText by rememberSaveable { mutableStateOf("") }

    FestivalDialog(
        title = "Ajouter une réservation",
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(entityIdText.toIntOrNull() ?: 0) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                "Entrez l'identifiant de l'entité (éditeur / association).",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = entityIdText,
                onValueChange = { entityIdText = it },
                label = { Text("ID de l'entité") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = Number)
            )
        }
    }
}

@Composable
fun EditFestivalDialog(
    festival: Festival,
    onDismissRequest: () -> Unit,
    onSave: (name: String, location: String, startDate: String, endDate: String,
             tableCount: Int, bigTableCount: Int, townTableCount: Int) -> Unit
) {
    val fmt = SimpleDateFormat("yyyy-MM-dd", java.util.Locale.FRANCE)
    var name by rememberSaveable { mutableStateOf(festival.name) }
    var location by rememberSaveable { mutableStateOf(festival.location) }
    var startDate by rememberSaveable { mutableStateOf(fmt.format(festival.start_date)) }
    var endDate by rememberSaveable { mutableStateOf(fmt.format(festival.end_date)) }
    var tableCount by rememberSaveable { mutableStateOf(festival.table_count.toString()) }
    var bigTableCount by rememberSaveable { mutableStateOf(festival.big_table_count.toString()) }
    var townTableCount by rememberSaveable { mutableStateOf(festival.town_table_count.toString()) }

    FestivalDialog(
        title = "Modifier le festival",
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            onSave(name, location, startDate, endDate,
                tableCount.toIntOrNull() ?: 0,
                bigTableCount.toIntOrNull() ?: 0,
                townTableCount.toIntOrNull() ?: 0)
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = name, onValueChange = { name = it },
                label = { Text("Nom du festival") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = location, onValueChange = { location = it },
                label = { Text("Lieu") }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                DatePickerField(
                    label = "Début",
                    value = startDate,
                    modifier = Modifier.weight(1f),
                    onDateSelected = { startDate = it }
                )
                DatePickerField(
                    label = "Fin",
                    value = endDate,
                    modifier = Modifier.weight(1f),
                    onDateSelected = { endDate = it }
                )
            }
            Divider()
            Text("Stocks de tables", style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.outline)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = tableCount, onValueChange = { tableCount = it },
                    label = { Text("Tables") }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = Number))
                OutlinedTextField(value = bigTableCount, onValueChange = { bigTableCount = it },
                    label = { Text("Grandes") }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = Number))
                OutlinedTextField(value = townTableCount, onValueChange = { townTableCount = it },
                    label = { Text("Mairies") }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = Number))
            }
        }
    }
}

@Composable
fun EditZoneTarifDialog(
    zone: ZoneTarif?,
    onDismissRequest: () -> Unit,
    onSave: (name: String, price: Double, electricalOutletPrice: Double) -> Unit
) {
    var name by rememberSaveable { mutableStateOf(zone?.name ?: "") }
    var price by rememberSaveable { mutableStateOf(zone?.price?.toString() ?: "0") }
    var outletPrice by rememberSaveable { mutableStateOf(zone?.electricalOutletPrice?.toString() ?: "0") }

    FestivalDialog(
        title = if (zone != null) "Modifier la zone tarifaire" else "Ajouter une zone tarifaire",
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            onSave(name, price.toDoubleOrNull() ?: 0.0, outletPrice.toDoubleOrNull() ?: 0.0)
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = name, onValueChange = { name = it },
                label = { Text("Nom de la zone") }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = price, onValueChange = { price = it },
                    label = { Text("Prix (€)") }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
                OutlinedTextField(value = outletPrice, onValueChange = { outletPrice = it },
                    label = { Text("Forfait prise (€)") }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            }
        }
    }
}

// ── Dialog: Modifier la surface d'un type de table ───────────────────────────
@Composable
fun EditSurfaceDialog(
    label: String,
    currentValue: String,
    onDismissRequest: () -> Unit,
    onSave: (surface: Double) -> Unit
) {
    var surface by rememberSaveable { mutableStateOf(currentValue) }

    FestivalDialog(
        title = "Surface – $label",
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(surface.toDoubleOrNull() ?: 4.0) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = surface,
                onValueChange = { surface = it },
                label = { Text("Surface par table (m²)") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
            )
        }
    }
}

@Composable
fun StockItem(
    label: String, 
    icon: ImageVector,
    stock: Pair<Int, Int>,
    surface: String,
    onSurfaceClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 12.dp)
        ) {
            // Left: Icon and Label
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                Text(label, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            // Middle: Surface
            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.clickable { onSurfaceClick() }
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 8.dp)
                ) {
                    Text(
                        text = "$surface m²",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        Icons.Default.Edit, 
                        contentDescription = "Modifier la surface", 
                        modifier = Modifier.size(14.dp), 
                        tint = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Right: Count
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    "${stock.first} / ${stock.second}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    "réservées",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.outline
                )
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true, name = "Light Mode")
@Preview(
    showBackground = true,
    showSystemUi = true,
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Mode"
)
@Composable
fun FestivalScreenPreview() {
    AYAEFestivalsTheme {
        val sampleZones = listOf(
            ZoneTarif(
                id = 1,
                name = "Zone Standard",
                price = 15.0,
                electricalOutlet = 1,
                electricalOutletPrice = 5.0,
                game_zones = listOf(
                    ZoneGame(
                        id = 1,
                        tarif_zone_id = 1,
                        name = "Jeux de société",
                        reserved_table = 10,
                        reserved_big_table = 2,
                        reserved_town_table = 0,
                        reserved_electrical_outlets = 2,
                        surface_area = 20.0
                    ),
                    ZoneGame(
                        id = 2,
                        tarif_zone_id = 1,
                        name = "Figurines",
                        reserved_table = 5,
                        reserved_big_table = 5,
                        reserved_town_table = 0,
                        reserved_electrical_outlets = 1,
                        surface_area = 15.0
                    )
                )
            ),
            ZoneTarif(
                id = 2,
                name = "Zone Premium",
                price = 30.0,
                electricalOutlet = 2,
                electricalOutletPrice = 10.0,
                game_zones = emptyList()
            )
        )
        FestivalScreen(
            data = Festival(
                id = 1,
                name = "Festival des Jeux 2026",
                location = "Salle des Fêtes, Paris",
                start_date = java.util.Date(),
                end_date = java.util.Date(),
                table_count = 100,
                big_table_count = 20,
                town_table_count = 5,
                table_surface = null,
                big_table_surface = null,
                town_table_surface = null,
                logoUrl = "https://162.38.111.44:4000/api/festivals/1/logo",
                tarif_zones = sampleZones,
            ),
            reservations = listOf(
                "Gigamic" to Reservation(
                    id = 1,
                    festival_id = 1,
                    entity_id = 101,
                    table_count = 45,
                    big_table_count = 10,
                    town_table_count = 5,
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
                        ),
                        ReservationInteraction(
                            reservation_id = 1,
                            description = "Premier contact par mail.",
                            interaction_date = "01/03/2026"
                        ),
                        ReservationInteraction(
                            reservation_id = 1,
                            description = "Premier contact par mail.",
                            interaction_date = "01/03/2026"
                        ),
                        ReservationInteraction(
                            reservation_id = 1,
                            description = "Premier contact par mail.",
                            interaction_date = "01/03/2026"
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
                            amount = 3,
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
                            game_id = 3,
                            amount = 4,
                            table_count = 2,
                            big_table_count = 1,
                            town_table_count = 0,
                            electrical_outlets = 0,
                            status = "RECEIVED",
                            zone_id = 2,
                            floor_space = null
                        )
                    )
                ),
                "Asmodee" to Reservation(
                    id = 2,
                    festival_id = 1,
                    entity_id = 102,
                    table_count = 10,
                    big_table_count = 2,
                    town_table_count = 0,
                    electrical_outlets = 0,
                    status = "TO_BE_CONTACTED",
                    note = "En attente de réponse.",
                    interactions = emptyList()
                )
            )
        )
    }
}
