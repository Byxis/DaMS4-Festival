package fr.ayae.festivals.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = Cyan80,
    onPrimary = Color(0xFF004D40),
    primaryContainer = Color(0xFF006064),
    onPrimaryContainer = Color(0xFFE0F7FA),
    
    secondary = Cyan80,
    onSecondary = Color(0xFF004D40),
    secondaryContainer = Color(0xFF006064),
    onSecondaryContainer = Color(0xFFE0F7FA),
    
    tertiary = Orange80,
    onTertiary = Color(0xFFE65100),
    tertiaryContainer = Color(0xFFEF6C00),
    onTertiaryContainer = Color(0xFFFFE0B2),
    
    background = SurfaceDark,
    surface = SurfaceDark,
    surfaceVariant = Color(0xFF37474F),
    onSurfaceVariant = Color(0xFFCFD8DC),
    
    error = Color(0xFFCF6679),
    onError = Color.Black
)

private val LightColorScheme = lightColorScheme(
    primary = Cyan40,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFB2EBF2),
    onPrimaryContainer = Color(0xFF004D40),
    
    secondary = Cyan40,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE0F7FA),
    onSecondaryContainer = Color(0xFF006064),
    
    tertiary = Orange40,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFE0B2),
    onTertiaryContainer = Color(0xFFE65100),
    
    background = SurfaceLight,
    surface = SurfaceLight,
    surfaceVariant = Color(0xFFECEFF1),
    onSurfaceVariant = Color(0xFF455A64),
    
    error = Color(0xFFB00020),
    onError = Color.White
)

@Composable
fun AYAEFestivalsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}