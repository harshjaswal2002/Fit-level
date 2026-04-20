import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from '../types/database'

const supabaseUrl = 'https://hssbcoglkvkhuyvurcmm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzc2Jjb2dsa3ZraHV5dnVyY21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTk3MjQsImV4cCI6MjA5MjI3NTcyNH0.q6B1PgkG6Knp8ce6E0bmNGTVUwgrQNzdmFyNmOZGq_U'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
