package fr.ayae.festivals.data
import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
class LoginRepository {

    suspend fun login(request : LoginRequest, context: Context): LoginResponse{
        return RetrofitInstance.getApi(context).login(request)
    }

    suspend fun logout( context: Context): MessageResponse {
        return RetrofitInstance.getApi(context).logout()
    }
}