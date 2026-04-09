package fr.ayae.festivals.data.administration

import android.content.Context
import fr.ayae.festivals.data.login.CreationResponse
import fr.ayae.festivals.data.login.LoginResponse
import fr.ayae.festivals.data.login.User

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

    suspend fun update(context : Context, user : User) : Response<LoginResponse>{
        val userId = user.id ?: 0
        return RetrofitInstance.getApi(context).update(userId, user)
    }

}