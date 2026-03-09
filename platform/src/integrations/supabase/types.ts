Initialising login role...
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
      achievement_badge_definitions: {
        Row: {
          badge_type: string
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number | null
          rarity: string | null
          unlock_criteria: Json | null
          user_id: string | null
        }
        Insert: {
          badge_type: string
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
          rarity?: string | null
          unlock_criteria?: Json | null
          user_id?: string | null
        }
        Update: {
          badge_type?: string
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
          rarity?: string | null
          unlock_criteria?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      acknowledgment_stamps: {
        Row: {
          action_id: string
          action_type: string
          arena_id: string | null
          flagstone_text_shown: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          stamp_hash: string
          stamped_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_id: string
          action_type: string
          arena_id?: string | null
          flagstone_text_shown?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          stamp_hash: string
          stamped_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_id?: string
          action_type?: string
          arena_id?: string | null
          flagstone_text_shown?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          stamp_hash?: string
          stamped_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acknowledgment_stamps_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      advance_order_items: {
        Row: {
          created_at: string | null
          farmer_id: string | null
          id: string
          item_name: string
          order_id: string | null
          organic: boolean | null
          price_credits: number
          produce_category: string | null
          quantity: string
        }
        Insert: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          item_name: string
          order_id?: string | null
          organic?: boolean | null
          price_credits: number
          produce_category?: string | null
          quantity: string
        }
        Update: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          item_name?: string
          order_id?: string | null
          organic?: boolean | null
          price_credits?: number
          produce_category?: string | null
          quantity?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_order_items_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "advance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      advance_orders: {
        Row: {
          actual_delivery_at: string | null
          created_at: string | null
          delivery_window_end: string | null
          delivery_window_start: string | null
          driver_id: string | null
          driver_share: number | null
          farmer_share: number | null
          id: string
          member_id: string | null
          node_id: string | null
          node_operator_share: number | null
          order_placed_at: string | null
          platform_margin: number | null
          status: string
          subtotal: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_at?: string | null
          created_at?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          driver_id?: string | null
          driver_share?: number | null
          farmer_share?: number | null
          id?: string
          member_id?: string | null
          node_id?: string | null
          node_operator_share?: number | null
          order_placed_at?: string | null
          platform_margin?: number | null
          status?: string
          subtotal?: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_at?: string | null
          created_at?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          driver_id?: string | null
          driver_share?: number | null
          farmer_share?: number | null
          id?: string
          member_id?: string | null
          node_id?: string | null
          node_operator_share?: number | null
          order_placed_at?: string | null
          platform_margin?: number | null
          status?: string
          subtotal?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_orders_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "distribution_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      aggregated_shopping_list: {
        Row: {
          actual_total_price: number | null
          actual_unit_price: number | null
          aggregation_window_id: string | null
          category: string | null
          created_at: string | null
          display_name: string
          estimated_total_price: number | null
          estimated_unit_price: number | null
          found_at_store: string | null
          id: string
          ingredient_normalized: string
          notes: string | null
          preferred_store: string | null
          purchased_quantity: number | null
          requesting_users: number | null
          status: string | null
          substitution_item: string | null
          total_quantity: number
          unit: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_total_price?: number | null
          actual_unit_price?: number | null
          aggregation_window_id?: string | null
          category?: string | null
          created_at?: string | null
          display_name: string
          estimated_total_price?: number | null
          estimated_unit_price?: number | null
          found_at_store?: string | null
          id?: string
          ingredient_normalized: string
          notes?: string | null
          preferred_store?: string | null
          purchased_quantity?: number | null
          requesting_users?: number | null
          status?: string | null
          substitution_item?: string | null
          total_quantity: number
          unit: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_total_price?: number | null
          actual_unit_price?: number | null
          aggregation_window_id?: string | null
          category?: string | null
          created_at?: string | null
          display_name?: string
          estimated_total_price?: number | null
          estimated_unit_price?: number | null
          found_at_store?: string | null
          id?: string
          ingredient_normalized?: string
          notes?: string | null
          preferred_store?: string | null
          purchased_quantity?: number | null
          requesting_users?: number | null
          status?: string | null
          substitution_item?: string | null
          total_quantity?: number
          unit?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aggregated_shopping_list_aggregation_window_id_fkey"
            columns: ["aggregation_window_id"]
            isOneToOne: false
            referencedRelation: "demand_aggregation_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      aggregation_participants: {
        Row: {
          aggregation_window_id: string | null
          created_at: string | null
          delivery_address: string | null
          delivery_instructions: string | null
          estimated_value: number | null
          household_id: string | null
          id: string
          item_count: number | null
          notified_at: string | null
          notified_of_aggregation: boolean | null
          payment_authorization_id: string | null
          payment_authorized: boolean | null
          responded_at: string | null
          response_deadline: string | null
          share_of_delivery_fee: number | null
          status: string | null
          total_charge: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aggregation_window_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          estimated_value?: number | null
          household_id?: string | null
          id?: string
          item_count?: number | null
          notified_at?: string | null
          notified_of_aggregation?: boolean | null
          payment_authorization_id?: string | null
          payment_authorized?: boolean | null
          responded_at?: string | null
          response_deadline?: string | null
          share_of_delivery_fee?: number | null
          status?: string | null
          total_charge?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aggregation_window_id?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          estimated_value?: number | null
          household_id?: string | null
          id?: string
          item_count?: number | null
          notified_at?: string | null
          notified_of_aggregation?: boolean | null
          payment_authorization_id?: string | null
          payment_authorized?: boolean | null
          responded_at?: string | null
          response_deadline?: string | null
          share_of_delivery_fee?: number | null
          status?: string | null
          total_charge?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aggregation_participants_aggregation_window_id_fkey"
            columns: ["aggregation_window_id"]
            isOneToOne: false
            referencedRelation: "demand_aggregation_windows"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page_path: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      anchors: {
        Row: {
          business_type: string | null
          c20_reciprocity_balance: number | null
          c20_total_balance_spent: number | null
          c20_total_margin_contributed: number | null
          charitable_tier_id: string | null
          city: string | null
          cost_plus_compliance_ratio: number | null
          cost_plus_compliant_gmv: number | null
          cost_plus_notes: string | null
          cost_plus_revoked_at: string | null
          cost_plus_revoked_reason: string | null
          cost_plus_total_gmv: number | null
          cost_plus_verified_at: string | null
          cost_plus_verified_by: string | null
          country: string | null
          created_at: string | null
          description: string | null
          destination_url: string
          display_name: string
          id: string
          is_local_pickup_available: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          owner_id: string
          pass_through_level: number | null
          postal_code: string | null
          pricing_policy: string | null
          region: string | null
          status: string | null
          total_pass_throughs: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          verification_code: string | null
          verification_method: string | null
          verified_at: string | null
          verified_cost_plus: boolean | null
        }
        Insert: {
          business_type?: string | null
          c20_reciprocity_balance?: number | null
          c20_total_balance_spent?: number | null
          c20_total_margin_contributed?: number | null
          charitable_tier_id?: string | null
          city?: string | null
          cost_plus_compliance_ratio?: number | null
          cost_plus_compliant_gmv?: number | null
          cost_plus_notes?: string | null
          cost_plus_revoked_at?: string | null
          cost_plus_revoked_reason?: string | null
          cost_plus_total_gmv?: number | null
          cost_plus_verified_at?: string | null
          cost_plus_verified_by?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          destination_url: string
          display_name: string
          id?: string
          is_local_pickup_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          pass_through_level?: number | null
          postal_code?: string | null
          pricing_policy?: string | null
          region?: string | null
          status?: string | null
          total_pass_throughs?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string | null
          verification_method?: string | null
          verified_at?: string | null
          verified_cost_plus?: boolean | null
        }
        Update: {
          business_type?: string | null
          c20_reciprocity_balance?: number | null
          c20_total_balance_spent?: number | null
          c20_total_margin_contributed?: number | null
          charitable_tier_id?: string | null
          city?: string | null
          cost_plus_compliance_ratio?: number | null
          cost_plus_compliant_gmv?: number | null
          cost_plus_notes?: string | null
          cost_plus_revoked_at?: string | null
          cost_plus_revoked_reason?: string | null
          cost_plus_total_gmv?: number | null
          cost_plus_verified_at?: string | null
          cost_plus_verified_by?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          destination_url?: string
          display_name?: string
          id?: string
          is_local_pickup_available?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          pass_through_level?: number | null
          postal_code?: string | null
          pricing_policy?: string | null
          region?: string | null
          status?: string | null
          total_pass_throughs?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string | null
          verification_method?: string | null
          verified_at?: string | null
          verified_cost_plus?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "anchors_charitable_tier_id_fkey"
            columns: ["charitable_tier_id"]
            isOneToOne: false
            referencedRelation: "charitable_business_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      archaeological_evidence: {
        Row: {
          created_at: string | null
          created_by: string | null
          discovery_date: string | null
          id: string
          image_url: string | null
          loc_reference: string | null
          location: string | null
          museum_location: string | null
          name: string
          related_branches: string[] | null
          scholar_consensus: string | null
          significance: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          discovery_date?: string | null
          id?: string
          image_url?: string | null
          loc_reference?: string | null
          location?: string | null
          museum_location?: string | null
          name: string
          related_branches?: string[] | null
          scholar_consensus?: string | null
          significance: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          discovery_date?: string | null
          id?: string
          image_url?: string | null
          loc_reference?: string | null
          location?: string | null
          museum_location?: string | null
          name?: string
          related_branches?: string[] | null
          scholar_consensus?: string | null
          significance?: string
        }
        Relationships: []
      }
      architect_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      architect_controls: {
        Row: {
          control_key: string
          control_value: Json
          created_at: string | null
          description: string | null
          id: string
          last_modified_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          control_key: string
          control_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          control_key?: string
          control_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          last_modified_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      arena_freezes: {
        Row: {
          arena_id: string | null
          credits_to_resolve: number | null
          duration_hours: number
          freeze_tier: string
          frozen_at: string | null
          id: string
          is_active: boolean | null
          reason: string
          resolved_by: string | null
          unfrozen_at: string | null
          user_id: string
        }
        Insert: {
          arena_id?: string | null
          credits_to_resolve?: number | null
          duration_hours: number
          freeze_tier: string
          frozen_at?: string | null
          id?: string
          is_active?: boolean | null
          reason: string
          resolved_by?: string | null
          unfrozen_at?: string | null
          user_id: string
        }
        Update: {
          arena_id?: string | null
          credits_to_resolve?: number | null
          duration_hours?: number
          freeze_tier?: string
          frozen_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string
          resolved_by?: string | null
          unfrozen_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_freezes_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_memberships: {
        Row: {
          arena_id: string
          freeze_tier: string | null
          freeze_until: string | null
          id: string
          is_frozen: boolean | null
          joined_at: string | null
          last_active_at: string | null
          reputation_score: number | null
          tier: number
          total_posts: number | null
          total_reports_received: number | null
          user_id: string
        }
        Insert: {
          arena_id: string
          freeze_tier?: string | null
          freeze_until?: string | null
          id?: string
          is_frozen?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          reputation_score?: number | null
          tier?: number
          total_posts?: number | null
          total_reports_received?: number | null
          user_id: string
        }
        Update: {
          arena_id?: string
          freeze_tier?: string | null
          freeze_until?: string | null
          id?: string
          is_frozen?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          reputation_score?: number | null
          tier?: number
          total_posts?: number | null
          total_reports_received?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_memberships_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_posts: {
        Row: {
          arena_id: string
          body: string
          created_at: string | null
          downvotes: number | null
          id: string
          is_flagged: boolean | null
          is_removed: boolean | null
          parent_id: string | null
          sources: string[] | null
          steelman: string | null
          tier: number
          title: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          arena_id: string
          body: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_flagged?: boolean | null
          is_removed?: boolean | null
          parent_id?: string | null
          sources?: string[] | null
          steelman?: string | null
          tier: number
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          arena_id?: string
          body?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_flagged?: boolean | null
          is_removed?: boolean | null
          parent_id?: string | null
          sources?: string[] | null
          steelman?: string | null
          tier?: number
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arena_posts_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "arena_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      arena_reports: {
        Row: {
          arena_id: string | null
          created_at: string | null
          effective_weight: number | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reporter_trust_level: number | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          arena_id?: string | null
          created_at?: string | null
          effective_weight?: number | null
          id?: string
          post_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          reporter_trust_level?: number | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          arena_id?: string | null
          created_at?: string | null
          effective_weight?: number | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reporter_trust_level?: number | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arena_reports_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arena_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "arena_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      arenas: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          discord_invite_url: string | null
          entry_flagstone_text: string | null
          exit_flagstone_text: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          portal_name: string
          slug: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          discord_invite_url?: string | null
          entry_flagstone_text?: string | null
          exit_flagstone_text?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          portal_name: string
          slug: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          discord_invite_url?: string | null
          entry_flagstone_text?: string | null
          exit_flagstone_text?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          portal_name?: string
          slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      areopagus_dictionary: {
        Row: {
          cognates: string[] | null
          created_at: string | null
          created_by: string | null
          definitions: Json
          historical_evolution: string | null
          id: string
          lexicon_entries: Json | null
          loc_classification: string | null
          original_language: string
          original_script: string
          pronunciation: string | null
          quality_score: number | null
          root_word: string | null
          scripture_occurrences: Json | null
          term: string
          transliteration: string
          updated_at: string | null
        }
        Insert: {
          cognates?: string[] | null
          created_at?: string | null
          created_by?: string | null
          definitions?: Json
          historical_evolution?: string | null
          id?: string
          lexicon_entries?: Json | null
          loc_classification?: string | null
          original_language: string
          original_script: string
          pronunciation?: string | null
          quality_score?: number | null
          root_word?: string | null
          scripture_occurrences?: Json | null
          term: string
          transliteration: string
          updated_at?: string | null
        }
        Update: {
          cognates?: string[] | null
          created_at?: string | null
          created_by?: string | null
          definitions?: Json
          historical_evolution?: string | null
          id?: string
          lexicon_entries?: Json | null
          loc_classification?: string | null
          original_language?: string
          original_script?: string
          pronunciation?: string | null
          quality_score?: number | null
          root_word?: string | null
          scripture_occurrences?: Json | null
          term?: string
          transliteration?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      areopagus_stamps: {
        Row: {
          branch_id: string | null
          earned_at: string | null
          id: string
          stamp_type: string
          user_id: string
          value: number | null
        }
        Insert: {
          branch_id?: string | null
          earned_at?: string | null
          id?: string
          stamp_type: string
          user_id: string
          value?: number | null
        }
        Update: {
          branch_id?: string | null
          earned_at?: string | null
          id?: string
          stamp_type?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "areopagus_stamps_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "doctrine_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      article_submissions: {
        Row: {
          article_file_path: string | null
          article_title: string
          article_type: string | null
          contact_email: string | null
          created_at: string | null
          credits_pledged: number | null
          editor_name: string | null
          follow_up_date: string | null
          golden_key: string | null
          id: string
          joule_multiplier: number | null
          priority: number | null
          publication_email: string | null
          publication_name: string
          published_at: string | null
          published_url: string | null
          rejection_reason: string | null
          response_at: string | null
          retry_after: string | null
          scheduled_for: string | null
          status: string | null
          submission_url: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_file_path?: string | null
          article_title: string
          article_type?: string | null
          contact_email?: string | null
          created_at?: string | null
          credits_pledged?: number | null
          editor_name?: string | null
          follow_up_date?: string | null
          golden_key?: string | null
          id?: string
          joule_multiplier?: number | null
          priority?: number | null
          publication_email?: string | null
          publication_name: string
          published_at?: string | null
          published_url?: string | null
          rejection_reason?: string | null
          response_at?: string | null
          retry_after?: string | null
          scheduled_for?: string | null
          status?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_file_path?: string | null
          article_title?: string
          article_type?: string | null
          contact_email?: string | null
          created_at?: string | null
          credits_pledged?: number | null
          editor_name?: string | null
          follow_up_date?: string | null
          golden_key?: string | null
          id?: string
          joule_multiplier?: number | null
          priority?: number | null
          publication_email?: string | null
          publication_name?: string
          published_at?: string | null
          published_url?: string | null
          rejection_reason?: string | null
          response_at?: string | null
          retry_after?: string | null
          scheduled_for?: string | null
          status?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      asset_prototyping_contracts: {
        Row: {
          asset_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          provider_id: string | null
          quoted_price: number | null
          requester_id: string | null
          requirements: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          quoted_price?: number | null
          requester_id?: string | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          provider_id?: string | null
          quoted_price?: number | null
          requester_id?: string | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_prototyping_contracts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "lb_asset_library"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      badge_types: {
        Row: {
          badge_category: string
          badge_code: string
          badge_color: string | null
          created_at: string | null
          description: string | null
          display_name: string
          featured_placement: boolean | null
          icon: string
          id: string
          is_active: boolean | null
          requirement_type: string | null
          requirement_value: number | null
          tier_level: number | null
          tier_name: string | null
          trust_score_bonus: number | null
          user_id: string | null
        }
        Insert: {
          badge_category: string
          badge_code: string
          badge_color?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          featured_placement?: boolean | null
          icon: string
          id?: string
          is_active?: boolean | null
          requirement_type?: string | null
          requirement_value?: number | null
          tier_level?: number | null
          tier_name?: string | null
          trust_score_bonus?: number | null
          user_id?: string | null
        }
        Update: {
          badge_category?: string
          badge_code?: string
          badge_color?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          featured_placement?: boolean | null
          icon?: string
          id?: string
          is_active?: boolean | null
          requirement_type?: string | null
          requirement_value?: number | null
          tier_level?: number | null
          tier_name?: string | null
          trust_score_bonus?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      beacon_folders: {
        Row: {
          color: string | null
          created_at: string | null
          ghost_id: string | null
          icon: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          ghost_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          ghost_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beacon_folders_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beacon_run_leaderboard: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number
          id: string
          is_current_record: boolean | null
          run_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds: number
          id?: string
          is_current_record?: boolean | null
          run_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number
          id?: string
          is_current_record?: boolean | null
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beacon_run_leaderboard_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "beacon_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_run_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_run_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beacon_run_progress: {
        Row: {
          beacons_reached: string[] | null
          completed_at: string | null
          crow_feather_id: number | null
          current_beacon_index: number | null
          elapsed_seconds: number | null
          ghost_id: string | null
          ghost_session_id: string | null
          id: string
          run_id: string
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          beacons_reached?: string[] | null
          completed_at?: string | null
          crow_feather_id?: number | null
          current_beacon_index?: number | null
          elapsed_seconds?: number | null
          ghost_id?: string | null
          ghost_session_id?: string | null
          id?: string
          run_id: string
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          beacons_reached?: string[] | null
          completed_at?: string | null
          crow_feather_id?: number | null
          current_beacon_index?: number | null
          elapsed_seconds?: number | null
          ghost_id?: string | null
          ghost_session_id?: string | null
          id?: string
          run_id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beacon_run_progress_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "beacon_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_run_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_run_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beacon_runs: {
        Row: {
          ante_credits: number | null
          beacon_ids: string[]
          best_time_seconds: number | null
          best_time_user_id: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          difficulty: string | null
          estimated_minutes: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          name: string
          prize_pool_credits: number | null
          published_at: string | null
          requires_ghost_mode: boolean | null
          slug: string | null
          times_completed: number | null
          times_started: number | null
          total_beacons: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ante_credits?: number | null
          beacon_ids?: string[]
          best_time_seconds?: number | null
          best_time_user_id?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          name: string
          prize_pool_credits?: number | null
          published_at?: string | null
          requires_ghost_mode?: boolean | null
          slug?: string | null
          times_completed?: number | null
          times_started?: number | null
          total_beacons?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ante_credits?: number | null
          beacon_ids?: string[]
          best_time_seconds?: number | null
          best_time_user_id?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          name?: string
          prize_pool_credits?: number | null
          published_at?: string | null
          requires_ghost_mode?: boolean | null
          slug?: string | null
          times_completed?: number | null
          times_started?: number | null
          total_beacons?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beacon_runs_best_time_user_id_fkey"
            columns: ["best_time_user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_runs_best_time_user_id_fkey"
            columns: ["best_time_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_runs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacon_runs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beacons: {
        Row: {
          beacon_color: string | null
          beacon_number: number | null
          beacon_type: string
          created_at: string | null
          deposited_by: string | null
          expires_at: string | null
          folder_id: string | null
          ghost_id: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          last_visited: string | null
          location_context: Json | null
          location_path: string
          location_type: string
          name: string
          notes: string | null
          orange_payload: Json | null
          orange_subtype: string | null
          page_title: string | null
          path: string | null
          reward_credits: number | null
          reward_marks: number | null
          user_id: string | null
          visit_count: number | null
        }
        Insert: {
          beacon_color?: string | null
          beacon_number?: number | null
          beacon_type?: string
          created_at?: string | null
          deposited_by?: string | null
          expires_at?: string | null
          folder_id?: string | null
          ghost_id?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          last_visited?: string | null
          location_context?: Json | null
          location_path: string
          location_type: string
          name: string
          notes?: string | null
          orange_payload?: Json | null
          orange_subtype?: string | null
          page_title?: string | null
          path?: string | null
          reward_credits?: number | null
          reward_marks?: number | null
          user_id?: string | null
          visit_count?: number | null
        }
        Update: {
          beacon_color?: string | null
          beacon_number?: number | null
          beacon_type?: string
          created_at?: string | null
          deposited_by?: string | null
          expires_at?: string | null
          folder_id?: string | null
          ghost_id?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          last_visited?: string | null
          location_context?: Json | null
          location_path?: string
          location_type?: string
          name?: string
          notes?: string | null
          orange_payload?: Json | null
          orange_subtype?: string | null
          page_title?: string | null
          path?: string | null
          reward_credits?: number | null
          reward_marks?: number | null
          user_id?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beacons_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "beacon_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beacons_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biz_storefront_items: {
        Row: {
          anchor_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          external_item_id: string | null
          external_url: string
          id: string
          image_url: string | null
          is_c20_eligible: boolean | null
          owner_id: string
          platform_margin_cents: number | null
          price_cents: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          anchor_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_item_id?: string | null
          external_url: string
          id?: string
          image_url?: string | null
          is_c20_eligible?: boolean | null
          owner_id: string
          platform_margin_cents?: number | null
          price_cents: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          anchor_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_item_id?: string | null
          external_url?: string
          id?: string
          image_url?: string | null
          is_c20_eligible?: boolean | null
          owner_id?: string
          platform_margin_cents?: number | null
          price_cents?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biz_storefront_items_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biz_storefront_items_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "biz_storefront_items_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      biz_storefront_sync_jobs: {
        Row: {
          anchor_id: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          items_synced: number | null
          owner_id: string
          platform_type: string
          source_url: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          anchor_id: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_synced?: number | null
          owner_id: string
          platform_type: string
          source_url: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          anchor_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_synced?: number | null
          owner_id?: string
          platform_type?: string
          source_url?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biz_storefront_sync_jobs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biz_storefront_sync_jobs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "biz_storefront_sync_jobs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      bond_accounts: {
        Row: {
          available_joules: number | null
          created_at: string | null
          id: string
          locked_joules: number | null
          marks_generated: number | null
          total_joules: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_joules?: number | null
          created_at?: string | null
          id?: string
          locked_joules?: number | null
          marks_generated?: number | null
          total_joules?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_joules?: number | null
          created_at?: string | null
          id?: string
          locked_joules?: number | null
          marks_generated?: number | null
          total_joules?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bond_allocations: {
        Row: {
          bond_account_id: string
          bounty_id: string | null
          contract_id: string | null
          created_at: string | null
          id: string
          joules_locked: number
          lock_until: string | null
          marks_generated: number | null
          purpose: string
          release_reason: string | null
          released_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          bond_account_id: string
          bounty_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          joules_locked: number
          lock_until?: string | null
          marks_generated?: number | null
          purpose: string
          release_reason?: string | null
          released_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          bond_account_id?: string
          bounty_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          joules_locked?: number
          lock_until?: string | null
          marks_generated?: number | null
          purpose?: string
          release_reason?: string | null
          released_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bond_allocations_bond_account_id_fkey"
            columns: ["bond_account_id"]
            isOneToOne: false
            referencedRelation: "bond_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bounty_claims: {
        Row: {
          bounty_id: string | null
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          bounty_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bounty_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bounty_signups: {
        Row: {
          bounty_id: string
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          bounty_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          bounty_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      bracket_standings: {
        Row: {
          achievements: Json | null
          bonus_points: number | null
          created_at: string | null
          current_rank: number | null
          id: string
          members_active: number | null
          members_drafted: number | null
          previous_rank: number | null
          season: string
          sponsor_id: string
          total_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          bonus_points?: number | null
          created_at?: string | null
          current_rank?: number | null
          id?: string
          members_active?: number | null
          members_drafted?: number | null
          previous_rank?: number | null
          season: string
          sponsor_id: string
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          bonus_points?: number | null
          created_at?: string | null
          current_rank?: number | null
          id?: string
          members_active?: number | null
          members_drafted?: number | null
          previous_rank?: number | null
          season?: string
          sponsor_id?: string
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bracket_standings_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brass_tacks_claims: {
        Row: {
          claim_status: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          membership_created: boolean | null
          membership_id: string | null
          offer_id: string
          user_id: string | null
        }
        Insert: {
          claim_status?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          membership_created?: boolean | null
          membership_id?: string | null
          offer_id: string
          user_id?: string | null
        }
        Update: {
          claim_status?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          membership_created?: boolean | null
          membership_id?: string | null
          offer_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brass_tacks_claims_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "johnny_appleseed_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_donations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          can_ship_nationwide: boolean | null
          company_name: string
          company_website: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          handling_instructions: string | null
          id: string
          items_distributed: number | null
          items_remaining: number | null
          notes: string | null
          product_description: string | null
          product_image_url: string | null
          product_name: string
          product_value: number
          quantity: number
          received_at: string | null
          ships_from: string | null
          status: string | null
          total_value: number | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          can_ship_nationwide?: boolean | null
          company_name: string
          company_website?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          handling_instructions?: string | null
          id?: string
          items_distributed?: number | null
          items_remaining?: number | null
          notes?: string | null
          product_description?: string | null
          product_image_url?: string | null
          product_name: string
          product_value: number
          quantity: number
          received_at?: string | null
          ships_from?: string | null
          status?: string | null
          total_value?: number | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          can_ship_nationwide?: boolean | null
          company_name?: string
          company_website?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          handling_instructions?: string | null
          id?: string
          items_distributed?: number | null
          items_remaining?: number | null
          notes?: string | null
          product_description?: string | null
          product_image_url?: string | null
          product_name?: string
          product_value?: number
          quantity?: number
          received_at?: string | null
          ships_from?: string | null
          status?: string | null
          total_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      c20_product_config: {
        Row: {
          anchor_id: string
          c20_auto_revert: boolean | null
          c20_enabled: boolean | null
          c20_max_units: number | null
          c20_price: number | null
          c20_units_sold: number | null
          cost_basis: number
          created_at: string | null
          id: string
          margin_at_c20: number | null
          margin_at_reference: number | null
          margin_sacrificed_per_unit: number | null
          product_name: string
          product_sku: string
          reference_price: number
          updated_at: string | null
        }
        Insert: {
          anchor_id: string
          c20_auto_revert?: boolean | null
          c20_enabled?: boolean | null
          c20_max_units?: number | null
          c20_price?: number | null
          c20_units_sold?: number | null
          cost_basis: number
          created_at?: string | null
          id?: string
          margin_at_c20?: number | null
          margin_at_reference?: number | null
          margin_sacrificed_per_unit?: number | null
          product_name: string
          product_sku: string
          reference_price: number
          updated_at?: string | null
        }
        Update: {
          anchor_id?: string
          c20_auto_revert?: boolean | null
          c20_enabled?: boolean | null
          c20_max_units?: number | null
          c20_price?: number | null
          c20_units_sold?: number | null
          cost_basis?: number
          created_at?: string | null
          id?: string
          margin_at_c20?: number | null
          margin_at_reference?: number | null
          margin_sacrificed_per_unit?: number | null
          product_name?: string
          product_sku?: string
          reference_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "c20_product_config_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c20_product_config_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "c20_product_config_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      c20_reciprocity_ledger: {
        Row: {
          amount: number
          anchor_id: string
          balance_after: number
          balance_before: number
          created_at: string | null
          created_by: string | null
          id: string
          joule_amount: number | null
          joule_rate: number | null
          notes: string | null
          order_id: string | null
          product_config_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          anchor_id: string
          balance_after: number
          balance_before: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          joule_amount?: number | null
          joule_rate?: number | null
          notes?: string | null
          order_id?: string | null
          product_config_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          anchor_id?: string
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          joule_amount?: number | null
          joule_rate?: number | null
          notes?: string | null
          order_id?: string | null
          product_config_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "c20_reciprocity_ledger_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c20_reciprocity_ledger_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "c20_reciprocity_ledger_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c20_reciprocity_ledger_product_config_id_fkey"
            columns: ["product_config_id"]
            isOneToOne: false
            referencedRelation: "c20_product_config"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_plan_purchases: {
        Row: {
          buyer_id: string | null
          id: string
          last_deployed_at: string | null
          plan_id: string | null
          price_paid: number
          purchased_at: string | null
          rating: number | null
          review: string | null
          times_deployed: number | null
        }
        Insert: {
          buyer_id?: string | null
          id?: string
          last_deployed_at?: string | null
          plan_id?: string | null
          price_paid?: number
          purchased_at?: string | null
          rating?: number | null
          review?: string | null
          times_deployed?: number | null
        }
        Update: {
          buyer_id?: string | null
          id?: string
          last_deployed_at?: string | null
          plan_id?: string | null
          price_paid?: number
          purchased_at?: string | null
          rating?: number | null
          review?: string | null
          times_deployed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_plan_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "campaign_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_plans: {
        Row: {
          avg_rating: number | null
          category: string | null
          content_categories: string[] | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_days: number
          id: string
          is_public: boolean | null
          plan_data: Json
          posts_per_day: number | null
          price_credits: number | null
          tags: string[] | null
          times_purchased: number | null
          times_used: number | null
          title: string
          total_posts: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_public?: boolean | null
          plan_data?: Json
          posts_per_day?: number | null
          price_credits?: number | null
          tags?: string[] | null
          times_purchased?: number | null
          times_used?: number | null
          title: string
          total_posts?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          category?: string | null
          content_categories?: string[] | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_public?: boolean | null
          plan_data?: Json
          posts_per_day?: number | null
          price_credits?: number | null
          tags?: string[] | null
          times_purchased?: number | null
          times_used?: number | null
          title?: string
          total_posts?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candle_burst_pairs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          pair_code: string
          paired_at: string | null
          rewards_a: Json | null
          rewards_b: Json | null
          stage: number | null
          stage_2_at: string | null
          status: string | null
          user_a_id: string
          user_b_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          pair_code: string
          paired_at?: string | null
          rewards_a?: Json | null
          rewards_b?: Json | null
          stage?: number | null
          stage_2_at?: string | null
          status?: string | null
          user_a_id: string
          user_b_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          pair_code?: string
          paired_at?: string | null
          rewards_a?: Json | null
          rewards_b?: Json | null
          stage?: number | null
          stage_2_at?: string | null
          status?: string | null
          user_a_id?: string
          user_b_id?: string | null
        }
        Relationships: []
      }
      candle_burst_rewards: {
        Row: {
          candle_uses: number | null
          claimed_at: string | null
          created_at: string | null
          id: string
          is_claimed: boolean | null
          pair_code: string | null
          pair_stage: number | null
          paired_with_user_id: string | null
          reward_choice: string | null
          trigger_id: string | null
          trigger_type: string
          user_id: string | null
        }
        Insert: {
          candle_uses?: number | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          pair_code?: string | null
          pair_stage?: number | null
          paired_with_user_id?: string | null
          reward_choice?: string | null
          trigger_id?: string | null
          trigger_type: string
          user_id?: string | null
        }
        Update: {
          candle_uses?: number | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          is_claimed?: boolean | null
          pair_code?: string | null
          pair_stage?: number | null
          paired_with_user_id?: string | null
          reward_choice?: string | null
          trigger_id?: string | null
          trigger_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cdn_settings: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          setting_key: string
          setting_value: Json
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string | null
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          reviewed_at: string | null
          score: number | null
          status: string | null
          submission_type: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          score?: number | null
          status?: string | null
          submission_type: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          score?: number | null
          status?: string | null
          submission_type?: string
          user_id?: string
        }
        Relationships: []
      }
      charitable_business_donations: {
        Row: {
          anchor_id: string
          business_owner_id: string
          donation_amount: number
          donation_percent: number
          id: string
          initiative_slug: string | null
          matching_amount: number | null
          matching_eligible: boolean | null
          matching_source: string | null
          recorded_at: string | null
          transaction_amount: number
          transaction_date: string
          user_id: string | null
        }
        Insert: {
          anchor_id: string
          business_owner_id: string
          donation_amount: number
          donation_percent: number
          id?: string
          initiative_slug?: string | null
          matching_amount?: number | null
          matching_eligible?: boolean | null
          matching_source?: string | null
          recorded_at?: string | null
          transaction_amount: number
          transaction_date: string
          user_id?: string | null
        }
        Update: {
          anchor_id?: string
          business_owner_id?: string
          donation_amount?: number
          donation_percent?: number
          id?: string
          initiative_slug?: string | null
          matching_amount?: number | null
          matching_eligible?: boolean | null
          matching_source?: string | null
          recorded_at?: string | null
          transaction_amount?: number
          transaction_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charitable_business_donations_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charitable_business_donations_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "charitable_business_donations_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      charitable_business_tiers: {
        Row: {
          badge_color: string
          created_at: string | null
          description: string | null
          display_name: string
          featured_placement: boolean | null
          icon: string
          id: string
          matching_cap_percent: number | null
          matching_eligible: boolean | null
          max_donation_percent: number | null
          min_donation_percent: number
          tier_level: number
          tier_name: string
          trust_score_bonus: number | null
          user_id: string | null
        }
        Insert: {
          badge_color: string
          created_at?: string | null
          description?: string | null
          display_name: string
          featured_placement?: boolean | null
          icon: string
          id?: string
          matching_cap_percent?: number | null
          matching_eligible?: boolean | null
          max_donation_percent?: number | null
          min_donation_percent: number
          tier_level: number
          tier_name: string
          trust_score_bonus?: number | null
          user_id?: string | null
        }
        Update: {
          badge_color?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          featured_placement?: boolean | null
          icon?: string
          id?: string
          matching_cap_percent?: number | null
          matching_eligible?: boolean | null
          max_donation_percent?: number | null
          min_donation_percent?: number
          tier_level?: number
          tier_name?: string
          trust_score_bonus?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      charitable_matching_pool: {
        Row: {
          annual_cap: number | null
          created_at: string | null
          current_balance: number | null
          id: string
          per_business_cap: number | null
          period_end: string | null
          period_start: string | null
          pool_name: string
          total_allocated: number | null
          total_matched: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          annual_cap?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          per_business_cap?: number | null
          period_end?: string | null
          period_start?: string | null
          pool_name?: string
          total_allocated?: number | null
          total_matched?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          annual_cap?: number | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          per_business_cap?: number | null
          period_end?: string | null
          period_start?: string | null
          pool_name?: string
          total_allocated?: number | null
          total_matched?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cloth_pouches: {
        Row: {
          created_at: string | null
          creation_rate: number
          credit_amount: number
          id: string
          invoked_at: string | null
          invoked_for: string | null
          purpose: string
          service_units: number
          status: string
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          creation_rate: number
          credit_amount: number
          id?: string
          invoked_at?: string | null
          invoked_for?: string | null
          purpose: string
          service_units: number
          status?: string
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          creation_rate?: number
          credit_amount?: number
          id?: string
          invoked_at?: string | null
          invoked_for?: string | null
          purpose?: string
          service_units?: number
          status?: string
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      co_factor_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          factors: Json
          id: string
          is_default: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          factors?: Json
          id?: string
          is_default?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          factors?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cold_start_thresholds: {
        Row: {
          captains_required: number
          created_at: string
          description: string | null
          families_required: number
          funding_required: number | null
          id: string
          initiative_id: string
          tier: string
        }
        Insert: {
          captains_required?: number
          created_at?: string
          description?: string | null
          families_required?: number
          funding_required?: number | null
          id?: string
          initiative_id: string
          tier: string
        }
        Update: {
          captains_required?: number
          created_at?: string
          description?: string | null
          families_required?: number
          funding_required?: number | null
          id?: string
          initiative_id?: string
          tier?: string
        }
        Relationships: []
      }
      command_paths: {
        Row: {
          created_at: string
          current_steward_id: string | null
          delegation_level: string
          id: string
          initiative_id: string
          probation_ends_at: string | null
          transferred_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_steward_id?: string | null
          delegation_level?: string
          id?: string
          initiative_id: string
          probation_ends_at?: string | null
          transferred_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_steward_id?: string | null
          delegation_level?: string
          id?: string
          initiative_id?: string
          probation_ends_at?: string | null
          transferred_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comparison_frame_slots: {
        Row: {
          added_at: string | null
          id: string
          slot_number: number
          template_id: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          slot_number: number
          template_id?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          slot_number?: number
          template_id?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      connection_handshakes: {
        Row: {
          completed_at: string | null
          current_step: string
          duration_ms: number | null
          id: string
          initiated_at: string
          ledger_entry_id: string
          member_id: string
          package_id: string
          result: string
          retry_count: number
          step_results: Json
          trunk_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: string
          duration_ms?: number | null
          id?: string
          initiated_at?: string
          ledger_entry_id: string
          member_id: string
          package_id: string
          result?: string
          retry_count?: number
          step_results?: Json
          trunk_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: string
          duration_ms?: number | null
          id?: string
          initiated_at?: string
          ledger_entry_id?: string
          member_id?: string
          package_id?: string
          result?: string
          retry_count?: number
          step_results?: Json
          trunk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_handshakes_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "source_distribution_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_handshakes_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      content_classifications: {
        Row: {
          content_tag: string
          id: string
          set_at: string | null
          stamp_id: string | null
          user_id: string
          visibility_level: number
        }
        Insert: {
          content_tag: string
          id?: string
          set_at?: string | null
          stamp_id?: string | null
          user_id: string
          visibility_level?: number
        }
        Update: {
          content_tag?: string
          id?: string
          set_at?: string | null
          stamp_id?: string | null
          user_id?: string
          visibility_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_classifications_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "acknowledgment_stamps"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pipeline: {
        Row: {
          article_content: string | null
          author_id: string | null
          author_name: string
          battery_campaign_id: string | null
          blog_content: string | null
          category: string
          cephas_path: string | null
          cephas_sync_status: string | null
          coverage_minutes_value: number | null
          created_at: string | null
          cue_card_id: string | null
          current_stage: string
          id: string
          innovation_numbers: number[] | null
          paper_content: string | null
          patent_series: string | null
          published_at: string | null
          reading_time_minutes: number | null
          related_content_ids: string[] | null
          seed_content: string | null
          slug: string
          stages: Json | null
          status: string
          subtitle: string | null
          tags: string[] | null
          title: string
          tldr_content: string | null
          treasure_key_ids: string[] | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          article_content?: string | null
          author_id?: string | null
          author_name?: string
          battery_campaign_id?: string | null
          blog_content?: string | null
          category?: string
          cephas_path?: string | null
          cephas_sync_status?: string | null
          coverage_minutes_value?: number | null
          created_at?: string | null
          cue_card_id?: string | null
          current_stage?: string
          id?: string
          innovation_numbers?: number[] | null
          paper_content?: string | null
          patent_series?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          related_content_ids?: string[] | null
          seed_content?: string | null
          slug: string
          stages?: Json | null
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          tldr_content?: string | null
          treasure_key_ids?: string[] | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          article_content?: string | null
          author_id?: string | null
          author_name?: string
          battery_campaign_id?: string | null
          blog_content?: string | null
          category?: string
          cephas_path?: string | null
          cephas_sync_status?: string | null
          coverage_minutes_value?: number | null
          created_at?: string | null
          cue_card_id?: string | null
          current_stage?: string
          id?: string
          innovation_numbers?: number[] | null
          paper_content?: string | null
          patent_series?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          related_content_ids?: string[] | null
          seed_content?: string | null
          slug?: string
          stages?: Json | null
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          tldr_content?: string | null
          treasure_key_ids?: string[] | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      content_topic_tags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          tagged_by: string | null
          topic_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          tagged_by?: string | null
          topic_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          tagged_by?: string | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_topic_tags_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "content_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      content_topics: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          display_order: number
          icon: string | null
          id: string
          is_default_hidden: boolean
          slug: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number
          icon?: string | null
          id?: string
          is_default_hidden?: boolean
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_default_hidden?: boolean
          slug?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          burst_id: string | null
          change_summary: string | null
          change_type: string
          changed_by: string | null
          content_id: string
          content_path: string | null
          content_snapshot: Json | null
          content_type: string
          created_at: string | null
          diff_from_previous: Json | null
          id: string
          session_id: string | null
          user_id: string | null
          version_hash: string
          version_number: number
        }
        Insert: {
          burst_id?: string | null
          change_summary?: string | null
          change_type: string
          changed_by?: string | null
          content_id: string
          content_path?: string | null
          content_snapshot?: Json | null
          content_type: string
          created_at?: string | null
          diff_from_previous?: Json | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          version_hash: string
          version_number: number
        }
        Update: {
          burst_id?: string | null
          change_summary?: string | null
          change_type?: string
          changed_by?: string | null
          content_id?: string
          content_path?: string | null
          content_snapshot?: Json | null
          content_type?: string
          created_at?: string | null
          diff_from_previous?: Json | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          version_hash?: string
          version_number?: number
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          contest_id: string | null
          credits_voted: number | null
          description: string | null
          entry_fee_paid: number
          id: string
          is_winner: boolean | null
          lovable_project_url: string | null
          preview_url: string | null
          submitted_at: string | null
          title: string
          user_id: string | null
          votes: number | null
          voting_ends_at: string | null
        }
        Insert: {
          contest_id?: string | null
          credits_voted?: number | null
          description?: string | null
          entry_fee_paid: number
          id?: string
          is_winner?: boolean | null
          lovable_project_url?: string | null
          preview_url?: string | null
          submitted_at?: string | null
          title: string
          user_id?: string | null
          votes?: number | null
          voting_ends_at?: string | null
        }
        Update: {
          contest_id?: string | null
          credits_voted?: number | null
          description?: string | null
          entry_fee_paid?: number
          id?: string
          is_winner?: boolean | null
          lovable_project_url?: string | null
          preview_url?: string | null
          submitted_at?: string | null
          title?: string
          user_id?: string | null
          votes?: number | null
          voting_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contest_scrolls"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_scrolls: {
        Row: {
          created_at: string | null
          current_winner_id: string | null
          description: string | null
          element_name: string
          element_type: string
          entry_fee: number | null
          id: string
          min_votes_to_replace: number | null
          prize_pool: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vote_cost: number | null
          voting_window_hours: number | null
        }
        Insert: {
          created_at?: string | null
          current_winner_id?: string | null
          description?: string | null
          element_name: string
          element_type: string
          entry_fee?: number | null
          id?: string
          min_votes_to_replace?: number | null
          prize_pool?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_cost?: number | null
          voting_window_hours?: number | null
        }
        Update: {
          created_at?: string | null
          current_winner_id?: string | null
          description?: string | null
          element_name?: string
          element_type?: string
          entry_fee?: number | null
          id?: string
          min_votes_to_replace?: number | null
          prize_pool?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_cost?: number | null
          voting_window_hours?: number | null
        }
        Relationships: []
      }
      contest_votes: {
        Row: {
          created_at: string | null
          credits_spent: number
          entry_id: string | null
          id: string
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          credits_spent: number
          entry_id?: string | null
          id?: string
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          credits_spent?: number
          entry_id?: string | null
          id?: string
          user_id?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "contest_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          completed_at: string | null
          contract_type: string
          counterparty_id: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          project_id: string | null
          signed_at: string | null
          status: string
          terms: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
          value_credits: number | null
          value_joules: number | null
        }
        Insert: {
          completed_at?: string | null
          contract_type?: string
          counterparty_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          signed_at?: string | null
          status?: string
          terms?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          value_credits?: number | null
          value_joules?: number | null
        }
        Update: {
          completed_at?: string | null
          contract_type?: string
          counterparty_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          signed_at?: string | null
          status?: string
          terms?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          value_credits?: number | null
          value_joules?: number | null
        }
        Relationships: []
      }
      cost_plus_audits: {
        Row: {
          anchor_id: string
          cost_breakdown: Json | null
          created_at: string | null
          evidence_notes: string | null
          evidence_url: string | null
          id: string
          request_type: string
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          anchor_id: string
          cost_breakdown?: Json | null
          created_at?: string | null
          evidence_notes?: string | null
          evidence_url?: string | null
          id?: string
          request_type: string
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          anchor_id?: string
          cost_breakdown?: Json | null
          created_at?: string | null
          evidence_notes?: string | null
          evidence_url?: string | null
          id?: string
          request_type?: string
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_plus_audits_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_plus_audits_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "cost_plus_audits_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_plus_economics: {
        Row: {
          certified_ip_stake_eligible: boolean | null
          certified_joule_multiplier: number | null
          certified_marks_multiplier: number | null
          certified_reciprocal_tier_max: number | null
          created_at: string | null
          description: string | null
          id: string
          policy_name: string
          uncertified_ip_stake_eligible: boolean | null
          uncertified_joule_multiplier: number | null
          uncertified_marks_multiplier: number | null
          uncertified_reciprocal_tier_max: number | null
          updated_at: string | null
        }
        Insert: {
          certified_ip_stake_eligible?: boolean | null
          certified_joule_multiplier?: number | null
          certified_marks_multiplier?: number | null
          certified_reciprocal_tier_max?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          policy_name: string
          uncertified_ip_stake_eligible?: boolean | null
          uncertified_joule_multiplier?: number | null
          uncertified_marks_multiplier?: number | null
          uncertified_reciprocal_tier_max?: number | null
          updated_at?: string | null
        }
        Update: {
          certified_ip_stake_eligible?: boolean | null
          certified_joule_multiplier?: number | null
          certified_marks_multiplier?: number | null
          certified_reciprocal_tier_max?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          policy_name?: string
          uncertified_ip_stake_eligible?: boolean | null
          uncertified_joule_multiplier?: number | null
          uncertified_marks_multiplier?: number | null
          uncertified_reciprocal_tier_max?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cottage_law_guide_purchases: {
        Row: {
          contributor_earned: number | null
          guide_id: string | null
          id: string
          lb_earned: number | null
          price_paid: number
          purchased_at: string | null
          rated_at: string | null
          rating: number | null
          review: string | null
          user_id: string
          was_helpful: boolean | null
        }
        Insert: {
          contributor_earned?: number | null
          guide_id?: string | null
          id?: string
          lb_earned?: number | null
          price_paid: number
          purchased_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          user_id: string
          was_helpful?: boolean | null
        }
        Update: {
          contributor_earned?: number | null
          guide_id?: string | null
          id?: string
          lb_earned?: number | null
          price_paid?: number
          purchased_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cottage_law_guide_purchases_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "cottage_law_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      cottage_law_guides: {
        Row: {
          average_rating: number | null
          city: string | null
          contributor_id: string | null
          county: string | null
          created_at: string | null
          effective_date: string | null
          full_content: string
          helpful_count: number | null
          id: string
          jurisdiction_type: string | null
          last_verified: string | null
          local_resources: Json | null
          not_helpful_count: number | null
          permit_thresholds: Json | null
          price_credits: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_urls: string[] | null
          state_code: string
          status: string | null
          step_by_step_permit: Json | null
          summary: string | null
          times_purchased: number | null
          title: string
          total_revenue: number | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          average_rating?: number | null
          city?: string | null
          contributor_id?: string | null
          county?: string | null
          created_at?: string | null
          effective_date?: string | null
          full_content: string
          helpful_count?: number | null
          id?: string
          jurisdiction_type?: string | null
          last_verified?: string | null
          local_resources?: Json | null
          not_helpful_count?: number | null
          permit_thresholds?: Json | null
          price_credits?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_urls?: string[] | null
          state_code: string
          status?: string | null
          step_by_step_permit?: Json | null
          summary?: string | null
          times_purchased?: number | null
          title: string
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          average_rating?: number | null
          city?: string | null
          contributor_id?: string | null
          county?: string | null
          created_at?: string | null
          effective_date?: string | null
          full_content?: string
          helpful_count?: number | null
          id?: string
          jurisdiction_type?: string | null
          last_verified?: string | null
          local_resources?: Json | null
          not_helpful_count?: number | null
          permit_thresholds?: Json | null
          price_credits?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_urls?: string[] | null
          state_code?: string
          status?: string | null
          step_by_step_permit?: Json | null
          summary?: string | null
          times_purchased?: number | null
          title?: string
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      cottage_law_rules: {
        Row: {
          allowed_food_types: string[] | null
          annual_revenue_limit: number | null
          application_url: string | null
          created_at: string | null
          daily_limit: number | null
          direct_sales_only: boolean | null
          effective_date: string | null
          farmers_market_allowed: boolean | null
          food_handler_cert_required: boolean | null
          id: string
          is_allowed: boolean | null
          kitchen_inspection_required: boolean | null
          labeling_required: boolean | null
          last_verified: string | null
          monthly_limit: number | null
          official_url: string | null
          online_sales_allowed: boolean | null
          permit_required: boolean | null
          permit_threshold_weekly: number | null
          prohibited_food_types: string[] | null
          registration_required: boolean | null
          required_label_items: string[] | null
          state_code: string
          state_name: string
          updated_at: string | null
          user_id: string | null
          weekly_limit: number | null
        }
        Insert: {
          allowed_food_types?: string[] | null
          annual_revenue_limit?: number | null
          application_url?: string | null
          created_at?: string | null
          daily_limit?: number | null
          direct_sales_only?: boolean | null
          effective_date?: string | null
          farmers_market_allowed?: boolean | null
          food_handler_cert_required?: boolean | null
          id?: string
          is_allowed?: boolean | null
          kitchen_inspection_required?: boolean | null
          labeling_required?: boolean | null
          last_verified?: string | null
          monthly_limit?: number | null
          official_url?: string | null
          online_sales_allowed?: boolean | null
          permit_required?: boolean | null
          permit_threshold_weekly?: number | null
          prohibited_food_types?: string[] | null
          registration_required?: boolean | null
          required_label_items?: string[] | null
          state_code: string
          state_name: string
          updated_at?: string | null
          user_id?: string | null
          weekly_limit?: number | null
        }
        Update: {
          allowed_food_types?: string[] | null
          annual_revenue_limit?: number | null
          application_url?: string | null
          created_at?: string | null
          daily_limit?: number | null
          direct_sales_only?: boolean | null
          effective_date?: string | null
          farmers_market_allowed?: boolean | null
          food_handler_cert_required?: boolean | null
          id?: string
          is_allowed?: boolean | null
          kitchen_inspection_required?: boolean | null
          labeling_required?: boolean | null
          last_verified?: string | null
          monthly_limit?: number | null
          official_url?: string | null
          online_sales_allowed?: boolean | null
          permit_required?: boolean | null
          permit_threshold_weekly?: number | null
          prohibited_food_types?: string[] | null
          registration_required?: boolean | null
          required_label_items?: string[] | null
          state_code?: string
          state_name?: string
          updated_at?: string | null
          user_id?: string | null
          weekly_limit?: number | null
        }
        Relationships: []
      }
      coverage_debit_events: {
        Row: {
          auto_muted: boolean
          created_at: string
          id: string
          ledger_entry_id: string
          minutes_debited: number
          remaining_balance: number
          speaker_id: string
          table_id: string
        }
        Insert: {
          auto_muted?: boolean
          created_at?: string
          id?: string
          ledger_entry_id: string
          minutes_debited: number
          remaining_balance: number
          speaker_id: string
          table_id: string
        }
        Update: {
          auto_muted?: boolean
          created_at?: string
          id?: string
          ledger_entry_id?: string
          minutes_debited?: number
          remaining_balance?: number
          speaker_id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverage_debit_events_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "round_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_minute_accounts: {
        Row: {
          accumulation_increment: number
          accumulation_level: number
          created_at: string
          current_balance: number
          donated_minutes: number
          earned_minutes: number
          id: string
          max_session_broadcast: number
          member_id: string
          reading_speed_tier: string
          received_donations: number
          spent_minutes: number
          updated_at: string
        }
        Insert: {
          accumulation_increment?: number
          accumulation_level?: number
          created_at?: string
          current_balance?: number
          donated_minutes?: number
          earned_minutes?: number
          id?: string
          max_session_broadcast?: number
          member_id: string
          reading_speed_tier?: string
          received_donations?: number
          spent_minutes?: number
          updated_at?: string
        }
        Update: {
          accumulation_increment?: number
          accumulation_level?: number
          created_at?: string
          current_balance?: number
          donated_minutes?: number
          earned_minutes?: number
          id?: string
          max_session_broadcast?: number
          member_id?: string
          reading_speed_tier?: string
          received_donations?: number
          spent_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      coverage_minute_donations: {
        Row: {
          created_at: string
          from_member_id: string
          id: string
          ledger_entry_id: string
          minutes: number
          to_member_id: string
        }
        Insert: {
          created_at?: string
          from_member_id: string
          id?: string
          ledger_entry_id: string
          minutes: number
          to_member_id: string
        }
        Update: {
          created_at?: string
          from_member_id?: string
          id?: string
          ledger_entry_id?: string
          minutes?: number
          to_member_id?: string
        }
        Relationships: []
      }
      coverage_minute_transactions: {
        Row: {
          balance_after: number
          content_id: string | null
          created_at: string
          donation_id: string | null
          id: string
          ledger_entry_id: string
          member_id: string
          minutes: number
          round_table_id: string | null
          source: string
          transaction_type: string
        }
        Insert: {
          balance_after: number
          content_id?: string | null
          created_at?: string
          donation_id?: string | null
          id?: string
          ledger_entry_id: string
          member_id: string
          minutes: number
          round_table_id?: string | null
          source: string
          transaction_type: string
        }
        Update: {
          balance_after?: number
          content_id?: string | null
          created_at?: string
          donation_id?: string | null
          id?: string
          ledger_entry_id?: string
          member_id?: string
          minutes?: number
          round_table_id?: string | null
          source?: string
          transaction_type?: string
        }
        Relationships: []
      }
      credit_markers: {
        Row: {
          created_at: string | null
          credit_reward: number
          description: string | null
          icon: string | null
          id: string
          is_repeatable: boolean | null
          marker_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_reward: number
          description?: string | null
          icon?: string | null
          id?: string
          is_repeatable?: boolean | null
          marker_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_reward?: number
          description?: string | null
          icon?: string | null
          id?: string
          is_repeatable?: boolean | null
          marker_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          fee_amount: number | null
          id: string
          net_amount: number
          payout_method: string | null
          payout_reference: string | null
          processed_at: string | null
          requested_at: string | null
          status: string | null
          user_id: string
          withdrawal_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          net_amount: number
          payout_method?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          user_id: string
          withdrawal_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_amount?: number | null
          id?: string
          net_amount?: number
          payout_method?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          user_id?: string
          withdrawal_type?: string
        }
        Relationships: []
      }
      crow_feathers: {
        Row: {
          achieved_at: string
          beacon_run_id: string | null
          category: string
          difficulty: string | null
          feather_number: number
          ghost_id: string | null
          id: string
          metadata: Json | null
          previous_holder_id: string | null
          previous_record_value: number | null
          record_value: number
          session_duration_minutes: number | null
          superseded_by: number | null
          time_bracket: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string
          beacon_run_id?: string | null
          category: string
          difficulty?: string | null
          feather_number?: number
          ghost_id?: string | null
          id?: string
          metadata?: Json | null
          previous_holder_id?: string | null
          previous_record_value?: number | null
          record_value: number
          session_duration_minutes?: number | null
          superseded_by?: number | null
          time_bracket?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string
          beacon_run_id?: string | null
          category?: string
          difficulty?: string | null
          feather_number?: number
          ghost_id?: string | null
          id?: string
          metadata?: Json | null
          previous_holder_id?: string | null
          previous_record_value?: number | null
          record_value?: number
          session_duration_minutes?: number | null
          superseded_by?: number | null
          time_bracket?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crown_positions: {
        Row: {
          created_at: string | null
          full_title_template: string
          holder_name: string | null
          holder_since: string | null
          holder_user_id: string | null
          id: string
          initiative: string
          letter_sent_at: string | null
          status: string | null
          suffix: string
          target_candidate: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          veto_power_expires_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_title_template: string
          holder_name?: string | null
          holder_since?: string | null
          holder_user_id?: string | null
          id: string
          initiative: string
          letter_sent_at?: string | null
          status?: string | null
          suffix: string
          target_candidate?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          veto_power_expires_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_title_template?: string
          holder_name?: string | null
          holder_since?: string | null
          holder_user_id?: string | null
          id?: string
          initiative?: string
          letter_sent_at?: string | null
          status?: string | null
          suffix?: string
          target_candidate?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          veto_power_expires_at?: string | null
        }
        Relationships: []
      }
      crown_succession_candidates: {
        Row: {
          candidate_name: string
          candidate_user_id: string | null
          created_at: string | null
          crisis_handling_score: number | null
          crown_position_id: string | null
          ethics_record_score: number | null
          evaluation_status: string | null
          id: string
          people_developed: number | null
          projects_completed: number | null
          rank_position: number | null
          reputation_points: number | null
          revenue_generated: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          candidate_name: string
          candidate_user_id?: string | null
          created_at?: string | null
          crisis_handling_score?: number | null
          crown_position_id?: string | null
          ethics_record_score?: number | null
          evaluation_status?: string | null
          id?: string
          people_developed?: number | null
          projects_completed?: number | null
          rank_position?: number | null
          reputation_points?: number | null
          revenue_generated?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          candidate_name?: string
          candidate_user_id?: string | null
          created_at?: string | null
          crisis_handling_score?: number | null
          crown_position_id?: string | null
          ethics_record_score?: number | null
          evaluation_status?: string | null
          id?: string
          people_developed?: number | null
          projects_completed?: number | null
          rank_position?: number | null
          reputation_points?: number | null
          revenue_generated?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crown_succession_candidates_crown_position_id_fkey"
            columns: ["crown_position_id"]
            isOneToOne: false
            referencedRelation: "crown_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      cue_card_campaigns: {
        Row: {
          cards_sent: number | null
          commitment_satisfied: boolean | null
          commitment_satisfied_at: string | null
          completed_at: string | null
          conversion_rate: number | null
          created_at: string | null
          default_expiration_hours: number | null
          description: string | null
          expiration_type: string | null
          id: string
          launched_at: string | null
          name: string
          project_id: string | null
          research_commitment: boolean | null
          research_commitment_set_at: string | null
          research_pool_accessed: boolean | null
          research_pool_accessed_at: string | null
          scheduled_at: string | null
          status: string | null
          template_ids: string[] | null
          total_clicks: number | null
          total_conversions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cards_sent?: number | null
          commitment_satisfied?: boolean | null
          commitment_satisfied_at?: string | null
          completed_at?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          default_expiration_hours?: number | null
          description?: string | null
          expiration_type?: string | null
          id?: string
          launched_at?: string | null
          name: string
          project_id?: string | null
          research_commitment?: boolean | null
          research_commitment_set_at?: string | null
          research_pool_accessed?: boolean | null
          research_pool_accessed_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_ids?: string[] | null
          total_clicks?: number | null
          total_conversions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cards_sent?: number | null
          commitment_satisfied?: boolean | null
          commitment_satisfied_at?: string | null
          completed_at?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          default_expiration_hours?: number | null
          description?: string | null
          expiration_type?: string | null
          id?: string
          launched_at?: string | null
          name?: string
          project_id?: string | null
          research_commitment?: boolean | null
          research_commitment_set_at?: string | null
          research_pool_accessed?: boolean | null
          research_pool_accessed_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          template_ids?: string[] | null
          total_clicks?: number | null
          total_conversions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cue_card_destinations: {
        Row: {
          category_slug: string | null
          created_at: string | null
          cue_card_template_id: string | null
          destination_type: string
          display_name: string | null
          id: string
          include_owned_only: boolean | null
          is_own_project: boolean | null
          portfolio_filter: string | null
          project_ids: string[] | null
          promotion_credit_rate: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string | null
          cue_card_template_id?: string | null
          destination_type: string
          display_name?: string | null
          id?: string
          include_owned_only?: boolean | null
          is_own_project?: boolean | null
          portfolio_filter?: string | null
          project_ids?: string[] | null
          promotion_credit_rate?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string | null
          cue_card_template_id?: string | null
          destination_type?: string
          display_name?: string | null
          id?: string
          include_owned_only?: boolean | null
          is_own_project?: boolean | null
          portfolio_filter?: string | null
          project_ids?: string[] | null
          promotion_credit_rate?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cue_card_destinations_cue_card_template_id_fkey"
            columns: ["cue_card_template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cue_card_registry: {
        Row: {
          anchor_id: string | null
          created_at: string | null
          creator_id: string
          first_seen: string | null
          id: string
          last_seen: string | null
          payload_hash: string
          report_count: number | null
          security_state: string | null
          signature: string
          stamp_id: string | null
          template_id: string | null
          total_scans: number | null
          total_verifications: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anchor_id?: string | null
          created_at?: string | null
          creator_id: string
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          payload_hash: string
          report_count?: number | null
          security_state?: string | null
          signature: string
          stamp_id?: string | null
          template_id?: string | null
          total_scans?: number | null
          total_verifications?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anchor_id?: string | null
          created_at?: string | null
          creator_id?: string
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          payload_hash?: string
          report_count?: number | null
          security_state?: string | null
          signature?: string
          stamp_id?: string | null
          template_id?: string | null
          total_scans?: number | null
          total_verifications?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cue_card_registry_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_card_registry_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "cue_card_registry_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_card_registry_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "stamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cue_card_registry_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cue_card_share_clicks: {
        Row: {
          awarded_at: string | null
          clicked_at: string | null
          clicker_ghost_id: string | null
          clicker_id: string | null
          frame_unlock_awarded: boolean | null
          id: string
          platform: string | null
          referrer_url: string | null
          share_id: string
          sharer_id: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          clicked_at?: string | null
          clicker_ghost_id?: string | null
          clicker_id?: string | null
          frame_unlock_awarded?: boolean | null
          id?: string
          platform?: string | null
          referrer_url?: string | null
          share_id: string
          sharer_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          clicked_at?: string | null
          clicker_ghost_id?: string | null
          clicker_id?: string | null
          frame_unlock_awarded?: boolean | null
          id?: string
          platform?: string | null
          referrer_url?: string | null
          share_id?: string
          sharer_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cue_card_templates: {
        Row: {
          accent_color: string | null
          background_type: string | null
          background_value: string | null
          body_text: string
          card_style: string | null
          clicks_per_frame_unlock: number | null
          created_at: string | null
          facebook_text: string | null
          hashtags: string[] | null
          id: string
          initiative_slug: string | null
          is_active: boolean | null
          linked_deck_card_id: string | null
          linkedin_text: string | null
          project_id: string | null
          qr_position: string | null
          qr_size: number | null
          social_unlock_type: string | null
          sort_order: number | null
          subtitle: string | null
          template_type: string
          title: string
          total_clicks_for_unlock: number | null
          twitter_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accent_color?: string | null
          background_type?: string | null
          background_value?: string | null
          body_text: string
          card_style?: string | null
          clicks_per_frame_unlock?: number | null
          created_at?: string | null
          facebook_text?: string | null
          hashtags?: string[] | null
          id?: string
          initiative_slug?: string | null
          is_active?: boolean | null
          linked_deck_card_id?: string | null
          linkedin_text?: string | null
          project_id?: string | null
          qr_position?: string | null
          qr_size?: number | null
          social_unlock_type?: string | null
          sort_order?: number | null
          subtitle?: string | null
          template_type?: string
          title: string
          total_clicks_for_unlock?: number | null
          twitter_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accent_color?: string | null
          background_type?: string | null
          background_value?: string | null
          body_text?: string
          card_style?: string | null
          clicks_per_frame_unlock?: number | null
          created_at?: string | null
          facebook_text?: string | null
          hashtags?: string[] | null
          id?: string
          initiative_slug?: string | null
          is_active?: boolean | null
          linked_deck_card_id?: string | null
          linkedin_text?: string | null
          project_id?: string | null
          qr_position?: string | null
          qr_size?: number | null
          social_unlock_type?: string | null
          sort_order?: number | null
          subtitle?: string | null
          template_type?: string
          title?: string
          total_clicks_for_unlock?: number | null
          twitter_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cue_card_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "cue_card_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daisy_chain_connections: {
        Row: {
          connection_description: string | null
          connection_type: string | null
          created_at: string | null
          from_recipient: string
          id: string
          mentioned_in_letter: string | null
          to_recipient: string
          user_id: string | null
        }
        Insert: {
          connection_description?: string | null
          connection_type?: string | null
          created_at?: string | null
          from_recipient: string
          id?: string
          mentioned_in_letter?: string | null
          to_recipient: string
          user_id?: string | null
        }
        Update: {
          connection_description?: string | null
          connection_type?: string | null
          created_at?: string | null
          from_recipient?: string
          id?: string
          mentioned_in_letter?: string | null
          to_recipient?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deck_card_collection: {
        Row: {
          acquired_at: string | null
          card_id: string
          found_at: string | null
          found_method: string | null
          ghost_id: string | null
          id: string
          is_in_castle_keep: boolean | null
          last_used_at: string | null
          next_available_at: string | null
          total_uses: number | null
          user_id: string | null
          uses_remaining: number | null
        }
        Insert: {
          acquired_at?: string | null
          card_id: string
          found_at?: string | null
          found_method?: string | null
          ghost_id?: string | null
          id?: string
          is_in_castle_keep?: boolean | null
          last_used_at?: string | null
          next_available_at?: string | null
          total_uses?: number | null
          user_id?: string | null
          uses_remaining?: number | null
        }
        Update: {
          acquired_at?: string | null
          card_id?: string
          found_at?: string | null
          found_method?: string | null
          ghost_id?: string | null
          id?: string
          is_in_castle_keep?: boolean | null
          last_used_at?: string | null
          next_available_at?: string | null
          total_uses?: number | null
          user_id?: string | null
          uses_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_card_collection_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "deck_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_card_collection_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_card_drops: {
        Row: {
          camouflage_art: string | null
          card_id: string
          created_at: string | null
          dropped_by: string | null
          found_at: string | null
          found_by: string | null
          id: string
          is_active: boolean | null
          is_camouflaged: boolean | null
          location_hint: string | null
          location_path: string
          location_type: string
          players_since_found: number | null
          regen_after_players: number | null
          regenerates: boolean | null
          user_id: string | null
        }
        Insert: {
          camouflage_art?: string | null
          card_id: string
          created_at?: string | null
          dropped_by?: string | null
          found_at?: string | null
          found_by?: string | null
          id?: string
          is_active?: boolean | null
          is_camouflaged?: boolean | null
          location_hint?: string | null
          location_path: string
          location_type: string
          players_since_found?: number | null
          regen_after_players?: number | null
          regenerates?: boolean | null
          user_id?: string | null
        }
        Update: {
          camouflage_art?: string | null
          card_id?: string
          created_at?: string | null
          dropped_by?: string | null
          found_at?: string | null
          found_by?: string | null
          id?: string
          is_active?: boolean | null
          is_camouflaged?: boolean | null
          location_hint?: string | null
          location_path?: string
          location_type?: string
          players_since_found?: number | null
          regen_after_players?: number | null
          regenerates?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_card_drops_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "deck_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_card_forges: {
        Row: {
          card_id: string
          created_at: string | null
          credits_spent: number
          custom_back_art: string | null
          custom_destination: string | null
          forge_type: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          credits_spent?: number
          custom_back_art?: string | null
          custom_destination?: string | null
          forge_type?: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          credits_spent?: number
          custom_back_art?: string | null
          custom_destination?: string | null
          forge_type?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_card_forges_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "deck_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_cards: {
        Row: {
          back_action: string | null
          back_destination: string | null
          back_instructions: string
          back_title: string
          border_color: string | null
          card_code: string
          card_type: string
          cooldown_hours: number | null
          created_at: string | null
          credit_cost: number | null
          description: string | null
          drop_rate: number | null
          front_icon: string | null
          front_image_url: string | null
          front_subtitle: string | null
          front_title: string
          id: string
          is_active: boolean | null
          is_consumable: boolean | null
          is_portal: boolean | null
          marks_value: number | null
          max_uses: number | null
          name: string
          portal_persists_in_keep: boolean | null
          rarity: string
          use_type: string | null
          user_id: string | null
        }
        Insert: {
          back_action?: string | null
          back_destination?: string | null
          back_instructions: string
          back_title: string
          border_color?: string | null
          card_code: string
          card_type?: string
          cooldown_hours?: number | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          drop_rate?: number | null
          front_icon?: string | null
          front_image_url?: string | null
          front_subtitle?: string | null
          front_title: string
          id?: string
          is_active?: boolean | null
          is_consumable?: boolean | null
          is_portal?: boolean | null
          marks_value?: number | null
          max_uses?: number | null
          name: string
          portal_persists_in_keep?: boolean | null
          rarity?: string
          use_type?: string | null
          user_id?: string | null
        }
        Update: {
          back_action?: string | null
          back_destination?: string | null
          back_instructions?: string
          back_title?: string
          border_color?: string | null
          card_code?: string
          card_type?: string
          cooldown_hours?: number | null
          created_at?: string | null
          credit_cost?: number | null
          description?: string | null
          drop_rate?: number | null
          front_icon?: string | null
          front_image_url?: string | null
          front_subtitle?: string | null
          front_title?: string
          id?: string
          is_active?: boolean | null
          is_consumable?: boolean | null
          is_portal?: boolean | null
          marks_value?: number | null
          max_uses?: number | null
          name?: string
          portal_persists_in_keep?: boolean | null
          rarity?: string
          use_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      defense_claws_preorders: {
        Row: {
          created_at: string | null
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          quantity: number | null
          recipient_name: string | null
          recipient_relationship: string | null
          shipping_address: Json | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          recipient_name?: string | null
          recipient_relationship?: string | null
          shipping_address?: Json | null
          total_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          recipient_name?: string | null
          recipient_relationship?: string | null
          shipping_address?: Json | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      defense_klaus_enrollments: {
        Row: {
          claim_token: string | null
          claimed_at: string | null
          claimed_by: string | null
          contribution_amount: number
          created_at: string | null
          email_hash: string
          enrollment_status: string | null
          expires_at: string | null
          id: string
          sponsor_anonymous: boolean | null
          sponsor_id: string | null
          user_id: string | null
        }
        Insert: {
          claim_token?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contribution_amount?: number
          created_at?: string | null
          email_hash: string
          enrollment_status?: string | null
          expires_at?: string | null
          id?: string
          sponsor_anonymous?: boolean | null
          sponsor_id?: string | null
          user_id?: string | null
        }
        Update: {
          claim_token?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contribution_amount?: number
          created_at?: string | null
          email_hash?: string
          enrollment_status?: string | null
          expires_at?: string | null
          id?: string
          sponsor_anonymous?: boolean | null
          sponsor_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defense_klaus_enrollments_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      defense_klaus_lawyer_applications: {
        Row: {
          bar_number: string | null
          bounty_id: string | null
          created_at: string | null
          experience_years: number | null
          id: string
          jurisdictions: string[] | null
          statement: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          bar_number?: string | null
          bounty_id?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          jurisdictions?: string[] | null
          statement?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bar_number?: string | null
          bounty_id?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          jurisdictions?: string[] | null
          statement?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "defense_klaus_lawyer_applications_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "defense_klaus_lawyer_bounties"
            referencedColumns: ["id"]
          },
        ]
      }
      defense_klaus_lawyer_bounties: {
        Row: {
          applications_count: number | null
          compensation_details: string | null
          compensation_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          practice_areas: string[] | null
          requirements: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          applications_count?: number | null
          compensation_details?: string | null
          compensation_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          practice_areas?: string[] | null
          requirements?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          applications_count?: number | null
          compensation_details?: string | null
          compensation_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          practice_areas?: string[] | null
          requirements?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      defense_klaus_referrals: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          recipient_email_hash: string
          referrer_proxy_id: string
          slot_number: number
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recipient_email_hash: string
          referrer_proxy_id: string
          slot_number: number
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recipient_email_hash?: string
          referrer_proxy_id?: string
          slot_number?: number
          status?: string | null
        }
        Relationships: []
      }
      defense_klaus_vouchers: {
        Row: {
          created_at: string | null
          donor_user_id: string | null
          email_hash: string
          id: string
          is_donated: boolean | null
          proxy_id: string
          qr_code_data: string
          redeemed_at: string | null
          voucher_type: string | null
        }
        Insert: {
          created_at?: string | null
          donor_user_id?: string | null
          email_hash: string
          id?: string
          is_donated?: boolean | null
          proxy_id: string
          qr_code_data: string
          redeemed_at?: string | null
          voucher_type?: string | null
        }
        Update: {
          created_at?: string | null
          donor_user_id?: string | null
          email_hash?: string
          id?: string
          is_donated?: boolean | null
          proxy_id?: string
          qr_code_data?: string
          redeemed_at?: string | null
          voucher_type?: string | null
        }
        Relationships: []
      }
      delivery_aggregation_windows: {
        Row: {
          created_at: string | null
          delivery_date: string
          delivery_time_slot: string | null
          id: string
          job_created_at: string | null
          job_id: string | null
          micro_local_area_id: string | null
          order_count: number | null
          shopping_list_ids: string[] | null
          status: string | null
          total_value: number | null
          user_id: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          delivery_date: string
          delivery_time_slot?: string | null
          id?: string
          job_created_at?: string | null
          job_id?: string | null
          micro_local_area_id?: string | null
          order_count?: number | null
          shopping_list_ids?: string[] | null
          status?: string | null
          total_value?: number | null
          user_id?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string | null
          delivery_date?: string
          delivery_time_slot?: string | null
          id?: string
          job_created_at?: string | null
          job_id?: string | null
          micro_local_area_id?: string | null
          order_count?: number | null
          shopping_list_ids?: string[] | null
          status?: string | null
          total_value?: number | null
          user_id?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_aggregation_windows_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "grocery_delivery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_aggregation_windows_micro_local_area_id_fkey"
            columns: ["micro_local_area_id"]
            isOneToOne: false
            referencedRelation: "micro_local_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_worker_stats: {
        Row: {
          average_delivery_time_minutes: number | null
          average_rating: number | null
          created_at: string | null
          delivery_badge_level: number | null
          earnings_this_month: number | null
          earnings_this_week: number | null
          is_verified_driver: boolean | null
          jobs_this_month: number | null
          jobs_this_week: number | null
          last_job_at: string | null
          total_deliveries: number | null
          total_earnings: number | null
          total_jobs_completed: number | null
          total_tips: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_delivery_time_minutes?: number | null
          average_rating?: number | null
          created_at?: string | null
          delivery_badge_level?: number | null
          earnings_this_month?: number | null
          earnings_this_week?: number | null
          is_verified_driver?: boolean | null
          jobs_this_month?: number | null
          jobs_this_week?: number | null
          last_job_at?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          total_jobs_completed?: number | null
          total_tips?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_delivery_time_minutes?: number | null
          average_rating?: number | null
          created_at?: string | null
          delivery_badge_level?: number | null
          earnings_this_month?: number | null
          earnings_this_week?: number | null
          is_verified_driver?: boolean | null
          jobs_this_month?: number | null
          jobs_this_week?: number | null
          last_job_at?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          total_jobs_completed?: number | null
          total_tips?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      demand_aggregation_windows: {
        Row: {
          area_name: string | null
          created_at: string | null
          delivery_job_id: string | null
          delivery_window_end: string | null
          delivery_window_start: string | null
          id: string
          max_participants: number | null
          max_value: number | null
          micro_local_area_id: string | null
          min_participants: number | null
          min_value: number | null
          participant_count: number | null
          status: string | null
          target_delivery_date: string
          threshold_met_at: string | null
          total_estimated_value: number | null
          total_items: number | null
          unique_ingredients: number | null
          updated_at: string | null
          user_id: string | null
          volume_discount_percent: number | null
          window_closes: string
          window_opens: string
          zip_code: string | null
        }
        Insert: {
          area_name?: string | null
          created_at?: string | null
          delivery_job_id?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          id?: string
          max_participants?: number | null
          max_value?: number | null
          micro_local_area_id?: string | null
          min_participants?: number | null
          min_value?: number | null
          participant_count?: number | null
          status?: string | null
          target_delivery_date: string
          threshold_met_at?: string | null
          total_estimated_value?: number | null
          total_items?: number | null
          unique_ingredients?: number | null
          updated_at?: string | null
          user_id?: string | null
          volume_discount_percent?: number | null
          window_closes: string
          window_opens: string
          zip_code?: string | null
        }
        Update: {
          area_name?: string | null
          created_at?: string | null
          delivery_job_id?: string | null
          delivery_window_end?: string | null
          delivery_window_start?: string | null
          id?: string
          max_participants?: number | null
          max_value?: number | null
          micro_local_area_id?: string | null
          min_participants?: number | null
          min_value?: number | null
          participant_count?: number | null
          status?: string | null
          target_delivery_date?: string
          threshold_met_at?: string | null
          total_estimated_value?: number | null
          total_items?: number | null
          unique_ingredients?: number | null
          updated_at?: string | null
          user_id?: string | null
          volume_discount_percent?: number | null
          window_closes?: string
          window_opens?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demand_aggregation_windows_micro_local_area_id_fkey"
            columns: ["micro_local_area_id"]
            isOneToOne: false
            referencedRelation: "micro_local_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_signals: {
        Row: {
          aggregated_into_node_id: string | null
          created_at: string | null
          dietary_requirements: string[] | null
          ghost_credits_spent: number | null
          id: string
          is_aggregated: boolean | null
          marks_pledged: number | null
          max_price_willing: number | null
          notes: string | null
          requested_frequency: string | null
          service_type: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          aggregated_into_node_id?: string | null
          created_at?: string | null
          dietary_requirements?: string[] | null
          ghost_credits_spent?: number | null
          id?: string
          is_aggregated?: boolean | null
          marks_pledged?: number | null
          max_price_willing?: number | null
          notes?: string | null
          requested_frequency?: string | null
          service_type: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          aggregated_into_node_id?: string | null
          created_at?: string | null
          dietary_requirements?: string[] | null
          ghost_credits_spent?: number | null
          id?: string
          is_aggregated?: boolean | null
          marks_pledged?: number | null
          max_price_willing?: number | null
          notes?: string | null
          requested_frequency?: string | null
          service_type?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_signals_aggregated_into_node_id_fkey"
            columns: ["aggregated_into_node_id"]
            isOneToOne: false
            referencedRelation: "node_status_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_signals_aggregated_into_node_id_fkey"
            columns: ["aggregated_into_node_id"]
            isOneToOne: false
            referencedRelation: "service_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      design_battle_participants: {
        Row: {
          ante_credit_equivalent: number
          ante_original: Json
          battle_id: string
          converted_at: string
          created_at: string
          crow_feather_earned: boolean | null
          display_name: string
          gap_rate_used: number
          id: string
          payout: number | null
          rank: number | null
          submission_url: string | null
          submitted_at: string | null
          user_id: string
          vote_count: number
        }
        Insert: {
          ante_credit_equivalent?: number
          ante_original?: Json
          battle_id: string
          converted_at?: string
          created_at?: string
          crow_feather_earned?: boolean | null
          display_name: string
          gap_rate_used?: number
          id?: string
          payout?: number | null
          rank?: number | null
          submission_url?: string | null
          submitted_at?: string | null
          user_id: string
          vote_count?: number
        }
        Update: {
          ante_credit_equivalent?: number
          ante_original?: Json
          battle_id?: string
          converted_at?: string
          created_at?: string
          crow_feather_earned?: boolean | null
          display_name?: string
          gap_rate_used?: number
          id?: string
          payout?: number | null
          rank?: number | null
          submission_url?: string | null
          submitted_at?: string | null
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "design_battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "design_battles"
            referencedColumns: ["id"]
          },
        ]
      }
      design_battle_votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          participant_id: string
          vote_credits: number
          voter_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          participant_id: string
          vote_credits?: number
          voter_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          participant_id?: string
          vote_credits?: number
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "design_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_battle_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "design_battle_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      design_battles: {
        Row: {
          bounty_id: string
          bounty_title: string
          community_votes: number
          created_at: string
          ends_at: string
          id: string
          min_ante_credits: number
          min_ante_joules: number
          min_ante_marks: number
          net_pot: number
          participant_count: number
          platform_cut: number
          skill_tier: string
          starts_at: string
          status: string
          timeframe: string
          total_pot: number
          updated_at: string
          winner_id: string | null
          winner_payout: number
        }
        Insert: {
          bounty_id: string
          bounty_title: string
          community_votes?: number
          created_at?: string
          ends_at: string
          id?: string
          min_ante_credits?: number
          min_ante_joules?: number
          min_ante_marks?: number
          net_pot?: number
          participant_count?: number
          platform_cut?: number
          skill_tier?: string
          starts_at?: string
          status?: string
          timeframe?: string
          total_pot?: number
          updated_at?: string
          winner_id?: string | null
          winner_payout?: number
        }
        Update: {
          bounty_id?: string
          bounty_title?: string
          community_votes?: number
          created_at?: string
          ends_at?: string
          id?: string
          min_ante_credits?: number
          min_ante_joules?: number
          min_ante_marks?: number
          net_pot?: number
          participant_count?: number
          platform_cut?: number
          skill_tier?: string
          starts_at?: string
          status?: string
          timeframe?: string
          total_pot?: number
          updated_at?: string
          winner_id?: string | null
          winner_payout?: number
        }
        Relationships: []
      }
      discoverable_cards: {
        Row: {
          card_type: string | null
          category_slug: string
          created_at: string | null
          description: string | null
          destination_route: string
          discovery_route: string | null
          glow_level: number | null
          hint_text: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          card_type?: string | null
          category_slug: string
          created_at?: string | null
          description?: string | null
          destination_route: string
          discovery_route?: string | null
          glow_level?: number | null
          hint_text?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          card_type?: string | null
          category_slug?: string
          created_at?: string | null
          description?: string | null
          destination_route?: string
          discovery_route?: string | null
          glow_level?: number | null
          hint_text?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discoverable_cards_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "discovery_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      discovery_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          max_visible_slots: number | null
          name: string
          slug: string
          sort_order: number | null
          trigger_type: string
          trigger_value: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_visible_slots?: number | null
          name: string
          slug: string
          sort_order?: number | null
          trigger_type?: string
          trigger_value?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_visible_slots?: number | null
          name?: string
          slug?: string
          sort_order?: number | null
          trigger_type?: string
          trigger_value?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      discovery_gates: {
        Row: {
          category_slug: string
          created_at: string | null
          description: string
          gate_slug: string
          icon: string | null
          id: string
          is_active: boolean | null
          no_label: string | null
          title: string
          trigger_route: string
          user_id: string | null
          yes_label: string | null
        }
        Insert: {
          category_slug: string
          created_at?: string | null
          description: string
          gate_slug: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          no_label?: string | null
          title: string
          trigger_route: string
          user_id?: string | null
          yes_label?: string | null
        }
        Update: {
          category_slug?: string
          created_at?: string | null
          description?: string
          gate_slug?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          no_label?: string | null
          title?: string
          trigger_route?: string
          user_id?: string | null
          yes_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_gates_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "discovery_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      distribution_nodes: {
        Row: {
          address: string | null
          advance_order_cutoff: string | null
          created_at: string | null
          distribution_days: string[] | null
          has_freeze_dry: boolean | null
          has_freezer: boolean | null
          has_meal_prep_kitchen: boolean | null
          has_refrigeration: boolean | null
          id: string
          is_active: boolean | null
          max_weekly_volume: string | null
          member_count: number | null
          name: string
          operator_id: string | null
          operator_share: number | null
          parking_spaces: number | null
          type: string
          updated_at: string | null
          zip_codes: string[] | null
        }
        Insert: {
          address?: string | null
          advance_order_cutoff?: string | null
          created_at?: string | null
          distribution_days?: string[] | null
          has_freeze_dry?: boolean | null
          has_freezer?: boolean | null
          has_meal_prep_kitchen?: boolean | null
          has_refrigeration?: boolean | null
          id?: string
          is_active?: boolean | null
          max_weekly_volume?: string | null
          member_count?: number | null
          name: string
          operator_id?: string | null
          operator_share?: number | null
          parking_spaces?: number | null
          type: string
          updated_at?: string | null
          zip_codes?: string[] | null
        }
        Update: {
          address?: string | null
          advance_order_cutoff?: string | null
          created_at?: string | null
          distribution_days?: string[] | null
          has_freeze_dry?: boolean | null
          has_freezer?: boolean | null
          has_meal_prep_kitchen?: boolean | null
          has_refrigeration?: boolean | null
          id?: string
          is_active?: boolean | null
          max_weekly_volume?: string | null
          member_count?: number | null
          name?: string
          operator_id?: string | null
          operator_share?: number | null
          parking_spaces?: number | null
          type?: string
          updated_at?: string | null
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      dna_lock: {
        Row: {
          category: string
          change_attempts: number | null
          created_at: string | null
          data_type: string
          description: string
          id: string
          is_locked: boolean
          last_change_attempt_at: string | null
          last_change_attempt_by: string | null
          last_read_at: string | null
          locked_at: string | null
          locked_by: string | null
          parameter_key: string
          parameter_value: string
          read_count: number | null
          user_id: string | null
        }
        Insert: {
          category: string
          change_attempts?: number | null
          created_at?: string | null
          data_type?: string
          description: string
          id?: string
          is_locked?: boolean
          last_change_attempt_at?: string | null
          last_change_attempt_by?: string | null
          last_read_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          parameter_key: string
          parameter_value: string
          read_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          change_attempts?: number | null
          created_at?: string | null
          data_type?: string
          description?: string
          id?: string
          is_locked?: boolean
          last_change_attempt_at?: string | null
          last_change_attempt_by?: string | null
          last_read_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          parameter_key?: string
          parameter_value?: string
          read_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      doctrinal_positions: {
        Row: {
          adherent_groups: Json | null
          believed: string
          branch_id: string
          call_to_action: Json | null
          created_at: string | null
          created_by: string | null
          dispute_status: string | null
          estimated_adherents: number | null
          evidence_basis: Json | null
          historical_sources: Json | null
          id: string
          key_term_links: Json | null
          loc_references: string[] | null
          popular_notes: string | null
          position_label: string
          practiced: string | null
          quality_score: number | null
          scholar_notes: string | null
          scholar_support: string
          scripture_references: Json | null
          taught: string
          updated_at: string | null
        }
        Insert: {
          adherent_groups?: Json | null
          believed: string
          branch_id: string
          call_to_action?: Json | null
          created_at?: string | null
          created_by?: string | null
          dispute_status?: string | null
          estimated_adherents?: number | null
          evidence_basis?: Json | null
          historical_sources?: Json | null
          id?: string
          key_term_links?: Json | null
          loc_references?: string[] | null
          popular_notes?: string | null
          position_label: string
          practiced?: string | null
          quality_score?: number | null
          scholar_notes?: string | null
          scholar_support?: string
          scripture_references?: Json | null
          taught: string
          updated_at?: string | null
        }
        Update: {
          adherent_groups?: Json | null
          believed?: string
          branch_id?: string
          call_to_action?: Json | null
          created_at?: string | null
          created_by?: string | null
          dispute_status?: string | null
          estimated_adherents?: number | null
          evidence_basis?: Json | null
          historical_sources?: Json | null
          id?: string
          key_term_links?: Json | null
          loc_references?: string[] | null
          popular_notes?: string | null
          position_label?: string
          practiced?: string | null
          quality_score?: number | null
          scholar_notes?: string | null
          scholar_support?: string
          scripture_references?: Json | null
          taught?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctrinal_positions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "doctrine_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      doctrine_branches: {
        Row: {
          created_at: string | null
          created_by: string | null
          depth_level: number
          description: string
          divergence_date: string | null
          divergence_event: string | null
          divergence_point: string
          domain: string
          id: string
          loc_reference: string | null
          parent_branch_id: string | null
          scholar_consensus: string | null
          scope: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          depth_level?: number
          description: string
          divergence_date?: string | null
          divergence_event?: string | null
          divergence_point: string
          domain?: string
          id?: string
          loc_reference?: string | null
          parent_branch_id?: string | null
          scholar_consensus?: string | null
          scope?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          depth_level?: number
          description?: string
          divergence_date?: string | null
          divergence_event?: string | null
          divergence_point?: string
          domain?: string
          id?: string
          loc_reference?: string | null
          parent_branch_id?: string | null
          scholar_consensus?: string | null
          scope?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctrine_branches_parent_branch_id_fkey"
            columns: ["parent_branch_id"]
            isOneToOne: false
            referencedRelation: "doctrine_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      doctrine_edits: {
        Row: {
          created_at: string | null
          edit_summary: string | null
          edit_type: string
          editor_id: string | null
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          previous_value: Json | null
        }
        Insert: {
          created_at?: string | null
          edit_summary?: string | null
          edit_type: string
          editor_id?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Update: {
          created_at?: string | null
          edit_summary?: string | null
          edit_type?: string
          editor_id?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Relationships: []
      }
      documentation_contributor_stats: {
        Row: {
          average_rating: number | null
          icing_earned: number | null
          last_payout_at: string | null
          pending_payout: number | null
          total_earnings: number | null
          total_guides: number | null
          total_helpful_votes: number | null
          total_hints: number | null
          total_items_published: number | null
          total_revenue: number | null
          total_sales: number | null
          total_walkthroughs: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          icing_earned?: number | null
          last_payout_at?: string | null
          pending_payout?: number | null
          total_earnings?: number | null
          total_guides?: number | null
          total_helpful_votes?: number | null
          total_hints?: number | null
          total_items_published?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          total_walkthroughs?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_rating?: number | null
          icing_earned?: number | null
          last_payout_at?: string | null
          pending_payout?: number | null
          total_earnings?: number | null
          total_guides?: number | null
          total_helpful_votes?: number | null
          total_hints?: number | null
          total_items_published?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          total_walkthroughs?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documentation_items: {
        Row: {
          applicable_initiatives: string[] | null
          applicable_states: string[] | null
          average_rating: number | null
          category: string
          content: string
          contributor_earnings: number | null
          contributor_id: string | null
          contributor_share: number | null
          created_at: string | null
          doc_type: string
          featured_at: string | null
          helpful_count: number | null
          id: string
          media_urls: string[] | null
          not_helpful_count: number | null
          price_credits: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          skill_level: string | null
          status: string | null
          subcategory: string | null
          summary: string | null
          tags: string[] | null
          times_purchased: number | null
          times_viewed: number | null
          title: string
          total_revenue: number | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          applicable_initiatives?: string[] | null
          applicable_states?: string[] | null
          average_rating?: number | null
          category: string
          content: string
          contributor_earnings?: number | null
          contributor_id?: string | null
          contributor_share?: number | null
          created_at?: string | null
          doc_type: string
          featured_at?: string | null
          helpful_count?: number | null
          id?: string
          media_urls?: string[] | null
          not_helpful_count?: number | null
          price_credits?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string | null
          status?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: string[] | null
          times_purchased?: number | null
          times_viewed?: number | null
          title: string
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          applicable_initiatives?: string[] | null
          applicable_states?: string[] | null
          average_rating?: number | null
          category?: string
          content?: string
          contributor_earnings?: number | null
          contributor_id?: string | null
          contributor_share?: number | null
          created_at?: string | null
          doc_type?: string
          featured_at?: string | null
          helpful_count?: number | null
          id?: string
          media_urls?: string[] | null
          not_helpful_count?: number | null
          price_credits?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string | null
          status?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: string[] | null
          times_purchased?: number | null
          times_viewed?: number | null
          title?: string
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      documentation_purchases: {
        Row: {
          contributor_earned: number | null
          doc_id: string | null
          id: string
          lb_earned: number | null
          price_paid: number
          purchased_at: string | null
          rated_at: string | null
          rating: number | null
          review: string | null
          user_id: string
          was_helpful: boolean | null
        }
        Insert: {
          contributor_earned?: number | null
          doc_id?: string | null
          id?: string
          lb_earned?: number | null
          price_paid: number
          purchased_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          user_id: string
          was_helpful?: boolean | null
        }
        Update: {
          contributor_earned?: number | null
          doc_id?: string | null
          id?: string
          lb_earned?: number | null
          price_paid?: number
          purchased_at?: string | null
          rated_at?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_purchases_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "documentation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_commitment_transactions: {
        Row: {
          amount: number
          commitment_id: string
          created_at: string | null
          id: string
          notes: string | null
          project_id: string | null
          project_name: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          commitment_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          commitment_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_commitment_transactions_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "donation_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_commitment_transactions_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "v_donation_commitments_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_commitments: {
        Row: {
          alert_before_charge: boolean | null
          amount: number
          category: string | null
          created_at: string | null
          donation_count: number | null
          frequency: string | null
          id: string
          last_donation_date: string | null
          next_charge_date: string | null
          percentage_amount: number | null
          remaining_pool: number | null
          status: string | null
          stripe_payment_method_id: string | null
          stripe_subscription_id: string | null
          target_id: string | null
          target_name: string | null
          target_type: string
          total_donated: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_before_charge?: boolean | null
          amount: number
          category?: string | null
          created_at?: string | null
          donation_count?: number | null
          frequency?: string | null
          id?: string
          last_donation_date?: string | null
          next_charge_date?: string | null
          percentage_amount?: number | null
          remaining_pool?: number | null
          status?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type: string
          total_donated?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_before_charge?: boolean | null
          amount?: number
          category?: string | null
          created_at?: string | null
          donation_count?: number | null
          frequency?: string | null
          id?: string
          last_donation_date?: string | null
          next_charge_date?: string | null
          percentage_amount?: number | null
          remaining_pool?: number | null
          status?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string
          total_donated?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      donation_record_views: {
        Row: {
          created_at: string
          donation_id: string
          fee_paid: number
          id: string
          ledger_entry_id: string
          viewer_member_id: string
        }
        Insert: {
          created_at?: string
          donation_id: string
          fee_paid?: number
          id?: string
          ledger_entry_id: string
          viewer_member_id: string
        }
        Update: {
          created_at?: string
          donation_id?: string
          fee_paid?: number
          id?: string
          ledger_entry_id?: string
          viewer_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_record_views_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "coverage_minute_donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_email: string | null
          donor_name: string | null
          guild_id: string | null
          id: string
          initiative_id: string | null
          is_anonymous: boolean | null
          is_subscription: boolean | null
          metadata: Json | null
          net_amount: number | null
          nominee_info: Json | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subscription_id: string | null
          tier: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          guild_id?: string | null
          id?: string
          initiative_id?: string | null
          is_anonymous?: boolean | null
          is_subscription?: boolean | null
          metadata?: Json | null
          net_amount?: number | null
          nominee_info?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string | null
          guild_id?: string | null
          id?: string
          initiative_id?: string | null
          is_anonymous?: boolean | null
          is_subscription?: boolean | null
          metadata?: Json | null
          net_amount?: number | null
          nominee_info?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiative_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_votes: {
        Row: {
          created_at: string | null
          donation_id: string | null
          donor_email: string | null
          donor_id: string | null
          expires_at: string | null
          id: string
          stripe_session_id: string | null
          total_votes: number
          user_id: string | null
          votes_remaining: number | null
          votes_used: number | null
        }
        Insert: {
          created_at?: string | null
          donation_id?: string | null
          donor_email?: string | null
          donor_id?: string | null
          expires_at?: string | null
          id?: string
          stripe_session_id?: string | null
          total_votes: number
          user_id?: string | null
          votes_remaining?: number | null
          votes_used?: number | null
        }
        Update: {
          created_at?: string | null
          donation_id?: string | null
          donor_email?: string | null
          donor_id?: string | null
          expires_at?: string | null
          id?: string
          stripe_session_id?: string | null
          total_votes?: number
          user_id?: string | null
          votes_remaining?: number | null
          votes_used?: number | null
        }
        Relationships: []
      }
      durin_door_attempts: {
        Row: {
          created_at: string | null
          door_id: string
          ghost_id: string | null
          id: string
          language: string | null
          password_tried: string
          reward_given: Json | null
          time_of_day: string | null
          user_id: string | null
          was_correct: boolean
        }
        Insert: {
          created_at?: string | null
          door_id: string
          ghost_id?: string | null
          id?: string
          language?: string | null
          password_tried: string
          reward_given?: Json | null
          time_of_day?: string | null
          user_id?: string | null
          was_correct?: boolean
        }
        Update: {
          created_at?: string | null
          door_id?: string
          ghost_id?: string | null
          id?: string
          language?: string | null
          password_tried?: string
          reward_given?: Json | null
          time_of_day?: string | null
          user_id?: string | null
          was_correct?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "durin_door_attempts_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      durin_door_unlocks: {
        Row: {
          door_id: string
          ghost_id: string | null
          id: string
          language: string
          password_used: string
          tier: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          door_id: string
          ghost_id?: string | null
          id?: string
          language: string
          password_used: string
          tier: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          door_id?: string
          ghost_id?: string | null
          id?: string
          language?: string
          password_used?: string
          tier?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "durin_door_unlocks_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equal_time_tracking: {
        Row: {
          branch_id: string
          call_for_voices: Json | null
          id: string
          is_balanced: boolean | null
          position_counts: Json | null
          underrepresented: string[] | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          call_for_voices?: Json | null
          id?: string
          is_balanced?: boolean | null
          position_counts?: Json | null
          underrepresented?: string[] | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          call_for_voices?: Json | null
          id?: string
          is_balanced?: boolean | null
          position_counts?: Json | null
          underrepresented?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equal_time_tracking_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "doctrine_branches"
            referencedColumns: ["id"]
          },
        ]
      }
      exception_stamps: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          reason_hash: string
          target_rating: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason_hash: string
          target_rating: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason_hash?: string
          target_rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exception_stamps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exception_stamps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_extensions: {
        Row: {
          child_id: string
          extension_number: number
          id: string
          parent_id: string
          spawn_reason: string | null
          spawn_trigger_score: number | null
          spawned_at: string | null
          user_id: string | null
        }
        Insert: {
          child_id: string
          extension_number: number
          id?: string
          parent_id: string
          spawn_reason?: string | null
          spawn_trigger_score?: number | null
          spawned_at?: string | null
          user_id?: string | null
        }
        Update: {
          child_id?: string
          extension_number?: number
          id?: string
          parent_id?: string
          spawn_reason?: string | null
          spawn_trigger_score?: number | null
          spawned_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_extensions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_extensions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_snapshots: {
        Row: {
          experiment_id: string
          id: string
          net_score: number | null
          notes: string | null
          snapshot_at: string | null
          snapshot_data: Json
          snapshot_number: number
          user_id: string | null
          vector_effects_summary: Json | null
        }
        Insert: {
          experiment_id: string
          id?: string
          net_score?: number | null
          notes?: string | null
          snapshot_at?: string | null
          snapshot_data?: Json
          snapshot_number: number
          user_id?: string | null
          vector_effects_summary?: Json | null
        }
        Update: {
          experiment_id?: string
          id?: string
          net_score?: number | null
          notes?: string | null
          snapshot_at?: string | null
          snapshot_data?: Json
          snapshot_number?: number
          user_id?: string | null
          vector_effects_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_snapshots_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      expiration_presets: {
        Row: {
          benefit_type: string
          created_at: string | null
          default_hours: number
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          max_hours: number
          min_hours: number
          urgency_note: string | null
          user_id: string | null
        }
        Insert: {
          benefit_type: string
          created_at?: string | null
          default_hours: number
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          max_hours: number
          min_hours: number
          urgency_note?: string | null
          user_id?: string | null
        }
        Update: {
          benefit_type?: string
          created_at?: string | null
          default_hours?: number
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          max_hours?: number
          min_hours?: number
          urgency_note?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expressions_of_interest: {
        Row: {
          conversion_order_id: string | null
          converted: boolean | null
          converted_at: string | null
          created_at: string | null
          ghost_credits_allocated: number | null
          ghost_profile_id: string | null
          id: string
          interest_level: string | null
          interest_type: string
          max_price_willing: number | null
          metadata: Json | null
          notes: string | null
          notify_on_available: boolean | null
          notify_on_price_drop: boolean | null
          preferred_price: number | null
          subject_id: string | null
          subject_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conversion_order_id?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          ghost_credits_allocated?: number | null
          ghost_profile_id?: string | null
          id?: string
          interest_level?: string | null
          interest_type: string
          max_price_willing?: number | null
          metadata?: Json | null
          notes?: string | null
          notify_on_available?: boolean | null
          notify_on_price_drop?: boolean | null
          preferred_price?: number | null
          subject_id?: string | null
          subject_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversion_order_id?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          ghost_credits_allocated?: number | null
          ghost_profile_id?: string | null
          id?: string
          interest_level?: string | null
          interest_type?: string
          max_price_willing?: number | null
          metadata?: Json | null
          notes?: string | null
          notify_on_available?: boolean | null
          notify_on_price_drop?: boolean | null
          preferred_price?: number | null
          subject_id?: string | null
          subject_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expressions_of_interest_conversion_order_id_fkey"
            columns: ["conversion_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expressions_of_interest_ghost_profile_id_fkey"
            columns: ["ghost_profile_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          created_by: string | null
          display_name: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_calendars: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          default_reminder_minutes: number | null
          description: string | null
          family_id: string
          google_account_email: string | null
          google_calendar_id: string | null
          id: string
          is_default: boolean | null
          last_sync_at: string | null
          name: string
          sync_direction: string | null
          sync_enabled: boolean | null
          sync_token: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_reminder_minutes?: number | null
          description?: string | null
          family_id: string
          google_account_email?: string | null
          google_calendar_id?: string | null
          id?: string
          is_default?: boolean | null
          last_sync_at?: string | null
          name: string
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_reminder_minutes?: number | null
          description?: string | null
          family_id?: string
          google_account_email?: string | null
          google_calendar_id?: string | null
          id?: string
          is_default?: boolean | null
          last_sync_at?: string | null
          name?: string
          sync_direction?: string | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_calendars_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_calendars_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_event_rsvps: {
        Row: {
          event_id: string
          id: string
          member_id: string
          notes: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          event_id: string
          id?: string
          member_id: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "family_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_event_rsvps_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_events: {
        Row: {
          all_day: boolean | null
          attendees: string[] | null
          calendar_id: string
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          event_type: string | null
          google_event_id: string | null
          id: string
          is_private: boolean | null
          is_recurring: boolean | null
          location: string | null
          parent_event_id: string | null
          recurrence_end: string | null
          recurrence_rule: string | null
          reminder_minutes: number[] | null
          source: string | null
          source_id: string | null
          start_time: string
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          attendees?: string[] | null
          calendar_id: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_private?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_end?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number[] | null
          source?: string | null
          source_id?: string | null
          start_time: string
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          attendees?: string[] | null
          calendar_id?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_private?: boolean | null
          is_recurring?: boolean | null
          location?: string | null
          parent_event_id?: string | null
          recurrence_end?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number[] | null
          source?: string | null
          source_id?: string | null
          start_time?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "family_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "family_events"
            referencedColumns: ["id"]
          },
        ]
      }
      family_garage_sales: {
        Row: {
          accepts_marks: boolean | null
          address_text: string
          city: string | null
          created_at: string | null
          description: string | null
          end_time: string
          host_id: string
          id: string
          latitude: number | null
          longitude: number | null
          marks_discount_pct: number | null
          postal_code: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accepts_marks?: boolean | null
          address_text: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          host_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          marks_discount_pct?: number | null
          postal_code?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accepts_marks?: boolean | null
          address_text?: string
          city?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          host_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          marks_discount_pct?: number | null
          postal_code?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_gift_lists: {
        Row: {
          created_at: string | null
          description: string | null
          family_id: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          notion_database_id: string | null
          notion_sync_url: string | null
          occasion: string | null
          occasion_date: string | null
          owner_id: string
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          notion_database_id?: string | null
          notion_sync_url?: string | null
          occasion?: string | null
          occasion_date?: string | null
          owner_id: string
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          notion_database_id?: string | null
          notion_sync_url?: string | null
          occasion?: string | null
          occasion_date?: string | null
          owner_id?: string
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_gift_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_gift_lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invite_votes: {
        Row: {
          id: string
          invite_id: string
          user_id: string | null
          vote: boolean
          voted_at: string | null
          voter_id: string
        }
        Insert: {
          id?: string
          invite_id: string
          user_id?: string | null
          vote: boolean
          voted_at?: string | null
          voter_id: string
        }
        Update: {
          id?: string
          invite_id?: string
          user_id?: string | null
          vote?: boolean
          voted_at?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invite_votes_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "family_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invite_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invite_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          family_id: string
          id: string
          invited_by: string
          invitee_email: string
          invitee_name: string
          message: string | null
          resolved_at: string | null
          status: string | null
          user_id: string | null
          votes_needed: number
          votes_received: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          family_id: string
          id?: string
          invited_by: string
          invitee_email: string
          invitee_name: string
          message?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
          votes_needed?: number
          votes_received?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          family_id?: string
          id?: string
          invited_by?: string
          invitee_email?: string
          invitee_name?: string
          message?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
          votes_needed?: number
          votes_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_knocks: {
        Row: {
          expires_at: string | null
          hunt_date: string
          id: string
          knocked_at: string | null
          person: string
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          hunt_date: string
          id?: string
          knocked_at?: string | null
          person: string
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          hunt_date?: string
          id?: string
          knocked_at?: string | null
          person?: string
          user_id?: string | null
        }
        Relationships: []
      }
      family_meal_plans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          custom_meal_name: string | null
          id: string
          include_in_shopping: boolean | null
          lmd_meal_id: string | null
          meal_date: string
          meal_slot: string
          notes: string | null
          recipe_id: string | null
          servings: number | null
          shopping_list_id: string | null
          status: string | null
          tribe_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          custom_meal_name?: string | null
          id?: string
          include_in_shopping?: boolean | null
          lmd_meal_id?: string | null
          meal_date: string
          meal_slot: string
          notes?: string | null
          recipe_id?: string | null
          servings?: number | null
          shopping_list_id?: string | null
          status?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          custom_meal_name?: string | null
          id?: string
          include_in_shopping?: boolean | null
          lmd_meal_id?: string | null
          meal_date?: string
          meal_slot?: string
          notes?: string | null
          recipe_id?: string | null
          servings?: number | null
          shopping_list_id?: string | null
          status?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_meal_plans_lmd_meal_id_fkey"
            columns: ["lmd_meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_meal_plans_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string | null
          email: string | null
          family_id: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          nickname: string
          role: string | null
          symbol: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          family_id: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          nickname: string
          role?: string | null
          symbol?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          family_id?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          nickname?: string
          role?: string | null
          symbol?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_shared_memories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          family_id: string
          id: string
          is_unlocked: boolean | null
          member_a: string
          member_b: string | null
          photo_urls: string[] | null
          title: string | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_unlocked?: boolean | null
          member_a: string
          member_b?: string | null
          photo_urls?: string[] | null
          title?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_unlocked?: boolean | null
          member_a?: string
          member_b?: string | null
          photo_urls?: string[] | null
          title?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_shared_memories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shared_memories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shared_memories_member_a_fkey"
            columns: ["member_a"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shared_memories_member_b_fkey"
            columns: ["member_b"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_shopping_list_items: {
        Row: {
          actual_price: number | null
          category: string | null
          checked_at: string | null
          checked_by: string | null
          created_at: string | null
          estimated_price: number | null
          id: string
          ingredient_name: string
          is_checked: boolean | null
          normalized_name: string | null
          notes: string | null
          quantity: number | null
          shopping_list_id: string
          source_meal_plan_id: string | null
          source_recipe_id: string | null
          substitutes: string | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          actual_price?: number | null
          category?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          ingredient_name: string
          is_checked?: boolean | null
          normalized_name?: string | null
          notes?: string | null
          quantity?: number | null
          shopping_list_id: string
          source_meal_plan_id?: string | null
          source_recipe_id?: string | null
          substitutes?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          actual_price?: number | null
          category?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          estimated_price?: number | null
          id?: string
          ingredient_name?: string
          is_checked?: boolean | null
          normalized_name?: string | null
          notes?: string | null
          quantity?: number | null
          shopping_list_id?: string
          source_meal_plan_id?: string | null
          source_recipe_id?: string | null
          substitutes?: string | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "family_shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shopping_list_items_source_meal_plan_id_fkey"
            columns: ["source_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "family_meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shopping_list_items_source_recipe_id_fkey"
            columns: ["source_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_shopping_list_items_source_recipe_id_fkey"
            columns: ["source_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      family_shopping_lists: {
        Row: {
          created_at: string | null
          delivery_job_id: string | null
          external_api: string | null
          external_order_id: string | null
          fulfillment_method: string | null
          id: string
          is_tribe_aggregated: boolean | null
          lgg_order_id: string | null
          lgs_order_id: string | null
          status: string | null
          tribe_id: string | null
          updated_at: string | null
          user_id: string
          week_end: string | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          delivery_job_id?: string | null
          external_api?: string | null
          external_order_id?: string | null
          fulfillment_method?: string | null
          id?: string
          is_tribe_aggregated?: boolean | null
          lgg_order_id?: string | null
          lgs_order_id?: string | null
          status?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id: string
          week_end?: string | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          delivery_job_id?: string | null
          external_api?: string | null
          external_order_id?: string | null
          fulfillment_method?: string | null
          id?: string
          is_tribe_aggregated?: boolean | null
          lgg_order_id?: string | null
          lgs_order_id?: string | null
          status?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id?: string
          week_end?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_shopping_lists_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_produce: {
        Row: {
          category: string
          created_at: string | null
          estimated_weekly_volume: string | null
          farmer_id: string | null
          id: string
          is_active: boolean | null
          item_name: string
          organic_certified: boolean | null
          price_per_unit: number | null
          seasonal_availability: string | null
          unit: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          estimated_weekly_volume?: string | null
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          item_name: string
          organic_certified?: boolean | null
          price_per_unit?: number | null
          seasonal_availability?: string | null
          unit?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          estimated_weekly_volume?: string | null
          farmer_id?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          organic_certified?: boolean | null
          price_per_unit?: number | null
          seasonal_availability?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_produce_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          advance_order_enabled: boolean | null
          challenges: string[] | null
          county: string | null
          created_at: string | null
          distance_to_nearest_node: number | null
          farm_name: string
          farmer_name: string
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          minimum_advance_order_days: number | null
          pickup_schedule: string[] | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          advance_order_enabled?: boolean | null
          challenges?: string[] | null
          county?: string | null
          created_at?: string | null
          distance_to_nearest_node?: number | null
          farm_name: string
          farmer_name: string
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          minimum_advance_order_days?: number | null
          pickup_schedule?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          advance_order_enabled?: boolean | null
          challenges?: string[] | null
          county?: string | null
          created_at?: string | null
          distance_to_nearest_node?: number | null
          farm_name?: string
          farmer_name?: string
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          minimum_advance_order_days?: number | null
          pickup_schedule?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_snapshots: {
        Row: {
          account_reference: string | null
          amount: number | null
          category: string | null
          currency: string | null
          description: string | null
          effective_date: string | null
          id: string
          ledger_entry_id: string | null
          recorded_at: string | null
          snapshot_type: string
          user_id: string | null
        }
        Insert: {
          account_reference?: string | null
          amount?: number | null
          category?: string | null
          currency?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          ledger_entry_id?: string | null
          recorded_at?: string | null
          snapshot_type: string
          user_id?: string | null
        }
        Update: {
          account_reference?: string | null
          amount?: number | null
          category?: string | null
          currency?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          ledger_entry_id?: string | null
          recorded_at?: string | null
          snapshot_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_snapshots_ledger_entry_id_fkey"
            columns: ["ledger_entry_id"]
            isOneToOne: false
            referencedRelation: "ip_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_anecdotes: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          lesson: string | null
          related_quote: string | null
          story: string
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          lesson?: string | null
          related_quote?: string | null
          story: string
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          lesson?: string | null
          related_quote?: string | null
          story?: string
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fray_entries: {
        Row: {
          ante_paid: number | null
          best_run_id: string | null
          best_time_seconds: number | null
          final_rank: number | null
          id: string
          league_id: string
          prize_earned: number | null
          registered_at: string | null
          user_id: string
        }
        Insert: {
          ante_paid?: number | null
          best_run_id?: string | null
          best_time_seconds?: number | null
          final_rank?: number | null
          id?: string
          league_id: string
          prize_earned?: number | null
          registered_at?: string | null
          user_id: string
        }
        Update: {
          ante_paid?: number | null
          best_run_id?: string | null
          best_time_seconds?: number | null
          final_rank?: number | null
          id?: string
          league_id?: string
          prize_earned?: number | null
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fray_entries_best_run_id_fkey"
            columns: ["best_run_id"]
            isOneToOne: false
            referencedRelation: "treasure_map_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fray_entries_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "fray_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      fray_leagues: {
        Row: {
          created_at: string | null
          description: string | null
          discord_channel_id: string | null
          ends_at: string
          entry_ante: number | null
          id: string
          map_id: string | null
          platform_cut_percent: number | null
          prize_pool: number | null
          registration_deadline: string | null
          starts_at: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discord_channel_id?: string | null
          ends_at: string
          entry_ante?: number | null
          id?: string
          map_id?: string | null
          platform_cut_percent?: number | null
          prize_pool?: number | null
          registration_deadline?: string | null
          starts_at: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discord_channel_id?: string | null
          ends_at?: string
          entry_ante?: number | null
          id?: string
          map_id?: string | null
          platform_cut_percent?: number | null
          prize_pool?: number | null
          registration_deadline?: string | null
          starts_at?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fray_leagues_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "treasure_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      free_daily_limits: {
        Row: {
          created_at: string | null
          cta_text: string | null
          feature_description: string | null
          feature_name: string
          feature_type: string
          free_daily_limit: number
          id: string
          is_active: boolean | null
          member_daily_limit: number | null
          updated_at: string | null
          upgrade_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          feature_description?: string | null
          feature_name: string
          feature_type: string
          free_daily_limit?: number
          id?: string
          is_active?: boolean | null
          member_daily_limit?: number | null
          updated_at?: string | null
          upgrade_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          feature_description?: string | null
          feature_name?: string
          feature_type?: string
          free_daily_limit?: number
          id?: string
          is_active?: boolean | null
          member_daily_limit?: number | null
          updated_at?: string | null
          upgrade_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      free_daily_usage: {
        Row: {
          conversion_date: string | null
          converted_to_member: boolean | null
          created_at: string | null
          device_fingerprint: string | null
          feature_type: string
          first_used_at: string | null
          id: string
          ip_hash: string | null
          last_used_at: string | null
          session_duration_seconds: number | null
          usage_count: number | null
          usage_date: string
          user_id: string | null
        }
        Insert: {
          conversion_date?: string | null
          converted_to_member?: boolean | null
          created_at?: string | null
          device_fingerprint?: string | null
          feature_type: string
          first_used_at?: string | null
          id?: string
          ip_hash?: string | null
          last_used_at?: string | null
          session_duration_seconds?: number | null
          usage_count?: number | null
          usage_date?: string
          user_id?: string | null
        }
        Update: {
          conversion_date?: string | null
          converted_to_member?: boolean | null
          created_at?: string | null
          device_fingerprint?: string | null
          feature_type?: string
          first_used_at?: string | null
          id?: string
          ip_hash?: string | null
          last_used_at?: string | null
          session_duration_seconds?: number | null
          usage_count?: number | null
          usage_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fresh_start_log: {
        Row: {
          id: string
          kept_collected_cards: number | null
          kept_ip_stakes: number | null
          kept_portfolio_value: number | null
          marks_spent: number
          previous_completed_bounties: number | null
          previous_discovery_count: number | null
          previous_guild_level: number | null
          previous_reputation_score: number | null
          reset_at: string
          reset_number: number
          user_id: string
        }
        Insert: {
          id?: string
          kept_collected_cards?: number | null
          kept_ip_stakes?: number | null
          kept_portfolio_value?: number | null
          marks_spent?: number
          previous_completed_bounties?: number | null
          previous_discovery_count?: number | null
          previous_guild_level?: number | null
          previous_reputation_score?: number | null
          reset_at?: string
          reset_number?: number
          user_id: string
        }
        Update: {
          id?: string
          kept_collected_cards?: number | null
          kept_ip_stakes?: number | null
          kept_portfolio_value?: number | null
          marks_spent?: number
          previous_completed_bounties?: number | null
          previous_discovery_count?: number | null
          previous_guild_level?: number | null
          previous_reputation_score?: number | null
          reset_at?: string
          reset_number?: number
          user_id?: string
        }
        Relationships: []
      }
      furnace_anchors: {
        Row: {
          anchor_type: string
          business_id: string | null
          created_at: string | null
          id: string
          last_scanned_at: string | null
          metadata: Json | null
          owner_id: string | null
          product_category: string | null
          product_description: string | null
          product_name: string | null
          qr_code_hash: string
          scan_count: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          anchor_type?: string
          business_id?: string | null
          created_at?: string | null
          id?: string
          last_scanned_at?: string | null
          metadata?: Json | null
          owner_id?: string | null
          product_category?: string | null
          product_description?: string | null
          product_name?: string | null
          qr_code_hash: string
          scan_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          anchor_type?: string
          business_id?: string | null
          created_at?: string | null
          id?: string
          last_scanned_at?: string | null
          metadata?: Json | null
          owner_id?: string | null
          product_category?: string | null
          product_description?: string | null
          product_name?: string | null
          qr_code_hash?: string
          scan_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      furnace_reports: {
        Row: {
          created_at: string | null
          cue_card_id: string | null
          description: string | null
          id: string
          image_url: string | null
          payload_data: Json | null
          report_type: string
          reporter_email: string | null
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cue_card_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          payload_data?: Json | null
          report_type: string
          reporter_email?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cue_card_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          payload_data?: Json | null
          report_type?: string
          reporter_email?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "furnace_reports_cue_card_id_fkey"
            columns: ["cue_card_id"]
            isOneToOne: false
            referencedRelation: "cue_card_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      furnace_scans: {
        Row: {
          anchor_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          is_authentic: boolean | null
          scan_context: string | null
          scan_location: Json | null
          scanner_ghost_id: string | null
          scanner_id: string | null
          user_id: string | null
        }
        Insert: {
          anchor_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_authentic?: boolean | null
          scan_context?: string | null
          scan_location?: Json | null
          scanner_ghost_id?: string | null
          scanner_id?: string | null
          user_id?: string | null
        }
        Update: {
          anchor_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_authentic?: boolean | null
          scan_context?: string | null
          scan_location?: Json | null
          scanner_ghost_id?: string | null
          scanner_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "furnace_scans_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "furnace_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      furnace_verifications: {
        Row: {
          created_at: string | null
          cue_card_id: string | null
          id: string
          ip_hash: string | null
          payload_checked: string | null
          result: string
          trust_score_shown: number | null
          user_agent_hash: string | null
          user_id: string | null
          verification_method: string
        }
        Insert: {
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          ip_hash?: string | null
          payload_checked?: string | null
          result: string
          trust_score_shown?: number | null
          user_agent_hash?: string | null
          user_id?: string | null
          verification_method: string
        }
        Update: {
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          ip_hash?: string | null
          payload_checked?: string | null
          result?: string
          trust_score_shown?: number | null
          user_agent_hash?: string | null
          user_id?: string | null
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "furnace_verifications_cue_card_id_fkey"
            columns: ["cue_card_id"]
            isOneToOne: false
            referencedRelation: "cue_card_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_passages: {
        Row: {
          friend_word: string
          gate_id: string
          id: string
          language: string
          passed_at: string | null
          user_id: string | null
        }
        Insert: {
          friend_word: string
          gate_id: string
          id?: string
          language: string
          passed_at?: string | null
          user_id?: string | null
        }
        Update: {
          friend_word?: string
          gate_id?: string
          id?: string
          language?: string
          passed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gate_passages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_passages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_demand_signals: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          initiative_id: string
          notes: string | null
          pledge_amount: number | null
          signal_type: string
          state: string | null
          user_id: string | null
          zip_code: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          initiative_id: string
          notes?: string | null
          pledge_amount?: number | null
          signal_type?: string
          state?: string | null
          user_id?: string | null
          zip_code: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          initiative_id?: string
          notes?: string | null
          pledge_amount?: number | null
          signal_type?: string
          state?: string | null
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      ghost_credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_deployment_configs: {
        Row: {
          cors_origins: string[]
          created_at: string
          database_type: string
          deployment_mode: string
          docker_image: string
          ghost_url: string
          golden_key_script_id: string
          id: string
          is_healthy: boolean
          jwt_bridge_enabled: boolean
          last_health_check_at: string | null
          monthly_cost_estimate: number
          pedestal_ids: string[]
          region: string
          supabase_jwt_secret_ref: string
          updated_at: string
        }
        Insert: {
          cors_origins?: string[]
          created_at?: string
          database_type?: string
          deployment_mode?: string
          docker_image?: string
          ghost_url: string
          golden_key_script_id: string
          id?: string
          is_healthy?: boolean
          jwt_bridge_enabled?: boolean
          last_health_check_at?: string | null
          monthly_cost_estimate?: number
          pedestal_ids?: string[]
          region?: string
          supabase_jwt_secret_ref?: string
          updated_at?: string
        }
        Update: {
          cors_origins?: string[]
          created_at?: string
          database_type?: string
          deployment_mode?: string
          docker_image?: string
          ghost_url?: string
          golden_key_script_id?: string
          id?: string
          is_healthy?: boolean
          jwt_bridge_enabled?: boolean
          last_health_check_at?: string | null
          monthly_cost_estimate?: number
          pedestal_ids?: string[]
          region?: string
          supabase_jwt_secret_ref?: string
          updated_at?: string
        }
        Relationships: []
      }
      ghost_jwt_bridges: {
        Row: {
          auto_create_members: boolean
          created_at: string
          deployment_config_id: string
          id: string
          is_active: boolean
          jwt_audience: string
          last_sync_at: string | null
          members_synced: number
          supabase_url: string
          sync_interval_ms: number
        }
        Insert: {
          auto_create_members?: boolean
          created_at?: string
          deployment_config_id: string
          id?: string
          is_active?: boolean
          jwt_audience?: string
          last_sync_at?: string | null
          members_synced?: number
          supabase_url: string
          sync_interval_ms?: number
        }
        Update: {
          auto_create_members?: boolean
          created_at?: string
          deployment_config_id?: string
          id?: string
          is_active?: boolean
          jwt_audience?: string
          last_sync_at?: string | null
          members_synced?: number
          supabase_url?: string
          sync_interval_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "ghost_jwt_bridges_deployment_config_id_fkey"
            columns: ["deployment_config_id"]
            isOneToOne: false
            referencedRelation: "ghost_deployment_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_leaderboard: {
        Row: {
          achieved_at: string | null
          category: string
          crow_feather_id: string | null
          id: string
          record_value: number
          session_duration_minutes: number
          time_bracket: string
          user_id: string | null
          username: string
        }
        Insert: {
          achieved_at?: string | null
          category: string
          crow_feather_id?: string | null
          id?: string
          record_value: number
          session_duration_minutes: number
          time_bracket: string
          user_id?: string | null
          username: string
        }
        Update: {
          achieved_at?: string | null
          category?: string
          crow_feather_id?: string | null
          id?: string
          record_value?: number
          session_duration_minutes?: number
          time_bracket?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghost_leaderboard_crow_feather_id_fkey"
            columns: ["crow_feather_id"]
            isOneToOne: false
            referencedRelation: "crow_feathers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_medallion_awards: {
        Row: {
          earned_at: string | null
          ghost_id: string
          medallion_id: string
          user_id: string | null
        }
        Insert: {
          earned_at?: string | null
          ghost_id: string
          medallion_id: string
          user_id?: string | null
        }
        Update: {
          earned_at?: string | null
          ghost_id?: string
          medallion_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghost_medallion_awards_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_medallion_awards_medallion_id_fkey"
            columns: ["medallion_id"]
            isOneToOne: false
            referencedRelation: "shadow_medallions"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_mode_sessions: {
        Row: {
          beacon_runs_created: number | null
          beacon_runs_played: number | null
          beacons_dropped: number | null
          crow_feathers_earned: number | null
          duration_minutes: number | null
          ended_at: string | null
          equipment_brought: Json | null
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          beacon_runs_created?: number | null
          beacon_runs_played?: number | null
          beacons_dropped?: number | null
          crow_feathers_earned?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          equipment_brought?: Json | null
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          beacon_runs_created?: number | null
          beacon_runs_played?: number | null
          beacons_dropped?: number | null
          crow_feathers_earned?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          equipment_brought?: Json | null
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ghost_pouch: {
        Row: {
          amount: number | null
          badge_name: string | null
          card_id: string | null
          claimed: boolean | null
          claimed_at: string | null
          claimed_by_user: string | null
          created_at: string | null
          ghost_id: string
          id: string
          reward_type: string
          source: string
          source_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          badge_name?: string | null
          card_id?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by_user?: string | null
          created_at?: string | null
          ghost_id: string
          id?: string
          reward_type: string
          source: string
          source_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          badge_name?: string | null
          card_id?: string | null
          claimed?: boolean | null
          claimed_at?: string | null
          claimed_by_user?: string | null
          created_at?: string | null
          ghost_id?: string
          id?: string
          reward_type?: string
          source?: string
          source_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghost_pouch_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "deck_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ghost_pouch_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ghost_profiles: {
        Row: {
          aptitude_radar: Json | null
          converted_at: string | null
          converted_to_user_id: string | null
          created_at: string | null
          detected_interests: string[] | null
          detected_skills: string[] | null
          documents_read: number | null
          draft_pool_email: string | null
          draft_pool_opted_in: boolean | null
          draft_pool_opted_in_at: string | null
          fingerprint_hash: string
          ghost_alias: string
          golden_keys_found: number | null
          id: string
          language_set_by_door: string | null
          pages_visited: number | null
          preferred_language: string | null
          total_session_time_minutes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aptitude_radar?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          detected_interests?: string[] | null
          detected_skills?: string[] | null
          documents_read?: number | null
          draft_pool_email?: string | null
          draft_pool_opted_in?: boolean | null
          draft_pool_opted_in_at?: string | null
          fingerprint_hash: string
          ghost_alias: string
          golden_keys_found?: number | null
          id?: string
          language_set_by_door?: string | null
          pages_visited?: number | null
          preferred_language?: string | null
          total_session_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aptitude_radar?: Json | null
          converted_at?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          detected_interests?: string[] | null
          detected_skills?: string[] | null
          documents_read?: number | null
          draft_pool_email?: string | null
          draft_pool_opted_in?: boolean | null
          draft_pool_opted_in_at?: string | null
          fingerprint_hash?: string
          ghost_alias?: string
          golden_keys_found?: number | null
          id?: string
          language_set_by_door?: string | null
          pages_visited?: number | null
          preferred_language?: string | null
          total_session_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ghost_sessions: {
        Row: {
          ended_at: string | null
          expires_at: string
          free_cue_card_id: string | null
          free_cue_card_selected_at: string | null
          id: string
          is_paused: boolean | null
          loot: Json
          paused_at: string | null
          saved_at: string | null
          saved_loot: Json | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          expires_at: string
          free_cue_card_id?: string | null
          free_cue_card_selected_at?: string | null
          id?: string
          is_paused?: boolean | null
          loot?: Json
          paused_at?: string | null
          saved_at?: string | null
          saved_loot?: Json | null
          started_at?: string
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          expires_at?: string
          free_cue_card_id?: string | null
          free_cue_card_selected_at?: string | null
          id?: string
          is_paused?: boolean | null
          loot?: Json
          paused_at?: string | null
          saved_at?: string | null
          saved_loot?: Json | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ghost_share_tracking: {
        Row: {
          click_count: number | null
          conversion_count: number | null
          converted_at: string | null
          converted_user_id: string | null
          created_at: string | null
          email: string
          first_share_at: string | null
          id: string
          ip_hash: string | null
          last_share_at: string | null
          pending_credits: number | null
          pending_marks: number | null
          share_count: number | null
          share_type: string | null
          status: string | null
          template_id: string | null
          tracking_token: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          click_count?: number | null
          conversion_count?: number | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string | null
          email: string
          first_share_at?: string | null
          id?: string
          ip_hash?: string | null
          last_share_at?: string | null
          pending_credits?: number | null
          pending_marks?: number | null
          share_count?: number | null
          share_type?: string | null
          status?: string | null
          template_id?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          click_count?: number | null
          conversion_count?: number | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string | null
          email?: string
          first_share_at?: string | null
          id?: string
          ip_hash?: string | null
          last_share_at?: string | null
          pending_credits?: number | null
          pending_marks?: number | null
          share_count?: number | null
          share_type?: string | null
          status?: string | null
          template_id?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghost_share_tracking_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_claim_history: {
        Row: {
          action: string
          action_at: string | null
          id: string
          item_id: string
          member_id: string
        }
        Insert: {
          action: string
          action_at?: string | null
          id?: string
          item_id: string
          member_id: string
        }
        Update: {
          action?: string
          action_at?: string | null
          id?: string
          item_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_claim_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_claim_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_family"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_claim_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_owner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_claim_history_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_list_access: {
        Row: {
          can_claim: boolean | null
          can_view: boolean | null
          granted_at: string | null
          granted_by: string | null
          id: string
          list_id: string
          member_id: string
        }
        Insert: {
          can_claim?: boolean | null
          can_view?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          list_id: string
          member_id: string
        }
        Update: {
          can_claim?: boolean | null
          can_view?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          list_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_list_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_access_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "family_gift_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_access_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_list_items: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          list_id: string
          name: string
          notes: string | null
          notion_block_id: string | null
          price_currency: string | null
          price_estimate: number | null
          priority: number | null
          purchased: boolean | null
          purchased_at: string | null
          purchased_by: string | null
          quantity_claimed: number | null
          quantity_wanted: number | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          list_id: string
          name: string
          notes?: string | null
          notion_block_id?: string | null
          price_currency?: string | null
          price_estimate?: number | null
          priority?: number | null
          purchased?: boolean | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity_claimed?: number | null
          quantity_wanted?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          list_id?: string
          name?: string
          notes?: string | null
          notion_block_id?: string | null
          price_currency?: string | null
          price_estimate?: number | null
          priority?: number | null
          purchased?: boolean | null
          purchased_at?: string | null
          purchased_by?: string | null
          quantity_claimed?: number | null
          quantity_wanted?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_list_items_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "family_gift_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_requests: {
        Row: {
          child_age: number | null
          child_first_name: string
          child_interests: string | null
          created_at: string | null
          current_amount: number | null
          delivered_at: string | null
          delivered_by: string | null
          delivery_address: Json | null
          funded_at: string | null
          funding_progress: number | null
          gift_budget_tier: string | null
          gift_category: string | null
          gift_source: string | null
          gift_wish: string
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          parent_email: string
          parent_name: string
          parent_phone: string | null
          product_image_url: string | null
          product_url: string | null
          purchase_amount: number | null
          purchase_receipt_url: string | null
          purchased_at: string | null
          purchased_by: string | null
          shipped_at: string | null
          sponsored_by: string | null
          status: string | null
          target_amount: number | null
          thank_you_message: string | null
          thank_you_photo_url: string | null
          thank_you_received: boolean | null
          thank_you_video_url: string | null
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          votes_needed: number | null
          votes_received: number | null
        }
        Insert: {
          child_age?: number | null
          child_first_name: string
          child_interests?: string | null
          created_at?: string | null
          current_amount?: number | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_address?: Json | null
          funded_at?: string | null
          funding_progress?: number | null
          gift_budget_tier?: string | null
          gift_category?: string | null
          gift_source?: string | null
          gift_wish: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          parent_email: string
          parent_name: string
          parent_phone?: string | null
          product_image_url?: string | null
          product_url?: string | null
          purchase_amount?: number | null
          purchase_receipt_url?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          shipped_at?: string | null
          sponsored_by?: string | null
          status?: string | null
          target_amount?: number | null
          thank_you_message?: string | null
          thank_you_photo_url?: string | null
          thank_you_received?: boolean | null
          thank_you_video_url?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          votes_needed?: number | null
          votes_received?: number | null
        }
        Update: {
          child_age?: number | null
          child_first_name?: string
          child_interests?: string | null
          created_at?: string | null
          current_amount?: number | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivery_address?: Json | null
          funded_at?: string | null
          funding_progress?: number | null
          gift_budget_tier?: string | null
          gift_category?: string | null
          gift_source?: string | null
          gift_wish?: string
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          parent_email?: string
          parent_name?: string
          parent_phone?: string | null
          product_image_url?: string | null
          product_url?: string | null
          purchase_amount?: number | null
          purchase_receipt_url?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          shipped_at?: string | null
          sponsored_by?: string | null
          status?: string | null
          target_amount?: number | null
          thank_you_message?: string | null
          thank_you_photo_url?: string | null
          thank_you_received?: boolean | null
          thank_you_video_url?: string | null
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          votes_needed?: number | null
          votes_received?: number | null
        }
        Relationships: []
      }
      gift_shopping_aggregations: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          discount_tier: number | null
          family_id: string | null
          gift_item_id: string | null
          id: string
          min_participants: number | null
          product_name: string
          product_price: number | null
          product_url: string | null
          quantity_needed: number | null
          shopping_date: string
          shopping_time: string | null
          status: string | null
          updated_at: string | null
          window_closes_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          discount_tier?: number | null
          family_id?: string | null
          gift_item_id?: string | null
          id?: string
          min_participants?: number | null
          product_name: string
          product_price?: number | null
          product_url?: string | null
          quantity_needed?: number | null
          shopping_date: string
          shopping_time?: string | null
          status?: string | null
          updated_at?: string | null
          window_closes_at: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          discount_tier?: number | null
          family_id?: string | null
          gift_item_id?: string | null
          id?: string
          min_participants?: number | null
          product_name?: string
          product_price?: number | null
          product_url?: string | null
          quantity_needed?: number | null
          shopping_date?: string
          shopping_time?: string | null
          status?: string | null
          updated_at?: string | null
          window_closes_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_shopping_aggregations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_aggregations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_aggregations_gift_item_id_fkey"
            columns: ["gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_aggregations_gift_item_id_fkey"
            columns: ["gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_family"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_aggregations_gift_item_id_fkey"
            columns: ["gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_owner"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_shopping_participants: {
        Row: {
          aggregation_id: string
          family_member_id: string
          for_gift_item_id: string | null
          id: string
          joined_at: string | null
          notes: string | null
          quantity: number | null
        }
        Insert: {
          aggregation_id: string
          family_member_id: string
          for_gift_item_id?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          quantity?: number | null
        }
        Update: {
          aggregation_id?: string
          family_member_id?: string
          for_gift_item_id?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_shopping_participants_aggregation_id_fkey"
            columns: ["aggregation_id"]
            isOneToOne: false
            referencedRelation: "gift_shopping_aggregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_participants_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_participants_for_gift_item_id_fkey"
            columns: ["for_gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_participants_for_gift_item_id_fkey"
            columns: ["for_gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_family"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_shopping_participants_for_gift_item_id_fkey"
            columns: ["for_gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_list_items_for_owner"
            referencedColumns: ["id"]
          },
        ]
      }
      gleaning_pool: {
        Row: {
          corner_percentage: number | null
          created_at: string
          gleaners_count: number | null
          gleaners_graduated: number | null
          id: string
          period_end: string
          period_start: string
          pool_available: number | null
          pool_distributed: number | null
          pool_earned_back: number | null
          pool_unused_returned: number | null
          total_platform_value: number | null
          user_id: string | null
        }
        Insert: {
          corner_percentage?: number | null
          created_at?: string
          gleaners_count?: number | null
          gleaners_graduated?: number | null
          id?: string
          period_end: string
          period_start: string
          pool_available?: number | null
          pool_distributed?: number | null
          pool_earned_back?: number | null
          pool_unused_returned?: number | null
          total_platform_value?: number | null
          user_id?: string | null
        }
        Update: {
          corner_percentage?: number | null
          created_at?: string
          gleaners_count?: number | null
          gleaners_graduated?: number | null
          id?: string
          period_end?: string
          period_start?: string
          pool_available?: number | null
          pool_distributed?: number | null
          pool_earned_back?: number | null
          pool_unused_returned?: number | null
          total_platform_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      global_unlock_pools: {
        Row: {
          campaign_description: string | null
          campaign_name: string | null
          clicks_needed: number | null
          contributors: string[] | null
          created_at: string | null
          cue_card_template_id: string | null
          deck_card_id: string | null
          ends_at: string | null
          id: string
          is_unlocked: boolean | null
          lock_bottom: boolean | null
          lock_left: boolean | null
          lock_right: boolean | null
          lock_top: boolean | null
          starts_at: string | null
          total_clicks: number | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_description?: string | null
          campaign_name?: string | null
          clicks_needed?: number | null
          contributors?: string[] | null
          created_at?: string | null
          cue_card_template_id?: string | null
          deck_card_id?: string | null
          ends_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          lock_bottom?: boolean | null
          lock_left?: boolean | null
          lock_right?: boolean | null
          lock_top?: boolean | null
          starts_at?: string | null
          total_clicks?: number | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_description?: string | null
          campaign_name?: string | null
          clicks_needed?: number | null
          contributors?: string[] | null
          created_at?: string | null
          cue_card_template_id?: string | null
          deck_card_id?: string | null
          ends_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          lock_bottom?: boolean | null
          lock_left?: boolean | null
          lock_right?: boolean | null
          lock_top?: boolean | null
          starts_at?: string | null
          total_clicks?: number | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      glowing_key_stamps: {
        Row: {
          credits_awarded: number
          glow_level_at_stamp: number | null
          id: string
          key_id: string
          marks_awarded: number
          stamp_id: string | null
          stamped_at: string | null
          user_id: string
        }
        Insert: {
          credits_awarded?: number
          glow_level_at_stamp?: number | null
          id?: string
          key_id: string
          marks_awarded?: number
          stamp_id?: string | null
          stamped_at?: string | null
          user_id: string
        }
        Update: {
          credits_awarded?: number
          glow_level_at_stamp?: number | null
          id?: string
          key_id?: string
          marks_awarded?: number
          stamp_id?: string | null
          stamped_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glowing_key_stamps_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "glowing_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glowing_key_stamps_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "acknowledgment_stamps"
            referencedColumns: ["id"]
          },
        ]
      }
      glowing_keys: {
        Row: {
          created_at: string | null
          current_stamps: number | null
          description: string | null
          expires_at: string | null
          glow_level: number
          id: string
          is_active: boolean | null
          is_wandering: boolean | null
          key_code: string
          location_hint: string | null
          location_route: string
          max_stamps: number | null
          next_location_route: string | null
          purpose: string | null
          reward_credits: number
          reward_marks: number
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_stamps?: number | null
          description?: string | null
          expires_at?: string | null
          glow_level?: number
          id?: string
          is_active?: boolean | null
          is_wandering?: boolean | null
          key_code: string
          location_hint?: string | null
          location_route: string
          max_stamps?: number | null
          next_location_route?: string | null
          purpose?: string | null
          reward_credits?: number
          reward_marks?: number
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_stamps?: number | null
          description?: string | null
          expires_at?: string | null
          glow_level?: number
          id?: string
          is_active?: boolean | null
          is_wandering?: boolean | null
          key_code?: string
          location_hint?: string | null
          location_route?: string
          max_stamps?: number | null
          next_location_route?: string | null
          purpose?: string | null
          reward_credits?: number
          reward_marks?: number
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      golden_key_multipliers: {
        Row: {
          bright_keys: number | null
          created_at: string | null
          current_multiplier: number | null
          first_key_milestone: boolean | null
          full_circle_milestone: boolean | null
          glowing_keys: number | null
          id: string
          last_restamp_30d: string | null
          last_restamp_7d: string | null
          last_restamp_90d: string | null
          legendary_keys: number | null
          midas_tokens: number | null
          midas_tokens_used: number | null
          radiant_keys: number | null
          ten_keys_milestone: boolean | null
          total_keys_found: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bright_keys?: number | null
          created_at?: string | null
          current_multiplier?: number | null
          first_key_milestone?: boolean | null
          full_circle_milestone?: boolean | null
          glowing_keys?: number | null
          id?: string
          last_restamp_30d?: string | null
          last_restamp_7d?: string | null
          last_restamp_90d?: string | null
          legendary_keys?: number | null
          midas_tokens?: number | null
          midas_tokens_used?: number | null
          radiant_keys?: number | null
          ten_keys_milestone?: boolean | null
          total_keys_found?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bright_keys?: number | null
          created_at?: string | null
          current_multiplier?: number | null
          first_key_milestone?: boolean | null
          full_circle_milestone?: boolean | null
          glowing_keys?: number | null
          id?: string
          last_restamp_30d?: string | null
          last_restamp_7d?: string | null
          last_restamp_90d?: string | null
          legendary_keys?: number | null
          midas_tokens?: number | null
          midas_tokens_used?: number | null
          radiant_keys?: number | null
          ten_keys_milestone?: boolean | null
          total_keys_found?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      golden_ticket_attempts: {
        Row: {
          attempt_answer: string
          attempted_at: string | null
          id: string
          is_correct: boolean | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          attempt_answer: string
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_answer?: string
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "golden_ticket_attempts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "golden_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      golden_tickets: {
        Row: {
          answer: string
          created_at: string | null
          expires_at: string | null
          found_at: string | null
          found_by: string | null
          hint: string | null
          id: string
          is_active: boolean | null
          location: string
          prize_description: string | null
          prize_type: string
          prize_value: string
          puzzle: string
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          expires_at?: string | null
          found_at?: string | null
          found_by?: string | null
          hint?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          prize_description?: string | null
          prize_type: string
          prize_value: string
          puzzle: string
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          expires_at?: string | null
          found_at?: string | null
          found_by?: string | null
          hint?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          prize_description?: string | null
          prize_type?: string
          prize_value?: string
          puzzle?: string
          user_id?: string | null
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          family_id: string
          google_email: string
          id: string
          refresh_token: string
          scopes: string[] | null
          token_expiry: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          family_id: string
          google_email: string
          id?: string
          refresh_token: string
          scopes?: string[] | null
          token_expiry: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          family_id?: string
          google_email?: string
          id?: string
          refresh_token?: string
          scopes?: string[] | null
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_events: {
        Row: {
          action: string
          actor_member_id: string
          created_at: string
          details: string
          entity_id: string
          entity_type: string
          id: string
          ledger_entry_id: string
          target_member_id: string | null
        }
        Insert: {
          action: string
          actor_member_id: string
          created_at?: string
          details?: string
          entity_id: string
          entity_type: string
          id?: string
          ledger_entry_id: string
          target_member_id?: string | null
        }
        Update: {
          action?: string
          actor_member_id?: string
          created_at?: string
          details?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ledger_entry_id?: string
          target_member_id?: string | null
        }
        Relationships: []
      }
      grocery_delivery_jobs: {
        Row: {
          aggregated_order_id: string | null
          completed_at: string | null
          created_at: string | null
          delivery_count: number | null
          delivery_fee: number
          first_delivery_at: string | null
          id: string
          micro_local_area: string
          notes: string | null
          pickup_address: string | null
          pickup_completed_at: string | null
          pickup_coordinates: unknown
          pickup_location: string
          pickup_started_at: string | null
          posted_at: string | null
          shopping_list_ids: string[] | null
          status: string | null
          tip_amount: number | null
          total_items: number | null
          total_order_value: number
          total_reimbursement: number | null
          total_weight_lbs: number | null
          updated_at: string | null
          user_id: string | null
          worker_accepted_at: string | null
          worker_id: string | null
        }
        Insert: {
          aggregated_order_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivery_count?: number | null
          delivery_fee?: number
          first_delivery_at?: string | null
          id?: string
          micro_local_area: string
          notes?: string | null
          pickup_address?: string | null
          pickup_completed_at?: string | null
          pickup_coordinates?: unknown
          pickup_location: string
          pickup_started_at?: string | null
          posted_at?: string | null
          shopping_list_ids?: string[] | null
          status?: string | null
          tip_amount?: number | null
          total_items?: number | null
          total_order_value?: number
          total_reimbursement?: number | null
          total_weight_lbs?: number | null
          updated_at?: string | null
          user_id?: string | null
          worker_accepted_at?: string | null
          worker_id?: string | null
        }
        Update: {
          aggregated_order_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivery_count?: number | null
          delivery_fee?: number
          first_delivery_at?: string | null
          id?: string
          micro_local_area?: string
          notes?: string | null
          pickup_address?: string | null
          pickup_completed_at?: string | null
          pickup_coordinates?: unknown
          pickup_location?: string
          pickup_started_at?: string | null
          posted_at?: string | null
          shopping_list_ids?: string[] | null
          status?: string | null
          tip_amount?: number | null
          total_items?: number | null
          total_order_value?: number
          total_reimbursement?: number | null
          total_weight_lbs?: number | null
          updated_at?: string | null
          user_id?: string | null
          worker_accepted_at?: string | null
          worker_id?: string | null
        }
        Relationships: []
      }
      grocery_delivery_recipients: {
        Row: {
          amount_charged: number | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_coordinates: unknown
          delivery_instructions: string | null
          delivery_order: number | null
          delivery_photo_url: string | null
          feedback: string | null
          id: string
          item_count: number | null
          job_id: string
          order_amount: number
          payment_authorized: boolean | null
          payment_authorized_at: string | null
          payment_captured: boolean | null
          payment_captured_at: string | null
          rating: number | null
          recipient_confirmed: boolean | null
          recipient_confirmed_at: string | null
          shopping_list_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_method_id: string | null
          user_id: string
        }
        Insert: {
          amount_charged?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_coordinates?: unknown
          delivery_instructions?: string | null
          delivery_order?: number | null
          delivery_photo_url?: string | null
          feedback?: string | null
          id?: string
          item_count?: number | null
          job_id: string
          order_amount?: number
          payment_authorized?: boolean | null
          payment_authorized_at?: string | null
          payment_captured?: boolean | null
          payment_captured_at?: string | null
          rating?: number | null
          recipient_confirmed?: boolean | null
          recipient_confirmed_at?: string | null
          shopping_list_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          user_id: string
        }
        Update: {
          amount_charged?: number | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_coordinates?: unknown
          delivery_instructions?: string | null
          delivery_order?: number | null
          delivery_photo_url?: string | null
          feedback?: string | null
          id?: string
          item_count?: number | null
          job_id?: string
          order_amount?: number
          payment_authorized?: boolean | null
          payment_authorized_at?: string | null
          payment_captured?: boolean | null
          payment_captured_at?: string | null
          rating?: number | null
          recipient_confirmed?: boolean | null
          recipient_confirmed_at?: string | null
          shopping_list_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_delivery_recipients_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "grocery_delivery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_delivery_recipients_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "family_shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          created_at: string | null
          experience_points: number | null
          guild_id: string
          id: string
          joined_at: string | null
          mentees_count: number | null
          projects_completed: number | null
          rank: number | null
          rank_achieved_at: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_points?: number | null
          guild_id: string
          id?: string
          joined_at?: string | null
          mentees_count?: number | null
          projects_completed?: number | null
          rank?: number | null
          rank_achieved_at?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_points?: number | null
          guild_id?: string
          id?: string
          joined_at?: string | null
          mentees_count?: number | null
          projects_completed?: number | null
          rank?: number | null
          rank_achieved_at?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_memberships: {
        Row: {
          guild_id: string
          id: string
          is_active: boolean
          joined_at: string
          member_id: string
          promoted_at: string | null
          role: string
          tribe_id: string | null
        }
        Insert: {
          guild_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          member_id: string
          promoted_at?: string | null
          role?: string
          tribe_id?: string | null
        }
        Update: {
          guild_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          member_id?: string
          promoted_at?: string | null
          role?: string
          tribe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_memberships_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_stakes: {
        Row: {
          contributions_total: number | null
          created_at: string | null
          guild_id: string
          id: string
          milestone_end: string | null
          milestone_start: string | null
          stake_amount: number
          stake_percentage: number | null
          updated_at: string | null
          user_id: string
          vested_amount: number | null
          withdrawals_total: number | null
        }
        Insert: {
          contributions_total?: number | null
          created_at?: string | null
          guild_id: string
          id?: string
          milestone_end?: string | null
          milestone_start?: string | null
          stake_amount?: number
          stake_percentage?: number | null
          updated_at?: string | null
          user_id: string
          vested_amount?: number | null
          withdrawals_total?: number | null
        }
        Update: {
          contributions_total?: number | null
          created_at?: string | null
          guild_id?: string
          id?: string
          milestone_end?: string | null
          milestone_start?: string | null
          stake_amount?: number
          stake_percentage?: number | null
          updated_at?: string | null
          user_id?: string
          vested_amount?: number | null
          withdrawals_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_stakes_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          banner_image_url: string | null
          code_of_conduct: string | null
          council_size: number | null
          created_at: string | null
          description: string | null
          dues_amount: number | null
          dues_frequency: string | null
          founded_at: string | null
          guild_master_id: string | null
          guild_type: string
          id: string
          keep_ids: string[]
          leader_id: string | null
          ledger_section_id: string
          max_members: number | null
          member_count: number | null
          member_ids: string[]
          membership_type: string | null
          monthly_phase_fee: number
          motto: string | null
          name: string
          officer_ids: string[]
          phase_mimictrunk_id: string | null
          quality_standards: string | null
          rules_document: string | null
          slug: string
          specialty: string | null
          status: string | null
          tagline: string | null
          treasury_balance: number | null
          tribe_ids: string[]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          banner_image_url?: string | null
          code_of_conduct?: string | null
          council_size?: number | null
          created_at?: string | null
          description?: string | null
          dues_amount?: number | null
          dues_frequency?: string | null
          founded_at?: string | null
          guild_master_id?: string | null
          guild_type: string
          id?: string
          keep_ids?: string[]
          leader_id?: string | null
          ledger_section_id?: string
          max_members?: number | null
          member_count?: number | null
          member_ids?: string[]
          membership_type?: string | null
          monthly_phase_fee?: number
          motto?: string | null
          name: string
          officer_ids?: string[]
          phase_mimictrunk_id?: string | null
          quality_standards?: string | null
          rules_document?: string | null
          slug: string
          specialty?: string | null
          status?: string | null
          tagline?: string | null
          treasury_balance?: number | null
          tribe_ids?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          banner_image_url?: string | null
          code_of_conduct?: string | null
          council_size?: number | null
          created_at?: string | null
          description?: string | null
          dues_amount?: number | null
          dues_frequency?: string | null
          founded_at?: string | null
          guild_master_id?: string | null
          guild_type?: string
          id?: string
          keep_ids?: string[]
          leader_id?: string | null
          ledger_section_id?: string
          max_members?: number | null
          member_count?: number | null
          member_ids?: string[]
          membership_type?: string | null
          monthly_phase_fee?: number
          motto?: string | null
          name?: string
          officer_ids?: string[]
          phase_mimictrunk_id?: string | null
          quality_standards?: string | null
          rules_document?: string | null
          slug?: string
          specialty?: string | null
          status?: string | null
          tagline?: string | null
          treasury_balance?: number | null
          tribe_ids?: string[]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      harper_audit_schedules: {
        Row: {
          audit_frequency_days: number
          complaint_count: number | null
          complaint_threshold: number | null
          created_at: string | null
          current_volume: number | null
          id: string
          last_audit_id: string | null
          next_scheduled_audit: string | null
          node_id: string
          node_rating: string
          quality_drop_threshold: number | null
          quality_score: number | null
          updated_at: string | null
          user_id: string | null
          volume_baseline: number | null
          volume_spike_percent: number | null
        }
        Insert: {
          audit_frequency_days?: number
          complaint_count?: number | null
          complaint_threshold?: number | null
          created_at?: string | null
          current_volume?: number | null
          id?: string
          last_audit_id?: string | null
          next_scheduled_audit?: string | null
          node_id: string
          node_rating?: string
          quality_drop_threshold?: number | null
          quality_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          volume_baseline?: number | null
          volume_spike_percent?: number | null
        }
        Update: {
          audit_frequency_days?: number
          complaint_count?: number | null
          complaint_threshold?: number | null
          created_at?: string | null
          current_volume?: number | null
          id?: string
          last_audit_id?: string | null
          next_scheduled_audit?: string | null
          node_id?: string
          node_rating?: string
          quality_drop_threshold?: number | null
          quality_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          volume_baseline?: number | null
          volume_spike_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "harper_audit_schedules_last_audit_id_fkey"
            columns: ["last_audit_id"]
            isOneToOne: false
            referencedRelation: "harper_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      harper_auditors: {
        Row: {
          audits_failed: number | null
          audits_passed: number | null
          average_audit_score: number | null
          created_at: string | null
          credential_status: string
          credentialed_at: string | null
          expertise_domains: string[] | null
          harper_medallion_id: string | null
          has_builder_status: boolean | null
          id: string
          last_audit_date: string | null
          last_audit_node_id: string | null
          node_leader_confirmed: boolean | null
          peer_votes_received: number | null
          peer_votes_required: number | null
          reputation_score: number | null
          tenure_months: number | null
          total_audits_completed: number | null
          updated_at: string | null
          user_id: string
          violation_count: number | null
        }
        Insert: {
          audits_failed?: number | null
          audits_passed?: number | null
          average_audit_score?: number | null
          created_at?: string | null
          credential_status?: string
          credentialed_at?: string | null
          expertise_domains?: string[] | null
          harper_medallion_id?: string | null
          has_builder_status?: boolean | null
          id?: string
          last_audit_date?: string | null
          last_audit_node_id?: string | null
          node_leader_confirmed?: boolean | null
          peer_votes_received?: number | null
          peer_votes_required?: number | null
          reputation_score?: number | null
          tenure_months?: number | null
          total_audits_completed?: number | null
          updated_at?: string | null
          user_id: string
          violation_count?: number | null
        }
        Update: {
          audits_failed?: number | null
          audits_passed?: number | null
          average_audit_score?: number | null
          created_at?: string | null
          credential_status?: string
          credentialed_at?: string | null
          expertise_domains?: string[] | null
          harper_medallion_id?: string | null
          has_builder_status?: boolean | null
          id?: string
          last_audit_date?: string | null
          last_audit_node_id?: string | null
          node_leader_confirmed?: boolean | null
          peer_votes_received?: number | null
          peer_votes_required?: number | null
          reputation_score?: number | null
          tenure_months?: number | null
          total_audits_completed?: number | null
          updated_at?: string | null
          user_id?: string
          violation_count?: number | null
        }
        Relationships: []
      }
      harper_audits: {
        Row: {
          audit_hash: string | null
          audit_type: string
          auditor_id: string
          auditor_signature: string | null
          completed_at: string | null
          created_at: string | null
          excellence_grade: number | null
          findings_summary: string | null
          id: string
          improvement_areas: string[] | null
          ip_ledger_entry_id: string | null
          node_id: string
          result: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audit_hash?: string | null
          audit_type?: string
          auditor_id: string
          auditor_signature?: string | null
          completed_at?: string | null
          created_at?: string | null
          excellence_grade?: number | null
          findings_summary?: string | null
          id?: string
          improvement_areas?: string[] | null
          ip_ledger_entry_id?: string | null
          node_id: string
          result?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audit_hash?: string | null
          audit_type?: string
          auditor_id?: string
          auditor_signature?: string | null
          completed_at?: string | null
          created_at?: string | null
          excellence_grade?: number | null
          findings_summary?: string | null
          id?: string
          improvement_areas?: string[] | null
          ip_ledger_entry_id?: string | null
          node_id?: string
          result?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harper_audits_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "harper_auditors"
            referencedColumns: ["id"]
          },
        ]
      }
      harper_peer_votes: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          user_id: string | null
          vote: string
          vote_reason: string | null
          voter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          vote: string
          vote_reason?: string | null
          voter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          vote?: string
          vote_reason?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harper_peer_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "harper_auditors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harper_peer_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "harper_auditors"
            referencedColumns: ["id"]
          },
        ]
      }
      harper_sop_reviews: {
        Row: {
          harper_id: string
          id: string
          issues_found: string[] | null
          node_id: string
          review_passed: boolean
          review_type: string
          reviewed_at: string | null
          user_id: string | null
        }
        Insert: {
          harper_id: string
          id?: string
          issues_found?: string[] | null
          node_id: string
          review_passed: boolean
          review_type: string
          reviewed_at?: string | null
          user_id?: string | null
        }
        Update: {
          harper_id?: string
          id?: string
          issues_found?: string[] | null
          node_id?: string
          review_passed?: boolean
          review_type?: string
          reviewed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      helm_card_slots: {
        Row: {
          created_at: string | null
          deck_card_id: string | null
          destination_type: string
          destination_url: string | null
          id: string
          is_locked: boolean | null
          lock_type: string | null
          required_beacon_color: string | null
          slot_icon: string
          slot_name: string
          slot_position: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deck_card_id?: string | null
          destination_type?: string
          destination_url?: string | null
          id?: string
          is_locked?: boolean | null
          lock_type?: string | null
          required_beacon_color?: string | null
          slot_icon?: string
          slot_name?: string
          slot_position: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deck_card_id?: string | null
          destination_type?: string
          destination_url?: string | null
          id?: string
          is_locked?: boolean | null
          lock_type?: string | null
          required_beacon_color?: string | null
          slot_icon?: string
          slot_name?: string
          slot_position?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      helm_input_preferences: {
        Row: {
          created_at: string | null
          custom_order: Json | null
          id: string
          input_mode: string
          last_accessed_at: string | null
          sub_channel: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_order?: Json | null
          id?: string
          input_mode: string
          last_accessed_at?: string | null
          sub_channel?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_order?: Json | null
          id?: string
          input_mode?: string
          last_accessed_at?: string | null
          sub_channel?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      help_wanted_listings: {
        Row: {
          assigned_at: string | null
          assigned_provider_id: string | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string
          created_at: string | null
          deadline: string | null
          description: string
          estimated_duration: string | null
          id: string
          location_type: string | null
          preferred_experience: number | null
          proposal_count: number | null
          requester_id: string
          required_skills: string[] | null
          service_locale: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgency: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_provider_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category: string
          created_at?: string | null
          deadline?: string | null
          description: string
          estimated_duration?: string | null
          id?: string
          location_type?: string | null
          preferred_experience?: number | null
          proposal_count?: number | null
          requester_id: string
          required_skills?: string[] | null
          service_locale?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_provider_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          estimated_duration?: string | null
          id?: string
          location_type?: string | null
          preferred_experience?: number | null
          proposal_count?: number | null
          requester_id?: string
          required_skills?: string[] | null
          service_locale?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_wanted_listings_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      herald_posts: {
        Row: {
          click_count: number | null
          counts_for_month: string | null
          created_at: string | null
          cue_card_id: string | null
          id: string
          platform: string
          platform_post_id: string | null
          post_text: string
          post_url: string | null
          posted_at: string | null
          scheduled_for: string | null
          signup_count: number | null
          status: string | null
          subscription_id: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          click_count?: number | null
          counts_for_month?: string | null
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          platform: string
          platform_post_id?: string | null
          post_text: string
          post_url?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          signup_count?: number | null
          status?: string | null
          subscription_id?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          click_count?: number | null
          counts_for_month?: string | null
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          platform?: string
          platform_post_id?: string | null
          post_text?: string
          post_url?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          signup_count?: number | null
          status?: string | null
          subscription_id?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "herald_posts_cue_card_id_fkey"
            columns: ["cue_card_id"]
            isOneToOne: false
            referencedRelation: "stamped_cue_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "herald_posts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "herald_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "herald_posts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      herald_subscriptions: {
        Row: {
          base_multiplier: number
          cancelled_at: string | null
          chain_bonus: number
          chain_freeze_month: string | null
          chain_frozen: boolean | null
          chain_length: number
          chain_started_at: string | null
          created_at: string | null
          current_month: string | null
          current_multiplier: number | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          max_multiplier: number
          monthly_price: number
          posts_this_month: number
          required_posts_per_month: number
          status: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_multiplier?: number
          cancelled_at?: string | null
          chain_bonus?: number
          chain_freeze_month?: string | null
          chain_frozen?: boolean | null
          chain_length?: number
          chain_started_at?: string | null
          created_at?: string | null
          current_month?: string | null
          current_multiplier?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_multiplier?: number
          monthly_price: number
          posts_this_month?: number
          required_posts_per_month?: number
          status?: string
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_multiplier?: number
          cancelled_at?: string | null
          chain_bonus?: number
          chain_freeze_month?: string | null
          chain_frozen?: boolean | null
          chain_length?: number
          chain_started_at?: string | null
          created_at?: string | null
          current_month?: string | null
          current_multiplier?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_multiplier?: number
          monthly_price?: number
          posts_this_month?: number
          required_posts_per_month?: number
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hex_island_portals: {
        Row: {
          created_at: string | null
          id: string
          source_island_id: string | null
          target_island_id: string | null
          toll_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_island_id?: string | null
          target_island_id?: string | null
          toll_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_island_id?: string | null
          target_island_id?: string | null
          toll_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hex_island_portals_source_island_id_fkey"
            columns: ["source_island_id"]
            isOneToOne: false
            referencedRelation: "hex_islands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hex_island_portals_target_island_id_fkey"
            columns: ["target_island_id"]
            isOneToOne: false
            referencedRelation: "hex_islands"
            referencedColumns: ["id"]
          },
        ]
      }
      hex_islands: {
        Row: {
          created_at: string | null
          governance_model: string | null
          id: string
          island_type: string
          name: string
          owner_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          governance_model?: string | null
          id?: string
          island_type: string
          name: string
          owner_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          governance_model?: string | null
          id?: string
          island_type?: string
          name?: string
          owner_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hex_islands_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hex_islands_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hexisle_buildings: {
        Row: {
          building_type: string
          construction_complete: string | null
          construction_started: string | null
          created_at: string | null
          hex_x: number
          hex_y: number
          id: string
          is_complete: boolean | null
          last_collection: string | null
          user_id: string | null
        }
        Insert: {
          building_type: string
          construction_complete?: string | null
          construction_started?: string | null
          created_at?: string | null
          hex_x: number
          hex_y: number
          id?: string
          is_complete?: boolean | null
          last_collection?: string | null
          user_id?: string | null
        }
        Update: {
          building_type?: string
          construction_complete?: string | null
          construction_started?: string | null
          created_at?: string | null
          hex_x?: number
          hex_y?: number
          id?: string
          is_complete?: boolean | null
          last_collection?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hexisle_cities: {
        Row: {
          created_at: string | null
          description: string | null
          features: string[] | null
          guild_hall: string | null
          hex_x: number
          hex_y: number
          id: string
          name: string
          population: number | null
          subtitle: string | null
          unlock_requirement: string | null
          user_id: string | null
          well_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          guild_hall?: string | null
          hex_x: number
          hex_y: number
          id: string
          name: string
          population?: number | null
          subtitle?: string | null
          unlock_requirement?: string | null
          user_id?: string | null
          well_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          guild_hall?: string | null
          hex_x?: number
          hex_y?: number
          id?: string
          name?: string
          population?: number | null
          subtitle?: string | null
          unlock_requirement?: string | null
          user_id?: string | null
          well_type?: string | null
        }
        Relationships: []
      }
      hexisle_player_quests: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          id: string
          progress: Json | null
          quest_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          id?: string
          progress?: Json | null
          quest_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          id?: string
          progress?: Json | null
          quest_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hexisle_player_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "hexisle_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      hexisle_player_state: {
        Row: {
          cities_discovered: string[] | null
          created_at: string | null
          credits: number | null
          current_city_id: string | null
          current_hex_x: number | null
          current_hex_y: number | null
          food: number | null
          id: string
          last_move: string | null
          level: number | null
          materials: number | null
          updated_at: string | null
          user_id: string | null
          water: number | null
          xp: number | null
        }
        Insert: {
          cities_discovered?: string[] | null
          created_at?: string | null
          credits?: number | null
          current_city_id?: string | null
          current_hex_x?: number | null
          current_hex_y?: number | null
          food?: number | null
          id?: string
          last_move?: string | null
          level?: number | null
          materials?: number | null
          updated_at?: string | null
          user_id?: string | null
          water?: number | null
          xp?: number | null
        }
        Update: {
          cities_discovered?: string[] | null
          created_at?: string | null
          credits?: number | null
          current_city_id?: string | null
          current_hex_x?: number | null
          current_hex_y?: number | null
          food?: number | null
          id?: string
          last_move?: string | null
          level?: number | null
          materials?: number | null
          updated_at?: string | null
          user_id?: string | null
          water?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      hexisle_quests: {
        Row: {
          city_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_real_world: boolean | null
          quest_type: string | null
          requirements: Json | null
          reward_badges: string[] | null
          reward_credits: number | null
          reward_items: string[] | null
          reward_xp: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_real_world?: boolean | null
          quest_type?: string | null
          requirements?: Json | null
          reward_badges?: string[] | null
          reward_credits?: number | null
          reward_items?: string[] | null
          reward_xp?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_real_world?: boolean | null
          quest_type?: string | null
          requirements?: Json | null
          reward_badges?: string[] | null
          reward_credits?: number | null
          reward_items?: string[] | null
          reward_xp?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hofund_channels: {
        Row: {
          channel_name: string
          channel_number: number
          channel_type: string
          created_at: string | null
          destination_url: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          medallion_id: string | null
          project_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_name: string
          channel_number?: number
          channel_type?: string
          created_at?: string | null
          destination_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          medallion_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_name?: string
          channel_number?: number
          channel_type?: string
          created_at?: string | null
          destination_url?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          medallion_id?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hofund_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "hofund_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hofund_dial_position: {
        Row: {
          current_channel: number
          id: string
          medallion_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_channel?: number
          id?: string
          medallion_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_channel?: number
          id?: string
          medallion_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      icing_distributions: {
        Row: {
          created_at: string | null
          icing_amount: number
          id: string
          maker_id: string
          maker_orders_count: number | null
          paid_at: string | null
          payment_reference: string | null
          pool_id: string | null
          recipe_stats_id: string | null
          share_percentage: number | null
          status: string | null
          total_recipe_orders: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          icing_amount: number
          id?: string
          maker_id: string
          maker_orders_count?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          pool_id?: string | null
          recipe_stats_id?: string | null
          share_percentage?: number | null
          status?: string | null
          total_recipe_orders?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          icing_amount?: number
          id?: string
          maker_id?: string
          maker_orders_count?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          pool_id?: string | null
          recipe_stats_id?: string | null
          share_percentage?: number | null
          status?: string | null
          total_recipe_orders?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "icing_distributions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "icing_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icing_distributions_recipe_stats_id_fkey"
            columns: ["recipe_stats_id"]
            isOneToOne: false
            referencedRelation: "icing_recipe_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      icing_pool: {
        Row: {
          calculated_at: string | null
          created_at: string | null
          current_period_volume: number | null
          distributed_at: string | null
          icing_rate: number | null
          id: string
          lb_margin_rate: number | null
          margin_from_increase: number | null
          period_end: string
          period_start: string
          period_type: string | null
          previous_period_volume: number | null
          status: string | null
          total_icing_pool: number | null
          user_id: string | null
          volume_increase: number | null
        }
        Insert: {
          calculated_at?: string | null
          created_at?: string | null
          current_period_volume?: number | null
          distributed_at?: string | null
          icing_rate?: number | null
          id?: string
          lb_margin_rate?: number | null
          margin_from_increase?: number | null
          period_end: string
          period_start: string
          period_type?: string | null
          previous_period_volume?: number | null
          status?: string | null
          total_icing_pool?: number | null
          user_id?: string | null
          volume_increase?: number | null
        }
        Update: {
          calculated_at?: string | null
          created_at?: string | null
          current_period_volume?: number | null
          distributed_at?: string | null
          icing_rate?: number | null
          id?: string
          lb_margin_rate?: number | null
          margin_from_increase?: number | null
          period_end?: string
          period_start?: string
          period_type?: string | null
          previous_period_volume?: number | null
          status?: string | null
          total_icing_pool?: number | null
          user_id?: string | null
          volume_increase?: number | null
        }
        Relationships: []
      }
      icing_recipe_stats: {
        Row: {
          created_at: string | null
          current_orders: number | null
          current_revenue: number | null
          icing_allocated: number | null
          id: string
          order_increase: number | null
          pool_id: string | null
          portfolio_recipe_id: string | null
          previous_orders: number | null
          previous_revenue: number | null
          recipe_id: string | null
          revenue_increase: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_orders?: number | null
          current_revenue?: number | null
          icing_allocated?: number | null
          id?: string
          order_increase?: number | null
          pool_id?: string | null
          portfolio_recipe_id?: string | null
          previous_orders?: number | null
          previous_revenue?: number | null
          recipe_id?: string | null
          revenue_increase?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_orders?: number | null
          current_revenue?: number | null
          icing_allocated?: number | null
          id?: string
          order_increase?: number | null
          pool_id?: string | null
          portfolio_recipe_id?: string | null
          previous_orders?: number | null
          previous_revenue?: number | null
          recipe_id?: string | null
          revenue_increase?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "icing_recipe_stats_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "icing_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icing_recipe_stats_portfolio_recipe_id_fkey"
            columns: ["portfolio_recipe_id"]
            isOneToOne: false
            referencedRelation: "user_recipe_portfolio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icing_recipe_stats_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "icing_recipe_stats_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_tasks: {
        Row: {
          category: string
          completed_at: string | null
          component_file: string | null
          components_needed: string[] | null
          created_at: string | null
          database_tables_needed: string[] | null
          documentation_file: string | null
          id: string
          notes: string | null
          priority: string
          status: string
          system_name: string
          updated_at: string | null
          user_id: string | null
          why_important: string | null
        }
        Insert: {
          category: string
          completed_at?: string | null
          component_file?: string | null
          components_needed?: string[] | null
          created_at?: string | null
          database_tables_needed?: string[] | null
          documentation_file?: string | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          system_name: string
          updated_at?: string | null
          user_id?: string | null
          why_important?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          component_file?: string | null
          components_needed?: string[] | null
          created_at?: string | null
          database_tables_needed?: string[] | null
          documentation_file?: string | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          system_name?: string
          updated_at?: string | null
          user_id?: string | null
          why_important?: string | null
        }
        Relationships: []
      }
      industry_benchmarks: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          notes: string | null
          platform_name: string
          source_date: string | null
          source_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          notes?: string | null
          platform_name: string
          source_date?: string | null
          source_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          notes?: string | null
          platform_name?: string
          source_date?: string | null
          source_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ingredient_demand_entries: {
        Row: {
          actual_item_purchased: string | null
          actual_price: number | null
          aggregation_status: string | null
          aggregation_window_id: string | null
          category: string | null
          created_at: string | null
          family_plan_id: string | null
          flexibility_days: number | null
          fulfilled_at: string | null
          fulfilled_by: string | null
          household_id: string | null
          id: string
          ingredient_name: string
          ingredient_normalized: string
          latitude: number | null
          longitude: number | null
          max_price_per_unit: number | null
          meal_order_id: string | null
          micro_local_area_id: string | null
          needed_by: string
          organic_required: boolean | null
          portfolio_recipe_id: string | null
          preferred_brand: string | null
          quantity: number
          recipe_id: string | null
          source_type: string
          substitution_allowed: boolean | null
          unit: string
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          actual_item_purchased?: string | null
          actual_price?: number | null
          aggregation_status?: string | null
          aggregation_window_id?: string | null
          category?: string | null
          created_at?: string | null
          family_plan_id?: string | null
          flexibility_days?: number | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          household_id?: string | null
          id?: string
          ingredient_name: string
          ingredient_normalized: string
          latitude?: number | null
          longitude?: number | null
          max_price_per_unit?: number | null
          meal_order_id?: string | null
          micro_local_area_id?: string | null
          needed_by: string
          organic_required?: boolean | null
          portfolio_recipe_id?: string | null
          preferred_brand?: string | null
          quantity: number
          recipe_id?: string | null
          source_type: string
          substitution_allowed?: boolean | null
          unit: string
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          actual_item_purchased?: string | null
          actual_price?: number | null
          aggregation_status?: string | null
          aggregation_window_id?: string | null
          category?: string | null
          created_at?: string | null
          family_plan_id?: string | null
          flexibility_days?: number | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          household_id?: string | null
          id?: string
          ingredient_name?: string
          ingredient_normalized?: string
          latitude?: number | null
          longitude?: number | null
          max_price_per_unit?: number | null
          meal_order_id?: string | null
          micro_local_area_id?: string | null
          needed_by?: string
          organic_required?: boolean | null
          portfolio_recipe_id?: string | null
          preferred_brand?: string | null
          quantity?: number
          recipe_id?: string | null
          source_type?: string
          substitution_allowed?: boolean | null
          unit?: string
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_demand_entries_meal_order_id_fkey"
            columns: ["meal_order_id"]
            isOneToOne: false
            referencedRelation: "meal_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_demand_entries_micro_local_area_id_fkey"
            columns: ["micro_local_area_id"]
            isOneToOne: false
            referencedRelation: "micro_local_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_demand_entries_portfolio_recipe_id_fkey"
            columns: ["portfolio_recipe_id"]
            isOneToOne: false
            referencedRelation: "user_recipe_portfolio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_demand_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_demand_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_care_units: {
        Row: {
          ai_advisor_name: string
          cost_per_cu: number
          created_at: string
          cu_definition: string
          current_tier: string
          id: string
          initiative_id: string
          name: string
          total_cu_deployed: number
          total_cu_funded: number
          updated_at: string
        }
        Insert: {
          ai_advisor_name: string
          cost_per_cu?: number
          created_at?: string
          cu_definition: string
          current_tier?: string
          id?: string
          initiative_id: string
          name: string
          total_cu_deployed?: number
          total_cu_funded?: number
          updated_at?: string
        }
        Update: {
          ai_advisor_name?: string
          cost_per_cu?: number
          created_at?: string
          cu_definition?: string
          current_tier?: string
          id?: string
          initiative_id?: string
          name?: string
          total_cu_deployed?: number
          total_cu_funded?: number
          updated_at?: string
        }
        Relationships: []
      }
      initiative_contributions: {
        Row: {
          contributed_at: string | null
          contribution_type: string
          credit_amount: number
          id: string
          initiative_name: string | null
          initiative_slug: string
          source_entity_id: string | null
          source_entity_type: string | null
          user_id: string
        }
        Insert: {
          contributed_at?: string | null
          contribution_type: string
          credit_amount: number
          id?: string
          initiative_name?: string | null
          initiative_slug: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id: string
        }
        Update: {
          contributed_at?: string | null
          contribution_type?: string
          credit_amount?: number
          id?: string
          initiative_name?: string | null
          initiative_slug?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      initiative_votes: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_allocated: number
          effective_joules: number | null
          first_100_multiplier: number | null
          golden_key_multiplier: number | null
          hot_bee_hive_multiplier: number | null
          id: string
          initiative_id: string
          mark_level_multiplier: number | null
          multiplier_at_vote: number
          outlet_multiplier: number | null
          refunded_at: string | null
          status: string
          timing_multiplier: number | null
          updated_at: string | null
          user_id: string
          voted_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_allocated?: number
          effective_joules?: number | null
          first_100_multiplier?: number | null
          golden_key_multiplier?: number | null
          hot_bee_hive_multiplier?: number | null
          id?: string
          initiative_id: string
          mark_level_multiplier?: number | null
          multiplier_at_vote?: number
          outlet_multiplier?: number | null
          refunded_at?: string | null
          status?: string
          timing_multiplier?: number | null
          updated_at?: string | null
          user_id: string
          voted_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_allocated?: number
          effective_joules?: number | null
          first_100_multiplier?: number | null
          golden_key_multiplier?: number | null
          hot_bee_hive_multiplier?: number | null
          id?: string
          initiative_id?: string
          mark_level_multiplier?: number | null
          multiplier_at_vote?: number
          outlet_multiplier?: number | null
          refunded_at?: string | null
          status?: string
          timing_multiplier?: number | null
          updated_at?: string | null
          user_id?: string
          voted_at?: string | null
        }
        Relationships: []
      }
      initiatives: {
        Row: {
          category: string | null
          created_at: string | null
          crown_name: string | null
          crown_status: string | null
          description: string | null
          goal_amount: number | null
          icon: string | null
          id: string
          initiative_number: number | null
          initiative_slug: string | null
          is_active: boolean | null
          name: string
          tagline: string | null
          updated_at: string | null
          user_id: string | null
          volunteer_roles: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          crown_name?: string | null
          crown_status?: string | null
          description?: string | null
          goal_amount?: number | null
          icon?: string | null
          id: string
          initiative_number?: number | null
          initiative_slug?: string | null
          is_active?: boolean | null
          name: string
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          volunteer_roles?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          crown_name?: string | null
          crown_status?: string | null
          description?: string | null
          goal_amount?: number | null
          icon?: string | null
          id?: string
          initiative_number?: number | null
          initiative_slug?: string | null
          is_active?: boolean | null
          name?: string
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          volunteer_roles?: string[] | null
        }
        Relationships: []
      }
      innovation_log: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          innovation_number: number
          logged_at: string | null
          logged_by: string | null
          patent_bag: string | null
          session_id: string | null
          session_tag: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          innovation_number: number
          logged_at?: string | null
          logged_by?: string | null
          patent_bag?: string | null
          session_id?: string | null
          session_tag?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          innovation_number?: number
          logged_at?: string | null
          logged_by?: string | null
          patent_bag?: string | null
          session_id?: string | null
          session_tag?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      innovation_stories: {
        Row: {
          biblical_reference: string | null
          created_at: string | null
          id: string
          innovation_name: string
          innovation_number: number
          journal_reference: string | null
          origin_date: string | null
          origin_location: string | null
          origin_memory: string | null
          patent_claim_summary: string | null
          personal_story_content: string | null
          personal_story_title: string | null
          related_innovations: number[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          biblical_reference?: string | null
          created_at?: string | null
          id?: string
          innovation_name: string
          innovation_number: number
          journal_reference?: string | null
          origin_date?: string | null
          origin_location?: string | null
          origin_memory?: string | null
          patent_claim_summary?: string | null
          personal_story_content?: string | null
          personal_story_title?: string | null
          related_innovations?: number[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          biblical_reference?: string | null
          created_at?: string | null
          id?: string
          innovation_name?: string
          innovation_number?: number
          journal_reference?: string | null
          origin_date?: string | null
          origin_location?: string | null
          origin_memory?: string | null
          patent_claim_summary?: string | null
          personal_story_content?: string | null
          personal_story_title?: string | null
          related_innovations?: number[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ip_ledger: {
        Row: {
          id: string
          medallion_id: string | null
          previous_hash: string | null
          record_data: Json
          record_hash: string
          record_type: string
          recorded_at: string | null
          sequence_number: number
          user_id: string | null
          verification_hash: string | null
          verified_by: string[] | null
        }
        Insert: {
          id?: string
          medallion_id?: string | null
          previous_hash?: string | null
          record_data: Json
          record_hash: string
          record_type: string
          recorded_at?: string | null
          sequence_number: number
          user_id?: string | null
          verification_hash?: string | null
          verified_by?: string[] | null
        }
        Update: {
          id?: string
          medallion_id?: string | null
          previous_hash?: string | null
          record_data?: Json
          record_hash?: string
          record_type?: string
          recorded_at?: string | null
          sequence_number?: number
          user_id?: string | null
          verification_hash?: string | null
          verified_by?: string[] | null
        }
        Relationships: []
      }
      johnny_appleseed_offers: {
        Row: {
          created_at: string | null
          expires_at: string | null
          geographic_filter: Json | null
          group_filter: string[] | null
          id: string
          offer_name: string
          purpose_statement: string | null
          remaining_memberships: number
          sponsor_id: string
          sponsor_message: string | null
          status: string | null
          temporal_filter: Json | null
          total_memberships: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          geographic_filter?: Json | null
          group_filter?: string[] | null
          id?: string
          offer_name: string
          purpose_statement?: string | null
          remaining_memberships: number
          sponsor_id: string
          sponsor_message?: string | null
          status?: string | null
          temporal_filter?: Json | null
          total_memberships: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          geographic_filter?: Json | null
          group_filter?: string[] | null
          id?: string
          offer_name?: string
          purpose_statement?: string | null
          remaining_memberships?: number
          sponsor_id?: string
          sponsor_message?: string | null
          status?: string | null
          temporal_filter?: Json | null
          total_memberships?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "johnny_appleseed_offers_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      joules_transactions: {
        Row: {
          balance_after: number
          created_at: string | null
          credits_spent: number
          id: string
          joules_amount: number
          locked_value: number
          multiplier_used: number
          reason: string
          reason_type: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          balance_after: number
          created_at?: string | null
          credits_spent?: number
          id?: string
          joules_amount: number
          locked_value?: number
          multiplier_used?: number
          reason: string
          reason_type: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string | null
          credits_spent?: number
          id?: string
          joules_amount?: number
          locked_value?: number
          multiplier_used?: number
          reason?: string
          reason_type?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kaleidoscope_placements: {
        Row: {
          anchor_id: string
          category: string
          clicks: number | null
          created_at: string | null
          id: string
          impressions: number | null
          is_active: boolean | null
          last_verified_at: string | null
          placement_type: string | null
          postal_code: string
          updated_at: string | null
        }
        Insert: {
          anchor_id: string
          category: string
          clicks?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          placement_type?: string | null
          postal_code: string
          updated_at?: string | null
        }
        Update: {
          anchor_id?: string
          category?: string
          clicks?: number | null
          created_at?: string | null
          id?: string
          impressions?: number | null
          is_active?: boolean | null
          last_verified_at?: string | null
          placement_type?: string | null
          postal_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kaleidoscope_placements_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kaleidoscope_placements_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "kaleidoscope_placements_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      keep_leases: {
        Row: {
          auto_renew: boolean
          capacity_tier: string
          created_at: string
          current_period_ends_at: string
          id: string
          keep_id: string
          lease_started_at: string
          ledger_entry_id: string
          lessee_id: string
          lessee_type: string
          monthly_lease_cost: number
          period_traffic_count: number
          status: string
          sub_lease_count: number
          trunk_id: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          capacity_tier: string
          created_at?: string
          current_period_ends_at: string
          id?: string
          keep_id: string
          lease_started_at?: string
          ledger_entry_id: string
          lessee_id: string
          lessee_type: string
          monthly_lease_cost: number
          period_traffic_count?: number
          status?: string
          sub_lease_count?: number
          trunk_id: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          capacity_tier?: string
          created_at?: string
          current_period_ends_at?: string
          id?: string
          keep_id?: string
          lease_started_at?: string
          ledger_entry_id?: string
          lessee_id?: string
          lessee_type?: string
          monthly_lease_cost?: number
          period_traffic_count?: number
          status?: string
          sub_lease_count?: number
          trunk_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keep_leases_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      keep_sub_leases: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          keep_id: string
          ledger_entry_id: string
          monthly_rent: number
          parent_lease_id: string
          space_name: string
          sub_lessee_id: string
          sub_lessee_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          keep_id: string
          ledger_entry_id: string
          monthly_rent: number
          parent_lease_id: string
          space_name: string
          sub_lessee_id: string
          sub_lessee_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          keep_id?: string
          ledger_entry_id?: string
          monthly_rent?: number
          parent_lease_id?: string
          space_name?: string
          sub_lessee_id?: string
          sub_lessee_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "keep_sub_leases_parent_lease_id_fkey"
            columns: ["parent_lease_id"]
            isOneToOne: false
            referencedRelation: "keep_leases"
            referencedColumns: ["id"]
          },
        ]
      }
      keep_tiers: {
        Row: {
          created_at: string | null
          id: string
          max_categories: number
          max_slots_per_category: number
          name: string
          requirement_type: string
          requirement_value: number | null
          slug: string
          sort_order: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_categories: number
          max_slots_per_category?: number
          name: string
          requirement_type: string
          requirement_value?: number | null
          slug: string
          sort_order?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_categories?: number
          max_slots_per_category?: number
          name?: string
          requirement_type?: string
          requirement_value?: number | null
          slug?: string
          sort_order?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      key_submissions: {
        Row: {
          feathers_awarded: number | null
          id: string
          is_correct: boolean
          key_word: string
          submitted_at: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          feathers_awarded?: number | null
          id?: string
          is_correct: boolean
          key_word: string
          submitted_at?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          feathers_awarded?: number | null
          id?: string
          is_correct?: boolean
          key_word?: string
          submitted_at?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kindling_subscriptions: {
        Row: {
          business_id: string
          charitable_pool_contributions: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string | null
          tier_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          charitable_pool_contributions?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          charitable_pool_contributions?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kindling_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "kindling_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      kindling_tiers: {
        Row: {
          charitable_allocation_percent: number | null
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_cue_cards: number | null
          max_products: number | null
          monthly_fee: number | null
          revenue_share_percent: number | null
          tier_level: number
          tier_name: string
          user_id: string | null
        }
        Insert: {
          charitable_allocation_percent?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cue_cards?: number | null
          max_products?: number | null
          monthly_fee?: number | null
          revenue_share_percent?: number | null
          tier_level: number
          tier_name: string
          user_id?: string | null
        }
        Update: {
          charitable_allocation_percent?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_cue_cards?: number | null
          max_products?: number | null
          monthly_fee?: number | null
          revenue_share_percent?: number | null
          tier_level?: number
          tier_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lb_asset_library: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          download_cost: number | null
          download_count: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_public: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_cost?: number | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_cost?: number | null
          download_count?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lb_taglines: {
        Row: {
          created_at: string
          display_order: number | null
          id: number
          is_active: boolean | null
          tagline: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          tagline: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          tagline?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboard_categories: {
        Row: {
          category_type: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
          time_bracketed: boolean | null
        }
        Insert: {
          category_type?: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
          time_bracketed?: boolean | null
        }
        Update: {
          category_type?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          time_bracketed?: boolean | null
        }
        Relationships: []
      }
      ledger_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      legal_defense_fund: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          total_contributed: number | null
          total_disbursed: number | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_contributed?: number | null
          total_disbursed?: number | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_contributed?: number | null
          total_disbursed?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      legal_formation_tracking: {
        Row: {
          approval_date: string | null
          created_at: string | null
          documents: Json | null
          ein: string | null
          entity_name: string
          entity_type: string | null
          filing_date: string | null
          id: string
          notes: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_date?: string | null
          created_at?: string | null
          documents?: Json | null
          ein?: string | null
          entity_name: string
          entity_type?: string | null
          filing_date?: string | null
          id?: string
          notes?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_date?: string | null
          created_at?: string | null
          documents?: Json | null
          ein?: string | null
          entity_name?: string
          entity_type?: string | null
          filing_date?: string | null
          id?: string
          notes?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      letter_queue: {
        Row: {
          attachment_paths: string[] | null
          attachments: Json | null
          bcc_emails: string[] | null
          body_html: string | null
          body_text: string | null
          category: string | null
          cc_emails: string[] | null
          created_at: string | null
          error_message: string | null
          follow_up_at: string | null
          from_name: string | null
          gmail_message_id: string | null
          id: string
          letter_file_path: string | null
          letter_title: string
          recipient_email: string | null
          recipient_name: string
          recipient_org: string | null
          reply_to: string | null
          response_notes: string | null
          response_received_at: string | null
          retry_count: number | null
          scheduled_for: string | null
          send_at: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          wave_number: number | null
        }
        Insert: {
          attachment_paths?: string[] | null
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          category?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          error_message?: string | null
          follow_up_at?: string | null
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          letter_file_path?: string | null
          letter_title: string
          recipient_email?: string | null
          recipient_name: string
          recipient_org?: string | null
          reply_to?: string | null
          response_notes?: string | null
          response_received_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          send_at?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          wave_number?: number | null
        }
        Update: {
          attachment_paths?: string[] | null
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          category?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          error_message?: string | null
          follow_up_at?: string | null
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          letter_file_path?: string | null
          letter_title?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_org?: string | null
          reply_to?: string | null
          response_notes?: string | null
          response_received_at?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          send_at?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          wave_number?: number | null
        }
        Relationships: []
      }
      leviathan_cue_cards: {
        Row: {
          bound_project_ids: string[] | null
          card_code: string
          created_at: string | null
          destination_id: string | null
          destination_type: string | null
          id: string
          last_scan_at: string | null
          payload_hash: string
          signature: string
          stamp_owner_id: string
          total_scans: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          bound_project_ids?: string[] | null
          card_code: string
          created_at?: string | null
          destination_id?: string | null
          destination_type?: string | null
          id?: string
          last_scan_at?: string | null
          payload_hash: string
          signature: string
          stamp_owner_id: string
          total_scans?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          bound_project_ids?: string[] | null
          card_code?: string
          created_at?: string | null
          destination_id?: string | null
          destination_type?: string | null
          id?: string
          last_scan_at?: string | null
          payload_hash?: string
          signature?: string
          stamp_owner_id?: string
          total_scans?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leviathan_cue_cards_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "cue_card_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leviathan_cue_cards_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "v_user_cue_card_destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      lifeline_requests: {
        Row: {
          created_at: string | null
          dosage: string | null
          id: string
          medication_name: string
          notes: string | null
          pharmacy_preference: string | null
          prescriber: string | null
          status: string | null
          urgency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          pharmacy_preference?: string | null
          prescriber?: string | null
          status?: string | null
          urgency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          pharmacy_preference?: string | null
          prescriber?: string | null
          status?: string | null
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      livekit_room_configs: {
        Row: {
          api_key_ref: string
          api_secret_ref: string
          audio_codec: string
          created_at: string
          id: string
          is_active: boolean
          recording_enabled: boolean
          region: string
          room_name: string
          server_url: string
          table_id: string
          table_size: string
        }
        Insert: {
          api_key_ref?: string
          api_secret_ref?: string
          audio_codec?: string
          created_at?: string
          id?: string
          is_active?: boolean
          recording_enabled?: boolean
          region?: string
          room_name: string
          server_url: string
          table_id: string
          table_size?: string
        }
        Update: {
          api_key_ref?: string
          api_secret_ref?: string
          audio_codec?: string
          created_at?: string
          id?: string
          is_active?: boolean
          recording_enabled?: boolean
          region?: string
          room_name?: string
          server_url?: string
          table_id?: string
          table_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "livekit_room_configs_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "round_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      lmd_charity_accounts: {
        Row: {
          auto_repay_percentage: number | null
          balance: number | null
          created_at: string | null
          id: string
          total_received: number | null
          total_repaid: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_repay_percentage?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          total_received?: number | null
          total_repaid?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_repay_percentage?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          total_received?: number | null
          total_repaid?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lmd_charity_transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          meal_id: string | null
          order_id: string | null
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          meal_id?: string | null
          order_id?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          meal_id?: string | null
          order_id?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lmd_charity_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "lmd_charity_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_charity_transactions_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_charity_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lmd_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lmd_chefs: {
        Row: {
          available_today: boolean | null
          badges: string[] | null
          bio: string | null
          charity_portions: number | null
          display_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          joined_at: string | null
          location: string | null
          rating: number | null
          specialties: string[] | null
          total_meals: number | null
          total_portions: number | null
          total_ratings: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_today?: boolean | null
          badges?: string[] | null
          bio?: string | null
          charity_portions?: number | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          joined_at?: string | null
          location?: string | null
          rating?: number | null
          specialties?: string[] | null
          total_meals?: number | null
          total_portions?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_today?: boolean | null
          badges?: string[] | null
          bio?: string | null
          charity_portions?: number | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          joined_at?: string | null
          location?: string | null
          rating?: number | null
          specialties?: string[] | null
          total_meals?: number | null
          total_portions?: number | null
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lmd_meal_requests: {
        Row: {
          created_at: string | null
          duration_days: number | null
          expires_at: string
          fulfilled_at: string | null
          fulfilled_by_meal_id: string | null
          id: string
          marks_committed: number
          meal_name: string
          pantry_recipe_id: string | null
          portion_count: number | null
          postal_code: string | null
          request_type: string
          requester_id: string
          specific_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_days?: number | null
          expires_at: string
          fulfilled_at?: string | null
          fulfilled_by_meal_id?: string | null
          id?: string
          marks_committed: number
          meal_name: string
          pantry_recipe_id?: string | null
          portion_count?: number | null
          postal_code?: string | null
          request_type: string
          requester_id: string
          specific_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number | null
          expires_at?: string
          fulfilled_at?: string | null
          fulfilled_by_meal_id?: string | null
          id?: string
          marks_committed?: number
          meal_name?: string
          pantry_recipe_id?: string | null
          portion_count?: number | null
          postal_code?: string | null
          request_type?: string
          requester_id?: string
          specific_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lmd_meal_requests_fulfilled_by_meal_id_fkey"
            columns: ["fulfilled_by_meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_meal_requests_pantry_recipe_id_fkey"
            columns: ["pantry_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_meal_requests_pantry_recipe_id_fkey"
            columns: ["pantry_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      lmd_meals: {
        Row: {
          allergens: string[] | null
          bulk_increment: number | null
          bulk_minimum: number | null
          chef_id: string | null
          cottage_law_category: string | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          id: string
          is_charity: boolean | null
          meal_name: string
          offering_type: string | null
          pickup_date: string
          pickup_instructions: string | null
          pickup_location: string
          pickup_time: string
          portfolio_recipe_id: string | null
          portions_available: number
          portions_claimed: number | null
          price_per_portion: number | null
          requires_permit: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          volume_discount_tiers: Json | null
        }
        Insert: {
          allergens?: string[] | null
          bulk_increment?: number | null
          bulk_minimum?: number | null
          chef_id?: string | null
          cottage_law_category?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          id?: string
          is_charity?: boolean | null
          meal_name: string
          offering_type?: string | null
          pickup_date: string
          pickup_instructions?: string | null
          pickup_location: string
          pickup_time: string
          portfolio_recipe_id?: string | null
          portions_available: number
          portions_claimed?: number | null
          price_per_portion?: number | null
          requires_permit?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          volume_discount_tiers?: Json | null
        }
        Update: {
          allergens?: string[] | null
          bulk_increment?: number | null
          bulk_minimum?: number | null
          chef_id?: string | null
          cottage_law_category?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          id?: string
          is_charity?: boolean | null
          meal_name?: string
          offering_type?: string | null
          pickup_date?: string
          pickup_instructions?: string | null
          pickup_location?: string
          pickup_time?: string
          portfolio_recipe_id?: string | null
          portions_available?: number
          portions_claimed?: number | null
          price_per_portion?: number | null
          requires_permit?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          volume_discount_tiers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lmd_meals_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "lmd_chefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_meals_portfolio_recipe_id_fkey"
            columns: ["portfolio_recipe_id"]
            isOneToOne: false
            referencedRelation: "user_recipe_portfolio"
            referencedColumns: ["id"]
          },
        ]
      }
      lmd_orders: {
        Row: {
          id: string
          meal_id: string | null
          ordered_at: string | null
          payment_method: string | null
          payment_status: string | null
          picked_up_at: string | null
          portions: number | null
          status: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          id?: string
          meal_id?: string | null
          ordered_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          portions?: number | null
          status?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          id?: string
          meal_id?: string | null
          ordered_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          portions?: number | null
          status?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lmd_orders_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      local_distributors: {
        Row: {
          active_standing_orders: number | null
          advance_retail_per_serving: number | null
          bulk_retail_per_serving: number | null
          business_name: string
          cost_per_serving_c20: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          kit_types_offered: string[] | null
          member_id: string | null
          member_since: string | null
          node_ids: string[] | null
          service_area: string[] | null
          updated_at: string | null
          walkup_retail_per_serving: number | null
          weekly_capacity: number | null
        }
        Insert: {
          active_standing_orders?: number | null
          advance_retail_per_serving?: number | null
          bulk_retail_per_serving?: number | null
          business_name: string
          cost_per_serving_c20?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kit_types_offered?: string[] | null
          member_id?: string | null
          member_since?: string | null
          node_ids?: string[] | null
          service_area?: string[] | null
          updated_at?: string | null
          walkup_retail_per_serving?: number | null
          weekly_capacity?: number | null
        }
        Update: {
          active_standing_orders?: number | null
          advance_retail_per_serving?: number | null
          bulk_retail_per_serving?: number | null
          business_name?: string
          cost_per_serving_c20?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kit_types_offered?: string[] | null
          member_id?: string | null
          member_since?: string | null
          node_ids?: string[] | null
          service_area?: string[] | null
          updated_at?: string | null
          walkup_retail_per_serving?: number | null
          weekly_capacity?: number | null
        }
        Relationships: []
      }
      local_listings: {
        Row: {
          accepts_marks: boolean | null
          address: string
          city: string
          created_at: string | null
          creator_id: string | null
          description: string | null
          end_time: string | null
          id: string
          latitude: number | null
          listing_type: string
          longitude: number | null
          start_time: string | null
          state: string
          tags: string[] | null
          title: string
          zip_code: string
        }
        Insert: {
          accepts_marks?: boolean | null
          address: string
          city: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          listing_type: string
          longitude?: number | null
          start_time?: string | null
          state: string
          tags?: string[] | null
          title: string
          zip_code: string
        }
        Update: {
          accepts_marks?: boolean | null
          address?: string
          city?: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          listing_type?: string
          longitude?: number | null
          start_time?: string | null
          state?: string
          tags?: string[] | null
          title?: string
          zip_code?: string
        }
        Relationships: []
      }
      local_sop_registry: {
        Row: {
          content_hash: string | null
          created_at: string | null
          harper_reviewer_id: string | null
          id: string
          last_harper_review: string | null
          node_id: string
          node_name: string
          review_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string | null
          harper_reviewer_id?: string | null
          id?: string
          last_harper_review?: string | null
          node_id: string
          node_name: string
          review_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string | null
          harper_reviewer_id?: string | null
          id?: string
          last_harper_review?: string | null
          node_id?: string
          node_name?: string
          review_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      looking_glass: {
        Row: {
          active_portal_card_id: string | null
          created_at: string | null
          display_language: string | null
          facet_1_destination: string | null
          facet_1_label: string | null
          facet_1_type: string | null
          facet_2_destination: string | null
          facet_2_label: string | null
          facet_2_type: string | null
          facet_3_destination: string | null
          facet_3_label: string | null
          facet_3_type: string | null
          facet_4_destination: string | null
          facet_4_label: string | null
          facet_4_type: string | null
          facet_5_destination: string | null
          facet_5_label: string | null
          facet_5_type: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_portal_card_id?: string | null
          created_at?: string | null
          display_language?: string | null
          facet_1_destination?: string | null
          facet_1_label?: string | null
          facet_1_type?: string | null
          facet_2_destination?: string | null
          facet_2_label?: string | null
          facet_2_type?: string | null
          facet_3_destination?: string | null
          facet_3_label?: string | null
          facet_3_type?: string | null
          facet_4_destination?: string | null
          facet_4_label?: string | null
          facet_4_type?: string | null
          facet_5_destination?: string | null
          facet_5_label?: string | null
          facet_5_type?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_portal_card_id?: string | null
          created_at?: string | null
          display_language?: string | null
          facet_1_destination?: string | null
          facet_1_label?: string | null
          facet_1_type?: string | null
          facet_2_destination?: string | null
          facet_2_label?: string | null
          facet_2_type?: string | null
          facet_3_destination?: string | null
          facet_3_label?: string | null
          facet_3_type?: string | null
          facet_4_destination?: string | null
          facet_4_label?: string | null
          facet_4_type?: string | null
          facet_5_destination?: string | null
          facet_5_label?: string | null
          facet_5_type?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "looking_glass_active_portal_card_id_fkey"
            columns: ["active_portal_card_id"]
            isOneToOne: false
            referencedRelation: "deck_card_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      looking_glass_entries: {
        Row: {
          body: string | null
          category: string | null
          created_at: string | null
          entry_type: string
          id: string
          source_agent: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          entry_type?: string
          id?: string
          source_agent?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string | null
          entry_type?: string
          id?: string
          source_agent?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      manufacturing_order_items: {
        Row: {
          created_at: string | null
          custom_options: Json | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_options?: Json | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_options?: Json | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_products"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_orders: {
        Row: {
          delivered_at: string | null
          id: string
          order_number: string
          ordered_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping: number | null
          shipping_address: Json | null
          status: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          user_id: string | null
        }
        Insert: {
          delivered_at?: string | null
          id?: string
          order_number: string
          ordered_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          user_id?: string | null
        }
        Update: {
          delivered_at?: string | null
          id?: string
          order_number?: string
          ordered_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      manufacturing_products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          customizable: boolean | null
          description: string | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          materials: string[] | null
          min_quantity: number | null
          name: string
          production_time_days: number | null
          slug: string
          updated_at: string | null
          user_id: string | null
          volume_discounts: Json | null
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string | null
          customizable?: boolean | null
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          materials?: string[] | null
          min_quantity?: number | null
          name: string
          production_time_days?: number | null
          slug: string
          updated_at?: string | null
          user_id?: string | null
          volume_discounts?: Json | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          customizable?: boolean | null
          description?: string | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          materials?: string[] | null
          min_quantity?: number | null
          name?: string
          production_time_days?: number | null
          slug?: string
          updated_at?: string | null
          user_id?: string | null
          volume_discounts?: Json | null
        }
        Relationships: []
      }
      manufacturing_quotes: {
        Row: {
          created_at: string | null
          description: string
          file_urls: string[] | null
          id: string
          material: string | null
          quantity: number | null
          quote_type: string | null
          quoted_price: number | null
          quoted_time_days: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          file_urls?: string[] | null
          id?: string
          material?: string | null
          quantity?: number | null
          quote_type?: string | null
          quoted_price?: number | null
          quoted_time_days?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          file_urls?: string[] | null
          id?: string
          material?: string | null
          quantity?: number | null
          quote_type?: string | null
          quoted_price?: number | null
          quoted_time_days?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      map_beacons: {
        Row: {
          beacon_order: number
          created_at: string | null
          hint: string | null
          id: string
          location_path: string
          location_type: string
          map_id: string
          name: string
          next_beacon_ids: string[] | null
          task_answer: string | null
          task_description: string | null
          task_type: string | null
          user_id: string | null
        }
        Insert: {
          beacon_order: number
          created_at?: string | null
          hint?: string | null
          id?: string
          location_path: string
          location_type: string
          map_id: string
          name: string
          next_beacon_ids?: string[] | null
          task_answer?: string | null
          task_description?: string | null
          task_type?: string | null
          user_id?: string | null
        }
        Update: {
          beacon_order?: number
          created_at?: string | null
          hint?: string | null
          id?: string
          location_path?: string
          location_type?: string
          map_id?: string
          name?: string
          next_beacon_ids?: string[] | null
          task_answer?: string | null
          task_description?: string | null
          task_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_beacons_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "treasure_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      map_progress: {
        Row: {
          beacons_visited: string[] | null
          completed_at: string | null
          current_beacon_id: string | null
          end_question_answered: boolean | null
          end_question_correct: boolean | null
          ghost_id: string | null
          id: string
          map_id: string
          marks_earned: number | null
          session_count: number | null
          started_at: string | null
          total_time_seconds: number | null
          user_id: string | null
        }
        Insert: {
          beacons_visited?: string[] | null
          completed_at?: string | null
          current_beacon_id?: string | null
          end_question_answered?: boolean | null
          end_question_correct?: boolean | null
          ghost_id?: string | null
          id?: string
          map_id: string
          marks_earned?: number | null
          session_count?: number | null
          started_at?: string | null
          total_time_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          beacons_visited?: string[] | null
          completed_at?: string | null
          current_beacon_id?: string | null
          end_question_answered?: boolean | null
          end_question_correct?: boolean | null
          ghost_id?: string | null
          id?: string
          map_id?: string
          marks_earned?: number | null
          session_count?: number | null
          started_at?: string | null
          total_time_seconds?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_progress_current_beacon_id_fkey"
            columns: ["current_beacon_id"]
            isOneToOne: false
            referencedRelation: "map_beacons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_progress_ghost_id_fkey"
            columns: ["ghost_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_progress_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "treasure_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          id: string
          reason: string
          reason_type: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          id?: string
          reason: string
          reason_type: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          id?: string
          reason?: string
          reason_type?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      matchtrade_joules_collateral: {
        Row: {
          bond_account_id: string | null
          id: string
          joules_locked: number
          locked_at: string | null
          offer_id: string
          release_reason: string | null
          released_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          bond_account_id?: string | null
          id?: string
          joules_locked: number
          locked_at?: string | null
          offer_id: string
          release_reason?: string | null
          released_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          bond_account_id?: string | null
          id?: string
          joules_locked?: number
          locked_at?: string | null
          offer_id?: string
          release_reason?: string | null
          released_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchtrade_joules_collateral_bond_account_id_fkey"
            columns: ["bond_account_id"]
            isOneToOne: false
            referencedRelation: "bond_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchtrade_joules_collateral_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "matchtrade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      matchtrade_matches: {
        Row: {
          a_confirmed_by_b: boolean | null
          a_delivered_at: string | null
          b_confirmed_by_a: boolean | null
          b_delivered_at: string | null
          completed_at: string | null
          created_at: string | null
          dispute_reason: string | null
          dispute_resolution: string | null
          dispute_resolved_at: string | null
          disputed_at: string | null
          id: string
          marks_transferred_a: number | null
          marks_transferred_b: number | null
          offer_a_id: string
          offer_b_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          a_confirmed_by_b?: boolean | null
          a_delivered_at?: string | null
          b_confirmed_by_a?: boolean | null
          b_delivered_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_resolved_at?: string | null
          disputed_at?: string | null
          id?: string
          marks_transferred_a?: number | null
          marks_transferred_b?: number | null
          offer_a_id: string
          offer_b_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          a_confirmed_by_b?: boolean | null
          a_delivered_at?: string | null
          b_confirmed_by_a?: boolean | null
          b_delivered_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          dispute_resolved_at?: string | null
          disputed_at?: string | null
          id?: string
          marks_transferred_a?: number | null
          marks_transferred_b?: number | null
          offer_a_id?: string
          offer_b_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchtrade_matches_offer_a_id_fkey"
            columns: ["offer_a_id"]
            isOneToOne: false
            referencedRelation: "matchtrade_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchtrade_matches_offer_b_id_fkey"
            columns: ["offer_b_id"]
            isOneToOne: false
            referencedRelation: "matchtrade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      matchtrade_offers: {
        Row: {
          category: string
          collateral_locked: boolean | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          joules_collateral: number
          marks_price: number
          matched_at: string | null
          matched_with_offer_id: string | null
          offerer_id: string
          postal_code: string | null
          radius_miles: number | null
          seeking_category: string | null
          seeking_description: string | null
          service_description: string | null
          service_title: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          collateral_locked?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          joules_collateral?: number
          marks_price: number
          matched_at?: string | null
          matched_with_offer_id?: string | null
          offerer_id: string
          postal_code?: string | null
          radius_miles?: number | null
          seeking_category?: string | null
          seeking_description?: string | null
          service_description?: string | null
          service_title: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          collateral_locked?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          joules_collateral?: number
          marks_price?: number
          matched_at?: string | null
          matched_with_offer_id?: string | null
          offerer_id?: string
          postal_code?: string | null
          radius_miles?: number | null
          seeking_category?: string | null
          seeking_description?: string | null
          service_description?: string | null
          service_title?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchtrade_offers_matched_with_offer_id_fkey"
            columns: ["matched_with_offer_id"]
            isOneToOne: false
            referencedRelation: "matchtrade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_kit_ingredients: {
        Row: {
          created_at: string | null
          farmer_id: string | null
          id: string
          ingredient_name: string
          kit_id: string | null
          preservation_method: string | null
          source: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          ingredient_name: string
          kit_id?: string | null
          preservation_method?: string | null
          source?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          farmer_id?: string | null
          id?: string
          ingredient_name?: string
          kit_id?: string | null
          preservation_method?: string | null
          source?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_kit_ingredients_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_kit_ingredients_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "meal_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_kits: {
        Row: {
          advance_price_per_serving: number
          bulk_price_per_serving: number
          c20_price: number
          cook_time: string | null
          cost_basis: number
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          name: string
          servings: number
          shelf_life: string | null
          updated_at: string | null
          walkup_price_per_serving: number
        }
        Insert: {
          advance_price_per_serving?: number
          bulk_price_per_serving?: number
          c20_price: number
          cook_time?: string | null
          cost_basis: number
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          servings?: number
          shelf_life?: string | null
          updated_at?: string | null
          walkup_price_per_serving?: number
        }
        Update: {
          advance_price_per_serving?: number
          bulk_price_per_serving?: number
          c20_price?: number
          cook_time?: string | null
          cost_basis?: number
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          servings?: number
          shelf_life?: string | null
          updated_at?: string | null
          walkup_price_per_serving?: number
        }
        Relationships: []
      }
      meal_orders: {
        Row: {
          bulk_discount_amount: number | null
          bulk_discount_percent: number | null
          created_at: string | null
          delivery_notes: string | null
          id: string
          meal_id: string | null
          quantity: number | null
          servings_requested: number | null
          special_requests: string | null
          status: string | null
          total_credits: number | null
          total_price: number | null
          unit_price: number | null
          user_id: string
        }
        Insert: {
          bulk_discount_amount?: number | null
          bulk_discount_percent?: number | null
          created_at?: string | null
          delivery_notes?: string | null
          id?: string
          meal_id?: string | null
          quantity?: number | null
          servings_requested?: number | null
          special_requests?: string | null
          status?: string | null
          total_credits?: number | null
          total_price?: number | null
          unit_price?: number | null
          user_id: string
        }
        Update: {
          bulk_discount_amount?: number | null
          bulk_discount_percent?: number | null
          created_at?: string | null
          delivery_notes?: string | null
          id?: string
          meal_id?: string | null
          quantity?: number | null
          servings_requested?: number | null
          special_requests?: string | null
          status?: string | null
          total_credits?: number | null
          total_price?: number | null
          unit_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_orders_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_prep_parties: {
        Row: {
          created_at: string | null
          current_participants: number | null
          duration: string | null
          home_address: string | null
          host_id: string | null
          host_name: string
          host_share: number | null
          id: string
          ingredient_cost: number | null
          max_participants: number | null
          node_id: string | null
          participant_fee: number
          party_date: string
          party_type: string
          platform_margin: number | null
          start_time: string
          status: string | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          duration?: string | null
          home_address?: string | null
          host_id?: string | null
          host_name: string
          host_share?: number | null
          id?: string
          ingredient_cost?: number | null
          max_participants?: number | null
          node_id?: string | null
          participant_fee?: number
          party_date: string
          party_type: string
          platform_margin?: number | null
          start_time: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          duration?: string | null
          home_address?: string | null
          host_id?: string | null
          host_name?: string
          host_share?: number | null
          id?: string
          ingredient_cost?: number | null
          max_participants?: number | null
          node_id?: string | null
          participant_fee?: number
          party_date?: string
          party_type?: string
          platform_margin?: number | null
          start_time?: string
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_prep_parties_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "distribution_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_prep_party_kits: {
        Row: {
          created_at: string | null
          id: string
          kit_id: string | null
          kit_name: string
          party_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          kit_id?: string | null
          kit_name: string
          party_id?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          kit_id?: string | null
          kit_name?: string
          party_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_prep_party_kits_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "meal_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_prep_party_kits_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "meal_prep_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_stamps: {
        Row: {
          allergens: string[] | null
          batch_number: number | null
          best_by: string | null
          cottage_law_compliant: boolean | null
          created_at: string | null
          has_issue: boolean | null
          id: string
          ingredients_hash: string | null
          issue_description: string | null
          issue_reported_at: string | null
          issue_resolved: boolean | null
          item_index: number | null
          items_in_batch: number | null
          made_at: string
          maker_id: string
          meal_id: string | null
          order_id: string | null
          permit_number: string | null
          quality_checked: boolean | null
          quality_checked_at: string | null
          quality_checker_id: string | null
          shelf_life_hours: number | null
          stamp_code: string
          state_code: string | null
          user_id: string | null
        }
        Insert: {
          allergens?: string[] | null
          batch_number?: number | null
          best_by?: string | null
          cottage_law_compliant?: boolean | null
          created_at?: string | null
          has_issue?: boolean | null
          id?: string
          ingredients_hash?: string | null
          issue_description?: string | null
          issue_reported_at?: string | null
          issue_resolved?: boolean | null
          item_index?: number | null
          items_in_batch?: number | null
          made_at?: string
          maker_id: string
          meal_id?: string | null
          order_id?: string | null
          permit_number?: string | null
          quality_checked?: boolean | null
          quality_checked_at?: string | null
          quality_checker_id?: string | null
          shelf_life_hours?: number | null
          stamp_code: string
          state_code?: string | null
          user_id?: string | null
        }
        Update: {
          allergens?: string[] | null
          batch_number?: number | null
          best_by?: string | null
          cottage_law_compliant?: boolean | null
          created_at?: string | null
          has_issue?: boolean | null
          id?: string
          ingredients_hash?: string | null
          issue_description?: string | null
          issue_reported_at?: string | null
          issue_resolved?: boolean | null
          item_index?: number | null
          items_in_batch?: number | null
          made_at?: string
          maker_id?: string
          meal_id?: string | null
          order_id?: string | null
          permit_number?: string | null
          quality_checked?: boolean | null
          quality_checked_at?: string | null
          quality_checker_id?: string | null
          shelf_life_hours?: number | null
          stamp_code?: string
          state_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_stamps_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_stamps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "meal_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      medallion_designs: {
        Row: {
          created_at: string | null
          description: string | null
          design_url: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          design_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      medallion_registry: {
        Row: {
          auto_grant_credits: number | null
          auto_grant_joules: number | null
          blockchain_network: string | null
          claim_url: string | null
          claimed_by_user_id: string | null
          claimed_date: string | null
          contact_method: string
          contact_type: string | null
          created_at: string | null
          id: string
          issued_by: string | null
          issued_date: string
          joules_locked_rate: number | null
          qr_code_url: string | null
          recipient_name: string
          status: string
          token_id: number | null
          transaction_reason: string
          transfer_tx_hash: string | null
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          auto_grant_credits?: number | null
          auto_grant_joules?: number | null
          blockchain_network?: string | null
          claim_url?: string | null
          claimed_by_user_id?: string | null
          claimed_date?: string | null
          contact_method: string
          contact_type?: string | null
          created_at?: string | null
          id: string
          issued_by?: string | null
          issued_date?: string
          joules_locked_rate?: number | null
          qr_code_url?: string | null
          recipient_name: string
          status?: string
          token_id?: number | null
          transaction_reason: string
          transfer_tx_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          auto_grant_credits?: number | null
          auto_grant_joules?: number | null
          blockchain_network?: string | null
          claim_url?: string | null
          claimed_by_user_id?: string | null
          claimed_date?: string | null
          contact_method?: string
          contact_type?: string | null
          created_at?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string
          joules_locked_rate?: number | null
          qr_code_url?: string | null
          recipient_name?: string
          status?: string
          token_id?: number | null
          transaction_reason?: string
          transfer_tx_hash?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      medallion_type_definitions: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          created_at: string | null
          description: string | null
          display_name: string
          invitation_codes: number | null
          service_credit_percentage: number | null
          type_code: string
          user_id: string | null
          voting_power_multiplier: number | null
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          invitation_codes?: number | null
          service_credit_percentage?: number | null
          type_code: string
          user_id?: string | null
          voting_power_multiplier?: number | null
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          invitation_codes?: number | null
          service_credit_percentage?: number | null
          type_code?: string
          user_id?: string | null
          voting_power_multiplier?: number | null
        }
        Relationships: []
      }
      member_armory: {
        Row: {
          acquired_at: string | null
          acquired_from: string | null
          id: string
          is_tradeable: boolean | null
          item_data: Json | null
          item_name: string
          item_type: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          acquired_from?: string | null
          id?: string
          is_tradeable?: boolean | null
          item_data?: Json | null
          item_name: string
          item_type: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          acquired_from?: string | null
          id?: string
          is_tradeable?: boolean | null
          item_data?: Json | null
          item_name?: string
          item_type?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: []
      }
      member_badges: {
        Row: {
          badge_type_id: string
          earned_at: string | null
          earned_for: string | null
          id: string
          is_featured: boolean | null
          is_visible: boolean | null
          metric_value: number | null
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
        }
        Insert: {
          badge_type_id: string
          earned_at?: string | null
          earned_for?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          metric_value?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
        }
        Update: {
          badge_type_id?: string
          earned_at?: string | null
          earned_for?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          metric_value?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_badges_badge_type_id_fkey"
            columns: ["badge_type_id"]
            isOneToOne: false
            referencedRelation: "badge_types"
            referencedColumns: ["id"]
          },
        ]
      }
      member_content_feeds: {
        Row: {
          created_at: string
          display_name: string | null
          feed_url: string
          id: string
          is_active: boolean
          last_fetched_at: string | null
          last_post_title: string | null
          max_posts_displayed: number
          platform: string
          publication_name: string | null
          show_on_profile: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          feed_url: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string | null
          last_post_title?: string | null
          max_posts_displayed?: number
          platform?: string
          publication_name?: string | null
          show_on_profile?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          feed_url?: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string | null
          last_post_title?: string | null
          max_posts_displayed?: number
          platform?: string
          publication_name?: string | null
          show_on_profile?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_medallion_collection: {
        Row: {
          chalk_one_type: string | null
          created_at: string | null
          display_order: number | null
          earned_date: string | null
          id: string
          is_featured: boolean | null
          medallion_id: string | null
          project_id: string | null
          sponsor_attribution: string | null
          user_id: string | null
        }
        Insert: {
          chalk_one_type?: string | null
          created_at?: string | null
          display_order?: number | null
          earned_date?: string | null
          id?: string
          is_featured?: boolean | null
          medallion_id?: string | null
          project_id?: string | null
          sponsor_attribution?: string | null
          user_id?: string | null
        }
        Update: {
          chalk_one_type?: string | null
          created_at?: string | null
          display_order?: number | null
          earned_date?: string | null
          id?: string
          is_featured?: boolean | null
          medallion_id?: string | null
          project_id?: string | null
          sponsor_attribution?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_medallion_collection_medallion_id_fkey"
            columns: ["medallion_id"]
            isOneToOne: false
            referencedRelation: "medallion_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_medallion_collection_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "member_medallion_collection_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payment_plugs: {
        Row: {
          created_at: string | null
          display_name: string | null
          handle_or_url: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          handle_or_url: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          handle_or_url?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      member_relationships: {
        Row: {
          created_at: string | null
          disconnected_at: string | null
          family_id: string
          from_member: string
          id: string
          is_connected: boolean | null
          reconnected_at: string | null
          to_member: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          disconnected_at?: string | null
          family_id: string
          from_member: string
          id?: string
          is_connected?: boolean | null
          reconnected_at?: string | null
          to_member: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          disconnected_at?: string | null
          family_id?: string
          from_member?: string
          id?: string
          is_connected?: boolean | null
          reconnected_at?: string | null
          to_member?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_relationships_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_relationships_from_member_fkey"
            columns: ["from_member"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_relationships_to_member_fkey"
            columns: ["to_member"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_scheduled_posts: {
        Row: {
          account_id: string | null
          clicks: number | null
          content: string
          content_html: string | null
          created_at: string | null
          cue_card_id: string | null
          engagements: number | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          impressions: number | null
          initiative_id: string | null
          link_url: string | null
          media_urls: string[] | null
          platform_post_id: string | null
          posted_at: string | null
          project_id: string | null
          retry_count: number | null
          scheduled_for: string
          status: string | null
          time_zone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          clicks?: number | null
          content: string
          content_html?: string | null
          created_at?: string | null
          cue_card_id?: string | null
          engagements?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          initiative_id?: string | null
          link_url?: string | null
          media_urls?: string[] | null
          platform_post_id?: string | null
          posted_at?: string | null
          project_id?: string | null
          retry_count?: number | null
          scheduled_for: string
          status?: string | null
          time_zone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          clicks?: number | null
          content?: string
          content_html?: string | null
          created_at?: string | null
          cue_card_id?: string | null
          engagements?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          initiative_id?: string | null
          link_url?: string | null
          media_urls?: string[] | null
          platform_post_id?: string | null
          posted_at?: string | null
          project_id?: string | null
          retry_count?: number | null
          scheduled_for?: string
          status?: string | null
          time_zone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_scheduled_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "member_social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_social_accounts: {
        Row: {
          access_token: string | null
          account_handle: string | null
          account_name: string | null
          account_nickname: string | null
          account_type: string | null
          app_password: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_verified: boolean | null
          last_used_at: string | null
          platform: string
          platform_user_id: string | null
          profile_url: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          account_handle?: string | null
          account_name?: string | null
          account_nickname?: string | null
          account_type?: string | null
          app_password?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          platform: string
          platform_user_id?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          account_handle?: string | null
          account_name?: string | null
          account_nickname?: string | null
          account_type?: string | null
          app_password?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          platform?: string
          platform_user_id?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      member_social_billing: {
        Row: {
          base_cost_credits: number | null
          created_at: string | null
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          platform_fee_credits: number | null
          posts_scheduled: number | null
          posts_sent: number | null
          status: string | null
          total_credits: number | null
          user_id: string | null
        }
        Insert: {
          base_cost_credits?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          platform_fee_credits?: number | null
          posts_scheduled?: number | null
          posts_sent?: number | null
          status?: string | null
          total_credits?: number | null
          user_id?: string | null
        }
        Update: {
          base_cost_credits?: number | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          platform_fee_credits?: number | null
          posts_scheduled?: number | null
          posts_sent?: number | null
          status?: string | null
          total_credits?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      memory_game_scores: {
        Row: {
          attempts: number | null
          id: string
          is_high_score: boolean | null
          played_at: string | null
          player: string
          score: number
          user_id: string | null
          vault_owner: string
        }
        Insert: {
          attempts?: number | null
          id?: string
          is_high_score?: boolean | null
          played_at?: string | null
          player: string
          score: number
          user_id?: string | null
          vault_owner: string
        }
        Update: {
          attempts?: number | null
          id?: string
          is_high_score?: boolean | null
          played_at?: string | null
          player?: string
          score?: number
          user_id?: string | null
          vault_owner?: string
        }
        Relationships: []
      }
      mic_permission_states: {
        Row: {
          active_publisher_id: string | null
          created_at: string
          debit_interval_ms: number
          edge_function_url: string
          id: string
          last_debit_at: string | null
          publish_granted_at: string | null
          publisher_balance_at_grant: number
          table_id: string
        }
        Insert: {
          active_publisher_id?: string | null
          created_at?: string
          debit_interval_ms?: number
          edge_function_url: string
          id?: string
          last_debit_at?: string | null
          publish_granted_at?: string | null
          publisher_balance_at_grant?: number
          table_id: string
        }
        Update: {
          active_publisher_id?: string | null
          created_at?: string
          debit_interval_ms?: number
          edge_function_url?: string
          id?: string
          last_debit_at?: string | null
          publish_granted_at?: string | null
          publisher_balance_at_grant?: number
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mic_permission_states_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: true
            referencedRelation: "round_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      mic_requests: {
        Row: {
          estimated_duration: number | null
          granted_at: string | null
          id: string
          member_id: string
          member_name: string
          released_at: string | null
          requested_at: string
          status: string
          table_id: string
        }
        Insert: {
          estimated_duration?: number | null
          granted_at?: string | null
          id?: string
          member_id: string
          member_name: string
          released_at?: string | null
          requested_at?: string
          status?: string
          table_id: string
        }
        Update: {
          estimated_duration?: number | null
          granted_at?: string | null
          id?: string
          member_id?: string
          member_name?: string
          released_at?: string | null
          requested_at?: string
          status?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mic_requests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "round_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_local_areas: {
        Row: {
          aggregation_radius_miles: number | null
          area_code: string
          base_delivery_fee: number | null
          city: string | null
          created_at: string | null
          default_delivery_windows: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          max_delivery_radius_miles: number | null
          min_orders_for_job: number | null
          minimum_orders_to_aggregate: number | null
          minimum_value_to_aggregate: number | null
          name: string
          per_mile_fee: number | null
          state: string | null
          user_id: string | null
          volume_discount_tiers: Json | null
          zip_codes: string[] | null
        }
        Insert: {
          aggregation_radius_miles?: number | null
          area_code: string
          base_delivery_fee?: number | null
          city?: string | null
          created_at?: string | null
          default_delivery_windows?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_radius_miles?: number | null
          min_orders_for_job?: number | null
          minimum_orders_to_aggregate?: number | null
          minimum_value_to_aggregate?: number | null
          name: string
          per_mile_fee?: number | null
          state?: string | null
          user_id?: string | null
          volume_discount_tiers?: Json | null
          zip_codes?: string[] | null
        }
        Update: {
          aggregation_radius_miles?: number | null
          area_code?: string
          base_delivery_fee?: number | null
          city?: string | null
          created_at?: string | null
          default_delivery_windows?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_radius_miles?: number | null
          min_orders_for_job?: number | null
          minimum_orders_to_aggregate?: number | null
          minimum_value_to_aggregate?: number | null
          name?: string
          per_mile_fee?: number | null
          state?: string | null
          user_id?: string | null
          volume_discount_tiers?: Json | null
          zip_codes?: string[] | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          amount: number
          approval_notes: string | null
          approved_at: string | null
          contract_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          order_index: number
          paid_at: string | null
          status: string | null
          submission_notes: string | null
          submitted_at: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          approval_notes?: string | null
          approved_at?: string | null
          contract_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index: number
          paid_at?: string | null
          status?: string | null
          submission_notes?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          approval_notes?: string | null
          approved_at?: string | null
          contract_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number
          paid_at?: string | null
          status?: string | null
          submission_notes?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mirror_conduits: {
        Row: {
          candle_cost: number | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          mirror_a_location: string
          mirror_b_location: string
          riddle_clue: string | null
          user_id: string | null
        }
        Insert: {
          candle_cost?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          mirror_a_location: string
          mirror_b_location: string
          riddle_clue?: string | null
          user_id?: string | null
        }
        Update: {
          candle_cost?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          mirror_a_location?: string
          mirror_b_location?: string
          riddle_clue?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      msa_accounts: {
        Row: {
          auto_contribute_percent: number | null
          balance: number | null
          created_at: string | null
          id: string
          member_id: string
          platform_match_eligible: boolean | null
          status: string | null
          stripe_customer_id: string | null
          total_contributed: number | null
          total_platform_match: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_contribute_percent?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          member_id: string
          platform_match_eligible?: boolean | null
          status?: string | null
          stripe_customer_id?: string | null
          total_contributed?: number | null
          total_platform_match?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_contribute_percent?: number | null
          balance?: number | null
          created_at?: string | null
          id?: string
          member_id?: string
          platform_match_eligible?: boolean | null
          status?: string | null
          stripe_customer_id?: string | null
          total_contributed?: number | null
          total_platform_match?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      msa_transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          description: string | null
          destination_type: string | null
          id: string
          source_type: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          description?: string | null
          destination_type?: string | null
          id?: string
          source_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          description?: string | null
          destination_type?: string | null
          id?: string
          source_type?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "msa_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "msa_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "msa_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_msa_account_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      node_activation_log: {
        Row: {
          activated_by: string | null
          activation_timestamp: string | null
          id: string
          node_id: string | null
          notes: string | null
          presold_count: number
          presold_percent: number
          total_demand_signals: number | null
          upfront_revenue: number | null
        }
        Insert: {
          activated_by?: string | null
          activation_timestamp?: string | null
          id?: string
          node_id?: string | null
          notes?: string | null
          presold_count: number
          presold_percent: number
          total_demand_signals?: number | null
          upfront_revenue?: number | null
        }
        Update: {
          activated_by?: string | null
          activation_timestamp?: string | null
          id?: string
          node_id?: string | null
          notes?: string | null
          presold_count?: number
          presold_percent?: number
          total_demand_signals?: number | null
          upfront_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "node_activation_log_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "node_status_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_activation_log_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "service_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_leadership: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_platform_employee: boolean | null
          license_expiry: string | null
          license_number: string | null
          license_type: string | null
          license_verified: boolean | null
          node_id: string | null
          owns_project: boolean | null
          role: string
          rotation_order: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_platform_employee?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          license_verified?: boolean | null
          node_id?: string | null
          owns_project?: boolean | null
          role: string
          rotation_order?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_platform_employee?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string | null
          license_verified?: boolean | null
          node_id?: string | null
          owns_project?: boolean | null
          role?: string
          rotation_order?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_leadership_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "node_status_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_leadership_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "service_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_preorders: {
        Row: {
          completion_amount: number | null
          completion_paid: boolean | null
          created_at: string | null
          id: string
          node_id: string | null
          phase: string
          quantity: number
          requested_date: string | null
          requested_time: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_type: string | null
          status: string
          total_price: number
          unit_price: number
          updated_at: string | null
          upfront_amount: number | null
          upfront_paid: boolean | null
          user_id: string | null
        }
        Insert: {
          completion_amount?: number | null
          completion_paid?: boolean | null
          created_at?: string | null
          id?: string
          node_id?: string | null
          phase?: string
          quantity?: number
          requested_date?: string | null
          requested_time?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_type?: string | null
          status?: string
          total_price: number
          unit_price: number
          updated_at?: string | null
          upfront_amount?: number | null
          upfront_paid?: boolean | null
          user_id?: string | null
        }
        Update: {
          completion_amount?: number | null
          completion_paid?: boolean | null
          created_at?: string | null
          id?: string
          node_id?: string | null
          phase?: string
          quantity?: number
          requested_date?: string | null
          requested_time?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_type?: string | null
          status?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          upfront_amount?: number | null
          upfront_paid?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_preorders_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "node_status_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_preorders_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "service_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          node_type: string | null
          owner_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          node_type?: string | null
          owner_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          node_type?: string | null
          owner_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      noid_applications: {
        Row: {
          applicant_id: string | null
          created_at: string | null
          id: string
          opportunity_id: string | null
          proposal_text: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          proposal_text: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          proposal_text?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noid_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noid_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noid_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "noid_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      noid_opportunities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          poster_id: string | null
          reward_credits: number
          role_type: string
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          poster_id?: string | null
          reward_credits: number
          role_type: string
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          poster_id?: string | null
          reward_credits?: number
          role_type?: string
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noid_opportunities_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noid_opportunities_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      npc_shopkeepers: {
        Row: {
          active_listing_count: number
          created_at: string
          display_name: string
          id: string
          inventory_type: string
          is_active: boolean
          keep_id: string
          owner_member_id: string
          sub_lease_id: string
          total_credits_earned: number
          total_transactions: number
        }
        Insert: {
          active_listing_count?: number
          created_at?: string
          display_name: string
          id?: string
          inventory_type: string
          is_active?: boolean
          keep_id: string
          owner_member_id: string
          sub_lease_id: string
          total_credits_earned?: number
          total_transactions?: number
        }
        Update: {
          active_listing_count?: number
          created_at?: string
          display_name?: string
          id?: string
          inventory_type?: string
          is_active?: boolean
          keep_id?: string
          owner_member_id?: string
          sub_lease_id?: string
          total_credits_earned?: number
          total_transactions?: number
        }
        Relationships: [
          {
            foreignKeyName: "npc_shopkeepers_sub_lease_id_fkey"
            columns: ["sub_lease_id"]
            isOneToOne: false
            referencedRelation: "keep_sub_leases"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          fulfilled: boolean | null
          fulfilled_at: string | null
          id: string
          item_description: string | null
          item_id: string | null
          item_name: string
          item_type: string
          line_total: number | null
          order_id: string
          quantity: number
          unit_price: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fulfilled?: boolean | null
          fulfilled_at?: string | null
          id?: string
          item_description?: string | null
          item_id?: string | null
          item_name: string
          item_type?: string
          line_total?: number | null
          order_id: string
          quantity?: number
          unit_price: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fulfilled?: boolean | null
          fulfilled_at?: string | null
          id?: string
          item_description?: string | null
          item_id?: string | null
          item_name?: string
          item_type?: string
          line_total?: number | null
          order_id?: string
          quantity?: number
          unit_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          credits_used: number | null
          delivered_at: string | null
          id: string
          joules_earned: number | null
          metadata: Json | null
          notes: string | null
          order_number: string
          order_type: string
          ordered_at: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          platform_fee: number | null
          seller_id: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shipping_locale: string | null
          shipping_node_id: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          total_credits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buyer_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          delivered_at?: string | null
          id?: string
          joules_earned?: number | null
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: string
          ordered_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          seller_id?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_locale?: string | null
          shipping_node_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buyer_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          delivered_at?: string | null
          id?: string
          joules_earned?: number | null
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: string
          ordered_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          seller_id?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_locale?: string | null
          shipping_node_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pantry_categories: {
        Row: {
          created_at: string | null
          cuisine: string
          current_bounty_marks: number | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          meal_type: string
          recipe_count: number | null
          style: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cuisine: string
          current_bounty_marks?: number | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          meal_type: string
          recipe_count?: number | null
          style?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cuisine?: string
          current_bounty_marks?: number | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          meal_type?: string
          recipe_count?: number | null
          style?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pantry_collection_recipes: {
        Row: {
          added_at: string | null
          collection_id: string
          id: string
          notes: string | null
          recipe_id: string
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          id?: string
          notes?: string | null
          recipe_id: string
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          id?: string
          notes?: string | null
          recipe_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_collection_recipes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipe_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_early_taster_rewards: {
        Row: {
          badge_earned: string | null
          created_at: string | null
          id: string
          marks_earned: number
          meal_id: string | null
          order_number: number
          reputation_earned: number
          user_id: string
        }
        Insert: {
          badge_earned?: string | null
          created_at?: string | null
          id?: string
          marks_earned: number
          meal_id?: string | null
          order_number: number
          reputation_earned: number
          user_id: string
        }
        Update: {
          badge_earned?: string | null
          created_at?: string | null
          id?: string
          marks_earned?: number
          meal_id?: string | null
          order_number?: number
          reputation_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_early_taster_rewards_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "lmd_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_ingredients_master: {
        Row: {
          aliases: string[] | null
          category: string | null
          common_units: string[] | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          name: string
          normalized_name: string
          user_id: string | null
        }
        Insert: {
          aliases?: string[] | null
          category?: string | null
          common_units?: string[] | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          normalized_name: string
          user_id?: string | null
        }
        Update: {
          aliases?: string[] | null
          category?: string | null
          common_units?: string[] | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          normalized_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pantry_maker_counter: {
        Row: {
          early_rewards_remaining: number | null
          id: number
          total_makers: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          early_rewards_remaining?: number | null
          id?: number
          total_makers?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          early_rewards_remaining?: number | null
          id?: number
          total_makers?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pantry_recipe_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pantry_recipe_ingredients: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          ingredient_name: string
          is_optional: boolean | null
          normalized_name: string | null
          preparation: string | null
          quantity: number | null
          recipe_id: string
          section: string | null
          sort_order: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          ingredient_name: string
          is_optional?: boolean | null
          normalized_name?: string | null
          preparation?: string | null
          quantity?: number | null
          recipe_id: string
          section?: string | null
          sort_order?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          ingredient_name?: string
          is_optional?: boolean | null
          normalized_name?: string | null
          preparation?: string | null
          quantity?: number | null
          recipe_id?: string
          section?: string | null
          sort_order?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_recipe_steps: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          instruction: string
          recipe_id: string
          step_number: number
          tip: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          instruction: string
          recipe_id: string
          step_number: number
          tip?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          instruction?: string
          recipe_id?: string
          step_number?: number
          tip?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_recipe_uses: {
        Row: {
          credit_calculation: Json | null
          credits_awarded: number | null
          id: string
          lmd_meal_id: string | null
          lmd_order_id: string | null
          recipe_id: string
          usage_type: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          credit_calculation?: Json | null
          credits_awarded?: number | null
          id?: string
          lmd_meal_id?: string | null
          lmd_order_id?: string | null
          recipe_id: string
          usage_type?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          credit_calculation?: Json | null
          credits_awarded?: number | null
          id?: string
          lmd_meal_id?: string | null
          lmd_order_id?: string | null
          recipe_id?: string
          usage_type?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pantry_recipe_uses_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_recipe_uses_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_recipe_votes: {
        Row: {
          created_at: string | null
          has_made: boolean | null
          id: string
          made_at: string | null
          made_count: number | null
          photo_url: string | null
          rating: number | null
          recipe_id: string
          review: string | null
          review_at: string | null
          updated_at: string | null
          user_id: string
          vote: number | null
          voted_at: string | null
        }
        Insert: {
          created_at?: string | null
          has_made?: boolean | null
          id?: string
          made_at?: string | null
          made_count?: number | null
          photo_url?: string | null
          rating?: number | null
          recipe_id: string
          review?: string | null
          review_at?: string | null
          updated_at?: string | null
          user_id: string
          vote?: number | null
          voted_at?: string | null
        }
        Update: {
          created_at?: string | null
          has_made?: boolean | null
          id?: string
          made_at?: string | null
          made_count?: number | null
          photo_url?: string | null
          rating?: number | null
          recipe_id?: string
          review?: string | null
          review_at?: string | null
          updated_at?: string | null
          user_id?: string
          vote?: number | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_recipe_votes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_recipe_votes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_recipes: {
        Row: {
          allergens: string[] | null
          approved_at: string | null
          approved_by: string | null
          cook_time_minutes: number | null
          created_at: string | null
          creator_id: string
          credit_cap_reached_at: string | null
          cuisine: string | null
          description: string | null
          dietary_tags: string[] | null
          difficulty: string | null
          escape_velocity_reached: boolean | null
          escape_velocity_reached_at: string | null
          fork_acknowledged_at: string | null
          forked_from_id: string | null
          id: string
          ingredient_hash: string | null
          ip_ledger_hash: string | null
          is_approved: boolean | null
          is_credit_capped: boolean | null
          is_fork: boolean | null
          make_count: number | null
          meal_type: string | null
          photo_url: string | null
          prep_time_minutes: number | null
          rejection_reason: string | null
          save_count: number | null
          servings: number | null
          status: string | null
          title: string
          total_credits_paid: number | null
          total_time_minutes: number | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          vote_count: number | null
        }
        Insert: {
          allergens?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          creator_id: string
          credit_cap_reached_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          escape_velocity_reached?: boolean | null
          escape_velocity_reached_at?: string | null
          fork_acknowledged_at?: string | null
          forked_from_id?: string | null
          id?: string
          ingredient_hash?: string | null
          ip_ledger_hash?: string | null
          is_approved?: boolean | null
          is_credit_capped?: boolean | null
          is_fork?: boolean | null
          make_count?: number | null
          meal_type?: string | null
          photo_url?: string | null
          prep_time_minutes?: number | null
          rejection_reason?: string | null
          save_count?: number | null
          servings?: number | null
          status?: string | null
          title: string
          total_credits_paid?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          vote_count?: number | null
        }
        Update: {
          allergens?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          creator_id?: string
          credit_cap_reached_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          difficulty?: string | null
          escape_velocity_reached?: boolean | null
          escape_velocity_reached_at?: string | null
          fork_acknowledged_at?: string | null
          forked_from_id?: string | null
          id?: string
          ingredient_hash?: string | null
          ip_ledger_hash?: string | null
          is_approved?: boolean | null
          is_credit_capped?: boolean | null
          is_fork?: boolean | null
          make_count?: number | null
          meal_type?: string | null
          photo_url?: string | null
          prep_time_minutes?: number | null
          rejection_reason?: string | null
          save_count?: number | null
          servings?: number | null
          status?: string | null
          title?: string
          total_credits_paid?: number | null
          total_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_recipes_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pantry_recipes_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_taster_counter: {
        Row: {
          early_rewards_remaining: number | null
          id: number
          total_tasters: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          early_rewards_remaining?: number | null
          id?: number
          total_tasters?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          early_rewards_remaining?: number | null
          id?: number
          total_tasters?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patent_allocation_pools: {
        Row: {
          allocation_percent: number
          cap_amount: number | null
          created_at: string | null
          current_allocated: number | null
          cycle_number: number | null
          description: string | null
          id: string
          is_active: boolean | null
          pool_code: string
          pool_name: string
          updated_at: string | null
        }
        Insert: {
          allocation_percent: number
          cap_amount?: number | null
          created_at?: string | null
          current_allocated?: number | null
          cycle_number?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pool_code: string
          pool_name: string
          updated_at?: string | null
        }
        Update: {
          allocation_percent?: number
          cap_amount?: number | null
          created_at?: string | null
          current_allocated?: number | null
          cycle_number?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          pool_code?: string
          pool_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      patent_bucket_allocations: {
        Row: {
          bucket_id: string
          created_at: string | null
          credit_equivalent: number
          id: string
          joule_amount: number
          status: string
          user_id: string | null
          vote_weight: number | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          credit_equivalent: number
          id?: string
          joule_amount: number
          status?: string
          user_id?: string | null
          vote_weight?: number | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          credit_equivalent?: number
          id?: string
          joule_amount?: number
          status?: string
          user_id?: string | null
          vote_weight?: number | null
        }
        Relationships: []
      }
      patent_selections: {
        Row: {
          created_at: string | null
          id: string
          patent_category: string | null
          patent_id: string
          patent_title: string
          selected_at: string | null
          sponsor_commitment_id: string | null
          transfer_date: string | null
          transfer_status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          patent_category?: string | null
          patent_id: string
          patent_title: string
          selected_at?: string | null
          sponsor_commitment_id?: string | null
          transfer_date?: string | null
          transfer_status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          patent_category?: string | null
          patent_id?: string
          patent_title?: string
          selected_at?: string | null
          sponsor_commitment_id?: string | null
          transfer_date?: string | null
          transfer_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_selections_sponsor_commitment_id_fkey"
            columns: ["sponsor_commitment_id"]
            isOneToOne: true
            referencedRelation: "sponsor_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_platform_registry: {
        Row: {
          color: string
          created_at: string | null
          display_name: string
          handle_prefix: string | null
          icon: string
          is_available: boolean | null
          platform: string
          url_pattern: string | null
          url_prefix: string | null
          validation_regex: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          display_name: string
          handle_prefix?: string | null
          icon: string
          is_available?: boolean | null
          platform: string
          url_pattern?: string | null
          url_prefix?: string | null
          validation_regex?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          display_name?: string
          handle_prefix?: string | null
          icon?: string
          is_available?: boolean | null
          platform?: string
          url_pattern?: string | null
          url_prefix?: string | null
          validation_regex?: string | null
        }
        Relationships: []
      }
      pedestal_contributions: {
        Row: {
          amount: number
          contribution_type: string
          created_at: string
          id: string
          ledger_entry_id: string
          member_id: string
          member_total_after: number
          pedestal_id: string
        }
        Insert: {
          amount: number
          contribution_type?: string
          created_at?: string
          id?: string
          ledger_entry_id: string
          member_id: string
          member_total_after: number
          pedestal_id: string
        }
        Update: {
          amount?: number
          contribution_type?: string
          created_at?: string
          id?: string
          ledger_entry_id?: string
          member_id?: string
          member_total_after?: number
          pedestal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedestal_contributions_pedestal_id_fkey"
            columns: ["pedestal_id"]
            isOneToOne: false
            referencedRelation: "pedestals"
            referencedColumns: ["id"]
          },
        ]
      }
      pedestals: {
        Row: {
          created_at: string
          curator_member_id: string
          description: string
          funder_count: number
          id: string
          is_public: boolean
          ledger_section_id: string
          name: string
          public_since: string | null
          status: string
          total_funding: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          curator_member_id: string
          description?: string
          funder_count?: number
          id?: string
          is_public?: boolean
          ledger_section_id: string
          name: string
          public_since?: string | null
          status?: string
          total_funding?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          curator_member_id?: string
          description?: string
          funder_count?: number
          id?: string
          is_public?: boolean
          ledger_section_id?: string
          name?: string
          public_since?: string | null
          status?: string
          total_funding?: number
          updated_at?: string
        }
        Relationships: []
      }
      peer_contracts: {
        Row: {
          acceptor_id: string | null
          created_at: string | null
          creator_id: string | null
          id: string
          joules_collateral: number
          status: string | null
          terms: string
          user_id: string | null
        }
        Insert: {
          acceptor_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          joules_collateral: number
          status?: string | null
          terms: string
          user_id?: string | null
        }
        Update: {
          acceptor_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          joules_collateral?: number
          status?: string | null
          terms?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_contracts_acceptor_id_fkey"
            columns: ["acceptor_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_contracts_acceptor_id_fkey"
            columns: ["acceptor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_contracts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_contracts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      petition_signatures: {
        Row: {
          comment: string | null
          id: string
          petition_id: string
          signed_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          id?: string
          petition_id: string
          signed_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          id?: string
          petition_id?: string
          signed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petition_signatures_petition_id_fkey"
            columns: ["petition_id"]
            isOneToOne: false
            referencedRelation: "petitions"
            referencedColumns: ["id"]
          },
        ]
      }
      petitions: {
        Row: {
          arena_id: string
          author_id: string
          civility_review_passed: boolean | null
          civility_reviewed_by: string | null
          created_at: string | null
          current_signatures: number | null
          description: string
          expires_at: string | null
          id: string
          petition_type: string
          signature_threshold: number
          status: string | null
          target_entity: string | null
          title: string
          town_hall_promoted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          arena_id: string
          author_id: string
          civility_review_passed?: boolean | null
          civility_reviewed_by?: string | null
          created_at?: string | null
          current_signatures?: number | null
          description: string
          expires_at?: string | null
          id?: string
          petition_type?: string
          signature_threshold?: number
          status?: string | null
          target_entity?: string | null
          title: string
          town_hall_promoted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          arena_id?: string
          author_id?: string
          civility_review_passed?: boolean | null
          civility_reviewed_by?: string | null
          created_at?: string | null
          current_signatures?: number | null
          description?: string
          expires_at?: string | null
          id?: string
          petition_type?: string
          signature_threshold?: number
          status?: string | null
          target_entity?: string | null
          title?: string
          town_hall_promoted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "petitions_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_access_records: {
        Row: {
          access_method: string
          accessed_at: string
          exited_at: string | null
          id: string
          ledger_entry_id: string
          member_id: string
          session_duration_minutes: number | null
          special_deck_card_id: string | null
          trunk_id: string
        }
        Insert: {
          access_method: string
          accessed_at?: string
          exited_at?: string | null
          id?: string
          ledger_entry_id: string
          member_id: string
          session_duration_minutes?: number | null
          special_deck_card_id?: string | null
          trunk_id: string
        }
        Update: {
          access_method?: string
          accessed_at?: string
          exited_at?: string | null
          id?: string
          ledger_entry_id?: string
          member_id?: string
          session_duration_minutes?: number | null
          special_deck_card_id?: string | null
          trunk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_access_records_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_mimictrunks: {
        Row: {
          connection_status: string
          created_at: string
          description: string
          dna_chain: Json
          golden_key_plane_id: string | null
          id: string
          last_validated_at: string | null
          ledger_snapshot_id: string
          ledger_snapshot_timestamp: string
          monthly_fee: number
          name: string
          owner_id: string
          owner_type: string
          parent_trunk_id: string | null
          source_code_checksum: string
          special_deck_card_id: string
          suspended_at: string | null
          updated_at: string
          validation_failure_count: number
        }
        Insert: {
          connection_status?: string
          created_at?: string
          description?: string
          dna_chain?: Json
          golden_key_plane_id?: string | null
          id?: string
          last_validated_at?: string | null
          ledger_snapshot_id: string
          ledger_snapshot_timestamp?: string
          monthly_fee?: number
          name: string
          owner_id: string
          owner_type: string
          parent_trunk_id?: string | null
          source_code_checksum?: string
          special_deck_card_id: string
          suspended_at?: string | null
          updated_at?: string
          validation_failure_count?: number
        }
        Update: {
          connection_status?: string
          created_at?: string
          description?: string
          dna_chain?: Json
          golden_key_plane_id?: string | null
          id?: string
          last_validated_at?: string | null
          ledger_snapshot_id?: string
          ledger_snapshot_timestamp?: string
          monthly_fee?: number
          name?: string
          owner_id?: string
          owner_type?: string
          parent_trunk_id?: string | null
          source_code_checksum?: string
          special_deck_card_id?: string
          suspended_at?: string | null
          updated_at?: string
          validation_failure_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "phase_mimictrunks_parent_trunk_id_fkey"
            columns: ["parent_trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_validation_attempts: {
        Row: {
          attempted_at: string
          duration_ms: number
          failed_components: string[]
          id: string
          ledger_entry_id: string
          overall_result: string
          results: Json
          trunk_id: string
        }
        Insert: {
          attempted_at?: string
          duration_ms?: number
          failed_components?: string[]
          id?: string
          ledger_entry_id: string
          overall_result?: string
          results?: Json
          trunk_id: string
        }
        Update: {
          attempted_at?: string
          duration_ms?: number
          failed_components?: string[]
          id?: string
          ledger_entry_id?: string
          overall_result?: string
          results?: Json
          trunk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_validation_attempts_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_drivers: {
        Row: {
          available_days: string[] | null
          created_at: string | null
          creator_share: number | null
          earnings_per_route: number | null
          has_refrigeration: boolean | null
          id: string
          is_active: boolean | null
          monthly_earnings: number | null
          name: string
          route_optimized: boolean | null
          service_area: string[] | null
          updated_at: string | null
          user_id: string | null
          vehicle_capacity: string | null
          vehicle_type: string | null
          weekly_routes: number | null
        }
        Insert: {
          available_days?: string[] | null
          created_at?: string | null
          creator_share?: number | null
          earnings_per_route?: number | null
          has_refrigeration?: boolean | null
          id?: string
          is_active?: boolean | null
          monthly_earnings?: number | null
          name: string
          route_optimized?: boolean | null
          service_area?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_capacity?: string | null
          vehicle_type?: string | null
          weekly_routes?: number | null
        }
        Update: {
          available_days?: string[] | null
          created_at?: string | null
          creator_share?: number | null
          earnings_per_route?: number | null
          has_refrigeration?: boolean | null
          id?: string
          is_active?: boolean | null
          monthly_earnings?: number | null
          name?: string
          route_optimized?: boolean | null
          service_area?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_capacity?: string | null
          vehicle_type?: string | null
          weekly_routes?: number | null
        }
        Relationships: []
      }
      pickup_route_stops: {
        Row: {
          completed_at: string | null
          created_at: string | null
          estimated_arrival: string | null
          id: string
          items: string[] | null
          location_id: string | null
          location_name: string | null
          route_id: string | null
          stop_order: number
          stop_type: string | null
          weight: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          estimated_arrival?: string | null
          id?: string
          items?: string[] | null
          location_id?: string | null
          location_name?: string | null
          route_id?: string | null
          stop_order: number
          stop_type?: string | null
          weight?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          estimated_arrival?: string | null
          id?: string
          items?: string[] | null
          location_id?: string | null
          location_name?: string | null
          route_id?: string | null
          stop_order?: number
          stop_type?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "pickup_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_routes: {
        Row: {
          created_at: string | null
          driver_earnings: number | null
          driver_id: string | null
          estimated_duration: string | null
          fuel_cost: number | null
          id: string
          route_date: string
          status: string | null
          total_miles: number | null
          total_stops: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_earnings?: number | null
          driver_id?: string | null
          estimated_duration?: string | null
          fuel_cost?: number | null
          id?: string
          route_date: string
          status?: string | null
          total_miles?: number | null
          total_stops?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_earnings?: number | null
          driver_id?: string | null
          estimated_duration?: string | null
          fuel_cost?: number | null
          id?: string
          route_date?: string
          status?: string | null
          total_miles?: number | null
          total_stops?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "pickup_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      pioneer_nodes: {
        Row: {
          capabilities: string[] | null
          created_at: string | null
          display_name: string
          equipment_type: string
          id: string
          location_city: string
          location_state: string
          node_number: number
          notes: string | null
          subsidy_claimed: boolean | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          capabilities?: string[] | null
          created_at?: string | null
          display_name: string
          equipment_type: string
          id?: string
          location_city: string
          location_state: string
          node_number?: number
          notes?: string | null
          subsidy_claimed?: boolean | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          capabilities?: string[] | null
          created_at?: string | null
          display_name?: string
          equipment_type?: string
          id?: string
          location_city?: string
          location_state?: string
          node_number?: number
          notes?: string | null
          subsidy_claimed?: boolean | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      plane_entries: {
        Row: {
          can_reenter: boolean
          engagement_seconds: number
          entered_at: string
          exited_at: string | null
          id: string
          key_found: boolean
          member_id: string
          plane_id: string
        }
        Insert: {
          can_reenter?: boolean
          engagement_seconds?: number
          entered_at?: string
          exited_at?: string | null
          id?: string
          key_found?: boolean
          member_id: string
          plane_id: string
        }
        Update: {
          can_reenter?: boolean
          engagement_seconds?: number
          entered_at?: string
          exited_at?: string | null
          id?: string
          key_found?: boolean
          member_id?: string
          plane_id?: string
        }
        Relationships: []
      }
      platform_features: {
        Row: {
          area: string
          created_at: string
          description: string | null
          difficulty_tier: number
          display_name: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          prerequisite_slugs: string[] | null
          route: string | null
          slug: string
        }
        Insert: {
          area: string
          created_at?: string
          description?: string | null
          difficulty_tier?: number
          display_name: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          prerequisite_slugs?: string[] | null
          route?: string | null
          slug: string
        }
        Update: {
          area?: string
          created_at?: string
          description?: string | null
          difficulty_tier?: number
          display_name?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          prerequisite_slugs?: string[] | null
          route?: string | null
          slug?: string
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          active_gleaners_count: number | null
          active_members_30_day: number | null
          avg_creator_retention_rate: number | null
          avg_time_to_first_transaction_hours: number | null
          calculated_by: string | null
          charitable_fund_balance: number | null
          context: Json | null
          created_at: string
          ghost_credits_conversion_rate: number | null
          ghost_credits_total_distributed: number | null
          ghost_credits_total_used: number | null
          gleaning_conversion_rate: number | null
          gleaning_credits_distributed: number | null
          gleaning_credits_earned_through_work: number | null
          id: string
          is_published: boolean | null
          metric_name: string | null
          metric_unit: string | null
          metric_value: number | null
          newcomer_30_day_retention: number | null
          newcomer_churn_rate: number | null
          newcomers_this_period: number | null
          notes: string | null
          operational_fund_balance: number | null
          our_project_success_rate: number | null
          our_time_to_first_transaction_days: number | null
          period_end: string
          period_start: string
          period_type: string
          recorded_at: string | null
          total_members: number | null
          total_transactions: number | null
          treasury_balance: number | null
          user_id: string | null
        }
        Insert: {
          active_gleaners_count?: number | null
          active_members_30_day?: number | null
          avg_creator_retention_rate?: number | null
          avg_time_to_first_transaction_hours?: number | null
          calculated_by?: string | null
          charitable_fund_balance?: number | null
          context?: Json | null
          created_at?: string
          ghost_credits_conversion_rate?: number | null
          ghost_credits_total_distributed?: number | null
          ghost_credits_total_used?: number | null
          gleaning_conversion_rate?: number | null
          gleaning_credits_distributed?: number | null
          gleaning_credits_earned_through_work?: number | null
          id?: string
          is_published?: boolean | null
          metric_name?: string | null
          metric_unit?: string | null
          metric_value?: number | null
          newcomer_30_day_retention?: number | null
          newcomer_churn_rate?: number | null
          newcomers_this_period?: number | null
          notes?: string | null
          operational_fund_balance?: number | null
          our_project_success_rate?: number | null
          our_time_to_first_transaction_days?: number | null
          period_end: string
          period_start: string
          period_type: string
          recorded_at?: string | null
          total_members?: number | null
          total_transactions?: number | null
          treasury_balance?: number | null
          user_id?: string | null
        }
        Update: {
          active_gleaners_count?: number | null
          active_members_30_day?: number | null
          avg_creator_retention_rate?: number | null
          avg_time_to_first_transaction_hours?: number | null
          calculated_by?: string | null
          charitable_fund_balance?: number | null
          context?: Json | null
          created_at?: string
          ghost_credits_conversion_rate?: number | null
          ghost_credits_total_distributed?: number | null
          ghost_credits_total_used?: number | null
          gleaning_conversion_rate?: number | null
          gleaning_credits_distributed?: number | null
          gleaning_credits_earned_through_work?: number | null
          id?: string
          is_published?: boolean | null
          metric_name?: string | null
          metric_unit?: string | null
          metric_value?: number | null
          newcomer_30_day_retention?: number | null
          newcomer_churn_rate?: number | null
          newcomers_this_period?: number | null
          notes?: string | null
          operational_fund_balance?: number | null
          our_project_success_rate?: number | null
          our_time_to_first_transaction_days?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          recorded_at?: string | null
          total_members?: number | null
          total_transactions?: number | null
          treasury_balance?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_status: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          enabled: boolean | null
          id: string
          pillar_id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          enabled?: boolean | null
          id?: string
          pillar_id: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          enabled?: boolean | null
          id?: string
          pillar_id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_achievements: {
        Row: {
          achievement_id: string
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          user_id: string | null
        }
        Insert: {
          achievement_id: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      portfolio_contacts: {
        Row: {
          added_at: string | null
          contact_user_id: string | null
          id: string
          name: string
          notes: string | null
          relationship: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          contact_user_id?: string | null
          id?: string
          name: string
          notes?: string | null
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          contact_user_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          relationship?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      portfolio_inventory: {
        Row: {
          acquired_at: string | null
          id: string
          item_data: Json | null
          item_type: string
          quantity: number | null
          user_id: string | null
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          item_data?: Json | null
          item_type: string
          quantity?: number | null
          user_id?: string | null
        }
        Update: {
          acquired_at?: string | null
          id?: string
          item_data?: Json | null
          item_type?: string
          quantity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      portfolio_maps: {
        Row: {
          discovered_at: string | null
          id: string
          is_treasure_map: boolean | null
          location_id: string
          map_data: Json | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          discovered_at?: string | null
          id?: string
          is_treasure_map?: boolean | null
          location_id: string
          map_data?: Json | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          discovered_at?: string | null
          id?: string
          is_treasure_map?: boolean | null
          location_id?: string
          map_data?: Json | null
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_maps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      portfolio_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      position_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          notes: string | null
          position_id: string
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          position_id: string
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          position_id?: string
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          credits_earned: number | null
          id: string
          impressions: number | null
          last_updated_at: string | null
          likes: number | null
          post_id: string | null
          shares: number | null
          signups_attributed: number | null
          user_id: string | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          credits_earned?: number | null
          id?: string
          impressions?: number | null
          last_updated_at?: string | null
          likes?: number | null
          post_id?: string | null
          shares?: number | null
          signups_attributed?: number | null
          user_id?: string | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          credits_earned?: number | null
          id?: string
          impressions?: number | null
          last_updated_at?: string | null
          likes?: number | null
          post_id?: string | null
          shares?: number | null
          signups_attributed?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      pr_campaigns: {
        Row: {
          article_url: string | null
          credits_matched: number | null
          editor_email: string | null
          email_threshold: number | null
          golden_ticket_puzzle: string | null
          id: string
          last_email_sent_at: string | null
          publication: string
          published_at: string | null
          social_platform: string | null
          status: string | null
          submitted_at: string | null
          title: string
          user_id: string | null
          votes: number | null
        }
        Insert: {
          article_url?: string | null
          credits_matched?: number | null
          editor_email?: string | null
          email_threshold?: number | null
          golden_ticket_puzzle?: string | null
          id?: string
          last_email_sent_at?: string | null
          publication: string
          published_at?: string | null
          social_platform?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          article_url?: string | null
          credits_matched?: number | null
          editor_email?: string | null
          email_threshold?: number | null
          golden_ticket_puzzle?: string | null
          id?: string
          last_email_sent_at?: string | null
          publication?: string
          published_at?: string | null
          social_platform?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          user_id?: string | null
          votes?: number | null
        }
        Relationships: []
      }
      pr_email_log: {
        Row: {
          campaign_id: string | null
          editor_email: string
          email_type: string | null
          id: string
          sent_at: string | null
          user_id: string | null
          vote_count: number
        }
        Insert: {
          campaign_id?: string | null
          editor_email: string
          email_type?: string | null
          id?: string
          sent_at?: string | null
          user_id?: string | null
          vote_count: number
        }
        Update: {
          campaign_id?: string | null
          editor_email?: string
          email_type?: string | null
          id?: string
          sent_at?: string | null
          user_id?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pr_email_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "pr_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_votes: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          credits_spent: number | null
          id: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          credits_spent?: number | null
          id?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          credits_spent?: number | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pr_votes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "pr_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      practical_positions: {
        Row: {
          believed: string
          created_at: string | null
          created_by: string | null
          evidence_basis: Json | null
          id: string
          notable_figures: string[] | null
          position_label: string
          practiced: string | null
          question_id: string
          scholar_level: string | null
          scripture_refs: Json | null
          steelman_opposing: string
          summary: string
          taught: string
          traditions: string[] | null
        }
        Insert: {
          believed: string
          created_at?: string | null
          created_by?: string | null
          evidence_basis?: Json | null
          id?: string
          notable_figures?: string[] | null
          position_label: string
          practiced?: string | null
          question_id: string
          scholar_level?: string | null
          scripture_refs?: Json | null
          steelman_opposing: string
          summary: string
          taught: string
          traditions?: string[] | null
        }
        Update: {
          believed?: string
          created_at?: string | null
          created_by?: string | null
          evidence_basis?: Json | null
          id?: string
          notable_figures?: string[] | null
          position_label?: string
          practiced?: string | null
          question_id?: string
          scholar_level?: string | null
          scripture_refs?: Json | null
          steelman_opposing?: string
          summary?: string
          taught?: string
          traditions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "practical_positions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "practical_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      practical_questions: {
        Row: {
          created_at: string | null
          created_by: string | null
          domain: string
          equal_time_status: string | null
          id: string
          question: string
          related_branches: string[] | null
          scope: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          domain?: string
          equal_time_status?: string | null
          id?: string
          question: string
          related_branches?: string[] | null
          scope?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          domain?: string
          equal_time_status?: string | null
          id?: string
          question?: string
          related_branches?: string[] | null
          scope?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pre_beta_recruits: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          invited_at: string | null
          joined_at: string | null
          name: string | null
          notes: string | null
          source: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          name?: string | null
          notes?: string | null
          source?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          name?: string | null
          notes?: string | null
          source?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_calculations: {
        Row: {
          cost_basis: number
          created_at: string | null
          creator_percent_actual: number | null
          creator_share: number
          dna_compliant: boolean | null
          gross_amount: number
          id: string
          initiative_fund: number
          margin_amount: number
          platform_margin: number
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          cost_basis?: number
          created_at?: string | null
          creator_percent_actual?: number | null
          creator_share: number
          dna_compliant?: boolean | null
          gross_amount: number
          id?: string
          initiative_fund?: number
          margin_amount: number
          platform_margin: number
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          cost_basis?: number
          created_at?: string | null
          creator_percent_actual?: number | null
          creator_share?: number
          dna_compliant?: boolean | null
          gross_amount?: number
          id?: string
          initiative_fund?: number
          margin_amount?: number
          platform_margin?: number
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      print_bounties: {
        Row: {
          card_id: string | null
          created_at: string | null
          delivery_deadline: string
          fulfiller_id: string | null
          id: string
          price_per_unit: number
          production_level: number
          quantity: number
          requester_id: string | null
          status: string | null
          total_marks_locked: number
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          delivery_deadline: string
          fulfiller_id?: string | null
          id?: string
          price_per_unit: number
          production_level: number
          quantity: number
          requester_id?: string | null
          status?: string | null
          total_marks_locked: number
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          delivery_deadline?: string
          fulfiller_id?: string | null
          id?: string
          price_per_unit?: number
          production_level?: number
          quantity?: number
          requester_id?: string | null
          status?: string | null
          total_marks_locked?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_bounties_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "qr_cue_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      private_portfolio_subscriptions: {
        Row: {
          coverage_minutes_earned: number
          id: string
          is_active: boolean
          member_id: string
          source: string
          source_name: string
          source_url: string | null
          subscribed_at: string
        }
        Insert: {
          coverage_minutes_earned?: number
          id?: string
          is_active?: boolean
          member_id: string
          source: string
          source_name: string
          source_url?: string | null
          subscribed_at?: string
        }
        Update: {
          coverage_minutes_earned?: number
          id?: string
          is_active?: boolean
          member_id?: string
          source?: string
          source_name?: string
          source_url?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      production_level_config: {
        Row: {
          description: string | null
          level: number
          max_credits: number | null
          min_credits: number
          multiplier: number | null
          name: string
          user_id: string | null
        }
        Insert: {
          description?: string | null
          level: number
          max_credits?: number | null
          min_credits: number
          multiplier?: number | null
          name: string
          user_id?: string | null
        }
        Update: {
          description?: string | null
          level?: number
          max_credits?: number | null
          min_credits?: number
          multiplier?: number | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      production_levels: {
        Row: {
          created_at: string | null
          current_votes: number | null
          id: string
          level_name: string
          level_number: number
          product_id: string | null
          status: string | null
          unit_price: number | null
          units_count: number | null
          user_id: string | null
          votes_needed: number | null
        }
        Insert: {
          created_at?: string | null
          current_votes?: number | null
          id?: string
          level_name: string
          level_number: number
          product_id?: string | null
          status?: string | null
          unit_price?: number | null
          units_count?: number | null
          user_id?: string | null
          votes_needed?: number | null
        }
        Update: {
          created_at?: string | null
          current_votes?: number | null
          id?: string
          level_name?: string
          level_number?: number
          product_id?: string | null
          status?: string | null
          unit_price?: number | null
          units_count?: number | null
          user_id?: string | null
          votes_needed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          product_sku: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          product_sku?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          product_sku?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_visibility_settings: {
        Row: {
          created_at: string | null
          id: string
          show_badges: boolean | null
          show_credits: boolean | null
          show_email: boolean | null
          show_guild: boolean | null
          show_joules: boolean | null
          show_marks: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_badges?: boolean | null
          show_credits?: boolean | null
          show_email?: boolean | null
          show_guild?: boolean | null
          show_joules?: boolean | null
          show_marks?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          show_badges?: boolean | null
          show_credits?: boolean | null
          show_email?: boolean | null
          show_guild?: boolean | null
          show_joules?: boolean | null
          show_marks?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_streak_days: number | null
          avatar_url: string | null
          created_at: string | null
          credits_balance: number | null
          display_name: string | null
          email: string | null
          fresh_start_count: number | null
          full_name: string | null
          ghost_credit_terms_accepted_at: string | null
          ghost_credit_terms_version: number | null
          guild_level: number | null
          id: string
          is_active: boolean | null
          joules_balance: number | null
          last_active_at: string | null
          last_fresh_start: string | null
          membership_status: string | null
          reputation_score: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_streak_days?: number | null
          avatar_url?: string | null
          created_at?: string | null
          credits_balance?: number | null
          display_name?: string | null
          email?: string | null
          fresh_start_count?: number | null
          full_name?: string | null
          ghost_credit_terms_accepted_at?: string | null
          ghost_credit_terms_version?: number | null
          guild_level?: number | null
          id: string
          is_active?: boolean | null
          joules_balance?: number | null
          last_active_at?: string | null
          last_fresh_start?: string | null
          membership_status?: string | null
          reputation_score?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_streak_days?: number | null
          avatar_url?: string | null
          created_at?: string | null
          credits_balance?: number | null
          display_name?: string | null
          email?: string | null
          fresh_start_count?: number | null
          full_name?: string | null
          ghost_credit_terms_accepted_at?: string | null
          ghost_credit_terms_version?: number | null
          guild_level?: number | null
          id?: string
          is_active?: boolean | null
          joules_balance?: number | null
          last_active_at?: string | null
          last_fresh_start?: string | null
          membership_status?: string | null
          reputation_score?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_backings: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          project_id: string | null
          sponsor_attribution: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          sponsor_attribution?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          sponsor_attribution?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_backings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_backings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_domain_mappings: {
        Row: {
          created_at: string | null
          dns_configured: boolean | null
          domain: string
          id: string
          is_primary: boolean | null
          project_id: string | null
          ssl_status: string | null
          subdomain: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dns_configured?: boolean | null
          domain: string
          id?: string
          is_primary?: boolean | null
          project_id?: string | null
          ssl_status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dns_configured?: boolean | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          project_id?: string | null
          ssl_status?: string | null
          subdomain?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_domain_mappings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_domain_mappings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_funding: {
        Row: {
          amount: number
          created_at: string | null
          funder_id: string | null
          funding_type: string | null
          id: string
          project_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          funder_id?: string | null
          funding_type?: string | null
          id?: string
          project_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          funder_id?: string | null
          funding_type?: string | null
          id?: string
          project_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          project_id: string
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          project_id: string
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          project_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_by: string | null
          invited_email: string
          project_id: string
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email: string
          project_id: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string
          project_id?: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_landing_pages: {
        Row: {
          body_content: string | null
          call_to_action_text: string | null
          call_to_action_type: string | null
          created_at: string | null
          headline: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          project_id: string | null
          segment_slug: string | null
          subheadline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          body_content?: string | null
          call_to_action_text?: string | null
          call_to_action_type?: string | null
          created_at?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          project_id?: string | null
          segment_slug?: string | null
          subheadline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          body_content?: string | null
          call_to_action_text?: string | null
          call_to_action_type?: string | null
          created_at?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          project_id?: string | null
          segment_slug?: string | null
          subheadline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_landing_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_landing_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_lifecycle_stages: {
        Row: {
          entered_at: string | null
          exited_at: string | null
          id: string
          notes: string | null
          project_id: string
          stage: string
          user_id: string | null
        }
        Insert: {
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          notes?: string | null
          project_id: string
          stage: string
          user_id?: string | null
        }
        Update: {
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          stage?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_member_contracts: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          member_id: string | null
          project_id: string | null
          role: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          member_id?: string | null
          project_id?: string | null
          role?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          member_id?: string | null
          project_id?: string | null
          role?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_member_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_member_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_pledges: {
        Row: {
          amount_credits: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          fulfilled_at: string | null
          id: string
          metadata: Json | null
          project_id: string
          refunded_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
          wave_id: string | null
        }
        Insert: {
          amount_credits: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          refunded_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          wave_id?: string | null
        }
        Update: {
          amount_credits?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          refunded_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          wave_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pledges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_pledges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_section_images: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          section_id: string | null
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          section_id?: string | null
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          section_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_sections: {
        Row: {
          content: string | null
          created_at: string | null
          display_order: number | null
          id: string
          project_id: string
          section_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          project_id: string
          section_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          project_id?: string
          section_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_subdomains: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          id: string
          is_active: boolean | null
          project_id: string
          ssl_status: string | null
          subdomain: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          ssl_status?: string | null
          subdomain: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          ssl_status?: string | null
          subdomain?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          credits_reward: number | null
          description: string | null
          due_date: string | null
          id: string
          marks_reward: number | null
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_reward?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          marks_reward?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          credits_reward?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          marks_reward?: number | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_themes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          project_id: string | null
          theme_data: Json | null
          theme_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          theme_data?: Json | null
          theme_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          theme_data?: Json | null
          theme_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_themes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_themes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          backer_count: number | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          current_funding: number | null
          description: string | null
          funding_deadline: string | null
          funding_goal: number | null
          id: string
          medallion_eligible: boolean | null
          name: string
          owner_id: string | null
          status: string | null
          tagline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backer_count?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_funding?: number | null
          description?: string | null
          funding_deadline?: string | null
          funding_goal?: number | null
          id?: string
          medallion_eligible?: boolean | null
          name: string
          owner_id?: string | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backer_count?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          current_funding?: number | null
          description?: string | null
          funding_deadline?: string | null
          funding_goal?: number | null
          id?: string
          medallion_eligible?: boolean | null
          name?: string
          owner_id?: string | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      promotion_attributions: {
        Row: {
          click_source: string | null
          clicker_ghost_id: string | null
          clicker_id: string | null
          conversion_value: number | null
          converted_to_backer: boolean | null
          converted_to_signup: boolean | null
          created_at: string | null
          destination_id: string | null
          id: string
          marks_awarded: number | null
          platform: string | null
          project_id: string
          promoter_id: string
          user_id: string | null
        }
        Insert: {
          click_source?: string | null
          clicker_ghost_id?: string | null
          clicker_id?: string | null
          conversion_value?: number | null
          converted_to_backer?: boolean | null
          converted_to_signup?: boolean | null
          created_at?: string | null
          destination_id?: string | null
          id?: string
          marks_awarded?: number | null
          platform?: string | null
          project_id: string
          promoter_id: string
          user_id?: string | null
        }
        Update: {
          click_source?: string | null
          clicker_ghost_id?: string | null
          clicker_id?: string | null
          conversion_value?: number | null
          converted_to_backer?: boolean | null
          converted_to_signup?: boolean | null
          created_at?: string | null
          destination_id?: string | null
          id?: string
          marks_awarded?: number | null
          platform?: string | null
          project_id?: string
          promoter_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_attributions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "cue_card_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_attributions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "v_user_cue_card_destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          available_start: string | null
          cover_letter: string
          created_at: string | null
          estimated_completion: string | null
          id: string
          listing_id: string
          pricing_type: string | null
          proposed_approach: string | null
          proposed_price: number
          provider_id: string
          requester_notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_start?: string | null
          cover_letter: string
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          listing_id: string
          pricing_type?: string | null
          proposed_approach?: string | null
          proposed_price: number
          provider_id: string
          requester_notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_start?: string | null
          cover_letter?: string
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          listing_id?: string
          pricing_type?: string | null
          proposed_approach?: string | null
          proposed_price?: number
          provider_id?: string
          requester_notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "help_wanted_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      prow_settings: {
        Row: {
          active_cue_card_id: string | null
          created_at: string | null
          cue_card_order: string[] | null
          id: string
          medallion_style: string | null
          medallion_theme: string | null
          preferred_tier: string | null
          share_email: boolean | null
          share_phone: boolean | null
          share_social: Json | null
          show_badges: boolean | null
          show_bounties: boolean | null
          show_contracts: boolean | null
          show_credits: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_cue_card_id?: string | null
          created_at?: string | null
          cue_card_order?: string[] | null
          id?: string
          medallion_style?: string | null
          medallion_theme?: string | null
          preferred_tier?: string | null
          share_email?: boolean | null
          share_phone?: boolean | null
          share_social?: Json | null
          show_badges?: boolean | null
          show_bounties?: boolean | null
          show_contracts?: boolean | null
          show_credits?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_cue_card_id?: string | null
          created_at?: string | null
          cue_card_order?: string[] | null
          id?: string
          medallion_style?: string | null
          medallion_theme?: string | null
          preferred_tier?: string | null
          share_email?: boolean | null
          share_phone?: boolean | null
          share_social?: Json | null
          show_badges?: boolean | null
          show_bounties?: boolean | null
          show_contracts?: boolean | null
          show_credits?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      puzzle_attempts: {
        Row: {
          completed_at: string | null
          coverage_minutes_earned: number
          id: string
          is_active: boolean
          keys_found: string[]
          member_id: string
          progress_percent: number
          puzzle_id: string
          started_at: string
        }
        Insert: {
          completed_at?: string | null
          coverage_minutes_earned?: number
          id?: string
          is_active?: boolean
          keys_found?: string[]
          member_id: string
          progress_percent?: number
          puzzle_id: string
          started_at?: string
        }
        Update: {
          completed_at?: string | null
          coverage_minutes_earned?: number
          id?: string
          is_active?: boolean
          keys_found?: string[]
          member_id?: string
          progress_percent?: number
          puzzle_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_attempts_puzzle_id_fkey"
            columns: ["puzzle_id"]
            isOneToOne: false
            referencedRelation: "real_world_puzzles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_cue_cards: {
        Row: {
          card_type: string
          created_at: string | null
          design_data: Json | null
          id: string
          owner_id: string | null
          project_id: string | null
          qr_hash: string
        }
        Insert: {
          card_type: string
          created_at?: string | null
          design_data?: Json | null
          id?: string
          owner_id?: string | null
          project_id?: string | null
          qr_hash: string
        }
        Update: {
          card_type?: string
          created_at?: string | null
          design_data?: Json | null
          id?: string
          owner_id?: string | null
          project_id?: string | null
          qr_hash?: string
        }
        Relationships: []
      }
      qr_print_bounties: {
        Row: {
          bounty_status: string | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          cue_card_id: string
          id: string
          ip_backing_joules: number | null
          material_type: string | null
          platform_margin_cents: number
          quantity: number
          requester_id: string
          shipping_address: Json
          total_cost_cents: number
          updated_at: string | null
        }
        Insert: {
          bounty_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          cue_card_id: string
          id?: string
          ip_backing_joules?: number | null
          material_type?: string | null
          platform_margin_cents: number
          quantity?: number
          requester_id: string
          shipping_address: Json
          total_cost_cents: number
          updated_at?: string | null
        }
        Update: {
          bounty_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          cue_card_id?: string
          id?: string
          ip_backing_joules?: number | null
          material_type?: string | null
          platform_margin_cents?: number
          quantity?: number
          requester_id?: string
          shipping_address?: Json
          total_cost_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_print_bounties_cue_card_id_fkey"
            columns: ["cue_card_id"]
            isOneToOne: false
            referencedRelation: "cue_card_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      rally_alerts: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          alert_code: string
          id: string
          location: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          alert_code: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          alert_code?: string
          id?: string
          location?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          coverage_minutes_earned: number
          golden_keys_found: number
          id: string
          member_id: string
          percent_complete: number
          plane_id: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          coverage_minutes_earned?: number
          golden_keys_found?: number
          id?: string
          member_id: string
          percent_complete?: number
          plane_id?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          coverage_minutes_earned?: number
          golden_keys_found?: number
          id?: string
          member_id?: string
          percent_complete?: number
          plane_id?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ready_made_bounty_templates: {
        Row: {
          category: string
          created_at: string | null
          full_description: string
          id: string
          is_active: boolean | null
          short_description: string
          suggested_credits_max: number
          suggested_credits_min: number
          target_platforms: string[] | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          full_description: string
          id?: string
          is_active?: boolean | null
          short_description: string
          suggested_credits_max: number
          suggested_credits_min: number
          target_platforms?: string[] | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          full_description?: string
          id?: string
          is_active?: boolean | null
          short_description?: string
          suggested_credits_max?: number
          suggested_credits_min?: number
          target_platforms?: string[] | null
          title?: string
        }
        Relationships: []
      }
      real_leaderboard: {
        Row: {
          category: string
          current_value: number
          id: string
          period_type: string
          rank: number | null
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          category: string
          current_value: number
          id?: string
          period_type: string
          rank?: number | null
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          category?: string
          current_value?: number
          id?: string
          period_type?: string
          rank?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      real_world_puzzles: {
        Row: {
          attempt_count: number
          completion_count: number
          content_reference: Json
          coverage_minutes_reward: number
          created_at: string
          creator_member_id: string
          description: string
          difficulty: string
          expires_at: string | null
          golden_key_chain: Json
          id: string
          island_placement: Json | null
          key_count: number
          ledger_entry_id: string
          location: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          completion_count?: number
          content_reference?: Json
          coverage_minutes_reward?: number
          created_at?: string
          creator_member_id: string
          description?: string
          difficulty?: string
          expires_at?: string | null
          golden_key_chain?: Json
          id?: string
          island_placement?: Json | null
          key_count?: number
          ledger_entry_id: string
          location: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          completion_count?: number
          content_reference?: Json
          coverage_minutes_reward?: number
          created_at?: string
          creator_member_id?: string
          description?: string
          difficulty?: string
          expires_at?: string | null
          golden_key_chain?: Json
          id?: string
          island_placement?: Json | null
          key_count?: number
          ledger_entry_id?: string
          location?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reality_snapshots: {
        Row: {
          active_orders_count: number | null
          created_by: string | null
          description: string | null
          id: string
          member_count: number | null
          metrics_snapshot: Json | null
          name: string | null
          snapshot_at: string | null
          total_revenue: number | null
          user_id: string | null
        }
        Insert: {
          active_orders_count?: number | null
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          metrics_snapshot?: Json | null
          name?: string | null
          snapshot_at?: string | null
          total_revenue?: number | null
          user_id?: string | null
        }
        Update: {
          active_orders_count?: number | null
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          metrics_snapshot?: Json | null
          name?: string | null
          snapshot_at?: string | null
          total_revenue?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      red_carpet_access: {
        Row: {
          category: string | null
          code_expires_at: string | null
          created_at: string | null
          domain: string | null
          email: string | null
          entry_mode: string
          herald_member_id: string | null
          id: string
          medallion_card_id: string | null
          press_outlet_id: string | null
          recipient_id: string | null
          recipient_name: string | null
          referral_code: string | null
          referrer_url: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          verification_attempts: number | null
          verification_code: string | null
          verified_at: string | null
        }
        Insert: {
          category?: string | null
          code_expires_at?: string | null
          created_at?: string | null
          domain?: string | null
          email?: string | null
          entry_mode?: string
          herald_member_id?: string | null
          id?: string
          medallion_card_id?: string | null
          press_outlet_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          referral_code?: string | null
          referrer_url?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verified_at?: string | null
        }
        Update: {
          category?: string | null
          code_expires_at?: string | null
          created_at?: string | null
          domain?: string | null
          email?: string | null
          entry_mode?: string
          herald_member_id?: string | null
          id?: string
          medallion_card_id?: string | null
          press_outlet_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          referral_code?: string | null
          referrer_url?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      reference_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          default_credits: number | null
          default_marks: number | null
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean | null
          skill_required: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_credits?: number | null
          default_marks?: number | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          skill_required?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_credits?: number | null
          default_marks?: number | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean | null
          skill_required?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          bonus_awarded: boolean | null
          bonus_feathers: number | null
          created_at: string | null
          id: string
          referred_user_id: string | null
          referrer_code: string
          referrer_id: string | null
          source_content: string | null
          source_platform: string | null
        }
        Insert: {
          bonus_awarded?: boolean | null
          bonus_feathers?: number | null
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_code: string
          referrer_id?: string | null
          source_content?: string | null
          source_platform?: string | null
        }
        Update: {
          bonus_awarded?: boolean | null
          bonus_feathers?: number | null
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_code?: string
          referrer_id?: string | null
          source_content?: string | null
          source_platform?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referred_at: string | null
          referred_email: string
          referred_id: string | null
          referrer_id: string
          source_pool_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referred_at?: string | null
          referred_email: string
          referred_id?: string | null
          referrer_id: string
          source_pool_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referred_at?: string | null
          referred_email?: string
          referred_id?: string | null
          referrer_id?: string
          source_pool_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      representative_tracking: {
        Row: {
          alignment_tags: string[] | null
          bill_id: string | null
          bill_title: string | null
          created_at: string | null
          district: string | null
          id: string
          office: string
          party: string | null
          representative_name: string
          source_url: string | null
          state: string | null
          user_id: string | null
          vote_cast: string | null
          vote_date: string | null
        }
        Insert: {
          alignment_tags?: string[] | null
          bill_id?: string | null
          bill_title?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          office: string
          party?: string | null
          representative_name: string
          source_url?: string | null
          state?: string | null
          user_id?: string | null
          vote_cast?: string | null
          vote_date?: string | null
        }
        Update: {
          alignment_tags?: string[] | null
          bill_id?: string | null
          bill_title?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          office?: string
          party?: string | null
          representative_name?: string
          source_url?: string | null
          state?: string | null
          user_id?: string | null
          vote_cast?: string | null
          vote_date?: string | null
        }
        Relationships: []
      }
      reputation_ratings: {
        Row: {
          category: string | null
          comment: string | null
          contract_id: string | null
          created_at: string | null
          id: string
          rater_id: string
          rating: number | null
          subject_id: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          comment?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          rater_id: string
          rating?: number | null
          subject_id: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          comment?: string | null
          contract_id?: string | null
          created_at?: string | null
          id?: string
          rater_id?: string
          rating?: number | null
          subject_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reputation_scores: {
        Row: {
          communication: number | null
          created_at: string | null
          id: string
          overall_score: number | null
          quality: number | null
          reliability: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          communication?: number | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          quality?: number | null
          reliability?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          communication?: number | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          quality?: number | null
          reliability?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_access_log: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string | null
          data_scope: string | null
          demographics_accessed: boolean | null
          id: string
          pii_accessed: boolean | null
          records_accessed: number | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string | null
          data_scope?: string | null
          demographics_accessed?: boolean | null
          id?: string
          pii_accessed?: boolean | null
          records_accessed?: number | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string | null
          data_scope?: string | null
          demographics_accessed?: boolean | null
          id?: string
          pii_accessed?: boolean | null
          records_accessed?: number | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_access_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "research_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_commitment_locks: {
        Row: {
          campaign_sent_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          locked_at: string | null
          project_id: string | null
          reason: string | null
          research_accessed_at: string | null
          satisfied_at: string | null
          user_id: string
        }
        Insert: {
          campaign_sent_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_at?: string | null
          project_id?: string | null
          reason?: string | null
          research_accessed_at?: string | null
          satisfied_at?: string | null
          user_id: string
        }
        Update: {
          campaign_sent_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          locked_at?: string | null
          project_id?: string | null
          reason?: string | null
          research_accessed_at?: string | null
          satisfied_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_pool_aggregates: {
        Row: {
          avg_conversion_rate: number | null
          avg_time_to_conversion_minutes: number | null
          avg_time_to_first_click_minutes: number | null
          campaign_count: number | null
          computed_at: string | null
          day_of_week: number | null
          expiration_hours: number | null
          hour_of_day: number | null
          id: string
          initiative_slug: string | null
          template_type: string | null
          total_cards_sent: number | null
          total_clicks: number | null
          total_conversions: number | null
          user_id: string | null
        }
        Insert: {
          avg_conversion_rate?: number | null
          avg_time_to_conversion_minutes?: number | null
          avg_time_to_first_click_minutes?: number | null
          campaign_count?: number | null
          computed_at?: string | null
          day_of_week?: number | null
          expiration_hours?: number | null
          hour_of_day?: number | null
          id?: string
          initiative_slug?: string | null
          template_type?: string | null
          total_cards_sent?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          user_id?: string | null
        }
        Update: {
          avg_conversion_rate?: number | null
          avg_time_to_conversion_minutes?: number | null
          avg_time_to_first_click_minutes?: number | null
          campaign_count?: number | null
          computed_at?: string | null
          day_of_week?: number | null
          expiration_hours?: number | null
          hour_of_day?: number | null
          id?: string
          initiative_slug?: string | null
          template_type?: string | null
          total_cards_sent?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      research_reports: {
        Row: {
          archive_url: string | null
          data_points_count: number | null
          experiment_id: string | null
          factors_measured: Json | null
          generated_at: string | null
          id: string
          is_archived: boolean | null
          net_score_at_generation: number | null
          period_end: string | null
          period_start: string | null
          report_data: Json
          report_title: string | null
          report_type: string
          retain_until: string | null
          size_bytes: number | null
          subscription_id: string
        }
        Insert: {
          archive_url?: string | null
          data_points_count?: number | null
          experiment_id?: string | null
          factors_measured?: Json | null
          generated_at?: string | null
          id?: string
          is_archived?: boolean | null
          net_score_at_generation?: number | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json
          report_title?: string | null
          report_type?: string
          retain_until?: string | null
          size_bytes?: number | null
          subscription_id: string
        }
        Update: {
          archive_url?: string | null
          data_points_count?: number | null
          experiment_id?: string | null
          factors_measured?: Json | null
          generated_at?: string | null
          id?: string
          is_archived?: boolean | null
          net_score_at_generation?: number | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json
          report_title?: string | null
          report_type?: string
          retain_until?: string | null
          size_bytes?: number | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_reports_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "research_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          institution_name: string | null
          irb_approval_number: string | null
          max_active_experiments: number | null
          max_chain_depth: number | null
          max_factors_per_experiment: number | null
          max_stored_reports: number | null
          monthly_rate_cents: number | null
          monthly_rate_credits: number | null
          report_format: string | null
          report_frequency: string | null
          research_purpose: string | null
          status: string
          storage_quota_mb: number | null
          storage_used_mb: number | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          institution_name?: string | null
          irb_approval_number?: string | null
          max_active_experiments?: number | null
          max_chain_depth?: number | null
          max_factors_per_experiment?: number | null
          max_stored_reports?: number | null
          monthly_rate_cents?: number | null
          monthly_rate_credits?: number | null
          report_format?: string | null
          report_frequency?: string | null
          research_purpose?: string | null
          status?: string
          storage_quota_mb?: number | null
          storage_used_mb?: number | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          institution_name?: string | null
          irb_approval_number?: string | null
          max_active_experiments?: number | null
          max_chain_depth?: number | null
          max_factors_per_experiment?: number | null
          max_stored_reports?: number | null
          monthly_rate_cents?: number | null
          monthly_rate_credits?: number | null
          report_format?: string | null
          report_frequency?: string | null
          research_purpose?: string | null
          status?: string
          storage_quota_mb?: number | null
          storage_used_mb?: number | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      research_tier_definitions: {
        Row: {
          api_access: boolean | null
          description: string | null
          display_name: string
          export_formats: string[]
          max_chain_depth: number
          max_experiments: number
          max_factors: number
          max_reports: number
          monthly_credits: number
          monthly_usd_cents: number
          priority_support: boolean | null
          report_frequencies: string[]
          storage_mb: number
          tier: string
        }
        Insert: {
          api_access?: boolean | null
          description?: string | null
          display_name: string
          export_formats: string[]
          max_chain_depth: number
          max_experiments: number
          max_factors: number
          max_reports: number
          monthly_credits: number
          monthly_usd_cents: number
          priority_support?: boolean | null
          report_frequencies: string[]
          storage_mb: number
          tier: string
        }
        Update: {
          api_access?: boolean | null
          description?: string | null
          display_name?: string
          export_formats?: string[]
          max_chain_depth?: number
          max_experiments?: number
          max_factors?: number
          max_reports?: number
          monthly_credits?: number
          monthly_usd_cents?: number
          priority_support?: boolean | null
          report_frequencies?: string[]
          storage_mb?: number
          tier?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          order_id: string | null
          rating: number
          response_at: string | null
          response_by: string | null
          response_text: string | null
          review_type: string
          reviewer_id: string
          status: string | null
          subject_id: string
          title: string | null
          unhelpful_count: number | null
          updated_at: string | null
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          order_id?: string | null
          rating: number
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_type: string
          reviewer_id: string
          status?: string | null
          subject_id: string
          title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          order_id?: string | null
          rating?: number
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_type?: string
          reviewer_id?: string
          status?: string | null
          subject_id?: string
          title?: string | null
          unhelpful_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      round_table_sessions: {
        Row: {
          ended_at: string | null
          id: string
          ledger_entry_id: string
          speaker_history: Json
          started_at: string
          table_id: string
          topic_id: string
          total_minutes_listened: number
          total_minutes_spoken: number
          total_participants: number
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ledger_entry_id: string
          speaker_history?: Json
          started_at?: string
          table_id: string
          topic_id: string
          total_minutes_listened?: number
          total_minutes_spoken?: number
          total_participants?: number
        }
        Update: {
          ended_at?: string | null
          id?: string
          ledger_entry_id?: string
          speaker_history?: Json
          started_at?: string
          table_id?: string
          topic_id?: string
          total_minutes_listened?: number
          total_minutes_spoken?: number
          total_participants?: number
        }
        Relationships: [
          {
            foreignKeyName: "round_table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "round_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      round_tables: {
        Row: {
          active_speaker_id: string | null
          active_speaker_started_at: string | null
          coverage_consumed: Json
          coverage_earned: Json
          created_at: string
          id: string
          ledger_session_id: string
          max_participants: number
          moderator_id: string
          participant_ids: string[]
          session_ended_at: string | null
          session_started_at: string
          status: string
          topic_description: string
          topic_id: string
          topic_name: string
        }
        Insert: {
          active_speaker_id?: string | null
          active_speaker_started_at?: string | null
          coverage_consumed?: Json
          coverage_earned?: Json
          created_at?: string
          id?: string
          ledger_session_id: string
          max_participants?: number
          moderator_id: string
          participant_ids?: string[]
          session_ended_at?: string | null
          session_started_at?: string
          status?: string
          topic_description?: string
          topic_id: string
          topic_name: string
        }
        Update: {
          active_speaker_id?: string | null
          active_speaker_started_at?: string | null
          coverage_consumed?: Json
          coverage_earned?: Json
          created_at?: string
          id?: string
          ledger_session_id?: string
          max_participants?: number
          moderator_id?: string
          participant_ids?: string[]
          session_ended_at?: string | null
          session_started_at?: string
          status?: string
          topic_description?: string
          topic_id?: string
          topic_name?: string
        }
        Relationships: []
      }
      ruprecht_domains: {
        Row: {
          can_be_overridden_by: string[]
          domain_description: string
          requires_process: string
          role: string
          user_id: string | null
        }
        Insert: {
          can_be_overridden_by: string[]
          domain_description: string
          requires_process: string
          role: string
          user_id?: string | null
        }
        Update: {
          can_be_overridden_by?: string[]
          domain_description?: string
          requires_process?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      santa_donations: {
        Row: {
          amount: number
          created_at: string | null
          donor_id: string | null
          id: string
          tier: string
          user_id: string | null
          votes_granted: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          donor_id?: string | null
          id?: string
          tier: string
          user_id?: string | null
          votes_granted: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          donor_id?: string | null
          id?: string
          tier?: string
          user_id?: string | null
          votes_granted?: number
        }
        Relationships: [
          {
            foreignKeyName: "santa_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santa_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      santa_gift_requests: {
        Row: {
          child_age: number
          child_interests: string
          created_at: string | null
          estimated_cost: number
          gift_description: string
          id: string
          requester_id: string | null
          status: string | null
          user_id: string | null
          votes: number | null
        }
        Insert: {
          child_age: number
          child_interests: string
          created_at?: string | null
          estimated_cost: number
          gift_description: string
          id?: string
          requester_id?: string | null
          status?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Update: {
          child_age?: number
          child_interests?: string
          created_at?: string | null
          estimated_cost?: number
          gift_description?: string
          id?: string
          requester_id?: string | null
          status?: string | null
          user_id?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "santa_gift_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santa_gift_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      santa_gifts: {
        Row: {
          category: string
          created_at: string | null
          current_amount: number
          description: string | null
          example_url: string | null
          fulfilled_at: string | null
          funded_at: string | null
          goal_amount: number
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_urgent: boolean | null
          name: string
          recipient_address: string | null
          recipient_child_age: number | null
          recipient_child_name: string | null
          recipient_parent_email: string | null
          recipient_thank_you: string | null
          redemption_code: string | null
          redemption_option: string | null
          status: string
          suggested_by: string | null
          suggested_by_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          current_amount?: number
          description?: string | null
          example_url?: string | null
          fulfilled_at?: string | null
          funded_at?: string | null
          goal_amount: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          name: string
          recipient_address?: string | null
          recipient_child_age?: number | null
          recipient_child_name?: string | null
          recipient_parent_email?: string | null
          recipient_thank_you?: string | null
          redemption_code?: string | null
          redemption_option?: string | null
          status?: string
          suggested_by?: string | null
          suggested_by_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          current_amount?: number
          description?: string | null
          example_url?: string | null
          fulfilled_at?: string | null
          funded_at?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_urgent?: boolean | null
          name?: string
          recipient_address?: string | null
          recipient_child_age?: number | null
          recipient_child_name?: string | null
          recipient_parent_email?: string | null
          recipient_thank_you?: string | null
          redemption_code?: string | null
          redemption_option?: string | null
          status?: string
          suggested_by?: string | null
          suggested_by_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      santa_nominations: {
        Row: {
          created_at: string | null
          handshake_code: string | null
          id: string
          jesper_id: string | null
          nominator_id: string | null
          oops_code: string | null
          purchaser_id: string | null
          reason_card: string
          recipient_address: string
          recipient_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          handshake_code?: string | null
          id?: string
          jesper_id?: string | null
          nominator_id?: string | null
          oops_code?: string | null
          purchaser_id?: string | null
          reason_card: string
          recipient_address: string
          recipient_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          handshake_code?: string | null
          id?: string
          jesper_id?: string | null
          nominator_id?: string | null
          oops_code?: string | null
          purchaser_id?: string | null
          reason_card?: string
          recipient_address?: string
          recipient_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      santa_pledges: {
        Row: {
          amount: number
          created_at: string | null
          gift_id: string | null
          id: string
          paid_at: string | null
          payment_status: string | null
          santa_id: string | null
          stripe_payment_id: string | null
          user_id: string | null
          votes: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          gift_id?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          santa_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
          votes: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          gift_id?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          santa_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string | null
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "santa_pledges_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "santa_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santa_pledges_santa_id_fkey"
            columns: ["santa_id"]
            isOneToOne: false
            referencedRelation: "santas"
            referencedColumns: ["id"]
          },
        ]
      }
      santa_stats: {
        Row: {
          gifts_fulfilled: number | null
          gifts_funded: number | null
          id: string
          total_pledged: number | null
          total_santas: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          gifts_fulfilled?: number | null
          gifts_funded?: number | null
          id?: string
          total_pledged?: number | null
          total_santas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          gifts_fulfilled?: number | null
          gifts_funded?: number | null
          id?: string
          total_pledged?: number | null
          total_santas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      santa_thank_yous: {
        Row: {
          child_name: string | null
          created_at: string | null
          gift_id: string | null
          id: string
          is_public: boolean | null
          message: string
          photo_url: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          child_name?: string | null
          created_at?: string | null
          gift_id?: string | null
          id?: string
          is_public?: boolean | null
          message: string
          photo_url?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          child_name?: string | null
          created_at?: string | null
          gift_id?: string | null
          id?: string
          is_public?: boolean | null
          message?: string
          photo_url?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "santa_thank_yous_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "santa_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      santas: {
        Row: {
          created_at: string | null
          cue_cards_created: number | null
          current_level: string | null
          email: string
          gifts_backed: number | null
          id: string
          name: string
          santa_number: number | null
          total_contributed: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cue_cards_created?: number | null
          current_level?: string | null
          email: string
          gifts_backed?: number | null
          id?: string
          name: string
          santa_number?: number | null
          total_contributed?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cue_cards_created?: number | null
          current_level?: string | null
          email?: string
          gifts_backed?: number | null
          id?: string
          name?: string
          santa_number?: number | null
          total_contributed?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          created_at: string | null
          error_message: string | null
          herald_post_id: string | null
          id: string
          platform: string
          plug_id: string | null
          post_image_url: string | null
          post_text: string
          posted_at: string | null
          retry_count: number | null
          scheduled_for: string
          share_url: string | null
          status: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          herald_post_id?: string | null
          id?: string
          platform: string
          plug_id?: string | null
          post_image_url?: string | null
          post_text: string
          posted_at?: string | null
          retry_count?: number | null
          scheduled_for: string
          share_url?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          herald_post_id?: string | null
          id?: string
          platform?: string
          plug_id?: string | null
          post_image_url?: string | null
          post_text?: string
          posted_at?: string | null
          retry_count?: number | null
          scheduled_for?: string
          share_url?: string | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_herald_post_id_fkey"
            columns: ["herald_post_id"]
            isOneToOne: false
            referencedRelation: "herald_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_plug_id_fkey"
            columns: ["plug_id"]
            isOneToOne: false
            referencedRelation: "social_media_plugs"
            referencedColumns: ["id"]
          },
        ]
      }
      scholar_credentials: {
        Row: {
          created_at: string | null
          degree: string
          field: string
          id: string
          institution: string
          user_id: string
          verification_stamp: string | null
          verified_by_lb: boolean | null
        }
        Insert: {
          created_at?: string | null
          degree: string
          field: string
          id?: string
          institution: string
          user_id: string
          verification_stamp?: string | null
          verified_by_lb?: boolean | null
        }
        Update: {
          created_at?: string | null
          degree?: string
          field?: string
          id?: string
          institution?: string
          user_id?: string
          verification_stamp?: string | null
          verified_by_lb?: boolean | null
        }
        Relationships: []
      }
      seedling_board_settings: {
        Row: {
          board_status: string | null
          created_at: string | null
          current_draft_round: number | null
          draft_window_end: string | null
          draft_window_start: string | null
          id: string
          picks_per_round: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          board_status?: string | null
          created_at?: string | null
          current_draft_round?: number | null
          draft_window_end?: string | null
          draft_window_start?: string | null
          id?: string
          picks_per_round?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          board_status?: string | null
          created_at?: string | null
          current_draft_round?: number | null
          draft_window_end?: string | null
          draft_window_start?: string | null
          id?: string
          picks_per_round?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seedling_pool: {
        Row: {
          created_at: string | null
          display_name: string | null
          draft_position: number | null
          draft_round: number | null
          drafted_at: string | null
          drafted_by: string | null
          email: string
          ghost_profile_id: string | null
          id: string
          in_draft_pool: boolean | null
          interests: string[] | null
          pool_visibility: string | null
          shadow_medallions: Json | null
          skills: string[] | null
          tagline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          draft_position?: number | null
          draft_round?: number | null
          drafted_at?: string | null
          drafted_by?: string | null
          email: string
          ghost_profile_id?: string | null
          id?: string
          in_draft_pool?: boolean | null
          interests?: string[] | null
          pool_visibility?: string | null
          shadow_medallions?: Json | null
          skills?: string[] | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          draft_position?: number | null
          draft_round?: number | null
          drafted_at?: string | null
          drafted_by?: string | null
          email?: string
          ghost_profile_id?: string | null
          id?: string
          in_draft_pool?: boolean | null
          interests?: string[] | null
          pool_visibility?: string | null
          shadow_medallions?: Json | null
          skills?: string[] | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seedling_pool_drafted_by_fkey"
            columns: ["drafted_by"]
            isOneToOne: false
            referencedRelation: "sponsor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_node_types: {
        Row: {
          capacity_unit: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          initiative_id: string | null
          min_presale_percent: number
          name: string
        }
        Insert: {
          capacity_unit?: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          min_presale_percent?: number
          name: string
        }
        Update: {
          capacity_unit?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          min_presale_percent?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_node_types_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiative_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_node_types_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      service_nodes: {
        Row: {
          activation_date: string | null
          activation_threshold: number | null
          address: string | null
          captain_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          creator_share_percent: number | null
          description: string | null
          geo_lat: number | null
          geo_lng: number | null
          id: string
          infrastructure_details: Json | null
          infrastructure_type: string
          name: string
          node_type_id: string | null
          owner_id: string | null
          platform_fee_percent: number | null
          presold_capacity: number | null
          reserved_capacity: number | null
          state: string | null
          status: string
          updated_at: string | null
          weekly_capacity: number
          zip_code: string | null
        }
        Insert: {
          activation_date?: string | null
          activation_threshold?: number | null
          address?: string | null
          captain_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          creator_share_percent?: number | null
          description?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id?: string
          infrastructure_details?: Json | null
          infrastructure_type: string
          name: string
          node_type_id?: string | null
          owner_id?: string | null
          platform_fee_percent?: number | null
          presold_capacity?: number | null
          reserved_capacity?: number | null
          state?: string | null
          status?: string
          updated_at?: string | null
          weekly_capacity?: number
          zip_code?: string | null
        }
        Update: {
          activation_date?: string | null
          activation_threshold?: number | null
          address?: string | null
          captain_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          creator_share_percent?: number | null
          description?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id?: string
          infrastructure_details?: Json | null
          infrastructure_type?: string
          name?: string
          node_type_id?: string | null
          owner_id?: string | null
          platform_fee_percent?: number | null
          presold_capacity?: number | null
          reserved_capacity?: number | null
          state?: string | null
          status?: string
          updated_at?: string | null
          weekly_capacity?: number
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_nodes_node_type_id_fkey"
            columns: ["node_type_id"]
            isOneToOne: false
            referencedRelation: "service_node_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          availability_status: string | null
          average_rating: number | null
          certifications: string[] | null
          completed_jobs: number | null
          created_at: string | null
          description: string | null
          harper_verified: boolean | null
          harper_verified_at: string | null
          hourly_rate: number | null
          id: string
          identity_verified: boolean | null
          minimum_project: number | null
          pricing_model: string | null
          primary_category: string
          provider_name: string
          remote_available: boolean | null
          secondary_categories: string[] | null
          service_area: string | null
          skills: string[] | null
          status: string | null
          tagline: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          average_rating?: number | null
          certifications?: string[] | null
          completed_jobs?: number | null
          created_at?: string | null
          description?: string | null
          harper_verified?: boolean | null
          harper_verified_at?: string | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          minimum_project?: number | null
          pricing_model?: string | null
          primary_category: string
          provider_name: string
          remote_available?: boolean | null
          secondary_categories?: string[] | null
          service_area?: string | null
          skills?: string[] | null
          status?: string | null
          tagline?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          average_rating?: number | null
          certifications?: string[] | null
          completed_jobs?: number | null
          created_at?: string | null
          description?: string | null
          harper_verified?: boolean | null
          harper_verified_at?: string | null
          hourly_rate?: number | null
          id?: string
          identity_verified?: boolean | null
          minimum_project?: number | null
          pricing_model?: string | null
          primary_category?: string
          provider_name?: string
          remote_available?: boolean | null
          secondary_categories?: string[] | null
          service_area?: string | null
          skills?: string[] | null
          status?: string | null
          tagline?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          areas_discovered: string[] | null
          collected_items: Json | null
          duration_seconds: number | null
          emailed_at: string | null
          ended_at: string | null
          entries: Json | null
          exported_at: string | null
          id: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          areas_discovered?: string[] | null
          collected_items?: Json | null
          duration_seconds?: number | null
          emailed_at?: string | null
          ended_at?: string | null
          entries?: Json | null
          exported_at?: string | null
          id?: string
          started_at: string
          user_id?: string | null
        }
        Update: {
          areas_discovered?: string[] | null
          collected_items?: Json | null
          duration_seconds?: number | null
          emailed_at?: string | null
          ended_at?: string | null
          entries?: Json | null
          exported_at?: string | null
          id?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_purchases: {
        Row: {
          id: string
          items_preserved: Json | null
          price_paid: number
          purchased_at: string | null
          session_duration_minutes: number
          user_id: string | null
        }
        Insert: {
          id?: string
          items_preserved?: Json | null
          price_paid: number
          purchased_at?: string | null
          session_duration_minutes: number
          user_id?: string | null
        }
        Update: {
          id?: string
          items_preserved?: Json | null
          price_paid?: number
          purchased_at?: string | null
          session_duration_minutes?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shadow_marks: {
        Row: {
          created_at: string | null
          crystallized_amount: number | null
          crystallized_at: string | null
          current_amount: number
          decay_interval_days: number | null
          decay_rate: number | null
          decay_start_days: number | null
          expires_at: string | null
          id: string
          initial_amount: number
          last_decay_at: string | null
          source_id: string | null
          source_type: string
          status: string
          user_id: string
          votes_needed: number | null
          votes_received: number | null
        }
        Insert: {
          created_at?: string | null
          crystallized_amount?: number | null
          crystallized_at?: string | null
          current_amount: number
          decay_interval_days?: number | null
          decay_rate?: number | null
          decay_start_days?: number | null
          expires_at?: string | null
          id?: string
          initial_amount: number
          last_decay_at?: string | null
          source_id?: string | null
          source_type: string
          status?: string
          user_id: string
          votes_needed?: number | null
          votes_received?: number | null
        }
        Update: {
          created_at?: string | null
          crystallized_amount?: number | null
          crystallized_at?: string | null
          current_amount?: number
          decay_interval_days?: number | null
          decay_rate?: number | null
          decay_start_days?: number | null
          expires_at?: string | null
          id?: string
          initial_amount?: number
          last_decay_at?: string | null
          source_id?: string | null
          source_type?: string
          status?: string
          user_id?: string
          votes_needed?: number | null
          votes_received?: number | null
        }
        Relationships: []
      }
      shadow_medallions: {
        Row: {
          color: string
          converts_to_badge: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color: string
          converts_to_badge?: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          converts_to_badge?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      side_quest_benefits: {
        Row: {
          amount: number
          benefit_type: string
          claim_id: string
          description: string | null
          granted_at: string
          granted_by: string | null
          id: string
          quest_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          benefit_type: string
          claim_id: string
          description?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          quest_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          benefit_type?: string
          claim_id?: string
          description?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          quest_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "side_quest_benefits_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "side_quest_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "side_quest_benefits_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "side_quest_stats"
            referencedColumns: ["quest_id"]
          },
          {
            foreignKeyName: "side_quest_benefits_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "side_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "side_quest_benefits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "credit_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      side_quest_claims: {
        Row: {
          claimed_at: string
          completed_at: string | null
          created_at: string
          credits_awarded: number | null
          expires_at: string | null
          id: string
          joules_awarded: number | null
          marks_cleared: number | null
          progress_percentage: number | null
          proof_description: string | null
          proof_metadata: Json | null
          proof_url: string | null
          quest_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reward_granted: boolean | null
          started_at: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          claimed_at?: string
          completed_at?: string | null
          created_at?: string
          credits_awarded?: number | null
          expires_at?: string | null
          id?: string
          joules_awarded?: number | null
          marks_cleared?: number | null
          progress_percentage?: number | null
          proof_description?: string | null
          proof_metadata?: Json | null
          proof_url?: string | null
          quest_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward_granted?: boolean | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          claimed_at?: string
          completed_at?: string | null
          created_at?: string
          credits_awarded?: number | null
          expires_at?: string | null
          id?: string
          joules_awarded?: number | null
          marks_cleared?: number | null
          progress_percentage?: number | null
          proof_description?: string | null
          proof_metadata?: Json | null
          proof_url?: string | null
          quest_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward_granted?: boolean | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "side_quest_claims_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "side_quest_stats"
            referencedColumns: ["quest_id"]
          },
          {
            foreignKeyName: "side_quest_claims_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "side_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      side_quests: {
        Row: {
          approved_by: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          detailed_instructions: string | null
          difficulty: string
          expires_at: string | null
          featured: boolean | null
          hexisle_xp: number | null
          id: string
          initiative_slug: string | null
          max_claims: number | null
          max_completions_per_user: number | null
          min_membership_days: number | null
          min_reputation_level: number | null
          position_category: string | null
          project_id: string | null
          quest_type: string
          required_guild: string | null
          required_skills: Json | null
          requires_approval: boolean | null
          reward_credits: number | null
          reward_joules: number | null
          reward_marks: number | null
          status: string
          time_limit_hours: number | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          detailed_instructions?: string | null
          difficulty?: string
          expires_at?: string | null
          featured?: boolean | null
          hexisle_xp?: number | null
          id?: string
          initiative_slug?: string | null
          max_claims?: number | null
          max_completions_per_user?: number | null
          min_membership_days?: number | null
          min_reputation_level?: number | null
          position_category?: string | null
          project_id?: string | null
          quest_type?: string
          required_guild?: string | null
          required_skills?: Json | null
          requires_approval?: boolean | null
          reward_credits?: number | null
          reward_joules?: number | null
          reward_marks?: number | null
          status?: string
          time_limit_hours?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          detailed_instructions?: string | null
          difficulty?: string
          expires_at?: string | null
          featured?: boolean | null
          hexisle_xp?: number | null
          id?: string
          initiative_slug?: string | null
          max_claims?: number | null
          max_completions_per_user?: number | null
          min_membership_days?: number | null
          min_reputation_level?: number | null
          position_category?: string | null
          project_id?: string | null
          quest_type?: string
          required_guild?: string | null
          required_skills?: Json | null
          requires_approval?: boolean | null
          reward_credits?: number | null
          reward_joules?: number | null
          reward_marks?: number | null
          status?: string
          time_limit_hours?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "side_quests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "side_quests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      slingshot_pass_throughs: {
        Row: {
          anchor_id: string
          created_at: string | null
          cue_card_id: string | null
          id: string
          ip_hash: string | null
          level: number
          marks_earned: number | null
          referrer_hash: string | null
          user_coupon_id: string | null
          user_coupon_issued: boolean | null
          user_id: string | null
        }
        Insert: {
          anchor_id: string
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          ip_hash?: string | null
          level: number
          marks_earned?: number | null
          referrer_hash?: string | null
          user_coupon_id?: string | null
          user_coupon_issued?: boolean | null
          user_id?: string | null
        }
        Update: {
          anchor_id?: string
          created_at?: string | null
          cue_card_id?: string | null
          id?: string
          ip_hash?: string | null
          level?: number
          marks_earned?: number | null
          referrer_hash?: string | null
          user_coupon_id?: string | null
          user_coupon_issued?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slingshot_pass_throughs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slingshot_pass_throughs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "slingshot_pass_throughs_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slingshot_pass_throughs_cue_card_id_fkey"
            columns: ["cue_card_id"]
            isOneToOne: false
            referencedRelation: "cue_card_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_handle: string | null
          account_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          account_handle?: string | null
          account_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          account_handle?: string | null
          account_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          posts_sent: number | null
          start_date: string | null
          status: string | null
          total_engagement: number | null
          total_posts: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          posts_sent?: number | null
          start_date?: string | null
          status?: string | null
          total_engagement?: number | null
          total_posts?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          posts_sent?: number | null
          start_date?: string | null
          status?: string | null
          total_engagement?: number | null
          total_posts?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_frame_locks: {
        Row: {
          clicks_per_lock: number | null
          contributors: string[] | null
          created_at: string | null
          cue_card_template_id: string | null
          deck_card_id: string | null
          id: string
          is_fully_unlocked: boolean | null
          is_global_pool: boolean | null
          lock_bottom: boolean | null
          lock_left: boolean | null
          lock_right: boolean | null
          lock_top: boolean | null
          total_clicks: number | null
          unlocked_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          clicks_per_lock?: number | null
          contributors?: string[] | null
          created_at?: string | null
          cue_card_template_id?: string | null
          deck_card_id?: string | null
          id?: string
          is_fully_unlocked?: boolean | null
          is_global_pool?: boolean | null
          lock_bottom?: boolean | null
          lock_left?: boolean | null
          lock_right?: boolean | null
          lock_top?: boolean | null
          total_clicks?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          clicks_per_lock?: number | null
          contributors?: string[] | null
          created_at?: string | null
          cue_card_template_id?: string | null
          deck_card_id?: string | null
          id?: string
          is_fully_unlocked?: boolean | null
          is_global_pool?: boolean | null
          lock_bottom?: boolean | null
          lock_left?: boolean | null
          lock_right?: boolean | null
          lock_top?: boolean | null
          total_clicks?: number | null
          unlocked_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_plugs: {
        Row: {
          access_token: string | null
          account_type: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_posted_at: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          post_count: number | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_type?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_posted_at?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          post_count?: number | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_type?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_posted_at?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          post_count?: number | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_plug_features: {
        Row: {
          approval_status: string | null
          color: string | null
          created_at: string | null
          display_name: string
          features: Json | null
          icon: string | null
          id: string
          is_available: boolean | null
          oauth_config: Json | null
          platform: string
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          color?: string | null
          created_at?: string | null
          display_name: string
          features?: Json | null
          icon?: string | null
          id?: string
          is_available?: boolean | null
          oauth_config?: Json | null
          platform: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          color?: string | null
          created_at?: string | null
          display_name?: string
          features?: Json | null
          icon?: string | null
          id?: string
          is_available?: boolean | null
          oauth_config?: Json | null
          platform?: string
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          campaign: string | null
          clue_level: number | null
          content: string
          created_at: string | null
          document_ref: string | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          link_url: string | null
          platform: string
          post_id: string | null
          posted_at: string | null
          scheduled_at: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          clue_level?: number | null
          content: string
          created_at?: string | null
          document_ref?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          platform: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_at: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          clue_level?: number | null
          content?: string
          created_at?: string | null
          document_ref?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          platform?: string
          post_id?: string | null
          posted_at?: string | null
          scheduled_at?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          clicks: number | null
          content_id: string | null
          content_type: string | null
          conversions: number | null
          created_at: string | null
          expires_at: string | null
          ghost_id: string | null
          id: string
          metadata: Json | null
          platform: string
          post_id: string | null
          share_type: string
          share_url: string | null
          shared_at: string | null
          user_id: string | null
        }
        Insert: {
          clicks?: number | null
          content_id?: string | null
          content_type?: string | null
          conversions?: number | null
          created_at?: string | null
          expires_at?: string | null
          ghost_id?: string | null
          id?: string
          metadata?: Json | null
          platform: string
          post_id?: string | null
          share_type: string
          share_url?: string | null
          shared_at?: string | null
          user_id?: string | null
        }
        Update: {
          clicks?: number | null
          content_id?: string | null
          content_type?: string | null
          conversions?: number | null
          created_at?: string | null
          expires_at?: string | null
          ghost_id?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          post_id?: string | null
          share_type?: string
          share_url?: string | null
          shared_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_verifications: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          platform: string
          pool_id: string | null
          post_url: string | null
          sponsor_id: string | null
          user_id: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform: string
          pool_id?: string | null
          post_url?: string | null
          sponsor_id?: string | null
          user_id: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          pool_id?: string | null
          post_url?: string | null
          sponsor_id?: string | null
          user_id?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      source_distribution_packages: {
        Row: {
          dna_chain: Json
          downloaded_at: string | null
          expires_at: string
          generated_at: string
          id: string
          ledger_entry_id: string
          manifest: Json
          member_id: string
          size_bytes: number
          status: string
          trunk_id: string
        }
        Insert: {
          dna_chain?: Json
          downloaded_at?: string | null
          expires_at: string
          generated_at?: string
          id?: string
          ledger_entry_id: string
          manifest?: Json
          member_id: string
          size_bytes?: number
          status?: string
          trunk_id: string
        }
        Update: {
          dna_chain?: Json
          downloaded_at?: string | null
          expires_at?: string
          generated_at?: string
          id?: string
          ledger_entry_id?: string
          manifest?: Json
          member_id?: string
          size_bytes?: number
          status?: string
          trunk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_distribution_packages_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      special_deck_card_links: {
        Row: {
          card_id: string
          id: string
          is_active: boolean
          issued_at: string
          member_id: string
          revoke_reason: string | null
          revoked_at: string | null
          trunk_id: string
        }
        Insert: {
          card_id: string
          id?: string
          is_active?: boolean
          issued_at?: string
          member_id: string
          revoke_reason?: string | null
          revoked_at?: string | null
          trunk_id: string
        }
        Update: {
          card_id?: string
          id?: string
          is_active?: boolean
          issued_at?: string
          member_id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          trunk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_deck_card_links_trunk_id_fkey"
            columns: ["trunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_allocations: {
        Row: {
          contribution_amount: number
          created_at: string | null
          id: string
          initiative_allocations: Json
          members_sponsored: number | null
          membership_allocation: number
          payment_intent_id: string | null
          payment_status: string | null
          platform_fee: number
          sponsor_id: string
          user_id: string | null
        }
        Insert: {
          contribution_amount: number
          created_at?: string | null
          id?: string
          initiative_allocations?: Json
          members_sponsored?: number | null
          membership_allocation: number
          payment_intent_id?: string | null
          payment_status?: string | null
          platform_fee: number
          sponsor_id: string
          user_id?: string | null
        }
        Update: {
          contribution_amount?: number
          created_at?: string | null
          id?: string
          initiative_allocations?: Json
          members_sponsored?: number | null
          membership_allocation?: number
          payment_intent_id?: string | null
          payment_status?: string | null
          platform_fee?: number
          sponsor_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_allocations_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_badges: {
        Row: {
          badge_type: string
          cascade_depth: number | null
          earned_at: string | null
          id: string
          is_visible: boolean | null
          people_sponsored: number
          total_sponsored: number
          user_id: string | null
        }
        Insert: {
          badge_type?: string
          cascade_depth?: number | null
          earned_at?: string | null
          id?: string
          is_visible?: boolean | null
          people_sponsored: number
          total_sponsored: number
          user_id?: string | null
        }
        Update: {
          badge_type?: string
          cascade_depth?: number | null
          earned_at?: string | null
          id?: string
          is_visible?: boolean | null
          people_sponsored?: number
          total_sponsored?: number
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_commitments: {
        Row: {
          amount_paid: number
          created_at: string | null
          delegation_contact: string | null
          delegation_type: string | null
          id: string
          invitation_id: string | null
          patent_selected_id: string | null
          payment_intent_id: string | null
          recipients_count: number | null
          recipients_designated: number | null
          seedling_sponsor_badge_granted: boolean | null
          sponsor_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          delegation_contact?: string | null
          delegation_type?: string | null
          id?: string
          invitation_id?: string | null
          patent_selected_id?: string | null
          payment_intent_id?: string | null
          recipients_count?: number | null
          recipients_designated?: number | null
          seedling_sponsor_badge_granted?: boolean | null
          sponsor_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          delegation_contact?: string | null
          delegation_type?: string | null
          id?: string
          invitation_id?: string | null
          patent_selected_id?: string | null
          payment_intent_id?: string | null
          recipients_count?: number | null
          recipients_designated?: number | null
          seedling_sponsor_badge_granted?: boolean | null
          sponsor_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_commitments_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "sponsor_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_general_pool: {
        Row: {
          created_at: string | null
          id: string
          medallions_available: number
          medallions_claimed: number
          sponsor_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          sponsor_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          sponsor_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_initiative_defaults: {
        Row: {
          created_at: string | null
          default_percentage: number
          description: string | null
          id: string
          initiative_id: string
          initiative_name: string
          is_removable: boolean | null
          min_percentage: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_percentage: number
          description?: string | null
          id?: string
          initiative_id: string
          initiative_name: string
          is_removable?: boolean | null
          min_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_percentage?: number
          description?: string | null
          id?: string
          initiative_id?: string
          initiative_name?: string
          is_removable?: boolean | null
          min_percentage?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_invitations: {
        Row: {
          access_token: string
          committed_at: string | null
          created_at: string | null
          daisy_chain_connections: string[] | null
          exploration_data: Json | null
          first_viewed_at: string | null
          id: string
          letter_file_path: string | null
          recipient_email: string | null
          recipient_name: string
          slug: string
          sponsor_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          committed_at?: string | null
          created_at?: string | null
          daisy_chain_connections?: string[] | null
          exploration_data?: Json | null
          first_viewed_at?: string | null
          id?: string
          letter_file_path?: string | null
          recipient_email?: string | null
          recipient_name: string
          slug: string
          sponsor_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          committed_at?: string | null
          created_at?: string | null
          daisy_chain_connections?: string[] | null
          exploration_data?: Json | null
          first_viewed_at?: string | null
          id?: string
          letter_file_path?: string | null
          recipient_email?: string | null
          recipient_name?: string
          slug?: string
          sponsor_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_locale_pools: {
        Row: {
          created_at: string | null
          id: string
          medallions_available: number
          medallions_claimed: number
          radius_miles: number | null
          sponsor_id: string
          status: string
          target_city: string | null
          target_country: string
          target_state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          radius_miles?: number | null
          sponsor_id: string
          status?: string
          target_city?: string | null
          target_country: string
          target_state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          radius_miles?: number | null
          sponsor_id?: string
          status?: string
          target_city?: string | null
          target_country?: string
          target_state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsor_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_anonymous: boolean | null
          participation_level: string | null
          total_contributed: number | null
          total_members_sponsored: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          participation_level?: string | null
          total_contributed?: number | null
          total_members_sponsored?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          participation_level?: string | null
          total_contributed?: number | null
          total_members_sponsored?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sponsor_requirement_pools: {
        Row: {
          created_at: string | null
          id: string
          medallions_available: number
          medallions_claimed: number
          requirements: Json
          sponsor_id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          requirements: Json
          sponsor_id: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          medallions_available?: number
          medallions_claimed?: number
          requirements?: Json
          sponsor_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sponsored_recipients: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          distribution_mode: string | null
          id: string
          invitation_sent_at: string | null
          medallion_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          requirements_verified_at: string | null
          source_pool_id: string | null
          sponsor_attribution: string | null
          sponsor_commitment_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          distribution_mode?: string | null
          id?: string
          invitation_sent_at?: string | null
          medallion_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          requirements_verified_at?: string | null
          source_pool_id?: string | null
          sponsor_attribution?: string | null
          sponsor_commitment_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          distribution_mode?: string | null
          id?: string
          invitation_sent_at?: string | null
          medallion_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          requirements_verified_at?: string | null
          source_pool_id?: string | null
          sponsor_attribution?: string | null
          sponsor_commitment_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_recipients_medallion_id_fkey"
            columns: ["medallion_id"]
            isOneToOne: false
            referencedRelation: "medallion_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_recipients_sponsor_commitment_id_fkey"
            columns: ["sponsor_commitment_id"]
            isOneToOne: false
            referencedRelation: "sponsor_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_splits: {
        Row: {
          created_at: string | null
          id: string
          source_sponsorship_id: string | null
          split_amount: number
          target_sponsorship_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_sponsorship_id?: string | null
          split_amount: number
          target_sponsorship_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_sponsorship_id?: string | null
          split_amount?: number
          target_sponsorship_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_splits_source_sponsorship_id_fkey"
            columns: ["source_sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorship_splits_target_sponsorship_id_fkey"
            columns: ["target_sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorships: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          credit_amount: number
          cycle_number: number | null
          expires_at: string | null
          id: string
          joule_equivalent: number | null
          pool_id: string | null
          recipient_email: string | null
          recipient_id: string | null
          source_sponsorship_id: string | null
          sponsor_id: string | null
          sponsor_type: string
          status: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          credit_amount: number
          cycle_number?: number | null
          expires_at?: string | null
          id?: string
          joule_equivalent?: number | null
          pool_id?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          source_sponsorship_id?: string | null
          sponsor_id?: string | null
          sponsor_type?: string
          status?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          credit_amount?: number
          cycle_number?: number | null
          expires_at?: string | null
          id?: string
          joule_equivalent?: number | null
          pool_id?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          source_sponsorship_id?: string | null
          sponsor_id?: string | null
          sponsor_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorships_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "patent_allocation_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorships_source_sponsorship_id_fkey"
            columns: ["source_sponsorship_id"]
            isOneToOne: false
            referencedRelation: "sponsorships"
            referencedColumns: ["id"]
          },
        ]
      }
      stamped_cue_cards: {
        Row: {
          card_image_url: string | null
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          custom_text: string | null
          id: string
          medallion_id: string | null
          published_at: string | null
          qr_data_url: string | null
          scheduled_at: string | null
          share_count: number | null
          shared_platforms: string[] | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_image_url?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          custom_text?: string | null
          id?: string
          medallion_id?: string | null
          published_at?: string | null
          qr_data_url?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          shared_platforms?: string[] | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_image_url?: string | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          custom_text?: string | null
          id?: string
          medallion_id?: string | null
          published_at?: string | null
          qr_data_url?: string | null
          scheduled_at?: string | null
          share_count?: number | null
          shared_platforms?: string[] | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamped_cue_cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      stamps: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_anchor_id: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          private_key_hash: string | null
          public_key: string | null
          revoke_reason: string | null
          revoked_at: string | null
          stamp_code: string
          total_cue_cards: number | null
          total_pass_throughs: number | null
          total_scans: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_anchor_id?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          private_key_hash?: string | null
          public_key?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          stamp_code: string
          total_cue_cards?: number | null
          total_pass_throughs?: number | null
          total_scans?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_anchor_id?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          private_key_hash?: string | null
          public_key?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          stamp_code?: string
          total_cue_cards?: number | null
          total_pass_throughs?: number | null
          total_scans?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamps_default_anchor_id_fkey"
            columns: ["default_anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamps_default_anchor_id_fkey"
            columns: ["default_anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "stamps_default_anchor_id_fkey"
            columns: ["default_anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      standing_order_items: {
        Row: {
          created_at: string | null
          id: string
          kit_id: string | null
          kit_name: string
          quantity: number
          servings: number
          standing_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kit_id?: string | null
          kit_name: string
          quantity?: number
          servings?: number
          standing_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kit_id?: string | null
          kit_name?: string
          quantity?: number
          servings?: number
          standing_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standing_order_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "meal_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standing_order_items_standing_order_id_fkey"
            columns: ["standing_order_id"]
            isOneToOne: false
            referencedRelation: "standing_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      standing_orders: {
        Row: {
          advance_notice_days: number | null
          created_at: string | null
          distributor_earnings: number | null
          distributor_id: string | null
          frequency: string
          id: string
          is_active: boolean | null
          is_paused: boolean | null
          member_id: string | null
          next_delivery_date: string | null
          node_id: string | null
          pause_until: string | null
          preferred_day: string | null
          preferred_time_window: string | null
          price_per_serving: number
          pricing_tier: string
          updated_at: string | null
          weekly_total: number | null
        }
        Insert: {
          advance_notice_days?: number | null
          created_at?: string | null
          distributor_earnings?: number | null
          distributor_id?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          member_id?: string | null
          next_delivery_date?: string | null
          node_id?: string | null
          pause_until?: string | null
          preferred_day?: string | null
          preferred_time_window?: string | null
          price_per_serving?: number
          pricing_tier?: string
          updated_at?: string | null
          weekly_total?: number | null
        }
        Update: {
          advance_notice_days?: number | null
          created_at?: string | null
          distributor_earnings?: number | null
          distributor_id?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          is_paused?: boolean | null
          member_id?: string | null
          next_delivery_date?: string | null
          node_id?: string | null
          pause_until?: string | null
          preferred_day?: string | null
          preferred_time_window?: string | null
          price_per_serving?: number
          pricing_tier?: string
          updated_at?: string | null
          weekly_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "standing_orders_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "distribution_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      star_chamber_audit_log: {
        Row: {
          action: string
          actor: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
          verification_id: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
          verification_id?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "star_chamber_audit_log_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "star_chamber_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      star_chamber_verdicts: {
        Row: {
          agent_name: string
          created_at: string | null
          decision: string
          id: string
          proposal_id: string | null
          reasoning: string
          user_id: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          decision: string
          id?: string
          proposal_id?: string | null
          reasoning: string
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          decision?: string
          id?: string
          proposal_id?: string | null
          reasoning?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "star_chamber_verdicts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      star_chamber_verifications: {
        Row: {
          agreement_percentage: number | null
          ai1_agent: string
          ai1_completed_at: string | null
          ai1_output: string | null
          ai2_agent: string
          ai2_completed_at: string | null
          ai2_output: string | null
          comparison_details: Json | null
          content_id: string
          content_type: string
          created_at: string | null
          final_decision: string | null
          human_review_notes: string | null
          human_reviewed_at: string | null
          human_reviewer_id: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agreement_percentage?: number | null
          ai1_agent: string
          ai1_completed_at?: string | null
          ai1_output?: string | null
          ai2_agent: string
          ai2_completed_at?: string | null
          ai2_output?: string | null
          comparison_details?: Json | null
          content_id: string
          content_type: string
          created_at?: string | null
          final_decision?: string | null
          human_review_notes?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agreement_percentage?: number | null
          ai1_agent?: string
          ai1_completed_at?: string | null
          ai1_output?: string | null
          ai2_agent?: string
          ai2_completed_at?: string | null
          ai2_output?: string | null
          comparison_details?: Json | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          final_decision?: string | null
          human_review_notes?: string | null
          human_reviewed_at?: string | null
          human_reviewer_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      steward_pledges: {
        Row: {
          amount_escrowed: number
          created_at: string | null
          id: string
          initiative_id: string
          status: string
          steward_user_id: string
        }
        Insert: {
          amount_escrowed?: number
          created_at?: string | null
          id?: string
          initiative_id: string
          status?: string
          steward_user_id: string
        }
        Update: {
          amount_escrowed?: number
          created_at?: string | null
          id?: string
          initiative_id?: string
          status?: string
          steward_user_id?: string
        }
        Relationships: []
      }
      stewardship_applications: {
        Row: {
          background_summary: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          id_verified: boolean
          initiative_id: string
          latitude: number | null
          legal_name: string
          longitude: number | null
          region_type: string | null
          scenario_responses: Json | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          background_summary?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          id_verified?: boolean
          initiative_id: string
          latitude?: number | null
          legal_name: string
          longitude?: number | null
          region_type?: string | null
          scenario_responses?: Json | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          background_summary?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          id_verified?: boolean
          initiative_id?: string
          latitude?: number | null
          legal_name?: string
          longitude?: number | null
          region_type?: string | null
          scenario_responses?: Json | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      stewardship_backers: {
        Row: {
          application_id: string
          backer_user_id: string
          created_at: string
          id: string
          pledge_amount_credits: number
          relationship_type: string
          status: string
          verified_at: string | null
        }
        Insert: {
          application_id: string
          backer_user_id: string
          created_at?: string
          id?: string
          pledge_amount_credits?: number
          relationship_type: string
          status?: string
          verified_at?: string | null
        }
        Update: {
          application_id?: string
          backer_user_id?: string
          created_at?: string
          id?: string
          pledge_amount_credits?: number
          relationship_type?: string
          status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stewardship_backers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "stewardship_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      structural_bylaws: {
        Row: {
          amendment_requirement: string
          category: string
          created_at: string | null
          description: string
          id: string
          name: string
          protection_level: string
          user_id: string | null
        }
        Insert: {
          amendment_requirement: string
          category: string
          created_at?: string | null
          description: string
          id: string
          name: string
          protection_level: string
          user_id?: string | null
        }
        Update: {
          amendment_requirement?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          protection_level?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subdomain_lockbox_configs: {
        Row: {
          config_data: Json | null
          created_at: string | null
          domain_mapping_id: string | null
          id: string
          is_active: boolean | null
          lockbox_type: string | null
          user_id: string | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          domain_mapping_id?: string | null
          id?: string
          is_active?: boolean | null
          lockbox_type?: string | null
          user_id?: string | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          domain_mapping_id?: string | null
          id?: string
          is_active?: boolean | null
          lockbox_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subdomain_lockbox_configs_domain_mapping_id_fkey"
            columns: ["domain_mapping_id"]
            isOneToOne: false
            referencedRelation: "project_domain_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_feeds: {
        Row: {
          added_at: string
          added_by_member_id: string
          content_count: number
          id: string
          is_active: boolean
          last_content_at: string | null
          pedestal_id: string
          source: string
          source_name: string
          source_url: string | null
        }
        Insert: {
          added_at?: string
          added_by_member_id: string
          content_count?: number
          id?: string
          is_active?: boolean
          last_content_at?: string | null
          pedestal_id: string
          source: string
          source_name: string
          source_url?: string | null
        }
        Update: {
          added_at?: string
          added_by_member_id?: string
          content_count?: number
          id?: string
          is_active?: boolean
          last_content_at?: string | null
          pedestal_id?: string
          source?: string
          source_name?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_feeds_pedestal_id_fkey"
            columns: ["pedestal_id"]
            isOneToOne: false
            referencedRelation: "pedestals"
            referencedColumns: ["id"]
          },
        ]
      }
      suggested_gifts: {
        Row: {
          age_range: string | null
          amazon_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price_estimate: number | null
          target_url: string | null
          times_funded: number | null
          times_suggested: number | null
          user_id: string | null
          walmart_url: string | null
        }
        Insert: {
          age_range?: string | null
          amazon_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price_estimate?: number | null
          target_url?: string | null
          times_funded?: number | null
          times_suggested?: number | null
          user_id?: string | null
          walmart_url?: string | null
        }
        Update: {
          age_range?: string | null
          amazon_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price_estimate?: number | null
          target_url?: string | null
          times_funded?: number | null
          times_suggested?: number | null
          user_id?: string | null
          walmart_url?: string | null
        }
        Relationships: []
      }
      swoop_activation_log: {
        Row: {
          action: string
          created_at: string
          id: string
          initiative_id: string
          notes: string | null
          triggered_by: string | null
          user_id: string | null
          vote_count_at_action: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          initiative_id: string
          notes?: string | null
          triggered_by?: string | null
          user_id?: string | null
          vote_count_at_action: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          initiative_id?: string
          notes?: string | null
          triggered_by?: string | null
          user_id?: string | null
          vote_count_at_action?: number
        }
        Relationships: [
          {
            foreignKeyName: "swoop_activation_log_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "swoop_initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      swoop_initiatives: {
        Row: {
          activation_date: string | null
          created_at: string
          current_votes: number
          deactivation_date: string | null
          description: string | null
          id: string
          initiative_name: string
          initiative_slug: string
          status: string
          threshold: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activation_date?: string | null
          created_at?: string
          current_votes?: number
          deactivation_date?: string | null
          description?: string | null
          id?: string
          initiative_name: string
          initiative_slug: string
          status?: string
          threshold?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activation_date?: string | null
          created_at?: string
          current_votes?: number
          deactivation_date?: string | null
          description?: string | null
          id?: string
          initiative_name?: string
          initiative_slug?: string
          status?: string
          threshold?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      swoop_master_fund: {
        Row: {
          balance: number | null
          id: string
          last_updated: string | null
          stripe_account_id: string | null
          total_allocated: number | null
          total_received: number | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          stripe_account_id?: string | null
          total_allocated?: number | null
          total_received?: number | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          stripe_account_id?: string | null
          total_allocated?: number | null
          total_received?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      swoop_project_updates: {
        Row: {
          author_id: string
          author_name: string
          author_role: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          project_id: string
          title: string | null
          update_type: string | null
          user_id: string | null
        }
        Insert: {
          author_id: string
          author_name: string
          author_role?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          project_id: string
          title?: string | null
          update_type?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          project_id?: string
          title?: string | null
          update_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swoop_project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "swoop_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swoop_project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_swoop_active_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      swoop_project_votes: {
        Row: {
          created_at: string | null
          credit_weight: number | null
          display_name: string | null
          id: string
          project_id: string
          show_support: boolean | null
          user_id: string | null
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          credit_weight?: number | null
          display_name?: string | null
          id?: string
          project_id: string
          show_support?: boolean | null
          user_id?: string | null
          voter_id: string
        }
        Update: {
          created_at?: string | null
          credit_weight?: number | null
          display_name?: string | null
          id?: string
          project_id?: string
          show_support?: boolean | null
          user_id?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swoop_project_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "swoop_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swoop_project_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_swoop_active_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      swoop_projects: {
        Row: {
          activation_date: string | null
          category: string | null
          closed_date: string | null
          closed_reason: string | null
          created_at: string | null
          current_amount: number | null
          description: string
          disbursed_amount: number | null
          featured: boolean | null
          featured_order: number | null
          funded_date: string | null
          goal_amount: number
          id: string
          last_update: string | null
          medical_situation: string
          monthly_needs: Json | null
          nominator_id: string
          nominator_name: string
          project_lead_email: string | null
          project_lead_id: string
          project_lead_name: string
          public_updates: Json | null
          recipient_location: string | null
          recipient_name: string
          recipient_relationship: string | null
          share_image_url: string | null
          short_description: string | null
          slug: string
          status: string | null
          stripe_account_created_at: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          verification_contact_name: string | null
          verification_contact_reached: boolean | null
          verification_contact_relationship: string | null
          verification_date: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_by: string | null
          vote_count: number | null
          vote_threshold: number | null
          voting_started_at: string | null
        }
        Insert: {
          activation_date?: string | null
          category?: string | null
          closed_date?: string | null
          closed_reason?: string | null
          created_at?: string | null
          current_amount?: number | null
          description: string
          disbursed_amount?: number | null
          featured?: boolean | null
          featured_order?: number | null
          funded_date?: string | null
          goal_amount: number
          id?: string
          last_update?: string | null
          medical_situation: string
          monthly_needs?: Json | null
          nominator_id: string
          nominator_name: string
          project_lead_email?: string | null
          project_lead_id: string
          project_lead_name: string
          public_updates?: Json | null
          recipient_location?: string | null
          recipient_name: string
          recipient_relationship?: string | null
          share_image_url?: string | null
          short_description?: string | null
          slug: string
          status?: string | null
          stripe_account_created_at?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          verification_contact_name?: string | null
          verification_contact_reached?: boolean | null
          verification_contact_relationship?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
          vote_count?: number | null
          vote_threshold?: number | null
          voting_started_at?: string | null
        }
        Update: {
          activation_date?: string | null
          category?: string | null
          closed_date?: string | null
          closed_reason?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string
          disbursed_amount?: number | null
          featured?: boolean | null
          featured_order?: number | null
          funded_date?: string | null
          goal_amount?: number
          id?: string
          last_update?: string | null
          medical_situation?: string
          monthly_needs?: Json | null
          nominator_id?: string
          nominator_name?: string
          project_lead_email?: string | null
          project_lead_id?: string
          project_lead_name?: string
          public_updates?: Json | null
          recipient_location?: string | null
          recipient_name?: string
          recipient_relationship?: string | null
          share_image_url?: string | null
          short_description?: string | null
          slug?: string
          status?: string | null
          stripe_account_created_at?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          verification_contact_name?: string | null
          verification_contact_reached?: boolean | null
          verification_contact_relationship?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
          vote_count?: number | null
          vote_threshold?: number | null
          voting_started_at?: string | null
        }
        Relationships: []
      }
      swoop_transactions: {
        Row: {
          amount: number
          created_at: string | null
          from_anonymous: boolean | null
          from_id: string | null
          from_name: string
          from_type: string
          id: string
          notes: string | null
          processed_at: string | null
          project_id: string
          purpose: string
          receipt_uploaded_at: string | null
          receipt_url: string | null
          status: string | null
          stripe_fee: number | null
          stripe_payment_intent_id: string | null
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          to_account_info: string | null
          to_name: string
          to_type: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_anonymous?: boolean | null
          from_id?: string | null
          from_name: string
          from_type: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          project_id: string
          purpose: string
          receipt_uploaded_at?: string | null
          receipt_url?: string | null
          status?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          to_account_info?: string | null
          to_name: string
          to_type: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_anonymous?: boolean | null
          from_id?: string | null
          from_name?: string
          from_type?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          project_id?: string
          purpose?: string
          receipt_uploaded_at?: string | null
          receipt_url?: string | null
          status?: string | null
          stripe_fee?: number | null
          stripe_payment_intent_id?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          to_account_info?: string | null
          to_name?: string
          to_type?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swoop_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "swoop_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swoop_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_swoop_active_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      swoop_votes: {
        Row: {
          created_at: string
          credit_amount: number
          display_name: string
          id: string
          initiative_id: string
          user_id: string
          vote_status: string
        }
        Insert: {
          created_at?: string
          credit_amount: number
          display_name: string
          id?: string
          initiative_id: string
          user_id: string
          vote_status?: string
        }
        Update: {
          created_at?: string
          credit_amount?: number
          display_name?: string
          id?: string
          initiative_id?: string
          user_id?: string
          vote_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "swoop_votes_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "swoop_initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_data_sources: {
        Row: {
          id: string
          last_source_check: string | null
          priority: number | null
          source_changed: boolean | null
          source_query: string | null
          source_table: string
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_source_check?: string | null
          priority?: number | null
          source_changed?: boolean | null
          source_query?: string | null
          source_table: string
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_source_check?: string | null
          priority?: number | null
          source_changed?: boolean | null
          source_query?: string | null
          source_table?: string
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_data_sources_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "sync_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_history: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          id: string
          items_synced: number | null
          status: string | null
          sync_type: string | null
          synced_at: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          items_synced?: number | null
          status?: string | null
          sync_type?: string | null
          synced_at?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          items_synced?: number | null
          status?: string | null
          sync_type?: string | null
          synced_at?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_history_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "sync_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_targets: {
        Row: {
          auto_sync_enabled: boolean | null
          created_at: string | null
          current_hash: string | null
          id: string
          is_stale: boolean | null
          last_sync_hash: string | null
          last_synced_at: string | null
          sync_interval_minutes: number | null
          target_name: string
          target_type: string
          target_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_sync_enabled?: boolean | null
          created_at?: string | null
          current_hash?: string | null
          id: string
          is_stale?: boolean | null
          last_sync_hash?: string | null
          last_synced_at?: string | null
          sync_interval_minutes?: number | null
          target_name: string
          target_type: string
          target_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_sync_enabled?: boolean | null
          created_at?: string | null
          current_hash?: string | null
          id?: string
          is_stale?: boolean | null
          last_sync_hash?: string | null
          last_synced_at?: string | null
          sync_interval_minutes?: number | null
          target_name?: string
          target_type?: string
          target_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_log: {
        Row: {
          agent: string | null
          created_at: string | null
          description: string | null
          duration_ms: number | null
          id: string
          metadata: Json | null
          status: string | null
          task_type: string | null
          user_id: string | null
        }
        Insert: {
          agent?: string | null
          created_at?: string | null
          description?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          task_type?: string | null
          user_id?: string | null
        }
        Update: {
          agent?: string | null
          created_at?: string | null
          description?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          task_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      taste_tester_records: {
        Row: {
          converted_at: string | null
          converted_to_credits: boolean | null
          created_at: string | null
          credits_received: number | null
          id: string
          marks_earned: number | null
          order_id: string | null
          order_number: number
          ordered_at: string | null
          portfolio_recipe_id: string | null
          recipe_id: string | null
          recipe_reached_5k: boolean | null
          recipe_reached_5k_at: string | null
          reputation_earned: number | null
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          converted_to_credits?: boolean | null
          created_at?: string | null
          credits_received?: number | null
          id?: string
          marks_earned?: number | null
          order_id?: string | null
          order_number: number
          ordered_at?: string | null
          portfolio_recipe_id?: string | null
          recipe_id?: string | null
          recipe_reached_5k?: boolean | null
          recipe_reached_5k_at?: string | null
          reputation_earned?: number | null
          user_id: string
        }
        Update: {
          converted_at?: string | null
          converted_to_credits?: boolean | null
          created_at?: string | null
          credits_received?: number | null
          id?: string
          marks_earned?: number | null
          order_id?: string | null
          order_number?: number
          ordered_at?: string | null
          portfolio_recipe_id?: string | null
          recipe_id?: string | null
          recipe_reached_5k?: boolean | null
          recipe_reached_5k_at?: string | null
          reputation_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taste_tester_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "meal_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taste_tester_records_portfolio_recipe_id_fkey"
            columns: ["portfolio_recipe_id"]
            isOneToOne: false
            referencedRelation: "user_recipe_portfolio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taste_tester_records_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taste_tester_records_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      template_attribution: {
        Row: {
          campaign_id: string | null
          clicks_generated: number | null
          conversions_generated: number | null
          created_at: string | null
          creator_id: string
          id: string
          is_derivative: boolean | null
          marks_for_clicks: number | null
          marks_for_conversions: number | null
          marks_for_derivative: number | null
          marks_for_selection: number | null
          marks_for_send: number | null
          marks_paid_at: string | null
          selected_at: string | null
          sent_at: string | null
          template_id: string | null
          total_marks_awarded: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicks_generated?: number | null
          conversions_generated?: number | null
          created_at?: string | null
          creator_id: string
          id?: string
          is_derivative?: boolean | null
          marks_for_clicks?: number | null
          marks_for_conversions?: number | null
          marks_for_derivative?: number | null
          marks_for_selection?: number | null
          marks_for_send?: number | null
          marks_paid_at?: string | null
          selected_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          total_marks_awarded?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          clicks_generated?: number | null
          conversions_generated?: number | null
          created_at?: string | null
          creator_id?: string
          id?: string
          is_derivative?: boolean | null
          marks_for_clicks?: number | null
          marks_for_conversions?: number | null
          marks_for_derivative?: number | null
          marks_for_selection?: number | null
          marks_for_send?: number | null
          marks_paid_at?: string | null
          selected_at?: string | null
          sent_at?: string | null
          template_id?: string | null
          total_marks_awarded?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_scenarios: {
        Row: {
          actual_outcome: Json | null
          created_at: string | null
          description: string | null
          expected_outcome: Json | null
          id: string
          name: string
          parameters: Json | null
          run_at: string | null
          scenario_type: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          actual_outcome?: Json | null
          created_at?: string | null
          description?: string | null
          expected_outcome?: Json | null
          id?: string
          name: string
          parameters?: Json | null
          run_at?: string | null
          scenario_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          actual_outcome?: Json | null
          created_at?: string | null
          description?: string | null
          expected_outcome?: Json | null
          id?: string
          name?: string
          parameters?: Json | null
          run_at?: string | null
          scenario_type?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      thank_you_cards: {
        Row: {
          created_at: string | null
          delivered_with_gift_at: string | null
          donation_id: string | null
          donor_name: string
          donor_vote_id: string | null
          gift_request_id: string | null
          id: string
          is_anonymous: boolean | null
          message: string
          printed_at: string | null
          status: string | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_with_gift_at?: string | null
          donation_id?: string | null
          donor_name: string
          donor_vote_id?: string | null
          gift_request_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          message: string
          printed_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_with_gift_at?: string | null
          donation_id?: string | null
          donor_name?: string
          donor_vote_id?: string | null
          gift_request_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string
          printed_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thank_you_cards_donor_vote_id_fkey"
            columns: ["donor_vote_id"]
            isOneToOne: false
            referencedRelation: "donor_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thank_you_cards_gift_request_id_fkey"
            columns: ["gift_request_id"]
            isOneToOne: false
            referencedRelation: "gift_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_votes: {
        Row: {
          id: string
          theme_id: string
          user_id: string
          vote: number
          voted_at: string | null
        }
        Insert: {
          id?: string
          theme_id: string
          user_id: string
          vote?: number
          voted_at?: string | null
        }
        Update: {
          id?: string
          theme_id?: string
          user_id?: string
          vote?: number
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_votes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "user_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_experiments: {
        Row: {
          chain_depth: number | null
          created_at: string | null
          created_by: string | null
          current_net_score: number | null
          delta_config: Json
          delta_description: string
          delta_type: string
          description: string | null
          extension_number: number | null
          extension_threshold: number | null
          factors: Json
          forked_at: string | null
          forked_from_reality_snapshot_id: string | null
          id: string
          last_computed_at: string | null
          max_extensions: number | null
          name: string
          parent_experiment_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chain_depth?: number | null
          created_at?: string | null
          created_by?: string | null
          current_net_score?: number | null
          delta_config: Json
          delta_description: string
          delta_type: string
          description?: string | null
          extension_number?: number | null
          extension_threshold?: number | null
          factors?: Json
          forked_at?: string | null
          forked_from_reality_snapshot_id?: string | null
          id?: string
          last_computed_at?: string | null
          max_extensions?: number | null
          name: string
          parent_experiment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chain_depth?: number | null
          created_at?: string | null
          created_by?: string | null
          current_net_score?: number | null
          delta_config?: Json
          delta_description?: string
          delta_type?: string
          description?: string | null
          extension_number?: number | null
          extension_threshold?: number | null
          factors?: Json
          forked_at?: string | null
          forked_from_reality_snapshot_id?: string | null
          id?: string
          last_computed_at?: string | null
          max_extensions?: number | null
          name?: string
          parent_experiment_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thought_experiments_parent_experiment_id_fkey"
            columns: ["parent_experiment_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          content_markdown: string | null
          content_url: string | null
          created_at: string | null
          credit_reward: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          module_type: string
          order_index: number | null
          prerequisite_module_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          content_markdown?: string | null
          content_url?: string | null
          created_at?: string | null
          credit_reward?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          module_type: string
          order_index?: number | null
          prerequisite_module_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          content_markdown?: string | null
          content_url?: string | null
          created_at?: string | null
          credit_reward?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          module_type?: string
          order_index?: number | null
          prerequisite_module_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_prerequisite_module_id_fkey"
            columns: ["prerequisite_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed_at: string | null
          credits_awarded: number | null
          id: string
          module_id: string | null
          score: number | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          credits_awarded?: number | null
          id?: string
          module_id?: string | null
          score?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          credits_awarded?: number | null
          id?: string
          module_id?: string | null
          score?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      transparency_metrics: {
        Row: {
          active_gleaners_count: number | null
          active_members_30_day: number | null
          avg_time_to_first_transaction_hours: number | null
          avg_transaction_value: number | null
          calculated_at: string | null
          charitable_fund_balance: number | null
          created_at: string | null
          creator_payout_total: number | null
          etsy_avg_time_to_first_sale_days: number | null
          ghost_credits_conversion_rate: number | null
          ghost_credits_total_distributed: number | null
          ghost_credits_total_used: number | null
          ghost_to_member_conversion_count: number | null
          gleaning_credits_distributed: number | null
          id: string
          kickstarter_avg_project_success_rate: number | null
          newcomer_30_day_retention: number | null
          newcomers_this_period: number | null
          our_project_success_rate: number | null
          our_time_to_first_transaction_days: number | null
          period_end: string
          period_start: string
          platform_margin_total: number | null
          total_members: number | null
          total_transaction_volume: number | null
          total_transactions: number | null
          treasury_balance: number | null
          user_id: string | null
        }
        Insert: {
          active_gleaners_count?: number | null
          active_members_30_day?: number | null
          avg_time_to_first_transaction_hours?: number | null
          avg_transaction_value?: number | null
          calculated_at?: string | null
          charitable_fund_balance?: number | null
          created_at?: string | null
          creator_payout_total?: number | null
          etsy_avg_time_to_first_sale_days?: number | null
          ghost_credits_conversion_rate?: number | null
          ghost_credits_total_distributed?: number | null
          ghost_credits_total_used?: number | null
          ghost_to_member_conversion_count?: number | null
          gleaning_credits_distributed?: number | null
          id?: string
          kickstarter_avg_project_success_rate?: number | null
          newcomer_30_day_retention?: number | null
          newcomers_this_period?: number | null
          our_project_success_rate?: number | null
          our_time_to_first_transaction_days?: number | null
          period_end: string
          period_start: string
          platform_margin_total?: number | null
          total_members?: number | null
          total_transaction_volume?: number | null
          total_transactions?: number | null
          treasury_balance?: number | null
          user_id?: string | null
        }
        Update: {
          active_gleaners_count?: number | null
          active_members_30_day?: number | null
          avg_time_to_first_transaction_hours?: number | null
          avg_transaction_value?: number | null
          calculated_at?: string | null
          charitable_fund_balance?: number | null
          created_at?: string | null
          creator_payout_total?: number | null
          etsy_avg_time_to_first_sale_days?: number | null
          ghost_credits_conversion_rate?: number | null
          ghost_credits_total_distributed?: number | null
          ghost_credits_total_used?: number | null
          ghost_to_member_conversion_count?: number | null
          gleaning_credits_distributed?: number | null
          id?: string
          kickstarter_avg_project_success_rate?: number | null
          newcomer_30_day_retention?: number | null
          newcomers_this_period?: number | null
          our_project_success_rate?: number | null
          our_time_to_first_transaction_days?: number | null
          period_end?: string
          period_start?: string
          platform_margin_total?: number | null
          total_members?: number | null
          total_transaction_volume?: number | null
          total_transactions?: number | null
          treasury_balance?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      treasure_attempts: {
        Row: {
          answer: number | null
          arrived_after_100: boolean
          created_at: string
          email: string
          id: string
          ip_address: string | null
          key_a: string | null
          key_b: string | null
          user_id: string | null
          was_correct: boolean
        }
        Insert: {
          answer?: number | null
          arrived_after_100?: boolean
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          key_a?: string | null
          key_b?: string | null
          user_id?: string | null
          was_correct?: boolean
        }
        Update: {
          answer?: number | null
          arrived_after_100?: boolean
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          key_a?: string | null
          key_b?: string | null
          user_id?: string | null
          was_correct?: boolean
        }
        Relationships: []
      }
      treasure_keys: {
        Row: {
          circle: number
          created_at: string | null
          document_name: string
          document_path: string
          feathers: number
          found_at: string | null
          found_by: string | null
          hiding_method: string | null
          hint: string | null
          id: string
          is_active: boolean | null
          key_word: string
          tier: string
          user_id: string | null
        }
        Insert: {
          circle: number
          created_at?: string | null
          document_name: string
          document_path: string
          feathers: number
          found_at?: string | null
          found_by?: string | null
          hiding_method?: string | null
          hint?: string | null
          id?: string
          is_active?: boolean | null
          key_word: string
          tier: string
          user_id?: string | null
        }
        Update: {
          circle?: number
          created_at?: string | null
          document_name?: string
          document_path?: string
          feathers?: number
          found_at?: string | null
          found_by?: string | null
          hiding_method?: string | null
          hint?: string | null
          id?: string
          is_active?: boolean | null
          key_word?: string
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treasure_map_completions: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number | null
          id: string
          map_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          id?: string
          map_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          id?: string
          map_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasure_map_completions_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "user_treasure_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      treasure_map_purchases: {
        Row: {
          buyer_id: string
          id: string
          map_id: string
          price_paid: number
          purchased_at: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          id?: string
          map_id: string
          price_paid: number
          purchased_at?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          id?: string
          map_id?: string
          price_paid?: number
          purchased_at?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasure_map_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasure_map_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasure_map_purchases_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "treasure_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasure_map_purchases_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasure_map_purchases_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treasure_map_runs: {
        Row: {
          ante_paid: number | null
          beacons_reached: Json | null
          completed_at: string | null
          completion_time_seconds: number | null
          id: string
          map_id: string
          runner_id: string
          started_at: string
          status: string
        }
        Insert: {
          ante_paid?: number | null
          beacons_reached?: Json | null
          completed_at?: string | null
          completion_time_seconds?: number | null
          id?: string
          map_id: string
          runner_id: string
          started_at?: string
          status?: string
        }
        Update: {
          ante_paid?: number | null
          beacons_reached?: Json | null
          completed_at?: string | null
          completion_time_seconds?: number | null
          id?: string
          map_id?: string
          runner_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasure_map_runs_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "treasure_maps"
            referencedColumns: ["id"]
          },
        ]
      }
      treasure_maps: {
        Row: {
          ante_price: number | null
          avg_completion_minutes: number | null
          beacon_ids: string[] | null
          beacons: Json | null
          best_time_at: string | null
          best_time_seconds: number | null
          best_time_user_id: string | null
          created_at: string | null
          creator_earnings: number | null
          creator_id: string | null
          description: string | null
          difficulty_level: number | null
          end_questions: Json | null
          ending_location: string | null
          estimated_time_minutes: number | null
          ghost_creator_id: string | null
          id: string
          is_featured: boolean | null
          is_for_sale: boolean | null
          is_published: boolean | null
          map_type: string | null
          name: string
          price_marks: number | null
          published_at: string | null
          rating_count: number | null
          rating_sum: number | null
          required_candles: number | null
          required_equipment: Json | null
          reward_badge: string | null
          reward_card_id: string | null
          reward_credits: number | null
          reward_marks: number | null
          route_data: Json | null
          starting_location: string | null
          times_completed: number | null
          times_sold: number | null
          times_started: number | null
          title: string | null
          total_runs: number | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          ante_price?: number | null
          avg_completion_minutes?: number | null
          beacon_ids?: string[] | null
          beacons?: Json | null
          best_time_at?: string | null
          best_time_seconds?: number | null
          best_time_user_id?: string | null
          created_at?: string | null
          creator_earnings?: number | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_questions?: Json | null
          ending_location?: string | null
          estimated_time_minutes?: number | null
          ghost_creator_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          is_published?: boolean | null
          map_type?: string | null
          name: string
          price_marks?: number | null
          published_at?: string | null
          rating_count?: number | null
          rating_sum?: number | null
          required_candles?: number | null
          required_equipment?: Json | null
          reward_badge?: string | null
          reward_card_id?: string | null
          reward_credits?: number | null
          reward_marks?: number | null
          route_data?: Json | null
          starting_location?: string | null
          times_completed?: number | null
          times_sold?: number | null
          times_started?: number | null
          title?: string | null
          total_runs?: number | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          ante_price?: number | null
          avg_completion_minutes?: number | null
          beacon_ids?: string[] | null
          beacons?: Json | null
          best_time_at?: string | null
          best_time_seconds?: number | null
          best_time_user_id?: string | null
          created_at?: string | null
          creator_earnings?: number | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_questions?: Json | null
          ending_location?: string | null
          estimated_time_minutes?: number | null
          ghost_creator_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_for_sale?: boolean | null
          is_published?: boolean | null
          map_type?: string | null
          name?: string
          price_marks?: number | null
          published_at?: string | null
          rating_count?: number | null
          rating_sum?: number | null
          required_candles?: number | null
          required_equipment?: Json | null
          reward_badge?: string | null
          reward_card_id?: string | null
          reward_credits?: number | null
          reward_marks?: number | null
          route_data?: Json | null
          starting_location?: string | null
          times_completed?: number | null
          times_sold?: number | null
          times_started?: number | null
          title?: string | null
          total_runs?: number | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasure_maps_ghost_creator_id_fkey"
            columns: ["ghost_creator_id"]
            isOneToOne: false
            referencedRelation: "ghost_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasure_maps_reward_card_id_fkey"
            columns: ["reward_card_id"]
            isOneToOne: false
            referencedRelation: "deck_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      treasure_milestones: {
        Row: {
          created_at: string
          id: string
          milestone: number
          posted_at: string
          social_post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          milestone: number
          posted_at?: string
          social_post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          milestone?: number
          posted_at?: string
          social_post_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      treasure_winners: {
        Row: {
          answer: number
          claimed_at: string
          created_at: string
          email: string
          id: string
          key_a: string
          key_b: string
          marks_awarded: number
          medallion_id: string | null
          rank: number
          tier: string
          user_id: string | null
        }
        Insert: {
          answer: number
          claimed_at?: string
          created_at?: string
          email: string
          id?: string
          key_a: string
          key_b: string
          marks_awarded?: number
          medallion_id?: string | null
          rank: number
          tier: string
          user_id?: string | null
        }
        Update: {
          answer?: number
          claimed_at?: string
          created_at?: string
          email?: string
          id?: string
          key_a?: string
          key_b?: string
          marks_awarded?: number
          medallion_id?: string | null
          rank?: number
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treasury_assets: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string | null
          estimated_value: number
          id: string
          owner_id: string | null
          user_id: string | null
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string | null
          estimated_value: number
          id?: string
          owner_id?: string | null
          user_id?: string | null
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          estimated_value?: number
          id?: string
          owner_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treasury_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treasury_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_meal_plan_shares: {
        Row: {
          can_add_to_aggregate: boolean | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          meal_plan_id: string
          shared_by: string
          tribe_id: string
          user_id: string | null
        }
        Insert: {
          can_add_to_aggregate?: boolean | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          meal_plan_id: string
          shared_by: string
          tribe_id: string
          user_id?: string | null
        }
        Update: {
          can_add_to_aggregate?: boolean | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          meal_plan_id?: string
          shared_by?: string
          tribe_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribe_meal_plan_shares_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "family_meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribe_meal_plan_shares_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_memberships: {
        Row: {
          guild_id: string
          id: string
          is_active: boolean
          joined_at: string
          member_id: string
          role: string
          tribe_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          member_id: string
          role?: string
          tribe_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          member_id?: string
          role?: string
          tribe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_memberships_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribe_memberships_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribes: {
        Row: {
          child_tribe_ids: string[]
          created_at: string
          description: string
          guild_id: string
          id: string
          is_chapter: boolean
          keep_ids: string[]
          leader_id: string
          ledger_section_id: string
          member_count: number
          member_ids: string[]
          monthly_phase_fee: number | null
          name: string
          nesting_depth: number
          parent_tribe_id: string | null
          phase_mimictrunk_id: string | null
          rules_document: string | null
          status: string
          updated_at: string
        }
        Insert: {
          child_tribe_ids?: string[]
          created_at?: string
          description?: string
          guild_id: string
          id?: string
          is_chapter?: boolean
          keep_ids?: string[]
          leader_id: string
          ledger_section_id: string
          member_count?: number
          member_ids?: string[]
          monthly_phase_fee?: number | null
          name: string
          nesting_depth?: number
          parent_tribe_id?: string | null
          phase_mimictrunk_id?: string | null
          rules_document?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          child_tribe_ids?: string[]
          created_at?: string
          description?: string
          guild_id?: string
          id?: string
          is_chapter?: boolean
          keep_ids?: string[]
          leader_id?: string
          ledger_section_id?: string
          member_count?: number
          member_ids?: string[]
          monthly_phase_fee?: number | null
          name?: string
          nesting_depth?: number
          parent_tribe_id?: string | null
          phase_mimictrunk_id?: string | null
          rules_document?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribes_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribes_parent_tribe_id_fkey"
            columns: ["parent_tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribes_phase_mimictrunk_id_fkey"
            columns: ["phase_mimictrunk_id"]
            isOneToOne: false
            referencedRelation: "phase_mimictrunks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievement_badges: {
        Row: {
          badge_category: string | null
          badge_type: string
          created_at: string | null
          description: string | null
          display_order: number | null
          earned_at: string | null
          earned_context: Json | null
          icon: string | null
          id: string
          is_displayed: boolean | null
          metadata: Json | null
          name: string
          points: number | null
          rarity: string | null
          user_id: string
        }
        Insert: {
          badge_category?: string | null
          badge_type: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          earned_at?: string | null
          earned_context?: Json | null
          icon?: string | null
          id?: string
          is_displayed?: boolean | null
          metadata?: Json | null
          name: string
          points?: number | null
          rarity?: string | null
          user_id: string
        }
        Update: {
          badge_category?: string | null
          badge_type?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          earned_at?: string | null
          earned_context?: Json | null
          icon?: string | null
          id?: string
          is_displayed?: boolean | null
          metadata?: Json | null
          name?: string
          points?: number | null
          rarity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_type: string
          activity_value: number | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          activity_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          activity_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_badge_achievements: {
        Row: {
          badge_type: string | null
          chalk_one_builder: boolean | null
          chalk_one_prime: boolean | null
          created_at: string | null
          earned_at: string | null
          id: string
          seedling_sponsor_count: number | null
          user_id: string | null
        }
        Insert: {
          badge_type?: string | null
          chalk_one_builder?: boolean | null
          chalk_one_prime?: boolean | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          seedling_sponsor_count?: number | null
          user_id?: string | null
        }
        Update: {
          badge_type?: string | null
          chalk_one_builder?: boolean | null
          chalk_one_prime?: boolean | null
          created_at?: string | null
          earned_at?: string | null
          id?: string
          seedling_sponsor_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_blocked_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bookshelf_config: {
        Row: {
          category_slug: string
          custom_sort_order: number | null
          id: string
          is_collapsed: boolean | null
          user_id: string
          viewport_offset: number | null
        }
        Insert: {
          category_slug: string
          custom_sort_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          user_id: string
          viewport_offset?: number | null
        }
        Update: {
          category_slug?: string
          custom_sort_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          user_id?: string
          viewport_offset?: number | null
        }
        Relationships: []
      }
      user_candles: {
        Row: {
          babylon_amount: number | null
          created_at: string | null
          id: string
          last_regeneration: string | null
          regeneration_count: number | null
          standard_amount: number | null
          user_id: string
        }
        Insert: {
          babylon_amount?: number | null
          created_at?: string | null
          id?: string
          last_regeneration?: string | null
          regeneration_count?: number | null
          standard_amount?: number | null
          user_id: string
        }
        Update: {
          babylon_amount?: number | null
          created_at?: string | null
          id?: string
          last_regeneration?: string | null
          regeneration_count?: number | null
          standard_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_candles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_candles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_card_placements: {
        Row: {
          card_slug: string
          category_slug: string
          id: string
          placed_at: string | null
          slot_index: number
          user_id: string
        }
        Insert: {
          card_slug: string
          category_slug: string
          id?: string
          placed_at?: string | null
          slot_index: number
          user_id: string
        }
        Update: {
          card_slug?: string
          category_slug?: string
          id?: string
          placed_at?: string | null
          slot_index?: number
          user_id?: string
        }
        Relationships: []
      }
      user_conduit_progress: {
        Row: {
          conduit_id: string
          discovered_at: string | null
          id: string
          last_used_at: string | null
          times_used: number | null
          user_id: string
        }
        Insert: {
          conduit_id: string
          discovered_at?: string | null
          id?: string
          last_used_at?: string | null
          times_used?: number | null
          user_id: string
        }
        Update: {
          conduit_id?: string
          discovered_at?: string | null
          id?: string
          last_used_at?: string | null
          times_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conduit_progress_conduit_id_fkey"
            columns: ["conduit_id"]
            isOneToOne: false
            referencedRelation: "mirror_conduits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_conduit_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_conduit_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_content_preferences: {
        Row: {
          age_verified: boolean
          age_verified_at: string | null
          content_level: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verification_method: string | null
        }
        Insert: {
          age_verified?: boolean
          age_verified_at?: string | null
          content_level?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          verification_method?: string | null
        }
        Update: {
          age_verified?: boolean
          age_verified_at?: string | null
          content_level?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verification_method?: string | null
        }
        Relationships: []
      }
      user_content_rating: {
        Row: {
          created_at: string | null
          current_rating: string | null
          id: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_rating?: string | null
          id?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_rating?: string | null
          id?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_content_rating_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_content_rating_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contracts: {
        Row: {
          contract_type: string | null
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_cottage_law_status: {
        Row: {
          approaching_threshold: boolean | null
          cert_expires: string | null
          cert_number: string | null
          current_annual_revenue: number | null
          current_monthly_revenue: number | null
          current_weekly_output: number | null
          has_food_handler_cert: boolean | null
          has_permit: boolean | null
          id: string
          over_threshold: boolean | null
          permit_expires: string | null
          permit_number: string | null
          state_code: string
          threshold_alert_sent_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approaching_threshold?: boolean | null
          cert_expires?: string | null
          cert_number?: string | null
          current_annual_revenue?: number | null
          current_monthly_revenue?: number | null
          current_weekly_output?: number | null
          has_food_handler_cert?: boolean | null
          has_permit?: boolean | null
          id?: string
          over_threshold?: boolean | null
          permit_expires?: string | null
          permit_number?: string | null
          state_code: string
          threshold_alert_sent_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approaching_threshold?: boolean | null
          cert_expires?: string | null
          cert_number?: string | null
          current_annual_revenue?: number | null
          current_monthly_revenue?: number | null
          current_weekly_output?: number | null
          has_food_handler_cert?: boolean | null
          has_permit?: boolean | null
          id?: string
          over_threshold?: boolean | null
          permit_expires?: string | null
          permit_number?: string | null
          state_code?: string
          threshold_alert_sent_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          anchor_id: string | null
          converted_at: string | null
          converted_to_member: boolean | null
          coupon_code: string
          created_at: string | null
          discount_type: string | null
          enforces_cost_plus: boolean | null
          expires_at: string
          id: string
          is_active: boolean | null
          pass_through_id: string | null
          scope: string | null
          used_transactions: number | null
          user_id: string | null
          valid_transactions: number | null
        }
        Insert: {
          anchor_id?: string | null
          converted_at?: string | null
          converted_to_member?: boolean | null
          coupon_code: string
          created_at?: string | null
          discount_type?: string | null
          enforces_cost_plus?: boolean | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          pass_through_id?: string | null
          scope?: string | null
          used_transactions?: number | null
          user_id?: string | null
          valid_transactions?: number | null
        }
        Update: {
          anchor_id?: string | null
          converted_at?: string | null
          converted_to_member?: boolean | null
          coupon_code?: string
          created_at?: string | null
          discount_type?: string | null
          enforces_cost_plus?: boolean | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          pass_through_id?: string | null
          scope?: string | null
          used_transactions?: number | null
          user_id?: string | null
          valid_transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_c20_reciprocity_leaderboard"
            referencedColumns: ["anchor_id"]
          },
          {
            foreignKeyName: "user_coupons_anchor_id_fkey"
            columns: ["anchor_id"]
            isOneToOne: false
            referencedRelation: "v_certified_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_pass_through_id_fkey"
            columns: ["pass_through_id"]
            isOneToOne: false
            referencedRelation: "slingshot_pass_throughs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credit_markers: {
        Row: {
          credits_awarded: number
          earned_at: string | null
          id: string
          marker_id: string | null
          user_id: string | null
        }
        Insert: {
          credits_awarded: number
          earned_at?: string | null
          id?: string
          marker_id?: string | null
          user_id?: string | null
        }
        Update: {
          credits_awarded?: number
          earned_at?: string | null
          id?: string
          marker_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_credit_markers_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "credit_markers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          contribution_credits: number | null
          created_at: string | null
          earned_credits: number | null
          eoi_credits: number | null
          eoi_used_credits: number | null
          first_transaction_at: string | null
          gleaning_credits_earned: number | null
          gleaning_credits_received: number | null
          gleaning_period_end: string | null
          gleaning_period_start: string | null
          graduated_from_gleaning_at: string | null
          id: string
          initial_credit_accepted: boolean | null
          is_gleaner: boolean | null
          last_activity_at: string | null
          total_credits: number | null
          updated_at: string | null
          used_credits: number | null
          user_id: string | null
        }
        Insert: {
          contribution_credits?: number | null
          created_at?: string | null
          earned_credits?: number | null
          eoi_credits?: number | null
          eoi_used_credits?: number | null
          first_transaction_at?: string | null
          gleaning_credits_earned?: number | null
          gleaning_credits_received?: number | null
          gleaning_period_end?: string | null
          gleaning_period_start?: string | null
          graduated_from_gleaning_at?: string | null
          id?: string
          initial_credit_accepted?: boolean | null
          is_gleaner?: boolean | null
          last_activity_at?: string | null
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id?: string | null
        }
        Update: {
          contribution_credits?: number | null
          created_at?: string | null
          earned_credits?: number | null
          eoi_credits?: number | null
          eoi_used_credits?: number | null
          first_transaction_at?: string | null
          gleaning_credits_earned?: number | null
          gleaning_credits_received?: number | null
          gleaning_period_end?: string | null
          gleaning_period_start?: string | null
          graduated_from_gleaning_at?: string | null
          id?: string
          initial_credit_accepted?: boolean | null
          is_gleaner?: boolean | null
          last_activity_at?: string | null
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_discovery_state: {
        Row: {
          card_slug: string | null
          category_slug: string
          discovered_at: string | null
          id: string
          stamp_id: string | null
          user_id: string
        }
        Insert: {
          card_slug?: string | null
          category_slug: string
          discovered_at?: string | null
          id?: string
          stamp_id?: string | null
          user_id: string
        }
        Update: {
          card_slug?: string | null
          category_slug?: string
          discovered_at?: string | null
          id?: string
          stamp_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_discovery_state_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "acknowledgment_stamps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feathers: {
        Row: {
          achievements: string[] | null
          circles_completed: number[] | null
          created_at: string | null
          id: string
          keys_found: string[] | null
          total_feathers: number | null
          updated_at: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          circles_completed?: number[] | null
          created_at?: string | null
          id?: string
          keys_found?: string[] | null
          total_feathers?: number | null
          updated_at?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          circles_completed?: number[] | null
          created_at?: string | null
          id?: string
          keys_found?: string[] | null
          total_feathers?: number | null
          updated_at?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_feature_discovery: {
        Row: {
          created_at: string
          discovery_level: string
          feature_area: string
          feature_slug: string
          first_seen_at: string | null
          first_used_at: string | null
          id: string
          last_used_at: string | null
          updated_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          discovery_level?: string
          feature_area: string
          feature_slug: string
          first_seen_at?: string | null
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          updated_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          discovery_level?: string
          feature_area?: string
          feature_slug?: string
          first_seen_at?: string | null
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          updated_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_free_cue_card: {
        Row: {
          cue_card_id: string | null
          selected_at: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          cue_card_id?: string | null
          selected_at?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          cue_card_id?: string | null
          selected_at?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_friend_words: {
        Row: {
          collected_at: string | null
          id: string
          language: string
          user_id: string
          word: string
        }
        Insert: {
          collected_at?: string | null
          id?: string
          language?: string
          user_id: string
          word: string
        }
        Update: {
          collected_at?: string | null
          id?: string
          language?: string
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_friend_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friend_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gate_responses: {
        Row: {
          gate_slug: string
          id: string
          responded_at: string | null
          response: string
          stamp_id: string | null
          user_id: string
        }
        Insert: {
          gate_slug: string
          id?: string
          responded_at?: string | null
          response: string
          stamp_id?: string | null
          user_id: string
        }
        Update: {
          gate_slug?: string
          id?: string
          responded_at?: string | null
          response?: string
          stamp_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gate_responses_stamp_id_fkey"
            columns: ["stamp_id"]
            isOneToOne: false
            referencedRelation: "acknowledgment_stamps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_guild_progression: {
        Row: {
          badges_earned: string[] | null
          certifications: string[] | null
          created_at: string | null
          guild_id: string
          id: string
          last_active_at: string | null
          projects_in_guild: number | null
          reputation_in_guild: number | null
          skill_level: number | null
          total_hours_logged: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges_earned?: string[] | null
          certifications?: string[] | null
          created_at?: string | null
          guild_id: string
          id?: string
          last_active_at?: string | null
          projects_in_guild?: number | null
          reputation_in_guild?: number | null
          skill_level?: number | null
          total_hours_logged?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges_earned?: string[] | null
          certifications?: string[] | null
          created_at?: string | null
          guild_id?: string
          id?: string
          last_active_at?: string | null
          projects_in_guild?: number | null
          reputation_in_guild?: number | null
          skill_level?: number | null
          total_hours_logged?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_guild_progression_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_joules: {
        Row: {
          created_at: string | null
          herald_multiplier: number
          id: string
          total_joules: number
          total_locked_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          herald_multiplier?: number
          id?: string
          total_joules?: number
          total_locked_value?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          herald_multiplier?: number
          id?: string
          total_joules?: number
          total_locked_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_kiss_preferences: {
        Row: {
          completed_pathways: string[] | null
          created_at: string | null
          current_pathway: string | null
          current_step: number | null
          id: string
          pathway_tiers: Json | null
          preferred_tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_pathways?: string[] | null
          created_at?: string | null
          current_pathway?: string | null
          current_step?: number | null
          id?: string
          pathway_tiers?: Json | null
          preferred_tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_pathways?: string[] | null
          created_at?: string | null
          current_pathway?: string | null
          current_step?: number | null
          id?: string
          pathway_tiers?: Json | null
          preferred_tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_language_preference: {
        Row: {
          preferred_language: string | null
          set_at: string | null
          set_by_door: string | null
          user_id: string
        }
        Insert: {
          preferred_language?: string | null
          set_at?: string | null
          set_by_door?: string | null
          user_id: string
        }
        Update: {
          preferred_language?: string | null
          set_at?: string | null
          set_by_door?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_marks: {
        Row: {
          created_at: string | null
          crown_eligible: boolean | null
          id: string
          mark_level: string | null
          total_marks: number
          updated_at: string | null
          user_id: string
          voting_multiplier: number | null
        }
        Insert: {
          created_at?: string | null
          crown_eligible?: boolean | null
          id?: string
          mark_level?: string | null
          total_marks?: number
          updated_at?: string | null
          user_id: string
          voting_multiplier?: number | null
        }
        Update: {
          created_at?: string | null
          crown_eligible?: boolean | null
          id?: string
          mark_level?: string | null
          total_marks?: number
          updated_at?: string | null
          user_id?: string
          voting_multiplier?: number | null
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          confirmation_phrase: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confirmation_phrase?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confirmation_phrase?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reading_history: {
        Row: {
          article_path: string
          article_title: string | null
          first_read_at: string | null
          id: string
          last_read_at: string | null
          read_count: number | null
          user_id: string | null
        }
        Insert: {
          article_path: string
          article_title?: string | null
          first_read_at?: string | null
          id?: string
          last_read_at?: string | null
          read_count?: number | null
          user_id?: string | null
        }
        Update: {
          article_path?: string
          article_title?: string | null
          first_read_at?: string | null
          id?: string
          last_read_at?: string | null
          read_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_recipe_portfolio: {
        Row: {
          allergens: string[] | null
          average_rating: number | null
          cook_time_minutes: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          dietary_tags: string[] | null
          eligible_for_graduation: boolean | null
          graduated_at: string | null
          graduated_to_pantry_id: string | null
          graduation_criteria_met_at: string | null
          id: string
          ingredients: Json | null
          instructions: Json | null
          is_proprietary: boolean | null
          meal_type: string | null
          photo_url: string | null
          prep_time_minutes: number | null
          rating_count: number | null
          recipe_type: string | null
          servings: number | null
          times_used: number | null
          title: string
          total_orders: number | null
          total_servings_sold: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergens?: string[] | null
          average_rating?: number | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          eligible_for_graduation?: boolean | null
          graduated_at?: string | null
          graduated_to_pantry_id?: string | null
          graduation_criteria_met_at?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: Json | null
          is_proprietary?: boolean | null
          meal_type?: string | null
          photo_url?: string | null
          prep_time_minutes?: number | null
          rating_count?: number | null
          recipe_type?: string | null
          servings?: number | null
          times_used?: number | null
          title: string
          total_orders?: number | null
          total_servings_sold?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergens?: string[] | null
          average_rating?: number | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          eligible_for_graduation?: boolean | null
          graduated_at?: string | null
          graduated_to_pantry_id?: string | null
          graduation_criteria_met_at?: string | null
          id?: string
          ingredients?: Json | null
          instructions?: Json | null
          is_proprietary?: boolean | null
          meal_type?: string | null
          photo_url?: string | null
          prep_time_minutes?: number | null
          rating_count?: number | null
          recipe_type?: string | null
          servings?: number | null
          times_used?: number | null
          title?: string
          total_orders?: number | null
          total_servings_sold?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recipe_portfolio_graduated_to_pantry_id_fkey"
            columns: ["graduated_to_pantry_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_portfolio_graduated_to_pantry_id_fkey"
            columns: ["graduated_to_pantry_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_given: boolean | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_given?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_given?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          role?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_social_plugs: {
        Row: {
          connected_at: string | null
          connection_data: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          oauth_expires_at: string | null
          oauth_refresh_token: string | null
          oauth_token: string | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          plug_features: Json | null
          server_invite_url: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          connected_at?: string | null
          connection_data?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          oauth_expires_at?: string | null
          oauth_refresh_token?: string | null
          oauth_token?: string | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          plug_features?: Json | null
          server_invite_url?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          connected_at?: string | null
          connection_data?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          oauth_expires_at?: string | null
          oauth_refresh_token?: string | null
          oauth_token?: string | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          plug_features?: Json | null
          server_invite_url?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_spotlight_prefs: {
        Row: {
          created_at: string | null
          dismissed_spotlights: string[] | null
          id: string
          ranger_mode: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_spotlights?: string[] | null
          id?: string
          ranger_mode?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_spotlights?: string[] | null
          id?: string
          ranger_mode?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_spotlight_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "member_reputation_stability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_spotlight_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          activity_streak_days: number | null
          created_at: string | null
          last_active_at: string | null
          total_transactions: number | null
          user_id: string
        }
        Insert: {
          activity_streak_days?: number | null
          created_at?: string | null
          last_active_at?: string | null
          total_transactions?: number | null
          user_id: string
        }
        Update: {
          activity_streak_days?: number | null
          created_at?: string | null
          last_active_at?: string | null
          total_transactions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_taste_tester_stats: {
        Row: {
          current_marks_balance: number | null
          is_master_taster: boolean | null
          master_taster_achieved_at: string | null
          recipes_reached_5k: number | null
          total_credits_from_conversion: number | null
          total_marks_converted: number | null
          total_marks_earned: number | null
          total_recipes_tested: number | null
          total_reputation_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_marks_balance?: number | null
          is_master_taster?: boolean | null
          master_taster_achieved_at?: string | null
          recipes_reached_5k?: number | null
          total_credits_from_conversion?: number | null
          total_marks_converted?: number | null
          total_marks_earned?: number | null
          total_recipes_tested?: number | null
          total_reputation_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_marks_balance?: number | null
          is_master_taster?: boolean | null
          master_taster_achieved_at?: string | null
          recipes_reached_5k?: number | null
          total_credits_from_conversion?: number | null
          total_marks_converted?: number | null
          total_marks_earned?: number | null
          total_recipes_tested?: number | null
          total_reputation_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_themes: {
        Row: {
          created_at: string | null
          css_content: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_image_url: string | null
          status: string | null
          target_element: string
          updated_at: string | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          css_content: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image_url?: string | null
          status?: string | null
          target_element: string
          updated_at?: string | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          css_content?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image_url?: string | null
          status?: string | null
          target_element?: string
          updated_at?: string | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: []
      }
      user_topic_preferences: {
        Row: {
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_preferences_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "content_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_treasure_maps: {
        Row: {
          beacon_path: Json | null
          completion_count: number | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          name: string
          publication_cost_paid: boolean | null
          published: boolean | null
          published_at: string | null
          test_completed: boolean | null
        }
        Insert: {
          beacon_path?: Json | null
          completion_count?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name: string
          publication_cost_paid?: boolean | null
          published?: boolean | null
          published_at?: string | null
          test_completed?: boolean | null
        }
        Update: {
          beacon_path?: Json | null
          completion_count?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name?: string
          publication_cost_paid?: boolean | null
          published?: boolean | null
          published_at?: string | null
          test_completed?: boolean | null
        }
        Relationships: []
      }
      user_wisp_stats: {
        Row: {
          best_finish: number | null
          best_time_ms: number | null
          best_win_streak: number
          current_win_streak: number
          first_candle_earned_at: string | null
          losses: number
          net_service_value: number
          quits: number
          stats_by_difficulty: Json | null
          total_ante_paid: number
          total_chases: number
          total_payout: number
          training_wisps_completed: number
          unlock_reason: string | null
          unlocked_at: string | null
          unlocked_chase_mode: boolean
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          best_finish?: number | null
          best_time_ms?: number | null
          best_win_streak?: number
          current_win_streak?: number
          first_candle_earned_at?: string | null
          losses?: number
          net_service_value?: number
          quits?: number
          stats_by_difficulty?: Json | null
          total_ante_paid?: number
          total_chases?: number
          total_payout?: number
          training_wisps_completed?: number
          unlock_reason?: string | null
          unlocked_at?: string | null
          unlocked_chase_mode?: boolean
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          best_finish?: number | null
          best_time_ms?: number | null
          best_win_streak?: number
          current_win_streak?: number
          first_candle_earned_at?: string | null
          losses?: number
          net_service_value?: number
          quits?: number
          stats_by_difficulty?: Json | null
          total_ante_paid?: number
          total_chases?: number
          total_payout?: number
          training_wisps_completed?: number
          unlock_reason?: string | null
          unlocked_at?: string | null
          unlocked_chase_mode?: boolean
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      vault_family_mapping: {
        Row: {
          created_at: string | null
          email: string | null
          family_id: string
          family_member_id: string | null
          id: string
          symbol: string | null
          user_id: string | null
          vault_person: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          family_id: string
          family_member_id?: string | null
          id?: string
          symbol?: string | null
          user_id?: string | null
          vault_person: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          family_id?: string
          family_member_id?: string | null
          id?: string
          symbol?: string | null
          user_id?: string | null
          vault_person?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_family_mapping_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_family_mapping_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_shared_content: {
        Row: {
          authorization_id: string
          content_text: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          location: string | null
          original_date: string | null
          photo_urls: string[] | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          authorization_id: string
          content_text?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          location?: string | null
          original_date?: string | null
          photo_urls?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          authorization_id?: string
          content_text?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          location?: string | null
          original_date?: string | null
          photo_urls?: string[] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_shared_content_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: false
            referencedRelation: "vault_sharing_authorizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_sharing_authorizations: {
        Row: {
          authorized_at: string | null
          content_scope: string
          created_at: string | null
          family_id: string
          granter_member_id: string
          granter_user_id: string | null
          id: string
          is_active: boolean | null
          revoked_at: string | null
          revoked_reason: string | null
          shared_with_member_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          authorized_at?: string | null
          content_scope?: string
          created_at?: string | null
          family_id: string
          granter_member_id: string
          granter_user_id?: string | null
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          shared_with_member_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          authorized_at?: string | null
          content_scope?: string
          created_at?: string | null
          family_id?: string
          granter_member_id?: string
          granter_user_id?: string | null
          id?: string
          is_active?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          shared_with_member_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_sharing_authorizations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_sharing_authorizations_granter_member_id_fkey"
            columns: ["granter_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_sharing_authorizations_shared_with_member_id_fkey"
            columns: ["shared_with_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_unlocks: {
        Row: {
          family_id: string | null
          family_member_id: string | null
          id: string
          person: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          family_id?: string | null
          family_member_id?: string | null
          id?: string
          person: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          family_id?: string | null
          family_member_id?: string | null
          id?: string
          person?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_unlocks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_unlocks_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_change_effects: {
        Row: {
          chain_depth: number | null
          computed_at: string | null
          confidence: number | null
          data_points_count: number | null
          delta_percent: number | null
          direction: string | null
          experiment_id: string
          factor_name: string
          factor_weight: number | null
          id: string
          period_end: string | null
          period_start: string | null
          reality_value: number | null
          sandbox_value: number | null
          user_id: string | null
        }
        Insert: {
          chain_depth?: number | null
          computed_at?: string | null
          confidence?: number | null
          data_points_count?: number | null
          delta_percent?: number | null
          direction?: string | null
          experiment_id: string
          factor_name: string
          factor_weight?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          reality_value?: number | null
          sandbox_value?: number | null
          user_id?: string | null
        }
        Update: {
          chain_depth?: number | null
          computed_at?: string | null
          confidence?: number | null
          data_points_count?: number | null
          delta_percent?: number | null
          direction?: string | null
          experiment_id?: string
          factor_name?: string
          factor_weight?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          reality_value?: number | null
          sandbox_value?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vector_change_effects_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "thought_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_schedules: {
        Row: {
          check_interval_hours: number | null
          created_at: string | null
          id: string
          last_check_at: string | null
          next_check_at: string
          platforms: Json | null
          pool_id: string
          requirement_type: string
          sponsor_handle: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          check_interval_hours?: number | null
          created_at?: string | null
          id?: string
          last_check_at?: string | null
          next_check_at: string
          platforms?: Json | null
          pool_id: string
          requirement_type: string
          sponsor_handle?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          check_interval_hours?: number | null
          created_at?: string | null
          id?: string
          last_check_at?: string | null
          next_check_at?: string
          platforms?: Json | null
          pool_id?: string
          requirement_type?: string
          sponsor_handle?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vip_page_views: {
        Row: {
          created_at: string | null
          id: string
          interactions: Json | null
          invitation_id: string | null
          page_path: string
          scroll_depth_percent: number | null
          session_id: string
          time_spent_seconds: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interactions?: Json | null
          invitation_id?: string | null
          page_path: string
          scroll_depth_percent?: number | null
          session_id: string
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interactions?: Json | null
          invitation_id?: string | null
          page_path?: string
          scroll_depth_percent?: number | null
          session_id?: string
          time_spent_seconds?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vip_page_views_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "sponsor_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_verifications: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          tier: string
          token: string
          user_id: string | null
          verified: boolean | null
          verified_at: string | null
          vip_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          tier?: string
          token: string
          user_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          vip_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          tier?: string
          token?: string
          user_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          vip_id?: string
        }
        Relationships: []
      }
      votable_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          item_type: string
          production_level: number | null
          status: string | null
          title: string
          total_credits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          item_type: string
          production_level?: number | null
          status?: string | null
          title: string
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          item_type?: string
          production_level?: number | null
          status?: string | null
          title?: string
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vote_allocations: {
        Row: {
          created_at: string | null
          donor_vote_id: string
          gift_request_id: string
          id: string
          user_id: string | null
          votes_cast: number
        }
        Insert: {
          created_at?: string | null
          donor_vote_id: string
          gift_request_id: string
          id?: string
          user_id?: string | null
          votes_cast?: number
        }
        Update: {
          created_at?: string | null
          donor_vote_id?: string
          gift_request_id?: string
          id?: string
          user_id?: string | null
          votes_cast?: number
        }
        Relationships: [
          {
            foreignKeyName: "vote_allocations_donor_vote_id_fkey"
            columns: ["donor_vote_id"]
            isOneToOne: false
            referencedRelation: "donor_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_allocations_gift_request_id_fkey"
            columns: ["gift_request_id"]
            isOneToOne: false
            referencedRelation: "gift_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          additional_multipliers: Json | null
          converted_at: string | null
          created_at: string | null
          credits_pledged: number
          id: string
          joules_potential: number | null
          mark_level_at_vote: number | null
          multiplier_at_vote: number
          production_level_at_vote: number
          status: string | null
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          additional_multipliers?: Json | null
          converted_at?: string | null
          created_at?: string | null
          credits_pledged: number
          id?: string
          joules_potential?: number | null
          mark_level_at_vote?: number | null
          multiplier_at_vote: number
          production_level_at_vote: number
          status?: string | null
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          additional_multipliers?: Json | null
          converted_at?: string | null
          created_at?: string | null
          credits_pledged?: number
          id?: string
          joules_potential?: number | null
          mark_level_at_vote?: number | null
          multiplier_at_vote?: number
          production_level_at_vote?: number
          status?: string | null
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wisp_chase_participants: {
        Row: {
          ante_paid: number
          chase_id: string
          current_mirror_index: number | null
          finish_position: number | null
          finish_time_ms: number | null
          finished_at: string | null
          id: string
          joined_at: string
          path_progress: Json | null
          payout: number | null
          pickle_count: number | null
          pickle_time_lost_ms: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          ante_paid: number
          chase_id: string
          current_mirror_index?: number | null
          finish_position?: number | null
          finish_time_ms?: number | null
          finished_at?: string | null
          id?: string
          joined_at?: string
          path_progress?: Json | null
          payout?: number | null
          pickle_count?: number | null
          pickle_time_lost_ms?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ante_paid?: number
          chase_id?: string
          current_mirror_index?: number | null
          finish_position?: number | null
          finish_time_ms?: number | null
          finished_at?: string | null
          id?: string
          joined_at?: string
          path_progress?: Json | null
          payout?: number | null
          pickle_count?: number | null
          pickle_time_lost_ms?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wisp_chase_participants_chase_id_fkey"
            columns: ["chase_id"]
            isOneToOne: false
            referencedRelation: "wisp_chases"
            referencedColumns: ["id"]
          },
        ]
      }
      wisp_chase_results: {
        Row: {
          ante_paid: number
          chase_id: string
          crow_feather_category: string | null
          crow_feather_earned: boolean | null
          crow_feather_number: number | null
          difficulty: string
          finish_position: number
          finish_time_ms: number | null
          id: string
          net_result: number
          payout: number
          platform_cut_applied: number
          recorded_at: string
          total_participants: number
          user_id: string
        }
        Insert: {
          ante_paid: number
          chase_id: string
          crow_feather_category?: string | null
          crow_feather_earned?: boolean | null
          crow_feather_number?: number | null
          difficulty: string
          finish_position: number
          finish_time_ms?: number | null
          id?: string
          net_result: number
          payout: number
          platform_cut_applied: number
          recorded_at?: string
          total_participants: number
          user_id: string
        }
        Update: {
          ante_paid?: number
          chase_id?: string
          crow_feather_category?: string | null
          crow_feather_earned?: boolean | null
          crow_feather_number?: number | null
          difficulty?: string
          finish_position?: number
          finish_time_ms?: number | null
          id?: string
          net_result?: number
          payout?: number
          platform_cut_applied?: number
          recorded_at?: string
          total_participants?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wisp_chase_results_chase_id_fkey"
            columns: ["chase_id"]
            isOneToOne: false
            referencedRelation: "wisp_chases"
            referencedColumns: ["id"]
          },
        ]
      }
      wisp_chases: {
        Row: {
          ante_amount: number
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          ended_at: string | null
          id: string
          max_participants: number | null
          min_participants: number
          participant_count: number
          path_length: number | null
          path_mirrors: Json | null
          path_seed: string | null
          platform_cut: number
          started_at: string | null
          status: string
          title: string | null
          total_pot: number
          user_id: string | null
        }
        Insert: {
          ante_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          ended_at?: string | null
          id?: string
          max_participants?: number | null
          min_participants?: number
          participant_count?: number
          path_length?: number | null
          path_mirrors?: Json | null
          path_seed?: string | null
          platform_cut?: number
          started_at?: string | null
          status?: string
          title?: string | null
          total_pot?: number
          user_id?: string | null
        }
        Update: {
          ante_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          ended_at?: string | null
          id?: string
          max_participants?: number | null
          min_participants?: number
          participant_count?: number
          path_length?: number | null
          path_mirrors?: Json | null
          path_seed?: string | null
          platform_cut?: number
          started_at?: string | null
          status?: string
          title?: string | null
          total_pot?: number
          user_id?: string | null
        }
        Relationships: []
      }
      withdrawal_configs: {
        Row: {
          created_at: string | null
          description: string | null
          fee_percentage: number | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          milestone_days: number | null
          min_amount: number | null
          user_id: string | null
          withdrawal_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fee_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          milestone_days?: number | null
          min_amount?: number | null
          user_id?: string | null
          withdrawal_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fee_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          milestone_days?: number | null
          min_amount?: number | null
          user_id?: string | null
          withdrawal_type?: string
        }
        Relationships: []
      }
      work_sessions: {
        Row: {
          agent: string | null
          burst_count: number | null
          documents_created: number | null
          documents_updated: number | null
          ended_at: string | null
          id: string
          innovations_logged: number | null
          notes: string | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          agent?: string | null
          burst_count?: number | null
          documents_created?: number | null
          documents_updated?: number | null
          ended_at?: string | null
          id: string
          innovations_logged?: number | null
          notes?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent?: string | null
          burst_count?: number | null
          documents_created?: number | null
          documents_updated?: number | null
          ended_at?: string | null
          id?: string
          innovations_logged?: number | null
          notes?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workstations: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          station_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          station_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          station_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workstations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_funding_summary"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "workstations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xml_access_credentials: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          permissions: string[] | null
          portal: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: string[] | null
          portal: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: string[] | null
          portal?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_daily_summary: {
        Row: {
          event_count: number | null
          event_date: string | null
          event_type: string | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_page_views: {
        Row: {
          page_path: string | null
          unique_sessions: number | null
          unique_viewers: number | null
          view_count: number | null
          view_date: string | null
        }
        Relationships: []
      }
      critical_implementations: {
        Row: {
          category: string | null
          components_needed: string[] | null
          database_tables_needed: string[] | null
          notes: string | null
          status: string | null
          system_name: string | null
          why_important: string | null
        }
        Insert: {
          category?: string | null
          components_needed?: string[] | null
          database_tables_needed?: string[] | null
          notes?: string | null
          status?: string | null
          system_name?: string | null
          why_important?: string | null
        }
        Update: {
          category?: string | null
          components_needed?: string[] | null
          database_tables_needed?: string[] | null
          notes?: string | null
          status?: string | null
          system_name?: string | null
          why_important?: string | null
        }
        Relationships: []
      }
      current_metrics: {
        Row: {
          context: Json | null
          metric_name: string | null
          metric_unit: string | null
          metric_value: number | null
          recorded_at: string | null
        }
        Relationships: []
      }
      defense_klaus_cold_start_stats: {
        Row: {
          free_signups: number | null
          paid_signups: number | null
          percent_complete: number | null
          platform_donated: number | null
          remaining_slots: number | null
          total_signups: number | null
          user_donated: number | null
        }
        Relationships: []
      }
      defense_klaus_daisy_chain_stats: {
        Row: {
          acceptance_rate: number | null
          accepted_referrals: number | null
          pending_referrals: number | null
          total_referrals: number | null
          unique_referrers: number | null
        }
        Relationships: []
      }
      family_shopping_aggregation: {
        Row: {
          category: string | null
          ingredient_name: string | null
          meal_date: string | null
          meal_plan_ids: string[] | null
          normalized_name: string | null
          recipe_ids: string[] | null
          total_quantity: number | null
          tribe_id: string | null
          unit: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_meal_plans_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      free_daily_analytics: {
        Row: {
          anonymous_users: number | null
          conversion_rate: number | null
          conversions: number | null
          feature_type: string | null
          logged_in_users: number | null
          total_uses: number | null
          unique_users: number | null
          usage_date: string | null
        }
        Relationships: []
      }
      gate_lintels: {
        Row: {
          gate_id: string | null
          recent_languages: string[] | null
          recent_words: string[] | null
        }
        Relationships: []
      }
      geographic_cold_start_progress: {
        Row: {
          active_captains: number | null
          city: string | null
          committed_families: number | null
          country: string | null
          current_tier: string | null
          initiative_id: string | null
          interested_families: number | null
          state: string | null
          total_pledged: number | null
          zip_code: string | null
        }
        Relationships: []
      }
      gift_list_items_for_family: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          claimed_by_name: string | null
          claimed_by_symbol: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          list_id: string | null
          name: string | null
          notes: string | null
          notion_block_id: string | null
          price_currency: string | null
          price_estimate: number | null
          priority: number | null
          purchased: boolean | null
          purchased_at: string | null
          purchased_by: string | null
          quantity_claimed: number | null
          quantity_wanted: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_list_items_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "family_gift_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_list_items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_list_items_for_owner: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_claimed: boolean | null
          is_purchased: boolean | null
          list_id: string | null
          name: string | null
          notion_block_id: string | null
          price_currency: string | null
          price_estimate: number | null
          priority: number | null
          quantity_claimed: number | null
          quantity_wanted: number | null
          updated_at: string | null
          url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "family_gift_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_summary: {
        Row: {
          category: string | null
          completed: number | null
          critical_incomplete: number | null
          critical_tasks: number | null
          documentation_only: number | null
          not_started: number | null
          partial: number | null
          total_tasks: number | null
        }
        Relationships: []
      }
      initiative_stats: {
        Row: {
          description: string | null
          id: string | null
          member_count: number | null
          name: string | null
          order_count: number | null
          slug: string | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          order_count?: never
          slug?: string | null
        }
        Update: {
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          order_count?: never
          slug?: string | null
        }
        Relationships: []
      }
      lmd_demand_summary: {
        Row: {
          earliest_expiry: string | null
          latest_expiry: string | null
          meal_name: string | null
          pantry_recipe_id: string | null
          postal_code: string | null
          request_count: number | null
          specific_dates: string[] | null
          total_marks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lmd_meal_requests_pantry_recipe_id_fkey"
            columns: ["pantry_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_escape_velocity_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lmd_meal_requests_pantry_recipe_id_fkey"
            columns: ["pantry_recipe_id"]
            isOneToOne: false
            referencedRelation: "pantry_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      member_currency_dashboard: {
        Row: {
          credits: number | null
          crown_eligible: boolean | null
          gleaning_earned: number | null
          gleaning_received: number | null
          joules: number | null
          joules_locked_value: number | null
          mark_level: string | null
          marks: number | null
          user_id: string | null
          voting_multiplier: number | null
        }
        Relationships: []
      }
      member_reputation_stability: {
        Row: {
          account_age_days: number | null
          display_name: string | null
          id: string | null
          member_since: string | null
          reputation_tier: string | null
          stability_score: number | null
          total_resets: number | null
        }
        Insert: {
          account_age_days?: never
          display_name?: string | null
          id?: string | null
          member_since?: string | null
          reputation_tier?: never
          stability_score?: never
          total_resets?: never
        }
        Update: {
          account_age_days?: never
          display_name?: string | null
          id?: string | null
          member_since?: string | null
          reputation_tier?: never
          stability_score?: never
          total_resets?: never
        }
        Relationships: []
      }
      node_status_dashboard: {
        Row: {
          activation_progress_percent: number | null
          activation_threshold: number | null
          capacity_unit: string | null
          captain_name: string | null
          city: string | null
          collected_upfront: number | null
          ghost_interest: number | null
          hard_orders: number | null
          id: string | null
          infrastructure_type: string | null
          name: string | null
          node_type_name: string | null
          pending_demand_signals: number | null
          soft_pledges: number | null
          state: string | null
          status: string | null
          weekly_capacity: number | null
          zip_code: string | null
        }
        Relationships: []
      }
      pantry_bounty_opportunities: {
        Row: {
          bounty_message: string | null
          cuisine: string | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string | null
          meal_type: string | null
          recipe_count: number | null
          shadow_marks_available: number | null
          shelf_status: string | null
          style: string | null
        }
        Insert: {
          bounty_message?: never
          cuisine?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string | null
          meal_type?: string | null
          recipe_count?: number | null
          shadow_marks_available?: never
          shelf_status?: never
          style?: string | null
        }
        Update: {
          bounty_message?: never
          cuisine?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string | null
          meal_type?: string | null
          recipe_count?: number | null
          shadow_marks_available?: never
          shelf_status?: never
          style?: string | null
        }
        Relationships: []
      }
      pantry_early_program_status: {
        Row: {
          maker_slots_remaining: number | null
          makers_claimed: number | null
          program_status: string | null
          taster_slots_remaining: number | null
          tasters_claimed: number | null
          total_makers: number | null
          total_tasters: number | null
        }
        Relationships: []
      }
      pantry_escape_velocity_recipes: {
        Row: {
          created_at: string | null
          creator_id: string | null
          cuisine: string | null
          escape_velocity_reached_at: string | null
          id: string | null
          ip_ledger_hash: string | null
          meal_type: string | null
          title: string | null
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          cuisine?: string | null
          escape_velocity_reached_at?: string | null
          id?: string | null
          ip_ledger_hash?: string | null
          meal_type?: string | null
          title?: string | null
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          cuisine?: string | null
          escape_velocity_reached_at?: string | null
          id?: string | null
          ip_ledger_hash?: string | null
          meal_type?: string | null
          title?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      project_funding_summary: {
        Row: {
          funding_deadline: string | null
          funding_goal: number | null
          funding_percentage: number | null
          project_id: string | null
          project_name: string | null
          project_status: string | null
          total_pledged: number | null
          unique_backers: number | null
        }
        Relationships: []
      }
      prow_stats: {
        Row: {
          active_bounties: number | null
          active_contracts: number | null
          completed_bounties: number | null
          credits: number | null
          joules: number | null
          locked_joules: number | null
          user_id: string | null
        }
        Relationships: []
      }
      red_carpet_dashboard: {
        Row: {
          category: string | null
          domain: string | null
          entry_mode: string | null
          first_view: string | null
          last_view: string | null
          recipient_id: string | null
          recipient_name: string | null
          total_views: number | null
          verified_emails: string[] | null
          verified_views: number | null
        }
        Relationships: []
      }
      side_quest_stats: {
        Row: {
          active_claims: number | null
          category: string | null
          completions: number | null
          difficulty: string | null
          hexisle_xp: number | null
          max_claims: number | null
          quest_id: string | null
          quest_status: string | null
          reward_credits: number | null
          reward_joules: number | null
          reward_marks: number | null
          title: string | null
          total_credits_distributed: number | null
        }
        Relationships: []
      }
      social_media_status: {
        Row: {
          failed: number | null
          next_post: string | null
          platform: string | null
          posted: number | null
          scheduled: number | null
        }
        Relationships: []
      }
      sponsorship_cascade_view: {
        Row: {
          credit_amount: number | null
          depth: number | null
          id: string | null
          path: string[] | null
          recipient_id: string | null
          recipient_name: string | null
          sponsor_id: string | null
          sponsor_name: string | null
          status: string | null
        }
        Relationships: []
      }
      treasure_automation_status: {
        Row: {
          emails_sent: number | null
          last_milestone: number | null
          last_milestone_at: string | null
          remaining_keys: number | null
          social_posts: number | null
          total_winners: number | null
        }
        Relationships: []
      }
      user_shadow_marks_summary: {
        Row: {
          milestone_completion_count: number | null
          total_crystallized: number | null
          total_expired: number | null
          total_shadow: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_c20_reciprocity_leaderboard: {
        Row: {
          anchor_id: string | null
          badge_tier: string | null
          compliance_ratio: number | null
          current_balance: number | null
          display_name: string | null
          products_at_c20: number | null
          total_contributed: number | null
          total_spent: number | null
          total_units_sold: number | null
        }
        Relationships: []
      }
      v_certified_anchors: {
        Row: {
          business_type: string | null
          charitable_icon: string | null
          charitable_tier: string | null
          cost_plus_verified_at: string | null
          destination_url: string | null
          display_name: string | null
          id: string | null
          total_pass_throughs: number | null
          trust_score: number | null
        }
        Relationships: []
      }
      v_current_transparency_metrics: {
        Row: {
          active_members: number | null
          active_proposals: number | null
          completed_orders: number | null
          snapshot_at: string | null
          total_innovations: number | null
          total_transaction_volume: number | null
        }
        Relationships: []
      }
      v_donation_commitments_summary: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          frequency: string | null
          id: string | null
          next_charge_date: string | null
          remaining_pool: number | null
          status: string | null
          target_name: string | null
          target_type: string | null
          total_donated: number | null
          transaction_count: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string | null
          next_charge_date?: string | null
          remaining_pool?: number | null
          status?: string | null
          target_name?: string | null
          target_type?: string | null
          total_donated?: number | null
          transaction_count?: never
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          category?: string | null
          created_at?: string | null
          frequency?: string | null
          id?: string | null
          next_charge_date?: string | null
          remaining_pool?: number | null
          status?: string | null
          target_name?: string | null
          target_type?: string | null
          total_donated?: number | null
          transaction_count?: never
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_msa_account_summary: {
        Row: {
          auto_contribute_percent: number | null
          balance: number | null
          id: string | null
          last_transaction: string | null
          member_id: string | null
          total_contributed: number | null
          total_platform_match: number | null
          total_withdrawn: number | null
          transaction_count: number | null
        }
        Insert: {
          auto_contribute_percent?: number | null
          balance?: number | null
          id?: string | null
          last_transaction?: never
          member_id?: string | null
          total_contributed?: number | null
          total_platform_match?: number | null
          total_withdrawn?: number | null
          transaction_count?: never
        }
        Update: {
          auto_contribute_percent?: number | null
          balance?: number | null
          id?: string | null
          last_transaction?: never
          member_id?: string | null
          total_contributed?: number | null
          total_platform_match?: number | null
          total_withdrawn?: number | null
          transaction_count?: never
        }
        Relationships: []
      }
      v_promotion_leaderboard: {
        Row: {
          backers_generated: number | null
          projects_promoted: number | null
          promoter_id: string | null
          signups_generated: number | null
          total_clicks: number | null
          total_marks_earned: number | null
        }
        Relationships: []
      }
      v_swoop_active_projects: {
        Row: {
          activation_date: string | null
          category: string | null
          closed_date: string | null
          closed_reason: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          disbursed_amount: number | null
          donation_count: number | null
          featured: boolean | null
          featured_order: number | null
          funded_date: string | null
          goal_amount: number | null
          id: string | null
          last_update: string | null
          medical_situation: string | null
          monthly_needs: Json | null
          nominator_id: string | null
          nominator_name: string | null
          percent_funded: number | null
          project_lead_email: string | null
          project_lead_id: string | null
          project_lead_name: string | null
          public_updates: Json | null
          recipient_location: string | null
          recipient_name: string | null
          recipient_relationship: string | null
          share_image_url: string | null
          short_description: string | null
          slug: string | null
          status: string | null
          stripe_account_created_at: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          supporter_count: number | null
          title: string | null
          updated_at: string | null
          verification_contact_name: string | null
          verification_contact_reached: boolean | null
          verification_contact_relationship: string | null
          verification_date: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_by: string | null
          vote_count: number | null
          vote_threshold: number | null
          voting_started_at: string | null
        }
        Insert: {
          activation_date?: string | null
          category?: string | null
          closed_date?: string | null
          closed_reason?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          disbursed_amount?: number | null
          donation_count?: never
          featured?: boolean | null
          featured_order?: number | null
          funded_date?: string | null
          goal_amount?: number | null
          id?: string | null
          last_update?: string | null
          medical_situation?: string | null
          monthly_needs?: Json | null
          nominator_id?: string | null
          nominator_name?: string | null
          percent_funded?: never
          project_lead_email?: string | null
          project_lead_id?: string | null
          project_lead_name?: string | null
          public_updates?: Json | null
          recipient_location?: string | null
          recipient_name?: string | null
          recipient_relationship?: string | null
          share_image_url?: string | null
          short_description?: string | null
          slug?: string | null
          status?: string | null
          stripe_account_created_at?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          supporter_count?: never
          title?: string | null
          updated_at?: string | null
          verification_contact_name?: string | null
          verification_contact_reached?: boolean | null
          verification_contact_relationship?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
          vote_count?: number | null
          vote_threshold?: number | null
          voting_started_at?: string | null
        }
        Update: {
          activation_date?: string | null
          category?: string | null
          closed_date?: string | null
          closed_reason?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          disbursed_amount?: number | null
          donation_count?: never
          featured?: boolean | null
          featured_order?: number | null
          funded_date?: string | null
          goal_amount?: number | null
          id?: string | null
          last_update?: string | null
          medical_situation?: string | null
          monthly_needs?: Json | null
          nominator_id?: string | null
          nominator_name?: string | null
          percent_funded?: never
          project_lead_email?: string | null
          project_lead_id?: string | null
          project_lead_name?: string | null
          public_updates?: Json | null
          recipient_location?: string | null
          recipient_name?: string | null
          recipient_relationship?: string | null
          share_image_url?: string | null
          short_description?: string | null
          slug?: string | null
          status?: string | null
          stripe_account_created_at?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          supporter_count?: never
          title?: string | null
          updated_at?: string | null
          verification_contact_name?: string | null
          verification_contact_reached?: boolean | null
          verification_contact_relationship?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_by?: string | null
          vote_count?: number | null
          vote_threshold?: number | null
          voting_started_at?: string | null
        }
        Relationships: []
      }
      v_swoop_project_transparency: {
        Row: {
          amount: number | null
          created_at: string | null
          from_anonymous: boolean | null
          from_name: string | null
          id: string | null
          processed_at: string | null
          project_id: string | null
          project_lead_name: string | null
          project_title: string | null
          purpose: string | null
          status: string | null
          to_name: string | null
          to_type: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swoop_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "swoop_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swoop_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_swoop_active_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_cue_card_destinations: {
        Row: {
          bound_projects_detail: Json | null
          category_slug: string | null
          created_at: string | null
          cue_card_template_id: string | null
          destination_type: string | null
          display_name: string | null
          id: string | null
          include_owned_only: boolean | null
          is_own_project: boolean | null
          portfolio_filter: string | null
          project_ids: string[] | null
          promotion_credit_rate: number | null
          template_title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cue_card_destinations_cue_card_template_id_fkey"
            columns: ["cue_card_template_id"]
            isOneToOne: false
            referencedRelation: "cue_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_giving_summary: {
        Row: {
          active_commitments: number | null
          active_recurring: number | null
          available_pool: number | null
          last_donation: string | null
          lifetime_donated: number | null
          user_id: string | null
        }
        Relationships: []
      }
      vault_family_sharing_status: {
        Row: {
          authorized_at: string | null
          content_count: number | null
          content_scope: string | null
          family_id: string | null
          granter_member_id: string | null
          granter_name: string | null
          is_active: boolean | null
          loteria_symbol: string | null
          shared_with_member_id: string | null
          shared_with_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_sharing_authorizations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_sharing_authorizations_granter_member_id_fkey"
            columns: ["granter_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_sharing_authorizations_shared_with_member_id_fkey"
            columns: ["shared_with_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_delivery_job: {
        Args: { p_job_id: string; p_worker_id: string }
        Returns: boolean
      }
      activate_swoop_project: { Args: { project_id: string }; Returns: boolean }
      add_shared_vault_content: {
        Args: {
          p_authorization_id: string
          p_content_text?: string
          p_content_type: string
          p_description?: string
          p_file_url?: string
          p_location?: string
          p_original_date?: string
          p_photo_urls?: string[]
          p_tags?: string[]
          p_title?: string
        }
        Returns: Json
      }
      add_to_ip_ledger: {
        Args: {
          p_medallion_id?: string
          p_record_data: Json
          p_record_type: string
        }
        Returns: string
      }
      approve_cost_plus_certification: {
        Args: {
          p_audit_id: string
          p_review_notes?: string
          p_validity_days?: number
        }
        Returns: boolean
      }
      are_members_connected: {
        Args: { member_a: string; member_b: string }
        Returns: boolean
      }
      assign_demand_to_window: { Args: { demand_id: string }; Returns: string }
      assign_harper_audit: {
        Args: { p_audit_type?: string; p_node_id: string }
        Returns: string
      }
      authorize_vault_sharing: {
        Args: {
          p_content_scope?: string
          p_family_id: string
          p_shared_with_member_id?: string
        }
        Returns: Json
      }
      auto_graduate_gleaners: { Args: never; Returns: number }
      award_early_taster_reward: {
        Args: { p_meal_id: string; p_user_id: string }
        Returns: {
          badge_awarded: string
          marks_awarded: number
          order_number: number
          reputation_awarded: number
        }[]
      }
      award_joules: {
        Args: {
          _credits_spent: number
          _multiplier: number
          _reason: string
          _reason_type: string
          _reference_id?: string
          _reference_type?: string
          _user_id: string
        }
        Returns: number
      }
      award_marks: {
        Args: {
          _amount: number
          _reason: string
          _reason_type: string
          _reference_id?: string
          _reference_type?: string
          _user_id: string
        }
        Returns: number
      }
      award_referral_bonus: {
        Args: {
          p_referred_user_id: string
          p_referrer_code: string
          p_source_content?: string
          p_source_platform?: string
        }
        Returns: Json
      }
      award_template_marks: {
        Args: { p_attribution_id: string }
        Returns: number
      }
      calculate_category_bounty: {
        Args: { recipe_count: number }
        Returns: number
      }
      calculate_chase_payouts: {
        Args: { p_chase_id: string }
        Returns: {
          payout: number
          user_id: string
        }[]
      }
      calculate_cost_plus_20: {
        Args: {
          _gross_amount: number
          _reference_id?: string
          _transaction_type: string
        }
        Returns: {
          creator_share: number
          initiative_fund: number
          is_compliant: boolean
          platform_margin: number
        }[]
      }
      calculate_experiment_net_score: {
        Args: { p_experiment_id: string }
        Returns: number
      }
      calculate_innovation_velocity: {
        Args: { p_period?: string }
        Returns: {
          innovations_count: number
          period_end: string
          period_start: string
          velocity: number
        }[]
      }
      calculate_platform_metrics: { Args: never; Returns: string }
      calculate_production_level: {
        Args: { total_credits: number }
        Returns: number
      }
      calculate_taste_tester_reward: {
        Args: { p_order_number: number }
        Returns: {
          marks: number
          reputation: number
        }[]
      }
      calculate_transparency_metrics: {
        Args: { p_period_type?: string }
        Returns: string
      }
      calculate_vote_multiplier: {
        Args: { p_initiative_id: string; p_user_id: string }
        Returns: number
      }
      can_sponsor: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      cast_votes: {
        Args: {
          p_donor_vote_id: string
          p_gift_request_id: string
          p_votes: number
        }
        Returns: boolean
      }
      check_aggregation_threshold: {
        Args: { window_id: string }
        Returns: boolean
      }
      check_and_award_crow_feather: {
        Args: {
          p_category: string
          p_record_value: number
          p_session_duration_minutes: number
          p_time_bracket: string
          p_user_id: string
          p_username: string
        }
        Returns: number
      }
      check_defense_klaus_enrollment: {
        Args: { email: string }
        Returns: boolean
      }
      check_extension_spawn: {
        Args: { p_experiment_id: string }
        Returns: boolean
      }
      check_free_daily_access: {
        Args: {
          p_device_fingerprint: string
          p_feature_type: string
          p_ip_hash: string
          p_user_id: string
        }
        Returns: {
          can_access: boolean
          daily_limit: number
          is_member: boolean
          remaining_uses: number
          upgrade_message: string
          uses_today: number
        }[]
      }
      check_harper_eligibility: {
        Args: { p_user_id: string }
        Returns: {
          eligible: boolean
          has_builder: boolean
          reason: string
          reputation: number
          tenure_months: number
          violations: number
        }[]
      }
      check_master_taster_conversion: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_memory_unlock: {
        Args: { p_family_id: string; p_member_a: string; p_member_b: string }
        Returns: boolean
      }
      check_sponsor_badge: { Args: { p_user_id: string }; Returns: undefined }
      check_treasure_milestones: { Args: never; Returns: undefined }
      check_wisp_unlock: { Args: { p_user_id: string }; Returns: boolean }
      claim_from_general_pool: {
        Args: { claiming_user_id: string }
        Returns: string
      }
      claim_gift_item: {
        Args: { p_item_id: string; p_member_id: string }
        Returns: Json
      }
      cleanup_old_analytics: { Args: never; Returns: undefined }
      cleanup_old_research_reports: {
        Args: { p_subscription_id: string }
        Returns: number
      }
      complete_delivery: {
        Args: { p_photo_url?: string; p_recipient_id: string }
        Returns: boolean
      }
      complete_design_battle: {
        Args: { p_battle_id: string }
        Returns: {
          crow_feather_awarded: boolean
          winner_payout: number
          winner_user_id: string
        }[]
      }
      complete_harper_audit: {
        Args: {
          p_audit_id: string
          p_grade: number
          p_result: string
          p_summary?: string
        }
        Returns: boolean
      }
      complete_hexisle_quest: {
        Args: { p_quest_id: string; p_user_id: string }
        Returns: boolean
      }
      convert_ghost_to_member: {
        Args: { p_email: string; p_user_id: string }
        Returns: {
          conversions_made: number
          credits_earned: number
          marks_earned: number
          shares_made: number
        }[]
      }
      convert_interest_to_order: { Args: { p_eoi_id: string }; Returns: string }
      convert_joules_to_c20_balance: {
        Args: { p_anchor_id: string; p_joule_amount: number; p_notes?: string }
        Returns: number
      }
      create_cloth_pouch: {
        Args: {
          p_credit_amount: number
          p_purpose: string
          p_target_id?: string
          p_user_id: string
        }
        Returns: string
      }
      create_commitment_lock: {
        Args: { p_project_id?: string; p_user_id: string }
        Returns: string
      }
      create_cue_card_destination: {
        Args: {
          p_category_slug?: string
          p_destination_type: string
          p_display_name?: string
          p_include_owned_only?: boolean
          p_is_own_project?: boolean
          p_project_ids?: string[]
          p_template_id: string
          p_user_id: string
        }
        Returns: Json
      }
      create_delivery_job_from_window: {
        Args: { p_window_id: string }
        Returns: string
      }
      create_donor_votes: {
        Args: {
          p_amount: number
          p_donation_id: string
          p_donor_email: string
          p_stripe_session_id: string
          p_tier: string
        }
        Returns: string
      }
      create_experiment_snapshot: {
        Args: { p_experiment_id: string; p_notes?: string }
        Returns: string
      }
      create_gift_occasion_event: {
        Args: { p_gift_list_id: string }
        Returns: string
      }
      create_gift_shopping_aggregation: {
        Args: {
          p_family_member_id: string
          p_gift_item_id: string
          p_shopping_date: string
          p_shopping_time?: string
        }
        Returns: string
      }
      create_job_from_aggregation: {
        Args: { window_id: string }
        Returns: string
      }
      create_meal_plan_events: {
        Args: {
          p_family_id: string
          p_meal_date: string
          p_meal_plan_id: string
          p_meal_slot: string
          p_meal_title: string
        }
        Returns: string
      }
      create_shopping_calendar_event: {
        Args: { p_aggregation_id: string }
        Returns: string
      }
      create_sponsorship: {
        Args: {
          p_amount: number
          p_recipient_email: string
          p_source_sponsorship_id?: string
          p_sponsor_id: string
        }
        Returns: string
      }
      create_user_stamp: { Args: { p_user_id: string }; Returns: string }
      decay_shadow_marks: { Args: never; Returns: number }
      detect_work_bursts: {
        Args: { p_gap_threshold_minutes?: number; p_session_id: string }
        Returns: {
          burst_duration_minutes: number
          burst_end: string
          burst_number: number
          burst_start: string
          items_in_burst: number
        }[]
      }
      draw_from_pool: {
        Args: { commitment_id: string; draw_amount: number }
        Returns: boolean
      }
      expire_lmd_requests: { Args: never; Returns: undefined }
      find_matching_locale_pool: {
        Args: { user_city: string; user_country: string; user_state: string }
        Returns: {
          medallions_available: number
          pool_id: string
          sponsor_id: string
        }[]
      }
      generate_aggregated_shopping_list: {
        Args: { window_id: string }
        Returns: undefined
      }
      generate_cue_card_code: { Args: never; Returns: string }
      generate_shopping_list: {
        Args: { p_tribe_id?: string; p_user_id: string; p_week_start: string }
        Returns: string
      }
      generate_stamp_code: { Args: never; Returns: string }
      get_anchor_economics: {
        Args: { p_anchor_id: string }
        Returns: {
          ip_stake_eligible: boolean
          is_certified: boolean
          joule_multiplier: number
          marks_multiplier: number
          reciprocal_tier_max: number
        }[]
      }
      get_automation_summary: {
        Args: never
        Returns: {
          letters_today: number
          pending_articles: number
          pending_letters: number
          pending_posts: number
          posts_today: number
        }[]
      }
      get_c20_reciprocity_summary: {
        Args: { p_anchor_id: string }
        Returns: {
          net_contribution: number
          products_at_c20: number
          reciprocity_balance: number
          total_balance_spent: number
          total_c20_units_remaining: number
          total_c20_units_sold: number
          total_margin_contributed: number
        }[]
      }
      get_city_cold_start_progress: {
        Args: { p_city: string; p_initiative_id: string; p_state: string }
        Returns: {
          active_captains: number
          captains_to_next_tier: number
          city: string
          committed_families: number
          current_tier: string
          families_to_next_tier: number
          initiative_id: string
          interested_families: number
          next_tier: string
          state: string
          total_pledged: number
        }[]
      }
      get_connected_members: {
        Args: { member_id: string }
        Returns: {
          connected_member_id: string
        }[]
      }
      get_cost_plus_tier: { Args: { p_anchor_id: string }; Returns: string }
      get_daisy_chain_connections: {
        Args: { p_recipient: string }
        Returns: {
          connected_to: string
          connection_description: string
          connection_type: string
        }[]
      }
      get_ghost_credit_stats: {
        Args: never
        Returns: {
          active_gleaners: number
          avg_usage_rate: number
          graduated_gleaners: number
          total_converted_to_real: number
          total_distributed: number
          total_used: number
        }[]
      }
      get_harper_badge: {
        Args: { p_user_id: string }
        Returns: {
          credential_status: string
          expertise: string[]
          is_harper: boolean
          pass_rate: number
          total_audits: number
        }[]
      }
      get_member_medallion_wall: {
        Args: { p_user_id: string }
        Returns: {
          chalk_one_type: string
          display_order: number
          earned_date: string
          is_featured: boolean
          medallion_id: string
          project_name: string
          sponsor_attribution: string
        }[]
      }
      get_member_social_accounts: {
        Args: { p_user_id: string }
        Returns: {
          account_handle: string
          account_name: string
          account_type: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_used_at: string
          platform: string
        }[]
      }
      get_member_social_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_accounts: number
          posts_this_month: number
          scheduled_posts: number
          total_accounts: number
          total_clicks: number
          total_engagements: number
        }[]
      }
      get_next_beacon_number: { Args: { p_user_id: string }; Returns: number }
      get_next_dk_proxy_id: { Args: never; Returns: string }
      get_next_treasure_rank: { Args: never; Returns: number }
      get_seedling_counter: {
        Args: { sponsor_id_param: string }
        Returns: {
          network_growth_percent: number
          seeds_planted: number
          seeds_sprouted: number
          total_earnings: number
          total_projects_completed: number
        }[]
      }
      get_shared_vault_content: {
        Args: { p_family_id: string }
        Returns: {
          content_id: string
          content_text: string
          content_type: string
          description: string
          file_url: string
          location: string
          original_date: string
          photo_urls: string[]
          shared_at: string
          shared_by_member_id: string
          shared_by_name: string
          tags: string[]
          thumbnail_url: string
          title: string
        }[]
      }
      get_time_bracket: { Args: { duration_minutes: number }; Returns: string }
      get_user_badges: {
        Args: { p_user_id: string }
        Returns: {
          badge_category: string
          badge_code: string
          badge_color: string
          description: string
          display_name: string
          earned_at: string
          icon: string
          is_featured: boolean
          metric_value: number
          tier_level: number
          tier_name: string
        }[]
      }
      get_user_plugs: {
        Args: { p_user_id: string }
        Returns: {
          features: Json
          is_enabled: boolean
          platform: string
          platform_username: string
        }[]
      }
      graduate_from_gleaning: { Args: { p_user_id: string }; Returns: boolean }
      grant_gleaning_credits: {
        Args: { p_credits?: number; p_user_id: string }
        Returns: boolean
      }
      has_active_commitment_lock: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      hash_email: { Args: { email: string }; Returns: string }
      increment_battle_votes: {
        Args: { p_participant_id: string; p_vote_count?: number }
        Returns: undefined
      }
      increment_ghost_click: { Args: { p_token: string }; Returns: undefined }
      increment_ghost_share: { Args: { p_token: string }; Returns: undefined }
      invoke_cloth_pouch: {
        Args: { p_description: string; p_pouch_id: string; p_user_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_cost_plus_certified: {
        Args: { p_anchor_id: string }
        Returns: boolean
      }
      is_product_c20_available: {
        Args: { p_product_config_id: string }
        Returns: boolean
      }
      join_candle_pair: {
        Args: { p_pair_code: string; p_user_id: string }
        Returns: Json
      }
      link_vault_to_family: {
        Args: {
          p_family_id: string
          p_family_member_id: string
          p_vault_person: string
        }
        Returns: Json
      }
      mark_article_read: {
        Args: { p_article_path: string; p_article_title?: string }
        Returns: undefined
      }
      mark_gift_purchased: {
        Args: { p_item_id: string; p_member_id: string }
        Returns: Json
      }
      mark_post_failed: {
        Args: { p_error: string; p_post_id: string }
        Returns: undefined
      }
      mark_post_sent: {
        Args: { p_platform_post_id: string; p_post_id: string }
        Returns: undefined
      }
      normalize_ingredient: { Args: { ingredient: string }; Returns: string }
      opt_out_of_aggregation: {
        Args: { p_user_id: string; p_window_id: string }
        Returns: undefined
      }
      perform_fresh_start: { Args: { p_user_id: string }; Returns: Json }
      process_cue_card_click: {
        Args: {
          p_clicker_ghost_id?: string
          p_clicker_id?: string
          p_platform?: string
          p_share_id: string
          p_sharer_id: string
          p_template_id: string
        }
        Returns: Json
      }
      process_recipe_vote: {
        Args: {
          p_marks_committed: number
          p_recipe_id: string
          p_user_id: string
        }
        Returns: {
          creator_id: string
          shadow_marks_crystallized: number
          vote_recorded: boolean
        }[]
      }
      process_recurring_commitment: {
        Args: { commitment_id: string }
        Returns: boolean
      }
      read_dna_lock: { Args: { _key: string }; Returns: string }
      record_c20_margin_contribution: {
        Args: {
          p_anchor_id: string
          p_order_id?: string
          p_product_config_id: string
          p_units_sold?: number
        }
        Returns: number
      }
      record_credit_transaction: {
        Args: {
          p_amount: number
          p_description?: string
          p_ref_id?: string
          p_ref_type?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      record_free_daily_usage: {
        Args: {
          p_device_fingerprint: string
          p_feature_type: string
          p_ip_hash: string
          p_session_duration?: number
          p_user_id: string
        }
        Returns: {
          remaining_uses: number
          success: boolean
          upgrade_message: string
          uses_today: number
        }[]
      }
      record_pass_through: {
        Args: {
          p_anchor_id: string
          p_cue_card_id: string
          p_ip_hash?: string
          p_level: number
        }
        Returns: string
      }
      record_promotion_click: {
        Args: {
          p_click_source?: string
          p_clicker_ghost_id?: string
          p_clicker_id?: string
          p_destination_id: string
          p_platform?: string
          p_project_id: string
          p_promoter_id: string
        }
        Returns: Json
      }
      regenerate_candle: { Args: { p_user_id: string }; Returns: number }
      request_cost_plus_certification: {
        Args: {
          p_anchor_id: string
          p_cost_breakdown?: Json
          p_evidence_notes?: string
          p_evidence_url?: string
        }
        Returns: string
      }
      return_swoop_pledges: {
        Args: { p_initiative_id: string }
        Returns: number
      }
      revoke_cost_plus_certification: {
        Args: { p_anchor_id: string; p_reason: string }
        Returns: boolean
      }
      revoke_vault_sharing: {
        Args: { p_authorization_id: string; p_reason?: string }
        Returns: Json
      }
      reward_ghost_for_conversion: {
        Args: { p_token: string }
        Returns: undefined
      }
      satisfy_commitment_lock: {
        Args: { p_campaign_id: string; p_user_id: string }
        Returns: boolean
      }
      schedule_member_post: {
        Args: {
          p_account_id: string
          p_content: string
          p_cue_card_id?: string
          p_hashtags?: string[]
          p_link_url?: string
          p_media_urls?: string[]
          p_scheduled_for: string
          p_user_id: string
        }
        Returns: string
      }
      spend_c20_balance: {
        Args: {
          p_amount: number
          p_anchor_id: string
          p_notes?: string
          p_order_id?: string
        }
        Returns: {
          balance_used: number
          joules_needed: number
          remaining_balance: number
        }[]
      }
      start_swoop_voting: { Args: { project_id: string }; Returns: boolean }
      toggle_social_plug: {
        Args: { p_enabled: boolean; p_platform: string; p_user_id: string }
        Returns: boolean
      }
      unclaim_gift_item: {
        Args: { p_item_id: string; p_member_id: string }
        Returns: Json
      }
      update_aggregation_window_stats: {
        Args: { window_id: string }
        Returns: undefined
      }
      update_cost_plus_compliance: {
        Args: {
          p_anchor_id: string
          p_is_compliant: boolean
          p_transaction_amount: number
        }
        Returns: undefined
      }
      update_hexisle_resources: {
        Args: {
          p_credits?: number
          p_food?: number
          p_materials?: number
          p_user_id: string
          p_water?: number
        }
        Returns: {
          cities_discovered: string[] | null
          created_at: string | null
          credits: number | null
          current_city_id: string | null
          current_hex_x: number | null
          current_hex_y: number | null
          food: number | null
          id: string
          last_move: string | null
          level: number | null
          materials: number | null
          updated_at: string | null
          user_id: string | null
          water: number | null
          xp: number | null
        }
        SetofOptions: {
          from: "*"
          to: "hexisle_player_state"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      use_candle: {
        Args: { p_amount: number; p_is_babylon?: boolean; p_user_id: string }
        Returns: boolean
      }
      verify_cue_card:
        | { Args: { p_context_id: string; p_herald_id: string }; Returns: Json }
        | {
            Args: { p_payload_hash: string }
            Returns: {
              anchor_url: string
              business_name: string
              charitable_icon: string
              charitable_tier: string
              first_seen: string
              is_valid: boolean
              total_scans: number
              trust_score: number
            }[]
          }
    }
    Enums: {
      [_ in never]: never
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
