package fr.ayae.festivals.ui.utils

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight

@Composable
fun AutoResizedText(
    text: String,
    style: TextStyle,
    color: Color = Color.Unspecified,
    fontWeight: FontWeight? = null,
    modifier: Modifier = Modifier
) {
    var multiplier by rememberSaveable(text) { mutableStateOf(1f) }

    Text(
        text = text,
        modifier = modifier,
        style = style.copy(fontSize = style.fontSize * multiplier),
        color = color,
        fontWeight = fontWeight,
        maxLines = 1,
        softWrap = false,
        onTextLayout = {
            if (it.hasVisualOverflow) {
                multiplier *= 0.95f
            }
        }
    )
}