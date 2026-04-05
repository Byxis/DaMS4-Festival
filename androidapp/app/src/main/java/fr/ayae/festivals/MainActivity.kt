package fr.ayae.festivals

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import fr.ayae.festivals.ui.festival.FestivalScreen
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.ui.Login.LoginViewModel
import fr.ayae.festivals.ui.Administration.AdministrationPage
import fr.ayae.festivals.ui.HomePage
import fr.ayae.festivals.ui.Login.LoginScreen
import fr.ayae.festivals.ui.Navigation.Destination
import fr.ayae.festivals.ui.Profile.ProfilePage
import fr.ayae.festivals.ui.Register.RegisterScreen
import fr.ayae.festivals.ui.theme.AYAEFestivalsTheme

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
    //remember : mémoire à court terme du composant
    // garde l'objet en mémoire et le renvoie à chaque fois que l'interface est réecrite
    val backStack = remember { mutableStateListOf<Any>(Destination.Login) }
    val loginViewModel: LoginViewModel = viewModel()
    val user = loginViewModel.userProfile
    val context = LocalContext.current
    val navigateBack = {
        if (backStack.size > 1) {
            backStack.removeAt(backStack.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.primary,
                ),
                title = { Text("AYAE Festivals") },
                navigationIcon = {
                    if (backStack.size > 1) {
                        IconButton(onClick = navigateBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Localized description"
                            )
                        }
                    }
                }
            )
        },
        bottomBar = {
            BottomAppBar(
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.primary,
            ) {
                if (backStack.last() != Destination.Login && backStack.last() != Destination.Register) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.primary,
                    ) {
                        Destination.entries.filter{it != Destination.Login && it!= Destination.Register}.forEachIndexed { index, destination ->
                            val isVisible = destination != Destination.Administration || user?.role == "admin"
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
        FestivalScreen(modifier = Modifier)
        Box(modifier = Modifier.padding(innerPadding)) {

            when (backStack.last()) {
                Destination.Login -> {
                    LoginScreen(
                        loginSuccess = {
                            backStack.clear()
                            backStack.add(Destination.Home)
                        },
                        onNavigateToRegister = {

                            backStack.add(Destination.Register)
                        }
                    )
                }

                Destination.Home -> {
                    HomePage()
                }
                Destination.Register->{
                    RegisterScreen(
                            registerSuccess = {
                                Log.d("NAV_DEBUG", "Action reçue par le chef d'orchestre ! On ferme la page.") // <-- MICRO 3
                                backStack.removeAt(backStack.size - 1)
                            },
                        onNavigateToLogin = {
                            backStack.removeAt(backStack.size - 1)
                        }
                        )
                }

                Destination.Administration -> {

                        AdministrationPage(

                        )
                }

                Destination.Profile -> {
                    ProfilePage(
                        logoutSuccess = {
                            loginViewModel.resetState()
                            backStack.clear()
                            backStack.add(Destination.Login)
                        }
                    )
                }

                else -> {
                    Text("Autre Écran", modifier = Modifier.align(Alignment.Center))
                }
            }
        }
    }
}

