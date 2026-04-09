package fr.ayae.festivals

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import fr.ayae.festivals.ui.festival.FestivalScreen
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.ui.login.AutoLoginState
import fr.ayae.festivals.ui.login.AutoLoginViewModel
import fr.ayae.festivals.ui.login.LoginViewModel
import fr.ayae.festivals.ui.administration.AdministrationPage
import fr.ayae.festivals.ui.homepage.HomePage
import fr.ayae.festivals.ui.login.LoginScreen
import fr.ayae.festivals.ui.navigation.Destination
import fr.ayae.festivals.ui.profile.ProfilePage
import fr.ayae.festivals.ui.register.RegisterScreen
import fr.ayae.festivals.ui.guest.GuestScreen
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme
import fr.ayae.festivals.ui.publisher.PublisherScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AYAEFestivalsTheme {
                AYAEFestivalsApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AYAEFestivalsApp() {
    val backStack = remember { mutableStateListOf<Any>(Destination.Login) }
    val showBackstack = false
    val loginViewModel: LoginViewModel = viewModel()
    val autoLoginViewModel: AutoLoginViewModel = viewModel()
    val user = loginViewModel.userProfile
    val role = loginViewModel.userRole
    val context = LocalContext.current

    // Observe auto-login state
    val autoLoginState by autoLoginViewModel.state.collectAsState()

    LaunchedEffect(Unit) {
        autoLoginViewModel.checkSession(context)
    }

    LaunchedEffect(autoLoginState) {
        when (autoLoginState) {
            is AutoLoginState.GoHome -> {
                loginViewModel.loadUserProfile(context)
                if (loginViewModel.userProfile != null) {
                    backStack.clear()
                    backStack.add(Destination.Home)
                } else {
                    // Profile loading failed (bad token) -> back to login
                    backStack.clear()
                    backStack.add(Destination.Login)
                }
            }
            is AutoLoginState.GoLogin -> {
                backStack.clear()
                backStack.add(Destination.Login)
            }
            is AutoLoginState.Loading -> { /* wait */ }
        }
    }

    // If role is guest, always redirect to Guest screen
    // (stays on Guest even if they somehow navigate away)
    LaunchedEffect(role) {
        if (role.isGuest && backStack.last() == Destination.Home) {
            // No push — the routing when block below handles it
        }
    }

    val navigateBack = {
        if (backStack.size > 1) {
            backStack.removeAt(backStack.size - 1)
        }
    }

    Scaffold(
        bottomBar = {
            BottomAppBar(
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.primary,
            ) {
                val isAuthScreen = backStack.last() == Destination.Login || backStack.last() == Destination.Register
                val isGuestScreen = role.isGuest
                if (!isAuthScreen && !isGuestScreen) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.primary,
                    ) {
                        Destination.entries
                            .filter { it != Destination.Login && it != Destination.Register }
                            .forEach { destination ->
                                val isVisible = when (destination) {
                                    Destination.Administration -> role.canViewAdmin
                                    Destination.Publisher     -> role.canViewPublishers
                                    else                      -> true
                                }
                                if (isVisible) {
                                    NavigationBarItem(
                                        selected = backStack.last() == destination,
                                        onClick = {
                                            if (backStack.last() != destination) {
                                                backStack.add(destination)
                                            }
                                        },
                                        icon = {
                                            Icon(
                                                destination.icon,
                                                contentDescription = destination.contentDescription
                                            )
                                        },
                                        label = { Text(destination.label) }
                                    )
                                }
                            }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {

            if (autoLoginState is AutoLoginState.Loading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                return@Box
            }

            when (val currentRoute = backStack.last()) {
                Destination.Login -> {
                    LoginScreen(
                        loginSuccess = {
                            loginViewModel.loadUserProfile(context)
                            backStack.clear()
                            backStack.add(Destination.Home)
                        },
                        onNavigateToRegister = {
                            backStack.add(Destination.Register)
                        }
                    )
                }

                Destination.Home -> {
                    when {
                        role.isUnresolved -> {
                            // The profile is loaded but the role is not recognized
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.Warning, contentDescription = "Erreur de rôle", tint = Color.Red, modifier = Modifier.size(48.dp))
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Text("Rôle non reconnu: '${loginViewModel.userProfile?.role}'", color = Color.Gray)
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Button(onClick = {
                                        loginViewModel.performLogout(context) {
                                            backStack.clear()
                                            backStack.add(Destination.Login)
                                        }
                                    }) {
                                        Text("Se déconnecter")
                                    }
                                }
                            }
                        }
                        role.isGuest -> {
                            // Guest: pending admin approval — blocking screen
                            GuestScreen(
                                onLogout = {
                                    loginViewModel.performLogout(context) {
                                        backStack.clear()
                                        backStack.add(Destination.Login)
                                    }
                                }
                            )
                        }
                        else -> {
                            FestivalScreen(modifier = Modifier)
                            HomePage(onNavigateToFestival = { id -> backStack.add("Festival/$id") })
                        }
                    }
                }

                is String -> {
                    if (currentRoute.startsWith("Festival/")) {
                        val festivalId = currentRoute.substringAfter("Festival/").toIntOrNull() ?: 1
                        FestivalScreen(
                            festivalId = festivalId,
                            userRole = role
                        )
                    } else if (currentRoute == "Festival") {
                        FestivalScreen(festivalId = 1, userRole = role)
                    } else {
                        Text("Autre Écran", modifier = Modifier.align(Alignment.Center))
                    }
                }

                Destination.Register -> {
                    RegisterScreen(
                        registerSuccess = {
                            Log.d("NAV_DEBUG", "Action reçue => on ferme la page.")
                            backStack.removeAt(backStack.size - 1)
                        },
                        onNavigateToLogin = {
                            backStack.removeAt(backStack.size - 1)
                        }
                    )
                }

                Destination.Administration -> {
                    AdministrationPage()
                }

                Destination.Profile -> {
                    ProfilePage(
                        loginViewModel = loginViewModel,   // shared instance — has userProfile already loaded
                        logoutSuccess = {
                            loginViewModel.resetState()
                            backStack.clear()
                            backStack.add(Destination.Login)
                        }
                    )
                }

                Destination.Publisher -> {
                    PublisherScreen()
                }

                else -> {
                    Text("Autre Écran", modifier = Modifier.align(Alignment.Center))
                }
            }
        }
    }
}
