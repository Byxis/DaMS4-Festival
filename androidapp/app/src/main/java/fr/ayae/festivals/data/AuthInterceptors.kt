package fr.ayae.festivals.data

import android.content.Context
import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response
import androidx.core.content.edit

// Sauvegarde le cookie à la réception du Login
class SaveCookiesInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalResponse = chain.proceed(chain.request())

        if (originalResponse.request.url.encodedPath.contains("login")) {
            val cookies = originalResponse.headers("Set-Cookie")
            if (cookies.isNotEmpty()) {
                val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
                sharedPrefs.edit(commit = true) {

                    for (cookie in cookies) {
                        // Extract key and value
                        val parts = cookie.split(";").firstOrNull()?.split("=", limit = 2)
                        if (parts != null && parts.size == 2) {
                            val key = parts[0].trim()
                            val value = parts[1].trim()

                            when (key) {
                                "access_token" -> {
                                    putString("access_token", value)
                                    Log.d("AUTH_DEBUG", "✅ Access Token sauvegardé (valeur seule)")
                                }

                                "refresh_token" -> {
                                    putString("refresh_token", value)
                                    Log.d("AUTH_DEBUG", "✅ Refresh Token sauvegardé (valeur seule)")
                                }
                            }
                        }
                    }
                }
            }
        }
        return originalResponse
    }

}