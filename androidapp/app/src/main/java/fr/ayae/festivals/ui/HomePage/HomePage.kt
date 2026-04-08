package fr.ayae.festivals.ui.HomePage

import android.annotation.SuppressLint
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.ImageLoader
import coil.compose.AsyncImage
import fr.ayae.festivals.data.Festival
import fr.ayae.festivals.data.RetrofitInstance
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

@SuppressLint("NotConstructor")
@Composable
fun HomePage(
    festivalViewModel: FestivalViewModel = viewModel(),
    onNavigateToFestival: (Int) -> Unit = {}
) {
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        festivalViewModel.getAllFestivals(context)
    }

    val state by festivalViewModel.state


    var searchQuery by remember { mutableStateOf("") }

    val bgDark = Color(0xFF121416)
    val cyanAccent = Color(0xFF00E5FF)
    val surfaceDark = Color(0xFF1E2124)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgDark)
            .padding(16.dp)
    ) {
        Text(
            text = "Festivals à venir",
            color = Color.White,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )


        OutlinedTextField(
            value = searchQuery,
            onValueChange = { nouvelleRecherche ->
                searchQuery = nouvelleRecherche
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            placeholder = { Text("Rechercher un festival...", color = Color.Gray) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = surfaceDark,
                unfocusedContainerColor = surfaceDark,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = cyanAccent,
                unfocusedBorderColor = Color.Transparent,
                cursorColor = cyanAccent
            )
        )


        when (state) {
            is festivalState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = cyanAccent)
                }
            }

            is festivalState.Empty -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Aucun festival pour le moment.", color = Color(0xFFAAAAAA))
                }
            }

            is festivalState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    val errorMessage = (state as festivalState.Error).message
                    Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
                }
            }

            is festivalState.Success -> {
                val festivals = (state as festivalState.Success).festivals

                val filteredFestivals = festivals.filter { festival ->
                    festival.name.contains(searchQuery, ignoreCase = true)
                }

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {

                    items(filteredFestivals) { festival ->
                        FestivalCard(festival, onNavigateToFestival)
                    }
                }
            }
        }
    }
}
@Composable
fun FestivalCard(festival: Festival, onNavigateToFestival: (Int) -> Unit) {
    val surfaceDark = Color(0xFF1E2124)
    val cyanAccent = Color(0xFF00E5FF)
    val textGray = Color(0xFFAAAAAA)
    val context = LocalContext.current


    val customImageLoader = remember {
        ImageLoader.Builder(context)
            .okHttpClient { RetrofitInstance.getSecureClient(context) }
            .build()
    }

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onNavigateToFestival(festival.id) },
        colors = CardDefaults.cardColors(containerColor = surfaceDark),
        shape = RoundedCornerShape(12.dp)
    ) {
        val baseUrl = fr.ayae.festivals.data.RetrofitInstance.BASE_URL

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {


            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = festival.name,
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                if (!festival.location.isNullOrEmpty()) {
                    Text(
                        text = "📍 ${festival.location}",
                        color = textGray,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val datesText = if (festival.start_date != null && festival.end_date != null) {
                        "Du ${formatIsoDate(festival.start_date!!)} au ${formatIsoDate(festival.end_date!!)}"
                    } else {
                        "Dates à venir"
                    }

                    Text(
                        text = datesText,
                        color = cyanAccent,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }


            if (festival.logoUrl != null) {

                Spacer(modifier = Modifier.width(16.dp))

                AsyncImage(
                    model = "${fr.ayae.festivals.data.RetrofitInstance.BASE_URL.removeSuffix("/")}${festival.logoUrl}",
                    imageLoader = customImageLoader,
                    contentDescription = "Logo de ${festival.name}",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(120.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.DarkGray),
                    onError = { error ->
                        android.util.Log.e("COIL_DEBUG", "Coil n'a pas pu charger l'image : ${error.result.throwable.message}")
                    }
                )
            }
        }
    }
}

fun formatIsoDate(isoString: String, toFrenchFormat: Boolean = true): String {
    try {
        if (isoString.length >= 10) {
            val yyyyMMdd = isoString.take(10)
            if (!toFrenchFormat) return yyyyMMdd
            val parts = yyyyMMdd.split("-")
            if (parts.size == 3) {
                return "${parts[2]}/${parts[1]}/${parts[0]}"
            }
        }
    } catch (e: Exception) {
    }
    return isoString
}