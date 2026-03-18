package fr.ayae.festivals.data

import android.content.Context
import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response

// 1. Le Douanier qui SAUVEGARDE le cookie à la réception du Login
class SaveCookiesInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalResponse = chain.proceed(chain.request())

        // Si c'est la réponse du login, on fouille les headers
        if (originalResponse.request.url.encodedPath.contains("login")) {
            val cookies = originalResponse.headers("Set-Cookie")
            if (cookies.isNotEmpty()) {
                val sharedPrefs = context.getSharedPreferences("AppCookies", Context.MODE_PRIVATE)
                val editor = sharedPrefs.edit()

                for (cookie in cookies) {
                    if (cookie.contains("access_token")) {
                        // On extrait juste la partie "access_token=eyJh...;"
                        val tokenPart = cookie.split(";").firstOrNull() ?: cookie
                        editor.putString("access_token", tokenPart)
                        Log.d("AUTH_DEBUG", "INTERCEPTEUR : Cookie sauvegardé ! -> $tokenPart")
                    }
                }
                editor.commit()
            }
        }
        return originalResponse
    }

}