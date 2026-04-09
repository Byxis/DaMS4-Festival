package fr.ayae.festivals.ui.register

import android.util.Patterns
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
@Composable
fun RegisterScreen(
    registerViewModel: RegisterViewModel = viewModel(),
    registerSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var showSuccessDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmedPassword by remember { mutableStateOf("") }

    val isEmailValid = Patterns.EMAIL_ADDRESS.matcher(email).matches()
    val state by registerViewModel.state
    val scrollState = rememberScrollState()

    LaunchedEffect(state) {
        if (state is AuthUiState.Success) {
            showSuccessDialog = true
        }
    }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {
                showSuccessDialog = false
                registerSuccess()
            },
            title = {
                Text(text = "Félicitations !")
            },
            text = {
                Text(text = "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSuccessDialog = false
                        registerViewModel.resetState()
                        registerSuccess()
                    }
                ) {
                    Text("Super !")
                }
            }
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()

            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(12.dp),

            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
                    .padding(32.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Inscription",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold

                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Créez votre compte",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                OutlinedTextField(
                    value = firstName,
                    onValueChange = { firstName = it },
                    label = { Text("Prénom*") },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true

                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = lastName,
                    onValueChange = { lastName = it },
                    label = { Text("Nom*") },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true

                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email*") },
                    shape = RoundedCornerShape(6.dp),
                    isError = email.isNotEmpty() && !isEmailValid,
                    supportingText = {
                        if (!isEmailValid && email.isNotEmpty()) {
                            Text(
                                text = "Format d'email invalide",
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true

                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Mot de passe*") },
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true

                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = confirmedPassword,
                    onValueChange = { confirmedPassword = it },
                    label = { Text("Confirmer le mot de passe*") },
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true

                )

                if (confirmedPassword.isNotEmpty() && confirmedPassword != password) {
                    Text(
                        text = "Les mots de passe ne correspondent pas",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = {
                        registerViewModel.performRegister(
                            context = context,
                            firstNameValue = firstName,
                            lastNameValue = lastName,
                            emailValue = email,
                            passwordValue = password
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(8.dp),

                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    Text("Inscription", fontSize = 16.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(onClick = { onNavigateToLogin() }) {
                    Text(
                        text = "Déjà inscrit ? Connectez-vous",
                        color = MaterialTheme.colorScheme.primary,
                        textDecoration = TextDecoration.Underline,
                        fontSize = 14.sp
                    )
                }

                if (state is AuthUiState.Error) {
                    Text(
                        text = (state as AuthUiState.Error).message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
            }
        }
    }
}