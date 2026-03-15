package fr.ayae.festivals.ui.Navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Login
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.ManageAccounts
import androidx.compose.ui.graphics.vector.ImageVector

enum class Destination(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val contentDescription: String
) {
    Home("home", "Home", Icons.Default.Home, "Home"),
    Administration("administration", "Administration", Icons.Default.ManageAccounts, "Administration"),
    Login("login", "Login", Icons.Default.Login, "Login"),
    Logout("logout", "Logout", Icons.Default.ExitToApp, "Logout"),

}