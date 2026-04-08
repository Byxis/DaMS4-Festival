package fr.ayae.festivals.ui.Register

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
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.ayae.festivals.R

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

    val bgColor = Color(0xFF141618)
    val cardColor = Color(0xFF1C1E21)
    val borderColor = Color(0xFF333333)
    val cyanAccent = Color(0xFF00E5FF)
    val textGray = Color(0xFFAAAAAA)

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
                Text(text = stringResource(R.string.register_success_title))
            },
            text = {
                Text(text = stringResource(R.string.register_success_message))
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSuccessDialog = false
                        registerViewModel.resetState()
                        registerSuccess()
                    }
                ) {
                    Text(stringResource(R.string.register_success_ok))
                }
            }
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = cardColor),
            border = BorderStroke(1.dp, borderColor)
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
                    text = stringResource(R.string.register_title),
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = stringResource(R.string.register_subtitle),
                    color = textGray,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                OutlinedTextField(
                    value = firstName,
                    onValueChange = { firstName = it },
                    label = { Text(stringResource(R.string.register_first_name_label)) },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = cyanAccent,
                        unfocusedBorderColor = borderColor,
                        focusedLabelColor = cyanAccent,
                        unfocusedLabelColor = textGray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = cyanAccent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedContainerColor = Color.Transparent
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = lastName,
                    onValueChange = { lastName = it },
                    label = { Text(stringResource(R.string.register_last_name_label)) },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = cyanAccent,
                        unfocusedBorderColor = borderColor,
                        focusedLabelColor = cyanAccent,
                        unfocusedLabelColor = textGray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = cyanAccent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedContainerColor = Color.Transparent
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text(stringResource(R.string.login_email_label)) },
                    shape = RoundedCornerShape(6.dp),
                    isError = email.isNotEmpty() && !isEmailValid,
                    supportingText = {
                        if (!isEmailValid && email.isNotEmpty()) {
                            Text(
                                text = stringResource(R.string.register_error_email_format),
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = cyanAccent,
                        unfocusedBorderColor = borderColor,
                        focusedLabelColor = cyanAccent,
                        unfocusedLabelColor = textGray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = cyanAccent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedContainerColor = Color.Transparent,
                        errorBorderColor = MaterialTheme.colorScheme.error,
                        errorLabelColor = MaterialTheme.colorScheme.error,
                        errorTextColor = Color.White,
                        errorSupportingTextColor = MaterialTheme.colorScheme.error
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text(stringResource(R.string.login_password_label)) },
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = cyanAccent,
                        unfocusedBorderColor = borderColor,
                        focusedLabelColor = cyanAccent,
                        unfocusedLabelColor = textGray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = cyanAccent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedContainerColor = Color.Transparent
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = confirmedPassword,
                    onValueChange = { confirmedPassword = it },
                    label = { Text(stringResource(R.string.register_confirm_password_label)) },
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = cyanAccent,
                        unfocusedBorderColor = borderColor,
                        focusedLabelColor = cyanAccent,
                        unfocusedLabelColor = textGray,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        cursorColor = cyanAccent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedContainerColor = Color.Transparent
                    )
                )

                if (confirmedPassword.isNotEmpty() && confirmedPassword != password) {
                    Text(
                        text = stringResource(R.string.register_error_password_mismatch),
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
                        containerColor = bgColor,
                        contentColor = cyanAccent
                    ),
                    border = BorderStroke(1.dp, borderColor)
                ) {
                    Text(stringResource(R.string.register_title), fontSize = 16.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(onClick = { onNavigateToLogin() }) {
                    Text(
                        text = stringResource(R.string.register_already_registered),
                        color = textGray,
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