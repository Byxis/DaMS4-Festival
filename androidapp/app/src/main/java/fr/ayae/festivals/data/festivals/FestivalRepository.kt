package fr.ayae.festivals.data.festivals

import android.content.Context
import fr.ayae.festivals.data.RetrofitInstance

class FestivalRepository {
    suspend fun getAllFestivals(context: Context): List<Festival> {
        return RetrofitInstance.getApi(context).getAllFestivals()
    }
}