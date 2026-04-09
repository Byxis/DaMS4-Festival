package fr.ayae.festivals.ui.profile



import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import fr.ayae.festivals.data.login.UserRole
import fr.ayae.festivals.ui.login.LoginViewModel

@SuppressLint("NotConstructor")
@Composable
fun ProfilePage(
    loginViewModel: LoginViewModel,   // passed from MainActivity — shared instance
    logoutSuccess: () -> Unit
){
    val context = LocalContext.current
    // No LaunchedEffect needed: profile is already loaded in MainActivity

    val user = loginViewModel.userProfile
    val role = loginViewModel.userRole

    val bgDark = Color(0xFF121416)
    val textGray = Color(0xFFAAAAAA)
    val salmonRed = Color(0xFFF27070)
    val avatarBg = Color(0xFFE0E0E0)
    val avatarIconDark = Color(0xFF1E2124)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(avatarBg, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = "Avatar",
                modifier = Modifier.size(90.dp),
                tint = avatarIconDark
            )
        }

        Spacer(modifier = Modifier.height(24.dp))





        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = user?.email ?: "",
            color = textGray,
            fontSize = 16.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        val roleDisplay = when (role) {
            UserRole.ADMIN     -> "Administrateur"
            UserRole.EDITOR    -> "Éditeur"
            UserRole.PUBLISHER -> "Éditeur de jeux"
            UserRole.GUEST     -> "Invité"
            UserRole.UNKNOWN   -> user?.role?.replaceFirstChar { it.uppercase() } ?: ""
        }

        Text(
            text = "Vous êtes $roleDisplay",
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = { loginViewModel.performLogout(context, logoutSuccess) },
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .height(55.dp),
            shape = RoundedCornerShape(50),
            colors = ButtonDefaults.buttonColors(
                containerColor = salmonRed,
                contentColor = Color.White
            )
        ) {
            Text(
                text = "Déconnexion",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}