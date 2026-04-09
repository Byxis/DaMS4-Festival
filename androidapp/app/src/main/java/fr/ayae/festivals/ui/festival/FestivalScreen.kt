package fr.ayae.festivals.ui.festival

import android.content.res.Configuration
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia
import androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.ImageOnly
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddCircleOutline
import androidx.compose.material.icons.filled.Desk
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.ImageNotSupported
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.TableBar
import androidx.compose.material.icons.filled.TableRestaurant
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.res.stringResource
import fr.ayae.festivals.R
import coil.compose.AsyncImage
import fr.ayae.festivals.data.festivals.Festival
import fr.ayae.festivals.data.reservation.Reservation
import fr.ayae.festivals.data.reservation.ReservationGame
import fr.ayae.festivals.data.reservation.ReservationInteraction
import fr.ayae.festivals.data.reservation.ZoneGame
import fr.ayae.festivals.data.reservation.ZoneTarif
import fr.ayae.festivals.ui.reservation.ReservationCard
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme
import fr.ayae.festivals.ui.utils.DatePickerField
import fr.ayae.festivals.ui.utils.FestivalDialog
import java.text.SimpleDateFormat
import java.util.Locale

import fr.ayae.festivals.data.login.UserRole

@Composable
fun FestivalScreen(
    festivalId: Int = 1,
    viewModel: FestivalViewModel = viewModel(factory = FestivalViewModel.Factory),
    modifier: Modifier = Modifier,
    userRole: UserRole = UserRole.EDITOR
) {
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        viewModel.loadData(context, festivalId)
    }

    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is FestivalUiState.Loading -> {
            Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is FestivalUiState.Error -> {
            Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(stringResource(R.string.home_error_prefix, state.message), color = MaterialTheme.colorScheme.error)
            }
        }
        is FestivalUiState.Success -> {
            FestivalScreenContent(
                data = state.festival,
                reservations = state.reservations,
                isOffline = state.isOffline,
                userRole = userRole,
                onNoteChanged = viewModel::updateReservationNote,
                onStatusChanged = viewModel::updateReservationStatus,
                onFestivalDetailsChanged = viewModel::updateFestivalDetails,
                onSurfaceChanged = viewModel::updateFestivalSurface,
                onPresentedByThemChanged = viewModel::updateReservationPresented,
                onReservationStockChanged = viewModel::updateReservationStock,
                onGameUpdated = { resId, rgId, amt, t, bt, tt, o, fs, st -> viewModel.updateGameInReservation(resId, rgId, amt, t, bt, tt, o, fs, st) },
                onAddEntity = viewModel::addEntityReservation,
                onAddZoneTarif = viewModel::addZoneTarif,
                onEditZoneTarif = viewModel::updateZoneTarif,
                onDeleteZoneTarif = viewModel::deleteZoneTarif,
                onAddGameZone = viewModel::addGameZone,
                onEditGameZone = viewModel::updateGameZone,
                onDeleteGameZone = viewModel::deleteGameZone,
                modifier = modifier
            )
        }
    }
}

/**
 * Stateless content for [FestivalScreen]. All state changes are propagated via callbacks.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FestivalScreenContent(
    data: Festival,
    reservations: List<Pair<String, Reservation>>,
    isOffline: Boolean = false,
    userRole: UserRole = UserRole.EDITOR,
    onNoteChanged: (Int, String) -> Unit = { _, _ -> },
    onStatusChanged: (Int, String) -> Unit = { _, _ -> },
    onFestivalDetailsChanged: (String, String, String, String, Int, Int, Int, Uri?) -> Unit = { _, _, _, _, _, _, _, _ -> },
    onSurfaceChanged: (String, Double) -> Unit = { _, _ -> },
    onPresentedByThemChanged: (Int, Boolean) -> Unit = { _, _ -> },
    onReservationStockChanged: (Int, Int, Int, Int, Int) -> Unit = { _, _, _, _, _ -> },
    onGameUpdated: (reservationId: Int, reservationGameId: Int, amount: Int, tables: Int, bigTables: Int, townTables: Int, outlets: Int, floorSpace: Double, status: String) -> Unit = { _, _, _, _, _, _, _, _, _ -> },
    onAddEntity: (String) -> Unit = {},
    onAddZoneTarif: (String, Double, Double) -> Unit = { _, _, _ -> },
    onEditZoneTarif: (Int, String, Double, Double) -> Unit = { _, _, _, _ -> },
    onDeleteZoneTarif: (Int) -> Unit = {},
    onAddGameZone: (Int, String) -> Unit = { _, _ -> },
    onEditGameZone: (Int, Int, String) -> Unit = { _, _, _ -> },
    onDeleteGameZone: (Int, Int) -> Unit = { _, _ -> },
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    SimpleDateFormat("dd MMM yyyy", Locale.FRANCE)
    
    val context = LocalContext.current
    val customImageLoader = androidx.compose.runtime.remember {
        coil.ImageLoader.Builder(context)
            .okHttpClient { fr.ayae.festivals.data.RetrofitInstance.getSecureClient(context) }
            .build()
    }

    // Derived permission flags (simpler to use locally)
    val canEdit = userRole.canEdit && !isOffline
    val canViewZones = userRole.canViewZones

    // Map zone IDs to their names so Reservations can display them cleanly
    val zoneMap = remember(data.tarif_zones) {
        val map = mutableMapOf<Int, String>()
        data.tarif_zones?.forEach { tz ->
            tz.game_zones?.forEach { gz ->
                map[gz.id] = gz.name
            }
        }
        map
    }

    var showImportEntityDialog by rememberSaveable { mutableStateOf(false) }
    var showAddEntityDialog by rememberSaveable { mutableStateOf(false) }
    var showEditFestivalDialog by rememberSaveable { mutableStateOf(false) }
    var showAddZoneDialog by rememberSaveable { mutableStateOf(false) }
    var editingSurfaceType by rememberSaveable { mutableStateOf<String?>(null) }

    Scaffold { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(24.dp)
        ) {
            if (isOffline) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .background(Color(0xFFB71C1C), shape = RoundedCornerShape(8.dp))
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                Text(
                    text = stringResource(R.string.festival_offline_banner),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                }
            }

            // Section 1: Header
            Column(modifier = Modifier.fillMaxWidth()) {
                Surface(
                    modifier = Modifier.fillMaxWidth().height(150.dp).padding(bottom = 16.dp),
                    shape = MaterialTheme.shapes.medium,
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    if (data.logoUrl != null) {
                        AsyncImage(
                            model = "${fr.ayae.festivals.data.RetrofitInstance.BASE_URL.removeSuffix("/")}${data.logoUrl}",
                            imageLoader = customImageLoader,
                            contentDescription = stringResource(R.string.festival_tab_details),
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.ImageNotSupported,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(stringResource(R.string.festival_no_image), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = data.name,
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    if (canEdit) {
                        IconButton(onClick = { showEditFestivalDialog = true }) {
                            Icon(Icons.Default.Edit, contentDescription = stringResource(R.string.festival_edit_title), tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Event, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(stringResource(R.string.festival_date_label), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                            if (data.start_date != null && data.end_date != null) {
                                Text(
                                    stringResource(R.string.home_date_range, fr.ayae.festivals.ui.homepage.formatIsoDate(data.start_date), fr.ayae.festivals.ui.homepage.formatIsoDate(data.end_date)),
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            } else {
                                Text(stringResource(R.string.festival_dates_undefined), style = MaterialTheme.typography.bodyLarge)
                            }
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(stringResource(R.string.festival_location_title), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
                            data.location?.let { Text(it, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.primary) }
                        }
                    }
                }

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 24.dp),
                    thickness = DividerDefaults.Thickness,
                    color = DividerDefaults.color
                )

                Text(stringResource(R.string.festival_space_title), style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(16.dp))

                val standardReserved = reservations.sumOf { it.second.table_count }
                val bigReserved = reservations.sumOf { it.second.big_table_count }
                val townReserved = reservations.sumOf { it.second.town_table_count }

                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    StockItem(stringResource(R.string.festival_tables_label), Icons.Default.TableBar, standardReserved to (data.table_count ?: 0), data.table_surface?.toString() ?: "4") { if (canEdit) editingSurfaceType = "Tables" }
                    StockItem(stringResource(R.string.festival_big_tables_label), Icons.Default.TableRestaurant, bigReserved to data.big_table_count, data.big_table_surface?.toString() ?: "4") { if (canEdit) editingSurfaceType = "Grandes Tables" }
                    StockItem(stringResource(R.string.festival_town_tables_municipal), Icons.Default.Desk, townReserved to data.town_table_count, data.town_table_surface?.toString() ?: "4") { if (canEdit) editingSurfaceType = "Tables Municipales" }
                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 24.dp),
                thickness = DividerDefaults.Thickness,
                color = DividerDefaults.color
            )

            // Section 2: Zones tarifaires (editor/admin uniquement)
            if (canViewZones) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(stringResource(R.string.festival_zones_title), style = MaterialTheme.typography.titleLarge)
                    if (canEdit) {
                        IconButton(onClick = { showAddZoneDialog = true }) {
                            Icon(Icons.Default.AddCircleOutline, contentDescription = stringResource(R.string.festival_add_zone), tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                ZonesTarifairesList(
                    zones = data.tarif_zones ?: emptyList(),
                    isOffline = !canEdit,
                    onAddGameZone = onAddGameZone,
                    onEditGameZone = onEditGameZone,
                    onDeleteGameZone = onDeleteGameZone,
                    onEditZoneTarif = onEditZoneTarif,
                    onDeleteZoneTarif = onDeleteZoneTarif
                )

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 32.dp),
                    thickness = DividerDefaults.Thickness,
                    color = DividerDefaults.color
                )
            }

            // Section 3: Réservations
            Column(modifier = Modifier.fillMaxWidth()) {
                if (!userRole.isPublisher) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(stringResource(R.string.festival_reservations_title), style = MaterialTheme.typography.titleLarge)
                        IconButton(onClick = { }) {
                            Icon(Icons.AutoMirrored.Filled.Sort, contentDescription = stringResource(R.string.festival_sort_by))
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                }

                val displayedReservations = if (userRole.canViewAllReservations) {
                    reservations
                } else {
                    emptyList()
                    // TODO: filter only for the publisher
                    //reservations.filter { it.second.entity_name == currentUserName }
                }
                displayedReservations.forEach { (entityName, res) ->
                    ReservationCard(
                        entityName = entityName,
                        hasLogo = false,
                        reservation = res,
                        warnings = computeTableWarnings(res),
                        onNoteChanged = { text -> onNoteChanged(res.id, text) },
                        onStatusChanged = { status -> onStatusChanged(res.id, status) },
                        onPresentedByThemChanged = { presented -> onPresentedByThemChanged(res.id, presented) },
                        onStockChanged = { t, bt, tt, o -> onReservationStockChanged(res.id, t, bt, tt, o) },
                        onGameUpdated = { rgId, amt, t, bt, tt, o, fs, st -> onGameUpdated(res.id, rgId, amt, t, bt, tt, o, fs, st) },
                        isOffline = !canEdit,
                        userRole = userRole,
                        zoneMap = zoneMap,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Add/import buttons only for editors and admins
                if (canEdit) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { showAddEntityDialog = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.festival_add_entity))
                        }
                        OutlinedButton(
                            onClick = { showImportEntityDialog = true },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.festival_import_entity))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(80.dp))
        }
    }

    if (showImportEntityDialog) {
        ImportEntityDialog(
            onDismissRequest = { showImportEntityDialog = false },
            onSave = { name ->
                onAddEntity(name)
                showImportEntityDialog = false
            }
        )
    }

    if (showAddEntityDialog) {
        AddEntityDialog(
            onDismissRequest = { showAddEntityDialog = false },
            onSave = { name ->
                onAddEntity(name)
                showAddEntityDialog = false
            }
        )
    }

    if (showEditFestivalDialog) {
        EditFestivalDialog(
            festival = data,
            onDismissRequest = { showEditFestivalDialog = false },
            onSave = { name, location, startDate, endDate, tableCount, bigTableCount, townTableCount, imageUri ->
                onFestivalDetailsChanged(name, location, startDate, endDate, tableCount, bigTableCount, townTableCount, imageUri)
                showEditFestivalDialog = false
            }
        )
    }

    if (showAddZoneDialog) {
        EditZoneTarifDialog(
            zone = null,
            onDismissRequest = { showAddZoneDialog = false },
            onSave = { name, price, outletPrice ->
                onAddZoneTarif(name, price, outletPrice)
                showAddZoneDialog = false
            }
        )
    }

    editingSurfaceType?.let { type ->
        EditSurfaceDialog(
            label = type,
            currentValue = when (type) {
                "Tables"         -> data.table_surface?.toString() ?: "4"
                "Grandes Tables" -> data.big_table_surface?.toString() ?: "4"
                else             -> data.town_table_surface?.toString() ?: "4"
            },
            onDismissRequest = { editingSurfaceType = null },
            onSave = { surface ->
                onSurfaceChanged(type, surface)
                editingSurfaceType = null
            }
        )
    }
}

@Composable
fun AddEntityDialog(
    onDismissRequest: () -> Unit,
    onSave: (name: String) -> Unit
) {
    var nameText by rememberSaveable { mutableStateOf("") }

    FestivalDialog(
        title = "Ajouter une entité",
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(nameText) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                "Entrez le nom de la nouvelle entité à ajouter.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = nameText,
                onValueChange = { nameText = it },
                label = { Text("Nom de l'entité") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun ImportEntityDialog(
    onDismissRequest: () -> Unit,
    onSave: (name: String) -> Unit
) {
    var nameText by rememberSaveable { mutableStateOf("") }

    FestivalDialog(
        title = "Importer une entité",
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(nameText) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                "Rechercher et nommer l'entité à importer.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            OutlinedTextField(
                value = nameText,
                onValueChange = { nameText = it },
                label = { Text("Nom de l'entité") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun EditFestivalDialog(
    festival: Festival,
    onDismissRequest: () -> Unit,
    onSave: (name: String, location: String, startDate: String, endDate: String,
             tableCount: Int, bigTableCount: Int, townTableCount: Int, imageUri: Uri?) -> Unit
) {
    SimpleDateFormat("yyyy-MM-dd", Locale.FRANCE)
    var name by rememberSaveable { mutableStateOf(festival.name) }
    var location by rememberSaveable { mutableStateOf(festival.location ?: "") }
    var startDate by remember { mutableStateOf(festival.start_date?.let { fr.ayae.festivals.ui.homepage.formatIsoDate(it, false) } ?: "") }
    var endDate by remember { mutableStateOf(festival.end_date?.let { fr.ayae.festivals.ui.homepage.formatIsoDate(it, false) } ?: "") }
    var tableCount by rememberSaveable { mutableStateOf(festival.table_count.toString()) }
    var bigTableCount by rememberSaveable { mutableStateOf(festival.big_table_count.toString()) }
    var townTableCount by rememberSaveable { mutableStateOf(festival.town_table_count.toString()) }
    var imageUri by rememberSaveable { mutableStateOf<Uri?>(null) }

    val launcher = rememberLauncherForActivityResult(contract = PickVisualMedia()) { uri ->
        imageUri = uri
    }

    FestivalDialog(
        title = stringResource(R.string.festival_edit_title),
        onDismissRequest = onDismissRequest,
        onSaveRequest = {
            onSave(name, location, startDate, endDate,
                tableCount.toIntOrNull() ?: 0,
                bigTableCount.toIntOrNull() ?: 0,
                townTableCount.toIntOrNull() ?: 0,
                imageUri)
        }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = name, onValueChange = { name = it },
                label = { Text(stringResource(R.string.festival_name_label)) }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(value = location, onValueChange = { location = it },
                label = { Text(stringResource(R.string.festival_location_label)) }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                DatePickerField(label = stringResource(R.string.festival_start_label), value = startDate, modifier = Modifier.weight(1f), onDateSelected = { startDate = it })
                DatePickerField(label = stringResource(R.string.festival_end_label), value = endDate, modifier = Modifier.weight(1f), onDateSelected = { endDate = it })
            }
            HorizontalDivider(Modifier, DividerDefaults.Thickness, DividerDefaults.color)
            Text(stringResource(R.string.festival_stocks_title), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.outline)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = tableCount, onValueChange = { tableCount = it },
                    label = { Text(stringResource(R.string.festival_tables_label)) }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                OutlinedTextField(value = bigTableCount, onValueChange = { bigTableCount = it },
                    label = { Text(stringResource(R.string.festival_big_tables_label)) }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                OutlinedTextField(value = townTableCount, onValueChange = { townTableCount = it },
                    label = { Text(stringResource(R.string.festival_town_tables_label)) }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            }
            HorizontalDivider(
                modifier = Modifier.padding(vertical = 4.dp),
                thickness = DividerDefaults.Thickness,
                color = DividerDefaults.color
            )
            OutlinedButton(
                onClick = { launcher.launch(PickVisualMediaRequest(ImageOnly)) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(if (imageUri != null) stringResource(R.string.festival_image_selected) else stringResource(R.string.festival_image_change))
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
        title = if (zone != null) stringResource(R.string.zone_edit_title) else stringResource(R.string.zone_add_title),
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(name, price.toDoubleOrNull() ?: 0.0, outletPrice.toDoubleOrNull() ?: 0.0) }
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = name, onValueChange = { name = it },
                label = { Text(stringResource(R.string.zone_name_label)) }, modifier = Modifier.fillMaxWidth())
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = price, onValueChange = { price = it },
                    label = { Text(stringResource(R.string.zone_price_label)) }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
                OutlinedTextField(value = outletPrice, onValueChange = { outletPrice = it },
                    label = { Text(stringResource(R.string.zone_outlet_price_label)) }, modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            }
        }
    }
}

@Composable
fun EditSurfaceDialog(
    label: String,
    currentValue: String,
    onDismissRequest: () -> Unit,
    onSave: (surface: Double) -> Unit
) {
    var surface by rememberSaveable { mutableStateOf(currentValue) }

    FestivalDialog(
        title = stringResource(R.string.festival_surface_title, label),
        onDismissRequest = onDismissRequest,
        onSaveRequest = { onSave(surface.toDoubleOrNull() ?: 4.0) }
    ) {
        OutlinedTextField(
            value = surface,
            onValueChange = { surface = it },
            label = { Text(stringResource(R.string.festival_surface_label)) },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
        )
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
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 12.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.width(8.dp))
                Text(label, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
            }

            Spacer(modifier = Modifier.width(8.dp))

            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.clickable { onSurfaceClick() }
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
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

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${stock.first} / ${stock.second}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(stringResource(R.string.festival_reserved_count), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.outline)
            }
        }
    }
}

fun computeTableWarnings(res: Reservation): List<String> {
    var assignedStandard = 0
    var assignedBig = 0
    var assignedTown = 0

    res.games?.forEach { g ->
        assignedStandard += g.table_count
        assignedBig += g.big_table_count
        assignedTown += g.town_table_count
    }

    fun checkStock(reserved: Int, assigned: Int, label: String): String? = when {
        reserved > assigned -> "Toutes les ${label.lowercase()} n'ont pas été attribuées : $assigned/$reserved"
        reserved < assigned -> "Trop de ${label.lowercase()} attribuées : $assigned/$reserved"
        else -> null
    }

    return listOfNotNull(
        checkStock(res.table_count, assignedStandard, "Tables"),
        checkStock(res.big_table_count, assignedBig, "Tables grandes"),
        checkStock(res.town_table_count, assignedTown, "Tables mairies")
    )
}

@Preview(showBackground = true, showSystemUi = true, name = "Light Mode")
@Preview(
    showBackground = true,
    showSystemUi = true,
    uiMode = Configuration.UI_MODE_NIGHT_YES,
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
                numberOutlets = 1,
                electricalOutletPrice = 5.0,
                game_zones = listOf(
                    ZoneGame(id = 1, tarif_zone_id = 1, name = "Jeux de société", reserved_table = 10, reserved_big_table = 2, reserved_town_table = 0, reserved_electrical_outlets = 2, surface_area = 20.0),
                    ZoneGame(id = 2, tarif_zone_id = 1, name = "Figurines", reserved_table = 5, reserved_big_table = 5, reserved_town_table = 0, reserved_electrical_outlets = 1, surface_area = 15.0)
                )
            ),
            ZoneTarif(id = 2, name = "Zone Premium", price = 30.0, numberOutlets = 2, electricalOutletPrice = 10.0, game_zones = emptyList())
        )
        FestivalScreenContent(
            data = Festival(
                id = 1,
                name = "",
                location = "",
                start_date = null,
                end_date = null,
                table_count = 0,
                big_table_count = 0,
                town_table_count = 0,
                table_surface = null,
                big_table_surface = null,
                town_table_surface = null,
                logoUrl = "https://162.38.111.44:4000/api/festivals/1/logo",
                tarif_zones = sampleZones
            ),
            reservations = listOf(
                "Gigamic" to Reservation(
                    id = 1, festival_id = 1, entity_id = 101,
                    table_count = 45, big_table_count = 10, town_table_count = 5, electrical_outlets = 1,
                    status = "CONFIRMED", presented_by_them = true,
                    note = "Besoin d'électricité à proximité.",
                    interactions = listOf(
                        ReservationInteraction(reservation_id = 1, description = "Contrat signé et retourné avec le paiement.", interaction_date = "15/03/2026"),
                        ReservationInteraction(reservation_id = 1, description = "Premier contact par mail.", interaction_date = "01/03/2026")
                    ),
                    games = listOf(
                        ReservationGame(id = 1, reservation_id = 1, game_id = 1, amount = 3, table_count = 1, big_table_count = 0, town_table_count = 0, electrical_outlets = 0, status = "CONFIRMED", zone_id = null, floor_space = null),
                        ReservationGame(id = 2, reservation_id = 1, game_id = 3, amount = 4, table_count = 2, big_table_count = 1, town_table_count = 0, electrical_outlets = 0, status = "RECEIVED", zone_id = 2, floor_space = null)
                    )
                ),
                "Asmodee" to Reservation(
                    id = 2, festival_id = 1, entity_id = 102,
                    table_count = 10, big_table_count = 2, town_table_count = 0, electrical_outlets = 0,
                    status = "TO_BE_CONTACTED", note = "En attente de réponse.", interactions = emptyList()
                )
            )
        )
    }
}
