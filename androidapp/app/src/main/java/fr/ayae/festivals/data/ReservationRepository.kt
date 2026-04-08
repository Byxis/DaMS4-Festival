package fr.ayae.festivals.data

import android.content.Context
import android.util.Log

class ReservationRepository {

    suspend fun getReservationsForFestival(context: Context, festivalId: Int): List<Reservation>? {
        return try {
            val api = RetrofitInstance.getApi(context)
            val reservations = api.getReservations(festivalId)
            Log.d("AUTH_DEBUG", "✅ Fetched ${reservations.size} reservations for festival $festivalId")
            return reservations
        } catch (e: Exception) {
            Log.e("AUTH_DEBUG", "❌ Error fetching reservations: ${e.message}", e)
            return emptyList()
        }
    }

    suspend fun getFestival(context: Context, festivalId: Int): fr.ayae.festivals.data.Festival? {
        return try {
            RetrofitInstance.getApi(context).getFestival(festivalId)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur lors de la récupération du festival: ${e.message}")
            null
        }
    }

    suspend fun updateFestival(context: Context, festivalId: Int, request: UpdateFestivalRequest): Festival? {
        return try {
            RetrofitInstance.getApi(context).updateFestival(festivalId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur updateFestival: ${e.message}")
            null
        }
    }

    suspend fun addZoneTarif(context: Context, festivalId: Int, request: AddZoneTarifRequest): ZoneTarif? {
        return try {
            RetrofitInstance.getApi(context).addZoneTarif(festivalId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur addZoneTarif: ${e.message}")
            null
        }
    }

    suspend fun updateZoneTarif(context: Context, festivalId: Int, tarifZoneId: Int, request: AddZoneTarifRequest): ZoneTarif? {
        return try {
            RetrofitInstance.getApi(context).updateZoneTarif(festivalId, tarifZoneId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur updateZoneTarif: ${e.message}")
            null
        }
    }

    suspend fun deleteZoneTarif(context: Context, festivalId: Int, tarifZoneId: Int): Boolean {
        return try {
            val response = RetrofitInstance.getApi(context).deleteZoneTarif(festivalId, tarifZoneId)
            response.isSuccessful
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur deleteZoneTarif: ${e.message}")
            false
        }
    }

    suspend fun addGameZone(context: Context, festivalId: Int, tarifZoneId: Int, request: AddGameZoneRequest): ZoneGame? {
        return try {
            RetrofitInstance.getApi(context).addGameZone(festivalId, tarifZoneId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur addGameZone: ${e.message}")
            null
        }
    }

    suspend fun updateGameZone(context: Context, festivalId: Int, tarifZoneId: Int, gameZoneId: Int, request: AddGameZoneRequest): ZoneGame? {
        return try {
            RetrofitInstance.getApi(context).updateGameZone(festivalId, tarifZoneId, gameZoneId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur updateGameZone: ${e.message}")
            null
        }
    }

    suspend fun deleteGameZone(context: Context, festivalId: Int, tarifZoneId: Int, gameZoneId: Int): Boolean {
        return try {
            val response = RetrofitInstance.getApi(context).deleteGameZone(festivalId, tarifZoneId, gameZoneId)
            response.isSuccessful
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur deleteGameZone: ${e.message}")
            false
        }
    }

    suspend fun addReservation(context: Context, festivalId: Int, request: AddReservationRequest): Reservation? {
        return try {
            RetrofitInstance.getApi(context).addReservation(festivalId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur addReservation: ${e.message}")
            null
        }
    }

    suspend fun updateReservation(context: Context, festivalId: Int, reservationId: Int, request: UpdateReservationRequest): Reservation? {
        return try {
            RetrofitInstance.getApi(context).updateReservation(festivalId, reservationId, request)
        } catch (e: Exception) {
            Log.e("AuthService", "Erreur updateReservation: ${e.message}")
            null
        }
    }
}
