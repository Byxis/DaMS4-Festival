package fr.ayae.festivals.data.publisher

import android.util.Log
import fr.ayae.festivals.data.APIService
import fr.ayae.festivals.data.contact.ContactDto
import fr.ayae.festivals.data.game.GameDto

class PublisherRepository(private val apiService: APIService) {

    suspend fun getPublishers(): List<PublisherDto> {
        return apiService.getAllPublishers()
    }
    // GET FUNCTIONS
    suspend fun getPublisherDetails(publisherId: Int): PublisherDto {

        val publisher = apiService.getPublisherById(publisherId)

        val games = getGamesForPublisher(publisherId)

        return publisher.copy(games = games)
    }


    suspend fun getGamesForPublisher(publisherId: Int): List<GameDto> {
        return try {
            apiService.getGamesForPublisher(publisherId)
        } catch (e: Exception) {
            Log.e("PublisherRepository", "Error fetching games for publisher $publisherId", e)
            emptyList()
        }
    }
    //CRUD PUBLISHER
    suspend fun addPublisher(name: String) {
        // L'API attend un objet, nous créons un DTO simple pour l'ajout.
        // Adaptez ceci si votre API attend plus de champs.
        val request = PublisherCreationRequest(name = name)
        apiService.addPublisher(request)
    }
    suspend fun editPublisher(publisherId: Int, newName: String) {
        val request = PublisherCreationRequest(name = newName)
        apiService.editPublisher(publisherId, request)
    }
    suspend fun deletePublisher(publisherId: Int) {
        apiService.deletePublisher(publisherId)
    }

}

//
@kotlinx.serialization.Serializable
data class PublisherCreationRequest(val name: String)