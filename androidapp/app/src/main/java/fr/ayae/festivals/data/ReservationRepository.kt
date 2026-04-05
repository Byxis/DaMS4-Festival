package fr.ayae.festivals.data

import android.content.Context
import android.util.Log

class ReservationRepository {

    suspend fun getReservationsForFestival(context: Context, festivalId: Int): List<Reservation>? {
        return try {
            val api = RetrofitInstance.getApi(context)
            val reservations = api.getReservations(festivalId)
            Log.d("AUTH_DEBUG", "✅ Fetched ${reservations.size} reservations for festival $festivalId")
            reservations
        } catch (e: Exception) {
            Log.e("AUTH_DEBUG", "❌ Error fetching reservations: ${e.message}", e)
            null
        }
    }
}
