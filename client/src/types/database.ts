export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// CUSTOM ENUM TYPES
// ============================================================================

export type PharmacyType = 'Chain' | 'Independent' | 'Hospital' | 'Generics';

export type MedicineForm =
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

export type MedicineCategory =
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

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type UserLevel = 'Baguhan' | 'Scout' | 'Champion' | 'Legend';

// Type aliases for backward compatibility
export type PharmacyTypeEnum = PharmacyType;
export type MedicineFormEnum = MedicineForm;
export type MedicineCategoryEnum = MedicineCategory;
export type StockStatusEnum = StockStatus;
export type UserLevelEnum = UserLevel;

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface PharmacyRow {
  id: string;
  name: string;
  slug: string;
  location: unknown; // PostGIS geography type
  address: string;
  city: string;
  phone: string | null;
  type: PharmacyType;
  chain_name: string | null;
  operating_hours: Json | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  rating: number | null;
  total_reports: number;
  created_at: string;
  updated_at: string;
}

export interface MedicineRow {
  id: string;
  brand_name: string | null;
  generic_name: string;
  dosage: string | null;
  form: MedicineForm | null;
  category: MedicineCategory | null;
  tags: string[];
  requires_prescription: boolean;
  description: string | null;
  side_effects: string[] | null;
  contraindications: string[] | null;
  search_vector: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryReportRow {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  reported_by: string;
  status: StockStatus;
  price: number | null;
  notes: string | null;
  reporter_location: unknown | null;
  distance_from_pharmacy: number | null;
  helpful_count: number;
  not_helpful_count: number;
  expires_at: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  alay_points: number;
  streak_days: number;
  contribution_count: number;
  level: UserLevel;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface HelpfulVoteRow {
  id: string;
  report_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export type PharmacyInsert = Omit<PharmacyRow, 'id' | 'created_at' | 'updated_at' | 'total_reports'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  total_reports?: number;
};

export type PharmacyUpdate = Partial<PharmacyRow>;

export type MedicineInsert = Omit<MedicineRow, 'id' | 'created_at' | 'updated_at' | 'search_vector'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type MedicineUpdate = Partial<MedicineRow>;

export type InventoryReportInsert = Omit<InventoryReportRow, 'id' | 'created_at' | 'helpful_count' | 'not_helpful_count' | 'expires_at'> & {
  id?: string;
  created_at?: string;
  helpful_count?: number;
  not_helpful_count?: number;
  expires_at?: string;
};

export type InventoryReportUpdate = Partial<InventoryReportRow>;

export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at' | 'alay_points' | 'streak_days' | 'contribution_count' | 'level' | 'badges'> & {
  alay_points?: number;
  streak_days?: number;
  contribution_count?: number;
  level?: UserLevel;
  badges?: string[];
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<ProfileRow>;

export type HelpfulVoteInsert = Omit<HelpfulVoteRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type HelpfulVoteUpdate = Partial<HelpfulVoteRow>;

// ============================================================================
// FUNCTION TYPES
// ============================================================================

export interface FunctionArgs {
  find_nearby_pharmacies: {
    user_lat: number;
    user_lng: number;
    radius_meters?: number;
  };
  search_medicines: {
    search_query: string;
    result_limit?: number;
  };
  get_pharmacy_stock: {
    p_pharmacy_id: string;
  };
  check_duplicate_report: {
    p_user_id: string;
    p_pharmacy_id: string;
    p_medicine_id: string;
  };
  check_rate_limit: {
    p_user_id: string;
  };
  vote_report_accuracy: {
    p_user_id: string;
    p_report_id: string;
    p_is_accurate: boolean;
  };
}

export interface FunctionReturns {
  find_nearby_pharmacies: NearbyPharmacyResult[];
  search_medicines: MedicineSearchResult[];
  get_pharmacy_stock: PharmacyStockResult[];
  check_duplicate_report: { is_duplicate: boolean; existing_report_id?: string };
  check_rate_limit: { can_report: boolean; remaining_reports: number; reset_at?: string };
  vote_report_accuracy: { success: boolean };
}

// ============================================================================
// RPC FUNCTION RETURN TYPES
// ============================================================================

export interface NearbyPharmacyResult {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  phone: string | null;
  type: PharmacyType;
  chain_name: string | null;
  operating_hours: Json | null;
  is_24_hours: boolean;
  is_verified: boolean;
  logo_url: string | null;
  rating: number | null;
  total_reports: number;
  distance_meters: number;
}

export interface MedicineSearchResult {
  id: string;
  brand_name: string | null;
  generic_name: string;
  dosage: string | null;
  form: MedicineForm | null;
  category: MedicineCategory | null;
  tags: string[];
  requires_prescription: boolean;
  description: string | null;
  rank: number;
}

export interface PharmacyStockResult {
  medicine_id: string;
  brand_name: string | null;
  generic_name: string;
  status: StockStatus;
  price: number | null;
  reported_by: string;
  reporter_name: string | null;
  created_at: string;
  expires_at: string;
  helpful_count: number;
  not_helpful_count: number;
}

// ============================================================================
// DATABASE TYPE (for Supabase client)
// ============================================================================

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      pharmacies: {
        Row: PharmacyRow
        Insert: Omit<PharmacyRow, 'id' | 'created_at' | 'updated_at' | 'total_reports'> & {
          id?: string
          created_at?: string
          updated_at?: string
          total_reports?: number
        }
        Update: Partial<PharmacyRow>
      }
      medicines: {
        Row: MedicineRow
        Insert: Omit<MedicineRow, 'id' | 'created_at' | 'updated_at' | 'search_vector'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<MedicineRow>
      }
      inventory_reports: {
        Row: InventoryReportRow
        Insert: Omit<InventoryReportRow, 'id' | 'created_at' | 'helpful_count' | 'not_helpful_count' | 'expires_at'> & {
          id?: string
          created_at?: string
          helpful_count?: number
          not_helpful_count?: number
          expires_at?: string
        }
        Update: Partial<InventoryReportRow>
      }
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at' | 'alay_points' | 'streak_days' | 'contribution_count' | 'level' | 'badges'> & {
          alay_points?: number
          streak_days?: number
          contribution_count?: number
          level?: UserLevel
          badges?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: Partial<ProfileRow>
      }
      helpful_votes: {
        Row: HelpfulVoteRow
        Insert: Omit<HelpfulVoteRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<HelpfulVoteRow>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_nearby_pharmacies: {
        Args: {
          user_lat: number
          user_lng: number
          radius_meters?: number
        }
        Returns: NearbyPharmacyResult[]
      }
      search_medicines: {
        Args: {
          search_query: string
          result_limit?: number
        }
        Returns: MedicineSearchResult[]
      }
      get_pharmacy_stock: {
        Args: {
          p_pharmacy_id: string
        }
        Returns: PharmacyStockResult[]
      }
    }
    Enums: {
      pharmacy_type: PharmacyType
      medicine_form: MedicineForm
      medicine_category: MedicineCategory
      stock_status: StockStatus
      user_level: UserLevel
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

