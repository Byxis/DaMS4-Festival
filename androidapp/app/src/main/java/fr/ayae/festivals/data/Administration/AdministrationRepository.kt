package fr.ayae.festivals.data.Administration

import android.content.Context
import fr.ayae.festivals.data.Login.LoginRequest
import fr.ayae.festivals.data.Login.LoginResponse
import fr.ayae.festivals.data.Login.UiState
import fr.ayae.festivals.data.RetrofitInstance


class AdministrationRepository {
    suspend fun getAllUser(context: Context): List<UserAdminPage> {
        return RetrofitInstance.getApi(context).getAllUsers()
    }

    suspend fun delete(context: Context, userID : Int){
        return RetrofitInstance.getApi(context).delete(userID)
    }


}