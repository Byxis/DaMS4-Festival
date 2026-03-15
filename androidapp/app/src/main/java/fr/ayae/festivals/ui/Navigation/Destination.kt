package fr.ayae.festivals.ui.Navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Login
import androidx.compose.ui.graphics.vector.ImageVector

enum class Destination(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val contentDescription: String
) {
    Home("songs", "Songs", Icons.Default.Home, "Home"),
    Login("album", "Album", Icons.Default.Login, "Login"),

}