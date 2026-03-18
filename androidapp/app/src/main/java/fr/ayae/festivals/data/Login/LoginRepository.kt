package fr.ayae.festivals.data.Login

import android.content.Context
import fr.ayae.festivals.data.RetrofitInstance

class LoginRepository {

    suspend fun login(request : LoginRequest, context: Context): LoginResponse {
        return RetrofitInstance.getApi(context).login(request)
    }

    suspend fun logout( context: Context): MessageResponse {
        return RetrofitInstance.getApi(context).logout()
    }

}