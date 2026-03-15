package fr.ayae.festivals.ui

import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.core.app.ComponentActivity
import androidx.compose.material3.TextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.LoginViewModel
import fr.ayae.festivals.data.UiState
import androidx.lifecycle.viewmodel.compose.viewModel


@Composable
fun LoginScreen(
    loginViewModel: LoginViewModel = viewModel()
) {


    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val state by loginViewModel.state

    Column(
        modifier = Modifier.fillMaxSize(),

        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TextField(
            value = email,
            onValueChange = { newText -> email = newText },
            placeholder = {
                Text(text = "email address")
            }
        )

        Spacer(modifier = Modifier.height(10.dp))

        TextField(
            value = password,
            onValueChange = { newText -> password = newText },
            placeholder = {
                Text(text = "password")
            }
        )

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = { loginViewModel.performLogin(email, password) },
            modifier = Modifier.fillMaxWidth(0.7f)
        ) {

            Text("Se connecter")
        }

        if (state is UiState.Error) {
            Text(
                text = (state as UiState.Error).message,
                color = androidx.compose.ui.graphics.Color.Red,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        if (state is UiState.Success) {
            Text(
                text = "Succès ! Bienvenue ",
                color = androidx.compose.ui.graphics.Color.Green,
                )
        }


    }
}