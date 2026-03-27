package fr.ayae.festivals.ui.Administration

import android.app.Application
import android.content.Context
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.ayae.festivals.data.Administration.AdministrationRepository
import fr.ayae.festivals.data.Login.User
import kotlinx.coroutines.launch
import retrofit2.HttpException

class AdminViewModel: ViewModel(){


    private val repository = AdministrationRepository()

    var usersList by mutableStateOf<List<User>>(emptyList())
        private set

     fun fetchAllUsers(context: Context,) {
         viewModelScope.launch {
             try {

                 val response = repository.getAllUser(context)
                 usersList = response

                     val firstUser = usersList[0]
                     Log.d("ADMIN_DEBUG", "Premier user reçu : Email=${firstUser.email}, Nom=${firstUser.lastName}, Prénom=${firstUser.firstName}")

                 Log.d("ADMIN_DEBUG", "Nombre d'utilisateurs reçus : ${usersList.size}")
             } catch (e: HttpException) {
                 Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)
             }
         }
     }

    fun deleteAnUser(context : Context, userID: Int) {
        viewModelScope.launch {
            try {

                val response = repository.delete( context, userID)
                fetchAllUsers(context)
                Log.d("ADMIN_DEBUG", "Tentative de suppression d'un utilisateur ...")
            } catch (e: HttpException) {
                Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)
            }
        }

    }

    fun createAnUser(context : Context, user: User){
        viewModelScope.launch{
            try{
                val response = repository.create( context, user)
                if(response.isSuccessful){
                    Log.d("ADMIN_DEBUG", "Utilisateur créé !")

                    fetchAllUsers(context)
                }
                Log.d("ADMIN_DEBUG", "Tentative de création d'un utilisateur ..")
            } catch (e: HttpException) {
                Log.e("ADMIN_DEBUG", "Détail de l'erreur : ${e.localizedMessage}", e)

            }
        }
    }





}