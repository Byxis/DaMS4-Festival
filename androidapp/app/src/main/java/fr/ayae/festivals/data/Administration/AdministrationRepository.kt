package fr.ayae.festivals.data.Administration

import android.content.Context
import fr.ayae.festivals.data.Login.CreationResponse
import fr.ayae.festivals.data.Login.User

import fr.ayae.festivals.data.RetrofitInstance
import retrofit2.Response


class AdministrationRepository {
    suspend fun getAllUser(context: Context): List<User> {
        return RetrofitInstance.getApi(context).getAllUsers()
    }

    suspend fun delete(context: Context, userID : Int){
        return RetrofitInstance.getApi(context).delete(userID)
    }

    suspend fun create(context: Context, user: User) : Response<CreationResponse>{
        return RetrofitInstance.getApi(context).create(user)
    }
}