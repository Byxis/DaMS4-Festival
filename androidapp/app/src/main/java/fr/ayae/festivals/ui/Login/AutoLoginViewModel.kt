package fr.ayae.festivals.ui.Login

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** Possible states during the auto-login check. */
sealed class AutoLoginState {
    data object Loading : AutoLoginState()
    data object GoHome  : AutoLoginState()
    data object GoLogin : AutoLoginState()
}

/**
 * ViewModel that checks whether the user's session token is still valid on app start.
 *
 * Strategy:
 * - If no token in SharedPreferences → [AutoLoginState.GoLogin]
 * - If token present → try a lightweight API call (GET /users)
 *   - Success → [AutoLoginState.GoHome]
 *   - Failure (401 / network error) → [AutoLoginState.GoLogin]
 */
class AutoLoginViewModel : ViewModel() {

    private val _state = MutableStateFlow<AutoLoginState>(AutoLoginState.Loading)
    val state: StateFlow<AutoLoginState> = _state.asStateFlow()

    /**
     * Initiate the session check. Call once from the entry composable.
     *
     * Strategy: check the PersistentCookieJar for existing session cookies.
     * If a cookie/token is present → go directly to Home (no network call needed).
     * An expired token will be caught naturally when the first real API call is made.
     */
    fun checkSession(context: Context) {
        viewModelScope.launch {
            val prefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
            val token = prefs.getString("access_token", "")

            _state.value = if (!token.isNullOrBlank()) {
                AutoLoginState.GoHome
            } else {
                AutoLoginState.GoLogin
            }
        }
    }
}
