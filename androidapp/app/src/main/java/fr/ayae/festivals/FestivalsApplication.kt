package fr.ayae.festivals

import android.app.Application
import fr.ayae.festivals.data.Reservation.ReservationRepository
import fr.ayae.festivals.data.db.AppDatabase

/**
 * Application class acting as the dependency container for the app.
 *
 * Provides lazy-initialized singletons for [AppDatabase] and [ReservationRepository],
 * following the pattern from the Android Basics codelabs.
 */
class FestivalsApplication : Application() {

    /** The Room database singleton. */
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this) }

    /** The single repository instance shared across ViewModels. */
    val reservationRepository: ReservationRepository by lazy {
        ReservationRepository(database)
    }
}
