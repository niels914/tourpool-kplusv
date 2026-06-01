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
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          is_admin: boolean;
          is_blocked: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email: string;
          is_admin?: boolean;
          is_blocked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string;
          is_admin?: boolean;
          is_blocked?: boolean;
        };
      };
      riders: {
        Row: {
          id: string;
          bib_number: number;
          bib_digit: number;
          full_name: string;
          team_name: string;
          nationality: string | null;
          pcs_slug: string | null;
          is_dns: boolean;
          is_dnf: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bib_number: number;
          full_name: string;
          team_name: string;
          nationality?: string | null;
          pcs_slug?: string | null;
          is_dns?: boolean;
          is_dnf?: boolean;
        };
        Update: {
          bib_number?: number;
          full_name?: string;
          team_name?: string;
          nationality?: string | null;
          pcs_slug?: string | null;
          is_dns?: boolean;
          is_dnf?: boolean;
        };
      };
      team_picks: {
        Row: {
          id: string;
          user_id: string;
          rider_id: string;
          bib_slot: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rider_id: string;
          bib_slot: number;
        };
        Update: {
          rider_id?: string;
        };
      };
      stages: {
        Row: {
          id: string;
          stage_number: number;
          stage_date: string;
          stage_type: "rit" | "ttt" | "itt";
          departure: string | null;
          arrival: string | null;
          distance_km: number | null;
          status: "scheduled" | "live" | "results_pending" | "locked";
          pcs_stage_url: string | null;
          locked_at: string | null;
          locked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          stage_number: number;
          stage_date: string;
          stage_type?: "rit" | "ttt" | "itt";
          departure?: string | null;
          arrival?: string | null;
          distance_km?: number | null;
          status?: "scheduled" | "live" | "results_pending" | "locked";
          pcs_stage_url?: string | null;
        };
        Update: {
          stage_number?: number;
          stage_date?: string;
          stage_type?: "rit" | "ttt" | "itt";
          departure?: string | null;
          arrival?: string | null;
          distance_km?: number | null;
          status?: "scheduled" | "live" | "results_pending" | "locked";
          pcs_stage_url?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
        };
      };
      stage_results: {
        Row: {
          id: string;
          stage_id: string;
          rider_id: string;
          result_type:
            | "stage_finish"
            | "gc_standing"
            | "mountain_standing"
            | "sprint_standing"
            | "white_standing";
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stage_id: string;
          rider_id: string;
          result_type:
            | "stage_finish"
            | "gc_standing"
            | "mountain_standing"
            | "sprint_standing"
            | "white_standing";
          position: number;
        };
        Update: {
          rider_id?: string;
          position?: number;
        };
      };
      final_results: {
        Row: {
          id: string;
          rider_id: string;
          result_type: "final_gc" | "final_mountain" | "final_sprint" | "final_white";
          position: number;
        };
        Insert: {
          id?: string;
          rider_id: string;
          result_type: "final_gc" | "final_mountain" | "final_sprint" | "final_white";
          position: number;
        };
        Update: {
          rider_id?: string;
          position?: number;
        };
      };
      config: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          value?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          email: string | null;
          token: string;
          used_at: string | null;
          used_by: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          token?: string;
          created_by: string;
        };
        Update: {
          used_at?: string | null;
          used_by?: string | null;
        };
      };
    };
    Views: {
      klassement: {
        Row: {
          user_id: string;
          display_name: string;
          email: string;
          total_points: number;
          stage_points: number;
          bonus_points: number;
          rank: number;
        };
      };
      rider_pick_counts: {
        Row: {
          rider_id: string;
          pick_count: number;
        };
      };
      rider_score_detail: {
        Row: {
          user_id: string;
          rider_id: string;
          rider_name: string;
          bib_number: number;
          team_name: string;
          bib_slot: number;
          pick_count: number;
          weighted_stage_points: number;
          weighted_bonus_points: number;
        };
      };
      cumulative_points: {
        Row: {
          user_id: string;
          stage_number: number;
          cumulative_points: number;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      registration_open: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      stage_finish_points: {
        Args: { pos: number };
        Returns: number;
      };
      jersey_points: {
        Args: { rtype: string; pos: number };
        Returns: number;
      };
      final_bonus_points: {
        Args: { rtype: string; pos: number };
        Returns: number;
      };
    };
    Enums: {
      stage_type: "rit" | "ttt" | "itt";
      stage_status: "scheduled" | "live" | "results_pending" | "locked";
      result_type:
        | "stage_finish"
        | "gc_standing"
        | "mountain_standing"
        | "sprint_standing"
        | "white_standing";
      final_result_type: "final_gc" | "final_mountain" | "final_sprint" | "final_white";
    };
  };
};
