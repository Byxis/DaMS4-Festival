package fr.ayae.festivals.data.Administration

import android.app.Application
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import retrofit2.HttpException
import kotlin.collections.emptyList
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.Login.User
import kotlinx.coroutines.launch


class AdminViewModel(application: Application) : AndroidViewModel(application){


    private val repository = AdministrationRepository()
    init{fetchAllUsers()}
    var usersList by mutableStateOf<List<UserAdminPage>>(emptyList())
        private set

     fun fetchAllUsers() {
         viewModelScope.launch {
             try {

                 val response = repository.getAllUser(getApplication())
                 usersList = response

                     val firstUser = usersList[0]
                     Log.d("ADMIN_DEBUG", "Premier user reçu : Email=${firstUser.email}, Nom=${firstUser.lastName}, Prénom=${firstUser.firstName}")

                 Log.d("ADMIN_DEBUG", "Nombre d'utilisateurs reçus : ${usersList.size}")
             } catch (e: HttpException) {
                 Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)
             }
         }
     }

    fun deleteAnUser(userID: Int) {
        viewModelScope.launch {
            try {

                val response = repository.delete(getApplication(), userID)
                fetchAllUsers()
                Log.d("ADMIN_DEBUG", "Tentative de suppression d'un utilisateur ...")
            } catch (e: HttpException) {
                Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)
            }
        }

    }

    fun createAnUser(user: User){
        viewModelScope.launch{
            try{
                val response = repository.create(getApplication(), user)
                if(response.isSuccessful){
                    Log.d("ADMIN_DEBUG", "Utilisateur créé !")

                    fetchAllUsers()
                }
                Log.d("ADMIN_DEBUG", "Tentative de création d'un utilisateur ..")
            } catch (e: HttpException) {
                Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)

            }
        }
    }





}