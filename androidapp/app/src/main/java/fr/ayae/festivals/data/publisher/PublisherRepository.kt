package fr.ayae.festivals.data.publisher

import fr.ayae.festivals.data.APIService

class PublisherRepository(private val apiService: APIService) {

    /**
     * Récupère la liste de tous les éditeurs depuis l'API.
     * Chaque éditeur contient déjà ses listes de contacts et de jeux
     * si votre API est configurée pour les inclure directement.
     */
    suspend fun getPublishers(): List<PublisherDto> {
        return apiService.getAllPublishers()
    }

    /**
     * Récupère les détails complets d'un seul éditeur en appelant
     * les points de terminaison séparés pour les contacts et les jeux.
     * Utile si votre GET /publishers ne renvoie pas tout.
     */
    suspend fun getPublisherDetails(publisherId: Int): PublisherDto {
        // 1. Récupérer les informations de base de l'éditeur
        val publisher = apiService.getPublisherById(publisherId)

        // 2. Récupérer les contacts et les jeux en parallèle
        val contacts = apiService.getContactsForPublisher(publisherId)
        val games = apiService.getGamesForPublisher(publisherId)

        // 3. Combiner les résultats dans un seul objet DTO
        return publisher.copy(contacts = contacts, games = games)
    }
}