export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      time_off_policies: {
        Row: {
          id: string
          created_at: string
          policy_name: string
        }
        Insert: {
          id?: string
          created_at?: string
          policy_name: string
        }
        Update: {
          id?: string
          created_at?: string
          policy_name?: string
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          id: string
          created_at: string
          employee_id: string | null
          policy_id: string
          request_type: string
          start_date: string
          end_date: string | null
          day_portion: string | null
          status: string
          reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          employee_id?: string | null
          policy_id: string
          request_type: string
          start_date: string
          end_date?: string | null
          day_portion?: string | null
          status?: string
          reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          employee_id?: string | null
          policy_id?: string
          request_type?: string
          start_date?: string
          end_date?: string | null
          day_portion?: string | null
          status?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_policy_id_fkey"
            columns: ["policy_id"]
            referencedRelation: "time_off_policies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}