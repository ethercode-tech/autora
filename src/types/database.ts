export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          id: string;
          email: string;
          name: string;
          business_name: string;
          requested_plan_id: string | null;
          payment_proof_url: string | null;
          status: string;
          requested_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
          resolution_notes: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          business_name: string;
          requested_plan_id?: string | null;
          payment_proof_url?: string | null;
          status?: string;
          requested_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          resolution_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["access_requests"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          // Optional while older projects complete the additive profile migration.
          full_name?: string | null;
          email?: string | null;
          business_name: string | null;
          currency: string | null;
          business_type: "manufacturer" | "reseller" | null;
          account_status:
            | "pending"
            | "approved_pending_payment"
            | "active"
            | "past_due"
            | "blocked"
            | "rejected"
            | "cancelled";
          onboarding_completed: boolean;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          business_name?: string | null;
          currency?: string | null;
          business_type?: "manufacturer" | "reseller" | null;
          account_status?: Database["public"]["Tables"]["profiles"]["Row"]["account_status"];
          onboarding_completed?: boolean;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
