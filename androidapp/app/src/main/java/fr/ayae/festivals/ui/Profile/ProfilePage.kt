package fr.ayae.festivals.ui.Profile

import android.annotation.SuppressLint
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.ui.Login.LoginViewModel

@SuppressLint("NotConstructor")
@Composable
fun ProfilePage(
    loginViewModel: LoginViewModel = viewModel(),
    logoutSuccess: () -> Unit
){
    val context = LocalContext.current
    LaunchedEffect(Unit) {
        loginViewModel.loadUserProfile(context)
    }

    val user = loginViewModel.userProfile

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Text("Bienvenue sur la page User Profile")
        Text("Email : ${user?.email}", style = MaterialTheme.typography.bodyLarge)
        Text("Rôle : ${user?.role}", style = MaterialTheme.typography.labelMedium)

        Spacer(modifier = Modifier.height(20.dp))
        Button(
            onClick = { loginViewModel.performLogout(context, logoutSuccess) },
            modifier = Modifier.fillMaxWidth(0.7f)
        ) {

            Text("Log out")
        }
    }
}


