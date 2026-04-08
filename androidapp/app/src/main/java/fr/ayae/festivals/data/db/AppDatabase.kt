package fr.ayae.festivals.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import fr.ayae.festivals.data.Festivals.Festival
import fr.ayae.festivals.data.Reservation.Reservation

/**
 * Room database for the Festivals app.
 *
 * Entities:
 * - [Festival] : cached festival data (tarif_zones stored as JSON via [Converters])
 * - [Reservation] : cached reservations (games + interactions stored as JSON via [Converters])
 */
@Database(
    entities = [Festival::class, Reservation::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun festivalDao(): FestivalDao
    abstract fun reservationDao(): ReservationDao

    companion object {
        @Volatile
        private var Instance: AppDatabase? = null

        /**
         * Returns the singleton [AppDatabase] instance, creating it if needed.
         * Uses [fallbackToDestructiveMigration] since this is a pure cache.
         */
        fun getDatabase(context: Context): AppDatabase {
            return Instance ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "festivals_database"
                )
                    .fallbackToDestructiveMigration(false)
                    .build()
                    .also { Instance = it }
            }
        }
    }
}
