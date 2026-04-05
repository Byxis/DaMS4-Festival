package fr.ayae.festivals.data.Register

import android.content.Context
import fr.ayae.festivals.data.Login.LoginResponse
import fr.ayae.festivals.data.Login.RegisterRequest
import fr.ayae.festivals.data.Login.User
import fr.ayae.festivals.data.RetrofitInstance

class RegisterRepository {
    suspend fun register(request : RegisterRequest, context: Context) : LoginResponse{
        return RetrofitInstance.getApi(context).register(request)
    }
}