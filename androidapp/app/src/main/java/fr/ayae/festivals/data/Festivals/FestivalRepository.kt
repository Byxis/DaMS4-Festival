package fr.ayae.festivals.data.Festivals

import android.content.Context
import fr.ayae.festivals.data.Festival
import fr.ayae.festivals.data.RetrofitInstance

class FestivalRepository {
    suspend fun getAllFestivals(context: Context): List<Festival> {
        return RetrofitInstance.getApi(context).getAllFestivals()
    }
}