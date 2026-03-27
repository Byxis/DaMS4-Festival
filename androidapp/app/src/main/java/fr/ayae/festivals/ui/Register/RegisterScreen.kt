package fr.ayae.festivals.ui.Register

import android.util.Patterns
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
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.State
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
import fr.ayae.festivals.ui.Login.LoginViewModel
import fr.ayae.festivals.ui.Login.UiState

import androidx.compose.runtime.mutableStateOf

private val internalState : MutableState<UiState> = mutableStateOf(UiState.Loading)
val state : State<UiState> = internalState
@Composable
fun RegisterScreen(
    registerSuccess: () ->Unit,
    onNavigateToLogin: () -> Unit,

    ) {


    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember{mutableStateOf("")}
    var confirmedPassword by remember { mutableStateOf("") }
    val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()







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

            value = firstName,
            onValueChange = { firstName = it },
            placeholder = { Text("Prénom*") },
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
                .fillMaxWidth(0.8f)

        )

        OutlinedTextField(
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                focusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent

            ),

            value = lastName,
            onValueChange = { lastName = it },
            placeholder = { Text("Nom*") },
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
                .fillMaxWidth(0.8f)

        )
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
            isError = isEmailValid,
            supportingText = {
                if (isEmailValid) {
                    Text(
                        text = "Format d'email invalide",
                        color = MaterialTheme.colorScheme.error
                    )
                }
            },
            modifier = Modifier.fillMaxWidth(0.8f)


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

        OutlinedTextField(
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                focusedBorderColor = Color.Gray.copy(alpha = 0.5f),

                unfocusedContainerColor = Color.Transparent,
                focusedContainerColor = Color.Transparent

            ),

            value = confirmedPassword,
            onValueChange = { confirmedPassword = it },
            placeholder = { Text("Mot de passe*") },
            visualTransformation = PasswordVisualTransformation(),
            shape = RoundedCornerShape(6.dp),
            modifier = Modifier
                .fillMaxWidth(0.8f)

        )

        if (confirmedPassword != password) {
            Text(
                text = "Les mots de passe ne correspondent pas",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .padding(start = 16.dp, top = 4.dp)
            )
        }

        Button(
            onClick = {  },
            modifier = Modifier.fillMaxWidth(0.7f)
        ) {

            Text("Inscription")

        }
        TextButton(onClick = { onNavigateToLogin() }) {
            Text(
                text = "Déja inscrit ? Connectez-vous ",
                color = MaterialTheme.colorScheme.primary
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