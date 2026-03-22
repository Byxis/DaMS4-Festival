package fr.ayae.festivals.ui

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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import fr.ayae.festivals.data.Login.LoginViewModel
import fr.ayae.festivals.data.Login.UiState
import androidx.lifecycle.viewmodel.compose.viewModel


@Composable
fun LoginScreen(
    loginViewModel: LoginViewModel = viewModel(),
    loginSuccess: () ->Unit,

) {


    var email by remember { mutableStateOf("") }
    val passwordState = rememberTextFieldState()
    var showPassword by remember { mutableStateOf(false) }
    val state by loginViewModel.state

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

        BasicSecureTextField(
            state = passwordState,
            textObfuscationMode = if (showPassword) {
                TextObfuscationMode.Visible
            } else {
                TextObfuscationMode.RevealLastTyped
            },
            modifier = Modifier
                .fillMaxWidth(0.8f)
                .border(1.dp, Color.Gray.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                .padding(12.dp),
            decorator = { innerTextField ->
                Box(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(end = 48.dp)
                    ) {
                        if (passwordState.text.isEmpty()) {
                            Text("password", color = Color.Gray)
                        }
                        innerTextField()
                    }
                    Icon(
                        imageVector = if (showPassword) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                        contentDescription = "Toggle password visibility",
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .size(24.dp)
                            .clickable { showPassword = !showPassword }
                    )
                }
            }
        )

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = { loginViewModel.performLogin(email.trim(), passwordState.text.toString().trim()) },
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
            loginSuccess()
        }


    }
}