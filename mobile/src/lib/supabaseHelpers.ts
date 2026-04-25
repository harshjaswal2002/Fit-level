import { supabase } from './supabase'

// Helper function to bypass TypeScript issues with Supabase RPC calls
// This is a temporary workaround until the Supabase types are properly generated
export const callRPC = async <T = any>(
  functionName: string,
  params: Record<string, any>
): Promise<{ data: T | null; error: any }> => {
  return (supabase.rpc as any)(functionName, params)
}

// Helper function to bypass TypeScript issues with Supabase inserts
export const insertRecord = async <T = any>(
  table: string,
  record: Record<string, any>
): Promise<{ data: T | null; error: any }> => {
  return (supabase.from(table).insert as any)(record)
}

// Helper function to bypass TypeScript issues with Supabase selects
export const selectRecord = async <T = any>(
  table: string,
  columns: string = '*'
) => {
  return supabase.from(table).select(columns)
}
