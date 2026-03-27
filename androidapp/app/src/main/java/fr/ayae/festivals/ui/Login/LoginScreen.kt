package fr.ayae.festivals.ui.Login

import android.content.Context
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicSecureTextField
import androidx.compose.foundation.text.input.TextObfuscationMode
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel


@Composable
fun LoginScreen(
    loginViewModel: LoginViewModel = viewModel(),
    loginSuccess: () ->Unit,
    onNavigateToRegister: () -> Unit
) {


    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val state by loginViewModel.state
    val context = LocalContext.current

    LaunchedEffect(state) {
        if (state is UiState.Success) {
            loginSuccess()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),

        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                focusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent

                ),

            value = email,
            onValueChange = { email = it },
            placeholder = { Text("email@example.com") },
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
                .fillMaxWidth(0.8f)

        )
        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                focusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent

            ),

            value = password,
            onValueChange = { password = it },
            placeholder = { Text("Mot de passe*") },
            visualTransformation = PasswordVisualTransformation(),
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
                .fillMaxWidth(0.8f)

        )

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = { loginViewModel.performLogin(context, password.trim(), email.trim()) },
            modifier = Modifier.fillMaxWidth(0.7f)
        ) {

            Text("Se connecter")

        }
        TextButton(onClick = { onNavigateToRegister() }) {
            Text(
                text = "Pas encore inscrit ?",
                color = MaterialTheme.colorScheme.primary // Optionnel : pour le mettre aux couleurs de ton thème
            )
        }

        if (state is UiState.Error) {
            Text(
                text = (state as UiState.Error).message,
                color = Color.Red,
                modifier = Modifier.padding(top = 8.dp)
            )
        }




    }
}