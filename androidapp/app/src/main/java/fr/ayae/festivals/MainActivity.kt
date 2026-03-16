package fr.ayae.festivals

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.CenterAlignedTopAppBar
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
import androidx.compose.material3.TopAppBarDefaults.topAppBarColors
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteType.Companion.NavigationBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.tooling.preview.PreviewScreenSizes
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.data.LoginViewModel
import fr.ayae.festivals.ui.HomePage
import fr.ayae.festivals.ui.LoginScreen
import fr.ayae.festivals.ui.Navigation.Destination
import fr.ayae.festivals.ui.ProfilePage
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
                if (backStack.last() != Destination.Login) {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.primary,
                    ) {
                        Destination.entries.filter{it != Destination.Login}.forEachIndexed { index, destination ->
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
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (backStack.last()) {
                Destination.Login -> {
                    LoginScreen(
                        loginSuccess = {
                            // pour empêcher le navigateBack de nous faire revenir sur la page de Login
                            backStack.clear()
                            backStack.add(Destination.Home)
                        }
                    )
                }
                Destination.Home -> {

                        HomePage()
                }

                Destination.Administration -> {

                    Text("Vous êtes sur la page d'administration")
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