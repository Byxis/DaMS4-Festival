package fr.ayae.festivals.ui.festival

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddCircleOutline
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.PlaylistAdd
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.ZoneGame
import fr.ayae.festivals.data.ZoneTarif
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme
import fr.ayae.festivals.ui.utils.FestivalDialog
import java.util.Locale

/**
 * A list of tarif zones with their associated game zones.
 */
@Composable
fun ZonesTarifairesList(
    zones: List<ZoneTarif>,
    onAddGameZone: (Int, String) -> Unit = { _, _ -> },
    onEditGameZone: (Int, Int, String) -> Unit = { _, _, _ -> },
    onDeleteGameZone: (Int, Int) -> Unit = { _, _ -> },
    onEditZoneTarif: (Int, String, Double, Double) -> Unit = { _, _, _, _ -> },
    onDeleteZoneTarif: (Int) -> Unit = { _ -> },
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        if (zones.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth().height(100.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.PlaylistAdd, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Aucune zone tarifaire disponible.", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
                }
            }
        } else {
            zones.forEach { zone ->
                ZoneTarifCard(
                    zone = zone, 
                    onAddGameZone = onAddGameZone,
                    onEditGameZone = onEditGameZone,
                    onDeleteGameZone = onDeleteGameZone,
                    onEditZoneTarif = onEditZoneTarif,
                    onDeleteZoneTarif = onDeleteZoneTarif
                )
            }
        }
    }
}

/**
 * Card representing a single [ZoneTarif] and its game zones.
 */
@Composable
fun ZoneTarifCard(
    zone: ZoneTarif,
    onAddGameZone: (Int, String) -> Unit = { _, _ -> },
    onEditGameZone: (Int, Int, String) -> Unit = { _, _, _ -> },
    onDeleteGameZone: (Int, Int) -> Unit = { _, _ -> },
    onEditZoneTarif: (Int, String, Double, Double) -> Unit = { _, _, _, _ -> },
    onDeleteZoneTarif: (Int) -> Unit = { _ -> },
    modifier: Modifier = Modifier
) {
    var expanded by rememberSaveable { mutableStateOf(false) }
    var showEditZoneDialog by rememberSaveable { mutableStateOf(false) }
    var showDeleteZoneDialog by rememberSaveable { mutableStateOf(false) }
    var showAddGameZoneDialog by rememberSaveable { mutableStateOf(false) }
    var editingGameZone by rememberSaveable { mutableStateOf<ZoneGame?>(null) }
    var deletingGameZone by rememberSaveable { mutableStateOf<ZoneGame?>(null) }
    
    val gameZones = zone.game_zones ?: emptyList()
    val totalTables = gameZones.sumOf { it.reserved_table }
    val totalBigTables = gameZones.sumOf { it.reserved_big_table }
    val totalTownTables = gameZones.sumOf { it.reserved_town_table }
    val totalSurface = gameZones.sumOf { it.surface_area }
    val gameZonesCount = gameZones.size

    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Header Row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded }
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = zone.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                
                // Right side: Price
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = MaterialTheme.colorScheme.primaryContainer,
                ) {
                    Text(
                        text = "${zone.price} €",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(4.dp))
                
                Row {
                    IconButton(onClick = { showEditZoneDialog = true }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick = { showDeleteZoneDialog = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
            
            // Expanded Content
            AnimatedVisibility(visible = expanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Divider(modifier = Modifier.padding(bottom = 8.dp))
                    
                    Row(modifier = Modifier.fillMaxWidth()) {
                        InfoItem(label = "Surface", value = String.format(Locale.FRANCE, "%.1f m²", totalSurface), modifier = Modifier.weight(1f))
                        InfoItem(label = "Forfait Prise", value = "${zone.electricalOutletPrice} €", modifier = Modifier.weight(1f))
                    }
                    
                    Row(modifier = Modifier.fillMaxWidth()) {
                        InfoItem(label = "Tables", value = "$totalTables", modifier = Modifier.weight(1f))
                        InfoItem(label = "Grandes Tables", value = "$totalBigTables", modifier = Modifier.weight(1f))
                        InfoItem(label = "Tables Mairies", value = "$totalTownTables", modifier = Modifier.weight(1f))
                    }
                    
                    if (gameZones.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Zones de jeu", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                            IconButton(onClick = { showAddGameZoneDialog = true }, modifier = Modifier.size(24.dp)) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = "Add Game Zone", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                            }
                        }
                        gameZones.forEach { gz ->
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                shape = MaterialTheme.shapes.small,
                                color = MaterialTheme.colorScheme.surface
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.SportsEsports, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(gz.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                                    Text(String.format(Locale.FRANCE, "%.1f m²", gz.surface_area), style = MaterialTheme.typography.labelMedium)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    IconButton(onClick = { editingGameZone = gz }, modifier = Modifier.size(24.dp)) {
                                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(16.dp))
                                    }
                                    IconButton(onClick = { deletingGameZone = gz }, modifier = Modifier.size(24.dp)) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    } else {
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = { showAddGameZoneDialog = true },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Ajouter une zone de jeu")
                        }
                    }
                }
            }
        }
    }

    // ── Edit zone tarifaire (reuses shared dialog) ──────────────────────────
    if (showEditZoneDialog) {
        EditZoneTarifDialog(
            zone = zone,
            onDismissRequest = { showEditZoneDialog = false },
            onSave = { name, price, outletPrice ->
                onEditZoneTarif(zone.id ?: 0, name, price, outletPrice)
                showEditZoneDialog = false
            }
        )
    }

    // ── Delete zone tarifaire ───────────────────────────────────────────────
    if (showDeleteZoneDialog) {
        FestivalDialog(
            title = "Supprimer la zone",
            onDismissRequest = { showDeleteZoneDialog = false },
            onSaveRequest = {
                onDeleteZoneTarif(zone.id ?: 0)
                showDeleteZoneDialog = false
            }
        ) {
            Text("Voulez-vous vraiment supprimer la zone \"${zone.name}\" ?")
        }
    }

    // ── Add game zone ───────────────────────────────────────────────────────
    if (showAddGameZoneDialog) {
        EditGameZoneDialog(
            gameZone = null,
            onDismissRequest = { showAddGameZoneDialog = false },
            onSave = { name ->
                onAddGameZone(zone.id ?: 0, name)
                showAddGameZoneDialog = false
            }
        )
    }

    // ── Edit game zone ──────────────────────────────────────────────────────
    editingGameZone?.let { gz ->
        EditGameZoneDialog(
            gameZone = gz,
            onDismissRequest = { editingGameZone = null },
            onSave = { name ->
                onEditGameZone(zone.id ?: 0, gz.id ?: 0, name)
                editingGameZone = null
            }
        )
    }

    // ── Delete game zone ────────────────────────────────────────────────────
    deletingGameZone?.let { gz ->
        FestivalDialog(
            title = "Supprimer la zone de jeu",
            onDismissRequest = { deletingGameZone = null },
            onSaveRequest = {
                onDeleteGameZone(zone.id ?: 0, gz.id ?: 0)
                deletingGameZone = null
            }
        ) {
            Text("Voulez-vous vraiment supprimer la zone de jeu \"${gz.name}\" ?")
        }
    }
}

@Composable
fun InfoItem(label: String, value: String, modifier: Modifier = Modifier) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = modifier) {
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
        Text(text = value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
    }
}

// ── Dialog: Ajouter / Modifier une zone de jeu ───────────────────────────────
// Note: the backend only accepts `name` for game-zones (reserved_table etc. are
// always initialised to 0 — same behaviour as the Angular frontend).
@Composable
fun EditGameZoneDialog(
    gameZone: ZoneGame?,          // null = create, non-null = edit
    onDismissRequest: () -> Unit,
    onSave: (name: String) -> Unit
) {
    var name by rememberSaveable { mutableStateOf(gameZone?.name ?: "") }

    FestivalDialog(
        title = if (gameZone != null) "Modifier la zone de jeu" else "Ajouter une zone de jeu",
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(name) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nom de la sous-zone de jeu") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }
    }
}

@Preview(showBackground = true, name = "Light Mode")
@Preview(
    showBackground = true,
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES,
    name = "Dark Mode"
)
@Composable
fun ZonesTarifairesListPreview() {
    val sampleZones = listOf(
        ZoneTarif(
            id = 1,
            name = "Zone Standard",
            price = 15.0,
            electricalOutlet = 1,
            electricalOutletPrice = 5.0,
            game_zones = listOf(
                ZoneGame(id = 1, tarif_zone_id = 1, name = "Jeux de société", reserved_table = 10, reserved_big_table = 2, reserved_town_table = 0, reserved_electrical_outlets = 2, surface_area = 20.0),
                ZoneGame(id = 2, tarif_zone_id = 1, name = "Figurines", reserved_table = 5, reserved_big_table = 5, reserved_town_table = 0, reserved_electrical_outlets = 1, surface_area = 15.0)
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

    AYAEFestivalsTheme {
        Surface(modifier = Modifier.padding(16.dp)) {
            ZonesTarifairesList(zones = sampleZones)
        }
    }
}
