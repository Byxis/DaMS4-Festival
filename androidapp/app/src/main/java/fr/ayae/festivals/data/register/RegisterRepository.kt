package fr.ayae.festivals.data.register

import android.content.Context
import fr.ayae.festivals.data.login.LoginResponse
import fr.ayae.festivals.data.login.RegisterRequest
import fr.ayae.festivals.data.RetrofitInstance

class RegisterRepository {
    suspend fun register(request : RegisterRequest, context: Context) : LoginResponse{
        return RetrofitInstance.getApi(context).register(request)
    }
}