package fr.ayae.festivals.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Boy
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Login
import androidx.compose.material.icons.filled.ManageAccounts
import androidx.compose.ui.graphics.vector.ImageVector

enum class Destination(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val contentDescription: String
) {
    Home("home", "Home", Icons.Default.Home, "Home"),
    Publisher("publisher", "Editeurs", Icons.Default.Boy, "Publishers"),
    Administration("administration", "Administration", Icons.Default.ManageAccounts, "Administration"),
    Login("login", "Login", Icons.Default.Login, "Login"),
    Register("register", "Register", Icons.Default.Login, "Register"),
    Profile("profile", "Profile", Icons.Default.ManageAccounts, "Profile"),

}