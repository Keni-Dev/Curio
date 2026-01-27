/**
 * Supabase Database Type Definitions
 * 
 * These types represent the database schema and are used for type-safe
 * interactions with Supabase. They follow snake_case conventions for
 * database columns while the app uses camelCase (see transformers in utils).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// ENUMS
// ============================================================================

export type PharmacyTypeEnum = 'Chain' | 'Independent' | 'Hospital' | 'Generics';

export type MedicineFormEnum =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Suspension'
  | 'Injection'
  | 'Cream'
  | 'Ointment'
  | 'Drops'
  | 'Inhaler'
  | 'Patch'
  | 'Suppository'
  | 'Other';

export type MedicineCategoryEnum =
  | 'Pain Relief'
  | 'Antibiotics'
  | 'Cardiovascular'
  | 'Diabetes'
  | 'Respiratory'
  | 'Gastrointestinal'
  | 'Vitamins'
  | 'Dermatology'
  | 'Mental Health'
  | 'Allergy'
  | 'Other';

export type StockStatusEnum = 'in_stock' | 'low_stock' | 'out_of_stock';

export type UserLevelEnum = 'Baguhan' | 'Scout' | 'Champion' | 'Legend';

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

export interface Database {
  public: {
    Tables: {
      pharmacies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          location: unknown; // PostGIS geography point
          address: string;
          city: string;
          phone: string | null;
          type: PharmacyTypeEnum;
          chain_name: string | null;
          operating_hours: Json | null;
          is_24_hours: boolean;
          is_verified: boolean;
          logo_url: string | null;
          rating: number | null;
          total_reports: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          location: unknown;
          address: string;
          city: string;
          phone?: string | null;
          type: PharmacyTypeEnum;
          chain_name?: string | null;
          operating_hours?: Json | null;
          is_24_hours?: boolean;
          is_verified?: boolean;
          logo_url?: string | null;
          rating?: number | null;
          total_reports?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          location?: unknown;
          address?: string;
          city?: string;
          phone?: string | null;
          type?: PharmacyTypeEnum;
          chain_name?: string | null;
          operating_hours?: Json | null;
          is_24_hours?: boolean;
          is_verified?: boolean;
          logo_url?: string | null;
          rating?: number | null;
          total_reports?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      medicines: {
        Row: {
          id: string;
          brand_name: string | null;
          generic_name: string;
          dosage: string | null;
          form: MedicineFormEnum | null;
          category: MedicineCategoryEnum | null;
          tags: string[];
          requires_prescription: boolean;
          description: string | null;
          side_effects: string[] | null;
          contraindications: string[] | null;
          search_vector: unknown | null; // tsvector
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_name?: string | null;
          generic_name: string;
          dosage?: string | null;
          form?: MedicineFormEnum | null;
          category?: MedicineCategoryEnum | null;
          tags?: string[];
          requires_prescription?: boolean;
          description?: string | null;
          side_effects?: string[] | null;
          contraindications?: string[] | null;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_name?: string | null;
          generic_name?: string;
          dosage?: string | null;
          form?: MedicineFormEnum | null;
          category?: MedicineCategoryEnum | null;
          tags?: string[];
          requires_prescription?: boolean;
          description?: string | null;
          side_effects?: string[] | null;
          contraindications?: string[] | null;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      inventory_reports: {
        Row: {
          id: string;
          pharmacy_id: string;
          medicine_id: string;
          reported_by: string;
          status: StockStatusEnum;
          price: number | null;
          notes: string | null;
          reporter_location: unknown | null; // PostGIS geography point
          distance_from_pharmacy: number | null;
          helpful_count: number;
          not_helpful_count: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pharmacy_id: string;
          medicine_id: string;
          reported_by: string;
          status: StockStatusEnum;
          price?: number | null;
          notes?: string | null;
          reporter_location?: unknown | null;
          distance_from_pharmacy?: number | null;
          helpful_count?: number;
          not_helpful_count?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pharmacy_id?: string;
          medicine_id?: string;
          reported_by?: string;
          status?: StockStatusEnum;
          price?: number | null;
          notes?: string | null;
          reporter_location?: unknown | null;
          distance_from_pharmacy?: number | null;
          helpful_count?: number;
          not_helpful_count?: number;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_reports_pharmacy_id_fkey';
            columns: ['pharmacy_id'];
            referencedRelation: 'pharmacies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_reports_medicine_id_fkey';
            columns: ['medicine_id'];
            referencedRelation: 'medicines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_reports_reported_by_fkey';
            columns: ['reported_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          alay_points: number;
          streak_days: number;
          contribution_count: number;
          level: UserLevelEnum;
          trust_score: number;
          last_contribution_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // Must match auth.users.id
          display_name?: string | null;
          avatar_url?: string | null;
          alay_points?: number;
          streak_days?: number;
          contribution_count?: number;
          level?: UserLevelEnum;
          trust_score?: number;
          last_contribution_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          alay_points?: number;
          streak_days?: number;
          contribution_count?: number;
          level?: UserLevelEnum;
          trust_score?: number;
          last_contribution_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      helpful_votes: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          is_helpful: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id: string;
          is_helpful: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string;
          is_helpful?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'helpful_votes_report_id_fkey';
            columns: ['report_id'];
            referencedRelation: 'inventory_reports';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'helpful_votes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      find_nearby_pharmacies: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_meters?: number;
        };
        Returns: Array<{
          id: string;
          name: string;
          slug: string;
          lat: number;
          lng: number;
          address: string;
          city: string;
          phone: string | null;
          type: PharmacyTypeEnum;
          chain_name: string | null;
          operating_hours: Json | null;
          is_24_hours: boolean;
          is_verified: boolean;
          logo_url: string | null;
          rating: number | null;
          total_reports: number;
          distance_meters: number;
        }>;
      };

      search_medicines: {
        Args: {
          search_query: string;
          result_limit?: number;
        };
        Returns: Array<{
          id: string;
          brand_name: string | null;
          generic_name: string;
          dosage: string | null;
          form: MedicineFormEnum | null;
          category: MedicineCategoryEnum | null;
          tags: string[];
          requires_prescription: boolean;
          description: string | null;
          rank: number;
        }>;
      };

      get_pharmacy_stock: {
        Args: {
          p_pharmacy_id: string;
        };
        Returns: Array<{
          medicine_id: string;
          brand_name: string | null;
          generic_name: string;
          status: StockStatusEnum;
          price: number | null;
          reported_by: string;
          reporter_name: string | null;
          created_at: string;
          expires_at: string;
          helpful_count: number;
          not_helpful_count: number;
        }>;
      };
    };

    Enums: {
      pharmacy_type: PharmacyTypeEnum;
      medicine_form: MedicineFormEnum;
      medicine_category: MedicineCategoryEnum;
      stock_status: StockStatusEnum;
      user_level: UserLevelEnum;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/** Shorthand for accessing table row types */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Shorthand for accessing table insert types */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Shorthand for accessing table update types */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/** Shorthand for accessing function return types */
export type FunctionReturns<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Returns'];

/** Shorthand for accessing function argument types */
export type FunctionArgs<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]['Args'];

// ============================================================================
// CONVENIENCE ALIASES
// ============================================================================

export type PharmacyRow = Tables<'pharmacies'>;
export type PharmacyInsert = TablesInsert<'pharmacies'>;
export type PharmacyUpdate = TablesUpdate<'pharmacies'>;

export type MedicineRow = Tables<'medicines'>;
export type MedicineInsert = TablesInsert<'medicines'>;
export type MedicineUpdate = TablesUpdate<'medicines'>;

export type InventoryReportRow = Tables<'inventory_reports'>;
export type InventoryReportInsert = TablesInsert<'inventory_reports'>;
export type InventoryReportUpdate = TablesUpdate<'inventory_reports'>;

export type ProfileRow = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type HelpfulVoteRow = Tables<'helpful_votes'>;
export type HelpfulVoteInsert = TablesInsert<'helpful_votes'>;
export type HelpfulVoteUpdate = TablesUpdate<'helpful_votes'>;

// Function return types
export type NearbyPharmacy = FunctionReturns<'find_nearby_pharmacies'>[number];
export type MedicineSearchResult = FunctionReturns<'search_medicines'>[number];
export type PharmacyStockItem = FunctionReturns<'get_pharmacy_stock'>[number];
