package fr.ayae.festivals.data.publisher

import fr.ayae.festivals.data.APIService

class PublisherRepository(private val apiService: APIService) {

    suspend fun getPublishers(): List<PublisherDto> {
        return apiService.getAllPublishers()
    }

    suspend fun getPublisherDetails(publisherId: Int): PublisherDto {
        val publisher = apiService.getPublisherById(publisherId)
        val contacts = apiService.getContactsForPublisher(publisherId)
        val games = apiService.getGamesForPublisher(publisherId)
        return publisher.copy(contacts = contacts, games = games)
    }

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

// Ajout d'une classe de données pour la requête de création
@kotlinx.serialization.Serializable
data class PublisherCreationRequest(val name: String)