package fr.ayae.festivals.data

class LoginRepository {

    suspend fun login(request : LoginRequest): LoginResponse{
        return RetrofitInstance.api.login(request)
    }
}