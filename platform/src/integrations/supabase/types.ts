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
  public: {
    Tables: {
      agent_action_audit_log: {
        Row: {
          action_type: string
          agent_email: string
          agent_id: string
          agent_role: string | null
          changes: Json
          id: string
          ip_address: string | null
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          verification_method: string | null
          verified: boolean | null
        }
        Insert: {
          action_type: string
          agent_email: string
          agent_id: string
          agent_role?: string | null
          changes: Json
          id?: string
          ip_address?: string | null
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          verification_method?: string | null
          verified?: boolean | null
        }
        Update: {
          action_type?: string
          agent_email?: string
          agent_id?: string
          agent_role?: string | null
          changes?: Json
          id?: string
          ip_address?: string | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          verification_method?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      agent_assessment_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          onboarding_id: string
          uploaded_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          onboarding_id: string
          uploaded_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          onboarding_id?: string
          uploaded_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_assessment_documents_onboarding_id_fkey"
            columns: ["onboarding_id"]
            isOneToOne: false
            referencedRelation: "agent_onboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_onboarding: {
        Row: {
          approval_status: string | null
          completed_at: string | null
          created_at: string | null
          hr_notes: string | null
          id: string
          keirsey_assessment_url: string | null
          keirsey_completed: boolean | null
          keirsey_completed_at: string | null
          keirsey_score_summary: Json | null
          keirsey_temperament:
            | Database["public"]["Enums"]["keirsey_temperament"]
            | null
          keirsey_variant: Database["public"]["Enums"]["keirsey_variant"] | null
          position_application_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          hr_notes?: string | null
          id?: string
          keirsey_assessment_url?: string | null
          keirsey_completed?: boolean | null
          keirsey_completed_at?: string | null
          keirsey_score_summary?: Json | null
          keirsey_temperament?:
            | Database["public"]["Enums"]["keirsey_temperament"]
            | null
          keirsey_variant?:
            | Database["public"]["Enums"]["keirsey_variant"]
            | null
          position_application_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_status?: string | null
          completed_at?: string | null
          created_at?: string | null
          hr_notes?: string | null
          id?: string
          keirsey_assessment_url?: string | null
          keirsey_completed?: boolean | null
          keirsey_completed_at?: string | null
          keirsey_score_summary?: Json | null
          keirsey_temperament?:
            | Database["public"]["Enums"]["keirsey_temperament"]
            | null
          keirsey_variant?:
            | Database["public"]["Enums"]["keirsey_variant"]
            | null
          position_application_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_onboarding_position_application_id_fkey"
            columns: ["position_application_id"]
            isOneToOne: false
            referencedRelation: "position_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_reviews: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          notes: string | null
          rating: number | null
          recommendation: string | null
          reviewed_at: string | null
          reviewer_email: string
          reviewer_id: string
          strengths: string | null
          updated_at: string | null
          weaknesses: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          recommendation?: string | null
          reviewed_at?: string | null
          reviewer_email: string
          reviewer_id: string
          strengths?: string | null
          updated_at?: string | null
          weaknesses?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          recommendation?: string | null
          reviewed_at?: string | null
          reviewer_email?: string
          reviewer_id?: string
          strengths?: string | null
          updated_at?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "position_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_downloads: {
        Row: {
          asset_id: string | null
          download_type: string | null
          downloaded_at: string | null
          fee_paid: number | null
          id: string
          ip_transaction_logged: boolean | null
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          download_type?: string | null
          downloaded_at?: string | null
          fee_paid?: number | null
          id?: string
          ip_transaction_logged?: boolean | null
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          download_type?: string | null
          downloaded_at?: string | null
          fee_paid?: number | null
          id?: string
          ip_transaction_logged?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_downloads_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "lb_asset_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_prototyping_contracts: {
        Row: {
          asset_id: string | null
          backup_compensation_credits: number | null
          contractor_id: string | null
          created_at: string | null
          credits_reward: number | null
          deadline: string | null
          feedback: string | null
          id: string
          is_backup: boolean | null
          proof_urls: Json | null
          reputation_points: number | null
          requirements: Json | null
          slot_number: number | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id?: string | null
          backup_compensation_credits?: number | null
          contractor_id?: string | null
          created_at?: string | null
          credits_reward?: number | null
          deadline?: string | null
          feedback?: string | null
          id?: string
          is_backup?: boolean | null
          proof_urls?: Json | null
          reputation_points?: number | null
          requirements?: Json | null
          slot_number?: number | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string | null
          backup_compensation_credits?: number | null
          contractor_id?: string | null
          created_at?: string | null
          credits_reward?: number | null
          deadline?: string | null
          feedback?: string | null
          id?: string
          is_backup?: boolean | null
          proof_urls?: Json | null
          reputation_points?: number | null
          requirements?: Json | null
          slot_number?: number | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_prototyping_contracts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "lb_asset_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_prototyping_contracts_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_submissions: {
        Row: {
          asset_content: Json
          asset_title: string
          asset_type: string
          contribution_percentage: number | null
          created_at: string | null
          id: string
          is_contribution_locked: boolean | null
          member_id: string
          project_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          workstation_id: string | null
        }
        Insert: {
          asset_content: Json
          asset_title: string
          asset_type: string
          contribution_percentage?: number | null
          created_at?: string | null
          id?: string
          is_contribution_locked?: boolean | null
          member_id: string
          project_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          workstation_id?: string | null
        }
        Update: {
          asset_content?: Json
          asset_title?: string
          asset_type?: string
          contribution_percentage?: number | null
          created_at?: string | null
          id?: string
          is_contribution_locked?: boolean | null
          member_id?: string
          project_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          workstation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_position_slas: {
        Row: {
          activation_notice_hours: number
          average_response_time_hours: number | null
          created_at: string | null
          failed_activation_penalty_pct: number
          failed_activations: number | null
          id: string
          late_response_penalty_pct: number
          max_activation_delay_hours: number
          position_id: string
          project_id: string
          reputation_hit_per_violation: number
          response_time_hours: number
          successful_activations: number | null
          total_activations: number | null
          updated_at: string | null
        }
        Insert: {
          activation_notice_hours?: number
          average_response_time_hours?: number | null
          created_at?: string | null
          failed_activation_penalty_pct?: number
          failed_activations?: number | null
          id?: string
          late_response_penalty_pct?: number
          max_activation_delay_hours?: number
          position_id: string
          project_id: string
          reputation_hit_per_violation?: number
          response_time_hours?: number
          successful_activations?: number | null
          total_activations?: number | null
          updated_at?: string | null
        }
        Update: {
          activation_notice_hours?: number
          average_response_time_hours?: number | null
          created_at?: string | null
          failed_activation_penalty_pct?: number
          failed_activations?: number | null
          id?: string
          late_response_penalty_pct?: number
          max_activation_delay_hours?: number
          position_id?: string
          project_id?: string
          reputation_hit_per_violation?: number
          response_time_hours?: number
          successful_activations?: number | null
          total_activations?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_position_slas_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_position_slas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      banyan_board_members: {
        Row: {
          board_member_id: string
          council_id: string
          elected_at: string
          id: string
          is_active: boolean
          term_end: string | null
          term_start: string
        }
        Insert: {
          board_member_id: string
          council_id: string
          elected_at?: string
          id?: string
          is_active?: boolean
          term_end?: string | null
          term_start?: string
        }
        Update: {
          board_member_id?: string
          council_id?: string
          elected_at?: string
          id?: string
          is_active?: boolean
          term_end?: string | null
          term_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "banyan_board_members_council_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "division_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_audit_log: {
        Row: {
          action: string
          id: string
          module_id: string
          notes: string | null
          performed_at: string | null
          performed_by: string | null
          project_id: string
          verification_result: Json | null
        }
        Insert: {
          action: string
          id?: string
          module_id: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          project_id: string
          verification_result?: Json | null
        }
        Update: {
          action?: string
          id?: string
          module_id?: string
          notes?: string | null
          performed_at?: string | null
          performed_by?: string | null
          project_id?: string
          verification_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_audit_log_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "project_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_audit_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_gas_costs: {
        Row: {
          block_number: number | null
          created_at: string
          funded_from_pool: boolean | null
          gas_price_gwei: number
          gas_used: number
          id: string
          network: string
          notes: string | null
          portal: string | null
          project_id: string
          total_cost_usd: number
          transaction_hash: string | null
          transaction_type: string
        }
        Insert: {
          block_number?: number | null
          created_at?: string
          funded_from_pool?: boolean | null
          gas_price_gwei?: number
          gas_used?: number
          id?: string
          network?: string
          notes?: string | null
          portal?: string | null
          project_id: string
          total_cost_usd?: number
          transaction_hash?: string | null
          transaction_type: string
        }
        Update: {
          block_number?: number | null
          created_at?: string
          funded_from_pool?: boolean | null
          gas_price_gwei?: number
          gas_used?: number
          id?: string
          network?: string
          notes?: string | null
          portal?: string | null
          project_id?: string
          total_cost_usd?: number
          transaction_hash?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_gas_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_entities: {
        Row: {
          activated_at: string
          charter_id: string | null
          created_at: string
          ein: string | null
          entity_name: string
          entity_type: string
          guild_id: string
          id: string
          is_active: boolean
          profit_share_percentage: number | null
          registration_number: string | null
          registration_state: string | null
          relationship_to_lb: string
          shared_revenue_account: boolean
          updated_at: string
        }
        Insert: {
          activated_at?: string
          charter_id?: string | null
          created_at?: string
          ein?: string | null
          entity_name: string
          entity_type: string
          guild_id: string
          id?: string
          is_active?: boolean
          profit_share_percentage?: number | null
          registration_number?: string | null
          registration_state?: string | null
          relationship_to_lb?: string
          shared_revenue_account?: boolean
          updated_at?: string
        }
        Update: {
          activated_at?: string
          charter_id?: string | null
          created_at?: string
          ein?: string | null
          entity_name?: string
          entity_type?: string
          guild_id?: string
          id?: string
          is_active?: boolean
          profit_share_percentage?: number | null
          registration_number?: string | null
          registration_state?: string | null
          relationship_to_lb?: string
          shared_revenue_account?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_entities_charter_id_fkey"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "guild_charters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_entities_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plan_tasks: {
        Row: {
          actual_completion_date: string | null
          actual_start_date: string | null
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          made_moot_reason: string | null
          metadata: Json | null
          notes: string | null
          prerequisite_task_ids: string[] | null
          priority: number
          project_id: string
          scheduled_completion_date: string | null
          scheduled_start_date: string | null
          status: string
          task_description: string | null
          task_name: string
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          category: string
          created_at?: string
          id?: string
          made_moot_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          prerequisite_task_ids?: string[] | null
          priority?: number
          project_id: string
          scheduled_completion_date?: string | null
          scheduled_start_date?: string | null
          status?: string
          task_description?: string | null
          task_name: string
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          made_moot_reason?: string | null
          metadata?: Json | null
          notes?: string | null
          prerequisite_task_ids?: string[] | null
          priority?: number
          project_id?: string
          scheduled_completion_date?: string | null
          scheduled_start_date?: string | null
          status?: string
          task_description?: string | null
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          can_be_revisited: boolean | null
          challenge_id: string
          content_url: string
          created_at: string
          description: string | null
          engagement_metrics: Json | null
          entrance_fee_paid: number | null
          final_score: number | null
          hexisle_xp_awarded: number | null
          id: string
          ideation_level: number | null
          judge_scores: Json | null
          placement: string | null
          prize_awarded: number | null
          reviewed_at: string | null
          submission_category: string
          submission_title: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_be_revisited?: boolean | null
          challenge_id: string
          content_url: string
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          entrance_fee_paid?: number | null
          final_score?: number | null
          hexisle_xp_awarded?: number | null
          id?: string
          ideation_level?: number | null
          judge_scores?: Json | null
          placement?: string | null
          prize_awarded?: number | null
          reviewed_at?: string | null
          submission_category: string
          submission_title: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_be_revisited?: boolean | null
          challenge_id?: string
          content_url?: string
          created_at?: string
          description?: string | null
          engagement_metrics?: Json | null
          entrance_fee_paid?: number | null
          final_score?: number | null
          hexisle_xp_awarded?: number | null
          id?: string
          ideation_level?: number | null
          judge_scores?: Json | null
          placement?: string | null
          prize_awarded?: number | null
          reviewed_at?: string | null
          submission_category?: string
          submission_title?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "influencer_challenge_config"
            referencedColumns: ["id"]
          },
        ]
      }
      charter_signatories: {
        Row: {
          charter_id: string
          charter_type: string | null
          id: string
          signature_data: Json | null
          signed_at: string
          user_id: string
        }
        Insert: {
          charter_id: string
          charter_type?: string | null
          id?: string
          signature_data?: Json | null
          signed_at?: string
          user_id: string
        }
        Update: {
          charter_id?: string
          charter_type?: string | null
          id?: string
          signature_data?: Json | null
          signed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charter_signatories_charter_id_fkey"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "guild_charters"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          awarded_at: string | null
          clan_id: string
          created_at: string | null
          icon_url: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          awarded_at?: string | null
          clan_id: string
          created_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          awarded_at?: string | null
          clan_id?: string
          created_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_achievements_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_agreement_beneficiaries: {
        Row: {
          agreement_id: string
          beneficiary_user_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          agreement_id: string
          beneficiary_user_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          agreement_id?: string
          beneficiary_user_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_agreement_beneficiaries_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "clan_member_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_charters: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          charter_document: string
          charter_name: string
          clan_id: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          charter_document: string
          charter_name: string
          clan_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          charter_document?: string
          charter_name?: string
          clan_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_charters_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_member_agreements: {
        Row: {
          agreement_type: string
          applies_to: string | null
          clan_id: string
          created_at: string
          created_by: string
          discount_percentage: number | null
          id: string
          is_active: boolean
          specific_member_ids: string[] | null
          terms: Json | null
        }
        Insert: {
          agreement_type: string
          applies_to?: string | null
          clan_id: string
          created_at?: string
          created_by: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          specific_member_ids?: string[] | null
          terms?: Json | null
        }
        Update: {
          agreement_type?: string
          applies_to?: string | null
          clan_id?: string
          created_at?: string
          created_by?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          specific_member_ids?: string[] | null
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_member_agreements_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_members: {
        Row: {
          clan_id: string
          id: string
          is_active: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          clan_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          clan_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_resource_sharing: {
        Row: {
          actual_return_date: string | null
          borrower_project_id: string
          clan_discount_percentage: number
          clan_id: string
          condition_at_loan: string | null
          condition_at_return: string | null
          created_at: string | null
          damage_description: string | null
          damage_reported: boolean | null
          discounted_rate: number
          id: string
          owner_project_id: string
          paid: boolean | null
          payment_date: string | null
          reputation_penalty_applied: number | null
          reserved_from: string
          reserved_until: string
          resource_description: string | null
          resource_name: string
          resource_type: string
          standard_rental_rate: number
          status: string
          total_cost: number | null
          updated_at: string | null
          vouched_by: string | null
          voucher_reputation_risk: number | null
        }
        Insert: {
          actual_return_date?: string | null
          borrower_project_id: string
          clan_discount_percentage?: number
          clan_id: string
          condition_at_loan?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          damage_description?: string | null
          damage_reported?: boolean | null
          discounted_rate: number
          id?: string
          owner_project_id: string
          paid?: boolean | null
          payment_date?: string | null
          reputation_penalty_applied?: number | null
          reserved_from: string
          reserved_until: string
          resource_description?: string | null
          resource_name: string
          resource_type: string
          standard_rental_rate: number
          status?: string
          total_cost?: number | null
          updated_at?: string | null
          vouched_by?: string | null
          voucher_reputation_risk?: number | null
        }
        Update: {
          actual_return_date?: string | null
          borrower_project_id?: string
          clan_discount_percentage?: number
          clan_id?: string
          condition_at_loan?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          damage_description?: string | null
          damage_reported?: boolean | null
          discounted_rate?: number
          id?: string
          owner_project_id?: string
          paid?: boolean | null
          payment_date?: string | null
          reputation_penalty_applied?: number | null
          reserved_from?: string
          reserved_until?: string
          resource_description?: string | null
          resource_name?: string
          resource_type?: string
          standard_rental_rate?: number
          status?: string
          total_cost?: number | null
          updated_at?: string | null
          vouched_by?: string | null
          voucher_reputation_risk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_resource_sharing_borrower_project_id_fkey"
            columns: ["borrower_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_resource_sharing_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_resource_sharing_owner_project_id_fkey"
            columns: ["owner_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          activated_at: string | null
          charter_current_signatures: number | null
          charter_id: string | null
          charter_required_signatures: number | null
          created_at: string
          created_by: string
          custom_name: string | null
          description: string | null
          display_name: string | null
          id: string
          is_active: boolean
          lb_fee_paid: number
          name: string
          stake_amount: number
          status: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          charter_current_signatures?: number | null
          charter_id?: string | null
          charter_required_signatures?: number | null
          created_at?: string
          created_by: string
          custom_name?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          lb_fee_paid?: number
          name: string
          stake_amount?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          charter_current_signatures?: number | null
          charter_id?: string | null
          charter_required_signatures?: number | null
          created_at?: string
          created_by?: string
          custom_name?: string | null
          description?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          lb_fee_paid?: number
          name?: string
          stake_amount?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_clan_charter"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "clan_charters"
            referencedColumns: ["id"]
          },
        ]
      }
      company_milestones: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          milestone_description: string | null
          milestone_type: string
          project_id: string
          verified_by: string | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_description?: string | null
          milestone_type: string
          project_id: string
          verified_by?: string | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_description?: string | null
          milestone_type?: string
          project_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_assignment_configs: {
        Row: {
          assignment_lead_time_days: number
          created_at: string | null
          id: string
          max_equity_ratio: number
          min_equity_ratio: number
          prerequisites: Json | null
          project_id: string
          requirements: Json | null
          time_commitment_options: Json
          updated_at: string | null
        }
        Insert: {
          assignment_lead_time_days?: number
          created_at?: string | null
          id?: string
          max_equity_ratio?: number
          min_equity_ratio?: number
          prerequisites?: Json | null
          project_id: string
          requirements?: Json | null
          time_commitment_options?: Json
          updated_at?: string | null
        }
        Update: {
          assignment_lead_time_days?: number
          created_at?: string | null
          id?: string
          max_equity_ratio?: number
          min_equity_ratio?: number
          prerequisites?: Json | null
          project_id?: string
          requirements?: Json | null
          time_commitment_options?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_assignment_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_completions: {
        Row: {
          blockchain_recorded: boolean | null
          completion_date: string | null
          contract_xml_hash: string | null
          credits_awarded: number | null
          equity_awarded: number | null
          id: string
          medallion_qr_code: string | null
          member_id: string
          position_id: string | null
          project_id: string
        }
        Insert: {
          blockchain_recorded?: boolean | null
          completion_date?: string | null
          contract_xml_hash?: string | null
          credits_awarded?: number | null
          equity_awarded?: number | null
          id?: string
          medallion_qr_code?: string | null
          member_id: string
          position_id?: string | null
          project_id: string
        }
        Update: {
          blockchain_recorded?: boolean | null
          completion_date?: string | null
          contract_xml_hash?: string | null
          credits_awarded?: number | null
          equity_awarded?: number | null
          id?: string
          medallion_qr_code?: string | null
          member_id?: string
          position_id?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_completions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_completions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_position_templates: {
        Row: {
          cash_amount: number | null
          category: Database["public"]["Enums"]["position_category"]
          compensation_type: string
          contract_xml_path: string | null
          created_at: string | null
          created_by: string | null
          credits_reserved: number
          equity_percentage: number | null
          id: string
          is_active: boolean | null
          negotiated_scale_id: string | null
          position_description: string | null
          position_title: string
          project_id: string
          required_stage: Database["public"]["Enums"]["lifecycle_stage"] | null
          scale_rate_metadata: Json | null
          scale_rate_type: string | null
          updated_at: string | null
        }
        Insert: {
          cash_amount?: number | null
          category: Database["public"]["Enums"]["position_category"]
          compensation_type?: string
          contract_xml_path?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_reserved?: number
          equity_percentage?: number | null
          id?: string
          is_active?: boolean | null
          negotiated_scale_id?: string | null
          position_description?: string | null
          position_title: string
          project_id: string
          required_stage?: Database["public"]["Enums"]["lifecycle_stage"] | null
          scale_rate_metadata?: Json | null
          scale_rate_type?: string | null
          updated_at?: string | null
        }
        Update: {
          cash_amount?: number | null
          category?: Database["public"]["Enums"]["position_category"]
          compensation_type?: string
          contract_xml_path?: string | null
          created_at?: string | null
          created_by?: string | null
          credits_reserved?: number
          equity_percentage?: number | null
          id?: string
          is_active?: boolean | null
          negotiated_scale_id?: string | null
          position_description?: string | null
          position_title?: string
          project_id?: string
          required_stage?: Database["public"]["Enums"]["lifecycle_stage"] | null
          scale_rate_metadata?: Json | null
          scale_rate_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_position_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_negotiated_scale"
            columns: ["negotiated_scale_id"]
            isOneToOne: false
            referencedRelation: "contract_scale_negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_scale_negotiations: {
        Row: {
          approved_by: string | null
          bulk_commitment_positions: number | null
          created_at: string | null
          discount_percentage: number | null
          id: string
          minimum_positions_required: number | null
          negotiated_by: string
          notes: string | null
          organization_id: string
          organization_type: string
          project_id: string
          status: string | null
          terms: Json | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          approved_by?: string | null
          bulk_commitment_positions?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          minimum_positions_required?: number | null
          negotiated_by: string
          notes?: string | null
          organization_id: string
          organization_type: string
          project_id: string
          status?: string | null
          terms?: Json | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_by?: string | null
          bulk_commitment_positions?: number | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          minimum_positions_required?: number | null
          negotiated_by?: string
          notes?: string | null
          organization_id?: string
          organization_type?: string
          project_id?: string
          status?: string | null
          terms?: Json | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_scale_negotiations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scale_negotiations_negotiated_by_fkey"
            columns: ["negotiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_scale_negotiations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_matches: {
        Row: {
          created_at: string
          id: string
          matched_amount: number
          referee_credit_amount: number
          referee_pledge_id: string
          referral_id: string
          referrer_credit_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          matched_amount: number
          referee_credit_amount: number
          referee_pledge_id: string
          referral_id: string
          referrer_credit_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          matched_amount?: number
          referee_credit_amount?: number
          referee_pledge_id?: string
          referral_id?: string
          referrer_credit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_matches_referee_pledge_id_fkey"
            columns: ["referee_pledge_id"]
            isOneToOne: false
            referencedRelation: "pledges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_matches_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "user_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          credits_amount: number
          description: string | null
          id: string
          metadata: Json | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_amount: number
          description?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_amount?: number
          description?: string | null
          id?: string
          metadata?: Json | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_withdrawals: {
        Row: {
          amount: number
          created_at: string
          fee_amount: number
          fee_percentage: number
          id: string
          net_amount: number
          processed_at: string | null
          requested_at: string
          status: string
          stripe_payout_id: string | null
          updated_at: string
          user_id: string
          withdrawal_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee_amount: number
          fee_percentage: number
          id?: string
          net_amount: number
          processed_at?: string | null
          requested_at?: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
          user_id: string
          withdrawal_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee_amount?: number
          fee_percentage?: number
          id?: string
          net_amount?: number
          processed_at?: string | null
          requested_at?: string
          status?: string
          stripe_payout_id?: string | null
          updated_at?: string
          user_id?: string
          withdrawal_type?: string
        }
        Relationships: []
      }
      crowdfunding_platform_connections: {
        Row: {
          api_key: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          oauth_refresh_token: string | null
          oauth_token: string | null
          platform: string
          project_id: string | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_refresh_token?: string | null
          oauth_token?: string | null
          platform: string
          project_id?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_refresh_token?: string | null
          oauth_token?: string | null
          platform?: string
          project_id?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_platform_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_pledges: {
        Row: {
          backer_email: string
          backer_name: string | null
          created_at: string | null
          credits_allocated: number | null
          id: string
          is_processed: boolean | null
          last_updated: string | null
          platform: string
          platform_pledge_id: string
          pledge_amount: number
          pledge_currency: string | null
          pledge_date: string
          processed_at: string | null
          product_id: string | null
          reward_tier: string | null
          synced_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backer_email: string
          backer_name?: string | null
          created_at?: string | null
          credits_allocated?: number | null
          id?: string
          is_processed?: boolean | null
          last_updated?: string | null
          platform: string
          platform_pledge_id: string
          pledge_amount?: number
          pledge_currency?: string | null
          pledge_date?: string
          processed_at?: string | null
          product_id?: string | null
          reward_tier?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backer_email?: string
          backer_name?: string | null
          created_at?: string | null
          credits_allocated?: number | null
          id?: string
          is_processed?: boolean | null
          last_updated?: string | null
          platform?: string
          platform_pledge_id?: string
          pledge_amount?: number
          pledge_currency?: string | null
          pledge_date?: string
          processed_at?: string | null
          product_id?: string | null
          reward_tier?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_pledges_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_sync_log: {
        Row: {
          completed_at: string | null
          error_details: Json | null
          errors_count: number | null
          id: string
          platform: string
          pledges_synced: number | null
          project_id: string | null
          started_at: string | null
          status: string | null
          sync_type: string | null
        }
        Insert: {
          completed_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          platform: string
          pledges_synced?: number | null
          project_id?: string | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
        }
        Update: {
          completed_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          platform?: string
          pledges_synced?: number | null
          project_id?: string | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_sync_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      derivative_compliance_audits: {
        Row: {
          audit_type: string
          audited_at: string
          audited_by: string | null
          compliance_status: string
          derivative_project_id: string
          findings: Json | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
        }
        Insert: {
          audit_type: string
          audited_at?: string
          audited_by?: string | null
          compliance_status: string
          derivative_project_id: string
          findings?: Json | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
        }
        Update: {
          audit_type?: string
          audited_at?: string
          audited_by?: string | null
          compliance_status?: string
          derivative_project_id?: string
          findings?: Json | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "derivative_compliance_audits_derivative_project_id_fkey"
            columns: ["derivative_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      derivative_royalties: {
        Row: {
          created_at: string
          derivative_project_id: string
          id: string
          paid_at: string | null
          parent_project_id: string
          payment_status: string
          revenue_amount: number
          royalty_amount: number
          royalty_percentage: number
          transaction_hash: string | null
        }
        Insert: {
          created_at?: string
          derivative_project_id: string
          id?: string
          paid_at?: string | null
          parent_project_id: string
          payment_status?: string
          revenue_amount: number
          royalty_amount: number
          royalty_percentage: number
          transaction_hash?: string | null
        }
        Update: {
          created_at?: string
          derivative_project_id?: string
          id?: string
          paid_at?: string | null
          parent_project_id?: string
          payment_status?: string
          revenue_amount?: number
          royalty_amount?: number
          royalty_percentage?: number
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "derivative_royalties_derivative_project_id_fkey"
            columns: ["derivative_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "derivative_royalties_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      division_councils: {
        Row: {
          appointed_at: string
          council_member_id: string
          division_name: string
          id: string
          is_active: boolean
        }
        Insert: {
          appointed_at?: string
          council_member_id: string
          division_name: string
          id?: string
          is_active?: boolean
        }
        Update: {
          appointed_at?: string
          council_member_id?: string
          division_name?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "division_councils_council_member_id_fkey"
            columns: ["council_member_id"]
            isOneToOne: false
            referencedRelation: "guild_representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      eoi_vesting_schedules: {
        Row: {
          amount_vested: number
          cash_ratio: number
          created_at: string
          days_elapsed: number
          eoi_amount: number
          equity_ratio: number
          id: string
          project_id: string
          ranking_score: number
          status: string
          total_vesting_days: number
          updated_at: string
          user_id: string
          vesting_start_date: string
        }
        Insert: {
          amount_vested?: number
          cash_ratio: number
          created_at?: string
          days_elapsed?: number
          eoi_amount: number
          equity_ratio: number
          id?: string
          project_id: string
          ranking_score: number
          status?: string
          total_vesting_days: number
          updated_at?: string
          user_id: string
          vesting_start_date?: string
        }
        Update: {
          amount_vested?: number
          cash_ratio?: number
          created_at?: string
          days_elapsed?: number
          eoi_amount?: number
          equity_ratio?: number
          id?: string
          project_id?: string
          ranking_score?: number
          status?: string
          total_vesting_days?: number
          updated_at?: string
          user_id?: string
          vesting_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "eoi_vesting_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_charters: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          can_form_entity: boolean
          charter_document: string
          charter_name: string
          charter_type: string
          created_at: string
          entity_relationship: string | null
          governance_model: Json | null
          guild_id: string
          id: string
          is_active: boolean
          profit_sharing_model: Json | null
          resource_pooling_rules: Json | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          can_form_entity?: boolean
          charter_document: string
          charter_name: string
          charter_type: string
          created_at?: string
          entity_relationship?: string | null
          governance_model?: Json | null
          guild_id: string
          id?: string
          is_active?: boolean
          profit_sharing_model?: Json | null
          resource_pooling_rules?: Json | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          can_form_entity?: boolean
          charter_document?: string
          charter_name?: string
          charter_type?: string
          created_at?: string
          entity_relationship?: string | null
          governance_model?: Json | null
          guild_id?: string
          id?: string
          is_active?: boolean
          profit_sharing_model?: Json | null
          resource_pooling_rules?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_charters_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: true
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_connections: {
        Row: {
          active_projects: number
          connection_strength: number
          connection_type: string
          contract_terms: Json | null
          established_at: string
          from_guild_id: string
          id: string
          is_active: boolean
          to_guild_id: string
        }
        Insert: {
          active_projects?: number
          connection_strength?: number
          connection_type: string
          contract_terms?: Json | null
          established_at?: string
          from_guild_id: string
          id?: string
          is_active?: boolean
          to_guild_id: string
        }
        Update: {
          active_projects?: number
          connection_strength?: number
          connection_type?: string
          contract_terms?: Json | null
          established_at?: string
          from_guild_id?: string
          id?: string
          is_active?: boolean
          to_guild_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_connections_from_guild_id_fkey"
            columns: ["from_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_connections_to_guild_id_fkey"
            columns: ["to_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_investment_fund: {
        Row: {
          allocated_to_captain_badges: number
          allocated_to_emergency_support: number
          allocated_to_gas: number
          allocated_to_infrastructure: number
          created_at: string
          id: string
          last_allocation_at: string | null
          total_fund_amount: number
          total_journeyman_stakes: number
          total_master_stakes: number
          updated_at: string
        }
        Insert: {
          allocated_to_captain_badges?: number
          allocated_to_emergency_support?: number
          allocated_to_gas?: number
          allocated_to_infrastructure?: number
          created_at?: string
          id?: string
          last_allocation_at?: string | null
          total_fund_amount?: number
          total_journeyman_stakes?: number
          total_master_stakes?: number
          updated_at?: string
        }
        Update: {
          allocated_to_captain_badges?: number
          allocated_to_emergency_support?: number
          allocated_to_gas?: number
          allocated_to_infrastructure?: number
          created_at?: string
          id?: string
          last_allocation_at?: string | null
          total_fund_amount?: number
          total_journeyman_stakes?: number
          total_master_stakes?: number
          updated_at?: string
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          is_active: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
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
      guild_membership_history: {
        Row: {
          action: string
          class_at_action: number | null
          created_at: string
          guild_id: string | null
          id: string
          reason: string | null
          stake_at_action: number | null
          tier_at_action: string | null
          user_id: string
        }
        Insert: {
          action: string
          class_at_action?: number | null
          created_at?: string
          guild_id?: string | null
          id?: string
          reason?: string | null
          stake_at_action?: number | null
          tier_at_action?: string | null
          user_id: string
        }
        Update: {
          action?: string
          class_at_action?: number | null
          created_at?: string
          guild_id?: string | null
          id?: string
          reason?: string | null
          stake_at_action?: number | null
          tier_at_action?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_membership_history_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_name_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name_type?: string
        }
        Relationships: []
      }
      guild_representatives: {
        Row: {
          elected_at: string
          election_type: string
          guild_id: string
          id: string
          is_active: boolean
          representative_id: string
          term_end: string | null
          term_start: string
        }
        Insert: {
          elected_at?: string
          election_type: string
          guild_id: string
          id?: string
          is_active?: boolean
          representative_id: string
          term_end?: string | null
          term_start?: string
        }
        Update: {
          elected_at?: string
          election_type?: string
          guild_id?: string
          id?: string
          is_active?: boolean
          representative_id?: string
          term_end?: string | null
          term_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_representatives_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_sponsorship_records: {
        Row: {
          access_fee_percentage: number
          class_difference: number
          completed_at: string | null
          contract_completed_successfully: boolean | null
          contract_id: string
          contract_value: number
          created_at: string | null
          id: string
          mentee_class: number
          mentee_id: string
          mentee_reputation_at_signing: number
          mentee_tier: string
          project_id: string
          reputation_penalty_applied: number | null
          reputation_penalty_date: string | null
          reputation_risk_percentage: number
          signed_at: string | null
          sponsor_class: number
          sponsor_earnings: number | null
          sponsor_id: string
          sponsor_reputation_at_signing: number
          sponsor_tier: string
          status: string
          tier_difference: number
          updated_at: string | null
        }
        Insert: {
          access_fee_percentage: number
          class_difference: number
          completed_at?: string | null
          contract_completed_successfully?: boolean | null
          contract_id: string
          contract_value: number
          created_at?: string | null
          id?: string
          mentee_class: number
          mentee_id: string
          mentee_reputation_at_signing: number
          mentee_tier: string
          project_id: string
          reputation_penalty_applied?: number | null
          reputation_penalty_date?: string | null
          reputation_risk_percentage: number
          signed_at?: string | null
          sponsor_class: number
          sponsor_earnings?: number | null
          sponsor_id: string
          sponsor_reputation_at_signing: number
          sponsor_tier: string
          status?: string
          tier_difference: number
          updated_at?: string | null
        }
        Update: {
          access_fee_percentage?: number
          class_difference?: number
          completed_at?: string | null
          contract_completed_successfully?: boolean | null
          contract_id?: string
          contract_value?: number
          created_at?: string | null
          id?: string
          mentee_class?: number
          mentee_id?: string
          mentee_reputation_at_signing?: number
          mentee_tier?: string
          project_id?: string
          reputation_penalty_applied?: number | null
          reputation_penalty_date?: string | null
          reputation_risk_percentage?: number
          signed_at?: string | null
          sponsor_class?: number
          sponsor_earnings?: number | null
          sponsor_id?: string
          sponsor_reputation_at_signing?: number
          sponsor_tier?: string
          status?: string
          tier_difference?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_sponsorship_records_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_sponsorship_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_stake_payments: {
        Row: {
          amount_paid: number
          class_level: number
          created_at: string
          cumulative_total: number
          id: string
          paid_at: string
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_price_id: string
          stripe_session_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          class_level: number
          created_at?: string
          cumulative_total: number
          id?: string
          paid_at?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_price_id: string
          stripe_session_id?: string | null
          tier: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          class_level?: number
          created_at?: string
          cumulative_total?: number
          id?: string
          paid_at?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_price_id?: string
          stripe_session_id?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      guilds: {
        Row: {
          charter_id: string | null
          created_at: string
          created_by: string | null
          custom_name: string | null
          description: string | null
          display_name: string | null
          guild_type: Database["public"]["Enums"]["guild_type"]
          id: string
          is_official: boolean
          min_interactions: number
          min_reputation_score: number
          name: string
          parent_guild_id: string | null
          updated_at: string
        }
        Insert: {
          charter_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_name?: string | null
          description?: string | null
          display_name?: string | null
          guild_type: Database["public"]["Enums"]["guild_type"]
          id?: string
          is_official?: boolean
          min_interactions?: number
          min_reputation_score?: number
          name: string
          parent_guild_id?: string | null
          updated_at?: string
        }
        Update: {
          charter_id?: string | null
          created_at?: string
          created_by?: string | null
          custom_name?: string | null
          description?: string | null
          display_name?: string | null
          guild_type?: Database["public"]["Enums"]["guild_type"]
          id?: string
          is_official?: boolean
          min_interactions?: number
          min_reputation_score?: number
          name?: string
          parent_guild_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_guilds_charter"
            columns: ["charter_id"]
            isOneToOne: false
            referencedRelation: "guild_charters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_parent_guild_id_fkey"
            columns: ["parent_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      hexisle_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          credit_bonus: number | null
          earned_at: string | null
          id: string
          island_name: string | null
          metadata: Json | null
          user_id: string
          xp_bonus: number | null
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          credit_bonus?: number | null
          earned_at?: string | null
          id?: string
          island_name?: string | null
          metadata?: Json | null
          user_id: string
          xp_bonus?: number | null
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          credit_bonus?: number | null
          earned_at?: string | null
          id?: string
          island_name?: string | null
          metadata?: Json | null
          user_id?: string
          xp_bonus?: number | null
        }
        Relationships: []
      }
      hexisle_skill_verifications: {
        Row: {
          created_at: string | null
          evidence_data: Json
          evidence_type: string
          id: string
          island_name: string
          project_id: string | null
          rejection_reason: string | null
          skill_claimed: string
          status: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          xp_awarded: number | null
        }
        Insert: {
          created_at?: string | null
          evidence_data?: Json
          evidence_type: string
          id?: string
          island_name: string
          project_id?: string | null
          rejection_reason?: string | null
          skill_claimed: string
          status?: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: number | null
        }
        Update: {
          created_at?: string | null
          evidence_data?: Json
          evidence_type?: string
          id?: string
          island_name?: string
          project_id?: string | null
          rejection_reason?: string | null
          skill_claimed?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hexisle_skill_verifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_pricing_data: {
        Row: {
          calculated_unit_price: number
          created_at: string | null
          data_source: string | null
          id: string
          last_sync_at: string | null
          product_id: string
          production_run_id: string
          run_end_date: string | null
          run_start_date: string | null
          units_in_run: number
          volume_discount_percentage: number | null
        }
        Insert: {
          calculated_unit_price: number
          created_at?: string | null
          data_source?: string | null
          id?: string
          last_sync_at?: string | null
          product_id: string
          production_run_id: string
          run_end_date?: string | null
          run_start_date?: string | null
          units_in_run: number
          volume_discount_percentage?: number | null
        }
        Update: {
          calculated_unit_price?: number
          created_at?: string | null
          data_source?: string | null
          id?: string
          last_sync_at?: string | null
          product_id?: string
          production_run_id?: string
          run_end_date?: string | null
          run_start_date?: string | null
          units_in_run?: number
          volume_discount_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_pricing_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_challenge_config: {
        Row: {
          allow_concurrent: boolean | null
          challenge_arena: string | null
          contest_description: string | null
          contest_name: string
          created_at: string
          eligibility_rules: string | null
          end_date: string | null
          entrance_fee_credits: number
          hexisle_skill_category: string | null
          id: string
          ideation_level: number | null
          is_active: boolean
          judging_criteria: Json
          prize_structure: Json
          project_id: string
          start_date: string | null
          submission_categories: Json
          submission_guidelines: string | null
          updated_at: string
        }
        Insert: {
          allow_concurrent?: boolean | null
          challenge_arena?: string | null
          contest_description?: string | null
          contest_name?: string
          created_at?: string
          eligibility_rules?: string | null
          end_date?: string | null
          entrance_fee_credits?: number
          hexisle_skill_category?: string | null
          id?: string
          ideation_level?: number | null
          is_active?: boolean
          judging_criteria?: Json
          prize_structure?: Json
          project_id: string
          start_date?: string | null
          submission_categories?: Json
          submission_guidelines?: string | null
          updated_at?: string
        }
        Update: {
          allow_concurrent?: boolean | null
          challenge_arena?: string | null
          contest_description?: string | null
          contest_name?: string
          created_at?: string
          eligibility_rules?: string | null
          end_date?: string | null
          entrance_fee_credits?: number
          hexisle_skill_category?: string | null
          id?: string
          ideation_level?: number | null
          is_active?: boolean
          judging_criteria?: Json
          prize_structure?: Json
          project_id?: string
          start_date?: string | null
          submission_categories?: Json
          submission_guidelines?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_contest_config_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_arbitration_cases: {
        Row: {
          case_type: string | null
          creator_id: string
          downgrade_duration_months: number | null
          equity_adjustment: number | null
          evidence: Json | null
          filed_at: string | null
          filed_by: string
          financial_penalty: number | null
          id: string
          mediator_id: string | null
          proposal_id: string
          resolved_at: string | null
          ruling: Database["public"]["Enums"]["arbitration_ruling"] | null
          ruling_rationale: string | null
          triggers_tier_downgrade: boolean | null
        }
        Insert: {
          case_type?: string | null
          creator_id: string
          downgrade_duration_months?: number | null
          equity_adjustment?: number | null
          evidence?: Json | null
          filed_at?: string | null
          filed_by: string
          financial_penalty?: number | null
          id?: string
          mediator_id?: string | null
          proposal_id: string
          resolved_at?: string | null
          ruling?: Database["public"]["Enums"]["arbitration_ruling"] | null
          ruling_rationale?: string | null
          triggers_tier_downgrade?: boolean | null
        }
        Update: {
          case_type?: string | null
          creator_id?: string
          downgrade_duration_months?: number | null
          equity_adjustment?: number | null
          evidence?: Json | null
          filed_at?: string | null
          filed_by?: string
          financial_penalty?: number | null
          id?: string
          mediator_id?: string | null
          proposal_id?: string
          resolved_at?: string | null
          ruling?: Database["public"]["Enums"]["arbitration_ruling"] | null
          ruling_rationale?: string | null
          triggers_tier_downgrade?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_arbitration_cases_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "ip_use_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_assets: {
        Row: {
          asset_description: string | null
          asset_name: string
          asset_type: Database["public"]["Enums"]["ip_asset_type"]
          category_lock_date: string | null
          control_tier: Database["public"]["Enums"]["ip_control_tier"]
          created_at: string | null
          creator_id: string
          equity_split_creator: number
          equity_split_lb: number
          expiration_date: string | null
          filing_date: string | null
          grant_date: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string | null
          patent_number: string | null
          prohibited_categories: string[] | null
          tier_c_invitation_id: string | null
          updated_at: string | null
        }
        Insert: {
          asset_description?: string | null
          asset_name: string
          asset_type: Database["public"]["Enums"]["ip_asset_type"]
          category_lock_date?: string | null
          control_tier?: Database["public"]["Enums"]["ip_control_tier"]
          created_at?: string | null
          creator_id: string
          equity_split_creator: number
          equity_split_lb: number
          expiration_date?: string | null
          filing_date?: string | null
          grant_date?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          patent_number?: string | null
          prohibited_categories?: string[] | null
          tier_c_invitation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_description?: string | null
          asset_name?: string
          asset_type?: Database["public"]["Enums"]["ip_asset_type"]
          category_lock_date?: string | null
          control_tier?: Database["public"]["Enums"]["ip_control_tier"]
          created_at?: string | null
          creator_id?: string
          equity_split_creator?: number
          equity_split_lb?: number
          expiration_date?: string | null
          filing_date?: string | null
          grant_date?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          patent_number?: string | null
          prohibited_categories?: string[] | null
          tier_c_invitation_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ip_contributions: {
        Row: {
          asset_id: string
          contribution_percentage: number
          contribution_type: string
          id: string
          member_id: string
          notes: string | null
          project_id: string
          recorded_at: string | null
          recorded_by: string | null
          royalty_eligible: boolean | null
        }
        Insert: {
          asset_id: string
          contribution_percentage: number
          contribution_type: string
          id?: string
          member_id: string
          notes?: string | null
          project_id: string
          recorded_at?: string | null
          recorded_by?: string | null
          royalty_eligible?: boolean | null
        }
        Update: {
          asset_id?: string
          contribution_percentage?: number
          contribution_type?: string
          id?: string
          member_id?: string
          notes?: string | null
          project_id?: string
          recorded_at?: string | null
          recorded_by?: string | null
          royalty_eligible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_contributions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_creator_controls: {
        Row: {
          can_propose_uses: boolean | null
          created_at: string | null
          has_veto_power: boolean | null
          id: string
          ip_asset_id: string
          max_dormancy_days: number | null
          min_commercialization_timeline: number | null
          quarterly_report_required: boolean | null
          requires_creator_approval_for: string[] | null
          reversion_clause: boolean | null
          reversion_conditions: Json | null
          updated_at: string | null
          voting_weight_in_lb: number | null
        }
        Insert: {
          can_propose_uses?: boolean | null
          created_at?: string | null
          has_veto_power?: boolean | null
          id?: string
          ip_asset_id: string
          max_dormancy_days?: number | null
          min_commercialization_timeline?: number | null
          quarterly_report_required?: boolean | null
          requires_creator_approval_for?: string[] | null
          reversion_clause?: boolean | null
          reversion_conditions?: Json | null
          updated_at?: string | null
          voting_weight_in_lb?: number | null
        }
        Update: {
          can_propose_uses?: boolean | null
          created_at?: string | null
          has_veto_power?: boolean | null
          id?: string
          ip_asset_id?: string
          max_dormancy_days?: number | null
          min_commercialization_timeline?: number | null
          quarterly_report_required?: boolean | null
          requires_creator_approval_for?: string[] | null
          reversion_clause?: boolean | null
          reversion_conditions?: Json | null
          updated_at?: string | null
          voting_weight_in_lb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_creator_controls_ip_asset_id_fkey"
            columns: ["ip_asset_id"]
            isOneToOne: false
            referencedRelation: "ip_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_tier_downgrade_history: {
        Row: {
          created_at: string | null
          creator_id: string
          downgrade_duration_months: number | null
          downgrade_end_date: string | null
          downgrade_start_date: string | null
          downgraded_to: Database["public"]["Enums"]["ip_control_tier"]
          id: string
          ip_asset_id: string
          is_permanent: boolean | null
          original_tier: Database["public"]["Enums"]["ip_control_tier"]
          reason: string
          related_arbitration_case_id: string | null
          restored_at: string | null
          restored_by: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          downgrade_duration_months?: number | null
          downgrade_end_date?: string | null
          downgrade_start_date?: string | null
          downgraded_to: Database["public"]["Enums"]["ip_control_tier"]
          id?: string
          ip_asset_id: string
          is_permanent?: boolean | null
          original_tier: Database["public"]["Enums"]["ip_control_tier"]
          reason: string
          related_arbitration_case_id?: string | null
          restored_at?: string | null
          restored_by?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          downgrade_duration_months?: number | null
          downgrade_end_date?: string | null
          downgrade_start_date?: string | null
          downgraded_to?: Database["public"]["Enums"]["ip_control_tier"]
          id?: string
          ip_asset_id?: string
          is_permanent?: boolean | null
          original_tier?: Database["public"]["Enums"]["ip_control_tier"]
          reason?: string
          related_arbitration_case_id?: string | null
          restored_at?: string | null
          restored_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_tier_downgrade_history_ip_asset_id_fkey"
            columns: ["ip_asset_id"]
            isOneToOne: false
            referencedRelation: "ip_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_tier_downgrade_history_related_arbitration_case_id_fkey"
            columns: ["related_arbitration_case_id"]
            isOneToOne: false
            referencedRelation: "ip_arbitration_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_use_proposals: {
        Row: {
          arbitration_ruling: string | null
          auto_approved_at: string | null
          created_at: string | null
          creator_denial_reason: string | null
          creator_response_deadline: string | null
          id: string
          ip_asset_id: string
          proposal_description: string
          proposed_by: string
          proposed_use_category: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["ip_proposal_status"] | null
          target_product_id: string | null
        }
        Insert: {
          arbitration_ruling?: string | null
          auto_approved_at?: string | null
          created_at?: string | null
          creator_denial_reason?: string | null
          creator_response_deadline?: string | null
          id?: string
          ip_asset_id: string
          proposal_description: string
          proposed_by: string
          proposed_use_category?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["ip_proposal_status"] | null
          target_product_id?: string | null
        }
        Update: {
          arbitration_ruling?: string | null
          auto_approved_at?: string | null
          created_at?: string | null
          creator_denial_reason?: string | null
          creator_response_deadline?: string | null
          id?: string
          ip_asset_id?: string
          proposal_description?: string
          proposed_by?: string
          proposed_use_category?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["ip_proposal_status"] | null
          target_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_use_proposals_ip_asset_id_fkey"
            columns: ["ip_asset_id"]
            isOneToOne: false
            referencedRelation: "ip_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_use_proposals_target_product_id_fkey"
            columns: ["target_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      kickstarter_pledges: {
        Row: {
          backer_email: string
          id: string
          is_processed: boolean | null
          kickstarter_pledge_id: string | null
          pledge_amount: number
          product_id: string | null
          synced_at: string | null
          user_id: string | null
        }
        Insert: {
          backer_email: string
          id?: string
          is_processed?: boolean | null
          kickstarter_pledge_id?: string | null
          pledge_amount: number
          product_id?: string | null
          synced_at?: string | null
          user_id?: string | null
        }
        Update: {
          backer_email?: string
          id?: string
          is_processed?: boolean | null
          kickstarter_pledge_id?: string | null
          pledge_amount?: number
          product_id?: string | null
          synced_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kickstarter_pledges_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kickstarter_pledges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kickstarter_sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          pledges_synced: number | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          pledges_synced?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          pledges_synced?: number | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
        }
        Relationships: []
      }
      lb_asset_library: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asset_name: string
          asset_type: string
          category: Database["public"]["Enums"]["position_category"] | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          description: string | null
          download_fee_credits: number | null
          file_paths: Json | null
          id: string
          ip_logged: boolean | null
          is_free_for_personal: boolean | null
          prototype_requirements: Json | null
          prototype_slots_filled: number | null
          prototype_slots_total: number | null
          requires_prototyping: boolean | null
          status: string | null
          thumbnail_url: string | null
          total_downloads: number | null
          total_royalties_earned: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asset_name: string
          asset_type?: string
          category?: Database["public"]["Enums"]["position_category"] | null
          created_at?: string | null
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          download_fee_credits?: number | null
          file_paths?: Json | null
          id?: string
          ip_logged?: boolean | null
          is_free_for_personal?: boolean | null
          prototype_requirements?: Json | null
          prototype_slots_filled?: number | null
          prototype_slots_total?: number | null
          requires_prototyping?: boolean | null
          status?: string | null
          thumbnail_url?: string | null
          total_downloads?: number | null
          total_royalties_earned?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asset_name?: string
          asset_type?: string
          category?: Database["public"]["Enums"]["position_category"] | null
          created_at?: string | null
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          download_fee_credits?: number | null
          file_paths?: Json | null
          id?: string
          ip_logged?: boolean | null
          is_free_for_personal?: boolean | null
          prototype_requirements?: Json | null
          prototype_slots_filled?: number | null
          prototype_slots_total?: number | null
          requires_prototyping?: boolean | null
          status?: string | null
          thumbnail_url?: string | null
          total_downloads?: number | null
          total_royalties_earned?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lb_asset_library_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lb_asset_library_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lb_funding_pool: {
        Row: {
          allocated_to_eoi: number
          allocated_to_gas: number
          available_for_eoi: number | null
          created_at: string
          gas_budget_percentage: number
          id: string
          last_contribution_at: string | null
          medallion_contribution_percentage: number
          total_pool_amount: number
          updated_at: string
        }
        Insert: {
          allocated_to_eoi?: number
          allocated_to_gas?: number
          available_for_eoi?: number | null
          created_at?: string
          gas_budget_percentage?: number
          id?: string
          last_contribution_at?: string | null
          medallion_contribution_percentage?: number
          total_pool_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_to_eoi?: number
          allocated_to_gas?: number
          available_for_eoi?: number | null
          created_at?: string
          gas_budget_percentage?: number
          id?: string
          last_contribution_at?: string | null
          medallion_contribution_percentage?: number
          total_pool_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      lb_member_hiring_log: {
        Row: {
          agreed_rate: number
          contract_id: string | null
          created_at: string | null
          hired_member_id: string | null
          hiring_member_id: string | null
          id: string
          lb_scale_rate: number
          rate_compliant: boolean
          reputation_penalty: number | null
          service_link_id: string | null
          violation_severity: string | null
        }
        Insert: {
          agreed_rate: number
          contract_id?: string | null
          created_at?: string | null
          hired_member_id?: string | null
          hiring_member_id?: string | null
          id?: string
          lb_scale_rate: number
          rate_compliant: boolean
          reputation_penalty?: number | null
          service_link_id?: string | null
          violation_severity?: string | null
        }
        Update: {
          agreed_rate?: number
          contract_id?: string | null
          created_at?: string | null
          hired_member_id?: string | null
          hiring_member_id?: string | null
          id?: string
          lb_scale_rate?: number
          rate_compliant?: boolean
          reputation_penalty?: number | null
          service_link_id?: string | null
          violation_severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lb_member_hiring_log_service_link_id_fkey"
            columns: ["service_link_id"]
            isOneToOne: false
            referencedRelation: "member_service_links"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_stage_tasks: {
        Row: {
          created_at: string
          id: string
          sort_order: number | null
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          task_description: string | null
          task_title: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number | null
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          task_description?: string | null
          task_title: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number | null
          stage?: Database["public"]["Enums"]["lifecycle_stage"]
          task_description?: string | null
          task_title?: string
        }
        Relationships: []
      }
      machine_schedules: {
        Row: {
          available_from: string
          available_until: string
          created_at: string | null
          cycle_type: string
          id: string
          is_reserved: boolean | null
          machine_name: string
          maintenance_day: number | null
          node_location: string
          reserved_for_product_id: string | null
        }
        Insert: {
          available_from: string
          available_until: string
          created_at?: string | null
          cycle_type: string
          id?: string
          is_reserved?: boolean | null
          machine_name: string
          maintenance_day?: number | null
          node_location: string
          reserved_for_product_id?: string | null
        }
        Update: {
          available_from?: string
          available_until?: string
          created_at?: string | null
          cycle_type?: string
          id?: string
          is_reserved?: boolean | null
          machine_name?: string
          maintenance_day?: number | null
          node_location?: string
          reserved_for_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_schedules_reserved_for_product_id_fkey"
            columns: ["reserved_for_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      medallion_designs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          background_style: string | null
          created_at: string
          created_by: string
          design_name: string
          design_notes: string | null
          design_type: string
          id: string
          logo_url: string | null
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          background_style?: string | null
          created_at?: string
          created_by: string
          design_name: string
          design_notes?: string | null
          design_type: string
          id?: string
          logo_url?: string | null
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          background_style?: string | null
          created_at?: string
          created_by?: string
          design_name?: string
          design_notes?: string | null
          design_type?: string
          id?: string
          logo_url?: string | null
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medallion_designs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      medallion_eligibility: {
        Row: {
          created_at: string
          id: string
          is_eligible: boolean | null
          medallion_minted: boolean
          medallion_token_id: string | null
          minted_block_number: number | null
          minted_tx_hash: string | null
          project_id: string
          token_contract_address: string | null
          token_id: number | null
          total_contribution: number | null
          total_direct_pledges: number
          total_matched_credits: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_eligible?: boolean | null
          medallion_minted?: boolean
          medallion_token_id?: string | null
          minted_block_number?: number | null
          minted_tx_hash?: string | null
          project_id: string
          token_contract_address?: string | null
          token_id?: number | null
          total_contribution?: number | null
          total_direct_pledges?: number
          total_matched_credits?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_eligible?: boolean | null
          medallion_minted?: boolean
          medallion_token_id?: string | null
          minted_block_number?: number | null
          minted_tx_hash?: string | null
          project_id?: string
          token_contract_address?: string | null
          token_id?: number | null
          total_contribution?: number | null
          total_direct_pledges?: number
          total_matched_credits?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medallion_eligibility_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      medallion_mint_batches: {
        Row: {
          batch_number: number
          completed_at: string | null
          created_at: string
          eligible_users_count: number
          id: string
          minted_count: number
          production_schedule_date: string
          project_id: string
          status: string
          transaction_hash: string | null
        }
        Insert: {
          batch_number: number
          completed_at?: string | null
          created_at?: string
          eligible_users_count?: number
          id?: string
          minted_count?: number
          production_schedule_date: string
          project_id: string
          status?: string
          transaction_hash?: string | null
        }
        Update: {
          batch_number?: number
          completed_at?: string | null
          created_at?: string
          eligible_users_count?: number
          id?: string
          minted_count?: number
          production_schedule_date?: string
          project_id?: string
          status?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medallion_mint_batches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      medallion_production_orders: {
        Row: {
          actual_completion_date: string | null
          created_at: string
          design_id: string | null
          estimated_completion_date: string | null
          id: string
          notes: string | null
          order_number: string | null
          project_id: string
          quantity: number
          shipping_carrier: string | null
          status: string
          total_cost: number | null
          tracking_number: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string
          design_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          project_id: string
          quantity?: number
          shipping_carrier?: string | null
          status?: string
          total_cost?: number | null
          tracking_number?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string
          design_id?: string | null
          estimated_completion_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          project_id?: string
          quantity?: number
          shipping_carrier?: string | null
          status?: string
          total_cost?: number | null
          tracking_number?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medallion_production_orders_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "medallion_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medallion_production_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      member_project_milestones: {
        Row: {
          created_at: string | null
          first_10_completed: boolean | null
          id: string
          physical_badge_reminder_sent: boolean | null
          project_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_10_completed?: boolean | null
          id?: string
          physical_badge_reminder_sent?: boolean | null
          project_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_10_completed?: boolean | null
          id?: string
          physical_badge_reminder_sent?: boolean | null
          project_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      member_service_links: {
        Row: {
          advertised_rate_max: number | null
          advertised_rate_min: number | null
          created_at: string | null
          external_contracts_completed: number | null
          id: string
          is_active: boolean | null
          last_violation_date: string | null
          lb_contracts_completed: number | null
          lb_rate_category: string | null
          platform_profile_url: string
          platform_username: string | null
          rate_differential_flagged: boolean | null
          service_platform: string
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          violations_count: number | null
        }
        Insert: {
          advertised_rate_max?: number | null
          advertised_rate_min?: number | null
          created_at?: string | null
          external_contracts_completed?: number | null
          id?: string
          is_active?: boolean | null
          last_violation_date?: string | null
          lb_contracts_completed?: number | null
          lb_rate_category?: string | null
          platform_profile_url: string
          platform_username?: string | null
          rate_differential_flagged?: boolean | null
          service_platform: string
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          violations_count?: number | null
        }
        Update: {
          advertised_rate_max?: number | null
          advertised_rate_min?: number | null
          created_at?: string | null
          external_contracts_completed?: number | null
          id?: string
          is_active?: boolean | null
          last_violation_date?: string | null
          lb_contracts_completed?: number | null
          lb_rate_category?: string | null
          platform_profile_url?: string
          platform_username?: string | null
          rate_differential_flagged?: boolean | null
          service_platform?: string
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          violations_count?: number | null
        }
        Relationships: []
      }
      patent_pool_usage_rights: {
        Row: {
          applies_to_lb_products_only: boolean | null
          authorization_model: string | null
          base_revenue_share: number | null
          can_combine_with_other_pool_ip: boolean | null
          can_derive: boolean | null
          can_modify: boolean | null
          created_at: string | null
          dibs_expiration: string | null
          dibs_holder_id: string | null
          dibs_profit_share: number | null
          external_license_revenue_share: number | null
          id: string
          ip_asset_id: string
          protest_offset_penalty: number | null
          unauthorized_use_premium: number | null
          unlimited_internal_use: boolean | null
          updated_at: string | null
          with_authorization_share: number | null
          without_authorization_share: number | null
        }
        Insert: {
          applies_to_lb_products_only?: boolean | null
          authorization_model?: string | null
          base_revenue_share?: number | null
          can_combine_with_other_pool_ip?: boolean | null
          can_derive?: boolean | null
          can_modify?: boolean | null
          created_at?: string | null
          dibs_expiration?: string | null
          dibs_holder_id?: string | null
          dibs_profit_share?: number | null
          external_license_revenue_share?: number | null
          id?: string
          ip_asset_id: string
          protest_offset_penalty?: number | null
          unauthorized_use_premium?: number | null
          unlimited_internal_use?: boolean | null
          updated_at?: string | null
          with_authorization_share?: number | null
          without_authorization_share?: number | null
        }
        Update: {
          applies_to_lb_products_only?: boolean | null
          authorization_model?: string | null
          base_revenue_share?: number | null
          can_combine_with_other_pool_ip?: boolean | null
          can_derive?: boolean | null
          can_modify?: boolean | null
          created_at?: string | null
          dibs_expiration?: string | null
          dibs_holder_id?: string | null
          dibs_profit_share?: number | null
          external_license_revenue_share?: number | null
          id?: string
          ip_asset_id?: string
          protest_offset_penalty?: number | null
          unauthorized_use_premium?: number | null
          unlimited_internal_use?: boolean | null
          updated_at?: string | null
          with_authorization_share?: number | null
          without_authorization_share?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patent_pool_usage_rights_ip_asset_id_fkey"
            columns: ["ip_asset_id"]
            isOneToOne: false
            referencedRelation: "ip_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_member_contracts: {
        Row: {
          accepted_at: string | null
          cash_amount: number | null
          compensation_type: string
          completed_at: string | null
          contract_description: string | null
          contract_title: string
          contract_xml_hash: string | null
          created_at: string
          deliverables: Json | null
          equity_percentage: number | null
          expires_at: string | null
          id: string
          initiator_id: string
          recipient_id: string
          status: string
          terms: Json | null
          time_commitment_days: number
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          cash_amount?: number | null
          compensation_type?: string
          completed_at?: string | null
          contract_description?: string | null
          contract_title: string
          contract_xml_hash?: string | null
          created_at?: string
          deliverables?: Json | null
          equity_percentage?: number | null
          expires_at?: string | null
          id?: string
          initiator_id: string
          recipient_id: string
          status?: string
          terms?: Json | null
          time_commitment_days: number
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          cash_amount?: number | null
          compensation_type?: string
          completed_at?: string | null
          contract_description?: string | null
          contract_title?: string
          contract_xml_hash?: string | null
          created_at?: string
          deliverables?: Json | null
          equity_percentage?: number | null
          expires_at?: string | null
          id?: string
          initiator_id?: string
          recipient_id?: string
          status?: string
          terms?: Json | null
          time_commitment_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      physical_badge_designs: {
        Row: {
          badge_status: string | null
          created_at: string | null
          design_file_path: string | null
          design_name: string
          id: string
          order_date: string | null
          production_partner_id: string | null
          project_id: string | null
          qr_code_data: string | null
          received_date: string | null
          shipped_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_status?: string | null
          created_at?: string | null
          design_file_path?: string | null
          design_name: string
          id?: string
          order_date?: string | null
          production_partner_id?: string | null
          project_id?: string | null
          qr_code_data?: string | null
          received_date?: string | null
          shipped_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_status?: string | null
          created_at?: string | null
          design_file_path?: string | null
          design_name?: string
          id?: string
          order_date?: string | null
          production_partner_id?: string | null
          project_id?: string | null
          qr_code_data?: string | null
          received_date?: string | null
          shipped_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_badge_designs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges: {
        Row: {
          amount: number
          cash_ratio: number | null
          commitment_deadline: string | null
          converted_at: string | null
          created_at: string | null
          eoi_conversion_percentage: number | null
          equity_ratio: number | null
          id: string
          is_eoi: boolean | null
          production_level_id: string
          reverted_at: string | null
          source: string
          status: string | null
          time_commitment_days: number | null
        }
        Insert: {
          amount: number
          cash_ratio?: number | null
          commitment_deadline?: string | null
          converted_at?: string | null
          created_at?: string | null
          eoi_conversion_percentage?: number | null
          equity_ratio?: number | null
          id?: string
          is_eoi?: boolean | null
          production_level_id: string
          reverted_at?: string | null
          source: string
          status?: string | null
          time_commitment_days?: number | null
        }
        Update: {
          amount?: number
          cash_ratio?: number | null
          commitment_deadline?: string | null
          converted_at?: string | null
          created_at?: string | null
          eoi_conversion_percentage?: number | null
          equity_ratio?: number | null
          id?: string
          is_eoi?: boolean | null
          production_level_id?: string
          reverted_at?: string | null
          source?: string
          status?: string | null
          time_commitment_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pledges_production_level_id_fkey"
            columns: ["production_level_id"]
            isOneToOne: false
            referencedRelation: "production_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_access_requests: {
        Row: {
          created_at: string
          id: string
          portal_type: string
          request_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          portal_type: string
          request_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          portal_type?: string
          request_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portal_configs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          portal_domain: string
          portal_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          portal_domain: string
          portal_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          portal_domain?: string
          portal_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      position_applications: {
        Row: {
          applicant_email: string
          applicant_id: string | null
          applicant_name: string
          application_data: Json | null
          applied_at: string | null
          cover_letter: string | null
          id: string
          position_id: string
          reserved_credits: number | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          applicant_email: string
          applicant_id?: string | null
          applicant_name: string
          application_data?: Json | null
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          position_id: string
          reserved_credits?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          applicant_email?: string
          applicant_id?: string | null
          applicant_name?: string
          application_data?: Json | null
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          position_id?: string
          reserved_credits?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      position_assignments: {
        Row: {
          adjusted_cash_amount: number | null
          adjusted_credits: number | null
          adjusted_equity_percentage: number | null
          applicant_id: string
          application_id: string
          assigned_at: string | null
          assigned_by: string | null
          assignment_status: Database["public"]["Enums"]["assignment_status"]
          assignment_type: Database["public"]["Enums"]["assignment_type"]
          created_at: string | null
          duty_description: string | null
          duty_percentage: number
          end_date: string | null
          id: string
          notes: string | null
          original_cash_amount: number | null
          original_credits: number | null
          original_equity_percentage: number | null
          position_id: string
          project_id: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          adjusted_cash_amount?: number | null
          adjusted_credits?: number | null
          adjusted_equity_percentage?: number | null
          applicant_id: string
          application_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_status"]
          assignment_type: Database["public"]["Enums"]["assignment_type"]
          created_at?: string | null
          duty_description?: string | null
          duty_percentage?: number
          end_date?: string | null
          id?: string
          notes?: string | null
          original_cash_amount?: number | null
          original_credits?: number | null
          original_equity_percentage?: number | null
          position_id: string
          project_id: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          adjusted_cash_amount?: number | null
          adjusted_credits?: number | null
          adjusted_equity_percentage?: number | null
          applicant_id?: string
          application_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_status?: Database["public"]["Enums"]["assignment_status"]
          assignment_type?: Database["public"]["Enums"]["assignment_type"]
          created_at?: string | null
          duty_description?: string | null
          duty_percentage?: number
          end_date?: string | null
          id?: string
          notes?: string | null
          original_cash_amount?: number | null
          original_credits?: number | null
          original_equity_percentage?: number | null
          position_id?: string
          project_id?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "position_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_assignments_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      position_contract_backups: {
        Row: {
          backup_compensation_credits: number | null
          backup_contractor_id: string | null
          compensation_source: string | null
          contract_type: string
          created_at: string | null
          id: string
          position_id: string | null
          primary_contractor_id: string | null
          secondary_compensation_credits: number | null
          secondary_contractor_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          backup_compensation_credits?: number | null
          backup_contractor_id?: string | null
          compensation_source?: string | null
          contract_type: string
          created_at?: string | null
          id?: string
          position_id?: string | null
          primary_contractor_id?: string | null
          secondary_compensation_credits?: number | null
          secondary_contractor_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          backup_compensation_credits?: number | null
          backup_contractor_id?: string | null
          compensation_source?: string | null
          contract_type?: string
          created_at?: string | null
          id?: string
          position_id?: string | null
          primary_contractor_id?: string | null
          secondary_compensation_credits?: number | null
          secondary_contractor_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_contract_backups_backup_contractor_id_fkey"
            columns: ["backup_contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_contract_backups_primary_contractor_id_fkey"
            columns: ["primary_contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_contract_backups_secondary_contractor_id_fkey"
            columns: ["secondary_contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_beta_recruits: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          created_by: string | null
          endorsement_value: string | null
          field_category: Database["public"]["Enums"]["position_category"]
          id: string
          last_contact_at: string | null
          name: string
          notes: string | null
          priority_rank: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          endorsement_value?: string | null
          field_category: Database["public"]["Enums"]["position_category"]
          id?: string
          last_contact_at?: string | null
          name: string
          notes?: string | null
          priority_rank?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          endorsement_value?: string | null
          field_category?: Database["public"]["Enums"]["position_category"]
          id?: string
          last_contact_at?: string | null
          name?: string
          notes?: string | null
          priority_rank?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_beta_recruits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_levels: {
        Row: {
          current_votes: number | null
          id: string
          level_name: string
          level_number: number
          product_id: string
          unit_price: number
          units_count: number
          votes_needed: number | null
        }
        Insert: {
          current_votes?: number | null
          id?: string
          level_name: string
          level_number: number
          product_id: string
          unit_price: number
          units_count: number
          votes_needed?: number | null
        }
        Update: {
          current_votes?: number | null
          id?: string
          level_name?: string
          level_number?: number
          product_id?: string
          unit_price?: number
          units_count?: number
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
      production_nodes: {
        Row: {
          created_at: string
          created_from_premium_funds: boolean
          current_wave_allocation: number
          funded_amount: number | null
          id: string
          is_active: boolean
          location: string | null
          max_capacity_per_wave: number
          node_name: string
          node_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_from_premium_funds?: boolean
          current_wave_allocation?: number
          funded_amount?: number | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity_per_wave?: number
          node_name: string
          node_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_from_premium_funds?: boolean
          current_wave_allocation?: number
          funded_amount?: number | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_capacity_per_wave?: number
          node_name?: string
          node_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      production_queue_history: {
        Row: {
          id: string
          preorder_count: number
          product_id: string
          queue_position: number
          recorded_at: string | null
          value_score: number
        }
        Insert: {
          id?: string
          preorder_count: number
          product_id: string
          queue_position: number
          recorded_at?: string | null
          value_score: number
        }
        Update: {
          id?: string
          preorder_count?: number
          product_id?: string
          queue_position?: number
          recorded_at?: string | null
          value_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_queue_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_value_ratings: {
        Row: {
          calculated_at: string | null
          calculation_details: Json | null
          cycle_fit_score: number
          days_since_last_production: number | null
          demand_factor: number
          estimated_next_run_date: string | null
          ghost_data_weight: number
          id: string
          never_produced: boolean | null
          node_availability_score: number
          preorder_count: number
          priority_boost: number
          product_id: string
          queue_position: number | null
          updated_at: string | null
          value_score: number
        }
        Insert: {
          calculated_at?: string | null
          calculation_details?: Json | null
          cycle_fit_score?: number
          days_since_last_production?: number | null
          demand_factor?: number
          estimated_next_run_date?: string | null
          ghost_data_weight?: number
          id?: string
          never_produced?: boolean | null
          node_availability_score?: number
          preorder_count?: number
          priority_boost?: number
          product_id: string
          queue_position?: number | null
          updated_at?: string | null
          value_score?: number
        }
        Update: {
          calculated_at?: string | null
          calculation_details?: Json | null
          cycle_fit_score?: number
          days_since_last_production?: number | null
          demand_factor?: number
          estimated_next_run_date?: string | null
          ghost_data_weight?: number
          id?: string
          never_produced?: boolean | null
          node_availability_score?: number
          preorder_count?: number
          priority_boost?: number
          product_id?: string
          queue_position?: number | null
          updated_at?: string | null
          value_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_value_ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_waves: {
        Row: {
          base_price_multiplier: number
          created_at: string
          demand_score: number | null
          dormant_activated: boolean | null
          dormant_activated_at: string | null
          dormant_days: number | null
          estimated_fulfillment_date: string | null
          has_dormant_capacity: boolean | null
          id: string
          max_units_per_node: number
          product_id: string
          production_level_id: string
          status: string
          surge_active: boolean | null
          surge_enabled: boolean | null
          surge_multiplier: number | null
          surge_threshold: number | null
          total_wave_capacity: number
          units_allocated: number
          units_reserved_fcfs: number
          updated_at: string
          wave_end_date: string | null
          wave_name: string | null
          wave_number: number
          wave_start_date: string | null
        }
        Insert: {
          base_price_multiplier?: number
          created_at?: string
          demand_score?: number | null
          dormant_activated?: boolean | null
          dormant_activated_at?: string | null
          dormant_days?: number | null
          estimated_fulfillment_date?: string | null
          has_dormant_capacity?: boolean | null
          id?: string
          max_units_per_node?: number
          product_id: string
          production_level_id: string
          status?: string
          surge_active?: boolean | null
          surge_enabled?: boolean | null
          surge_multiplier?: number | null
          surge_threshold?: number | null
          total_wave_capacity: number
          units_allocated?: number
          units_reserved_fcfs?: number
          updated_at?: string
          wave_end_date?: string | null
          wave_name?: string | null
          wave_number: number
          wave_start_date?: string | null
        }
        Update: {
          base_price_multiplier?: number
          created_at?: string
          demand_score?: number | null
          dormant_activated?: boolean | null
          dormant_activated_at?: string | null
          dormant_days?: number | null
          estimated_fulfillment_date?: string | null
          has_dormant_capacity?: boolean | null
          id?: string
          max_units_per_node?: number
          product_id?: string
          production_level_id?: string
          status?: string
          surge_active?: boolean | null
          surge_enabled?: boolean | null
          surge_multiplier?: number | null
          surge_threshold?: number | null
          total_wave_capacity?: number
          units_allocated?: number
          units_reserved_fcfs?: number
          updated_at?: string
          wave_end_date?: string | null
          wave_name?: string | null
          wave_number?: number
          wave_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_waves_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_waves_production_level_id_fkey"
            columns: ["production_level_id"]
            isOneToOne: false
            referencedRelation: "production_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          details: string | null
          id: string
          name: string
          product_sku: string | null
          project_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          id?: string
          name: string
          product_sku?: string | null
          project_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          details?: string | null
          id?: string
          name?: string
          product_sku?: string | null
          project_id?: string
        }
        Relationships: [
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
          show_achievements: boolean | null
          show_clans: boolean | null
          show_email: boolean | null
          show_full_name: boolean | null
          show_guilds: boolean | null
          show_project_count: boolean | null
          show_reputation_score: boolean | null
          show_skill_levels: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_achievements?: boolean | null
          show_clans?: boolean | null
          show_email?: boolean | null
          show_full_name?: boolean | null
          show_guilds?: boolean | null
          show_project_count?: boolean | null
          show_reputation_score?: boolean | null
          show_skill_levels?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          show_achievements?: boolean | null
          show_clans?: boolean | null
          show_email?: boolean | null
          show_full_name?: boolean | null
          show_guilds?: boolean | null
          show_project_count?: boolean | null
          show_reputation_score?: boolean | null
          show_skill_levels?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_moniker: string | null
          email: string
          full_name: string | null
          id: string
          membership_activated_at: string | null
          membership_confirmation_token: string | null
          membership_expires_at: string | null
          membership_reminder_sent_at: string | null
          membership_status: string | null
          physical_badge_ordered: boolean | null
          physical_badge_received: boolean | null
          profile_is_public: boolean | null
          show_real_name: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_moniker?: string | null
          email: string
          full_name?: string | null
          id: string
          membership_activated_at?: string | null
          membership_confirmation_token?: string | null
          membership_expires_at?: string | null
          membership_reminder_sent_at?: string | null
          membership_status?: string | null
          physical_badge_ordered?: boolean | null
          physical_badge_received?: boolean | null
          profile_is_public?: boolean | null
          show_real_name?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_moniker?: string | null
          email?: string
          full_name?: string | null
          id?: string
          membership_activated_at?: string | null
          membership_confirmation_token?: string | null
          membership_expires_at?: string | null
          membership_reminder_sent_at?: string | null
          membership_status?: string | null
          physical_badge_ordered?: boolean | null
          physical_badge_received?: boolean | null
          profile_is_public?: boolean | null
          show_real_name?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_aggregate_data: {
        Row: {
          avg_completion_time_days: number | null
          avg_position_cost: number | null
          avg_position_profit: number | null
          common_prerequisites: Json | null
          common_requirements: Json | null
          created_at: string | null
          id: string
          last_updated: string | null
          max_cost: number | null
          max_profit: number | null
          min_cost: number | null
          min_profit: number | null
          project_category: string
          project_tags: string[] | null
          total_projects_analyzed: number | null
        }
        Insert: {
          avg_completion_time_days?: number | null
          avg_position_cost?: number | null
          avg_position_profit?: number | null
          common_prerequisites?: Json | null
          common_requirements?: Json | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          max_cost?: number | null
          max_profit?: number | null
          min_cost?: number | null
          min_profit?: number | null
          project_category: string
          project_tags?: string[] | null
          total_projects_analyzed?: number | null
        }
        Update: {
          avg_completion_time_days?: number | null
          avg_position_cost?: number | null
          avg_position_profit?: number | null
          common_prerequisites?: Json | null
          common_requirements?: Json | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          max_cost?: number | null
          max_profit?: number | null
          min_cost?: number | null
          min_profit?: number | null
          project_category?: string
          project_tags?: string[] | null
          total_projects_analyzed?: number | null
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          category: string
          created_at: string | null
          id: string
          project_id: string
          tags: string[] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          project_id: string
          tags?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          project_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_cost_summary: {
        Row: {
          api_cost_usd: number | null
          created_at: string | null
          db_cost_usd: number | null
          gas_cost_usd: number | null
          id: string
          period_month: string
          project_id: string
          storage_cost_usd: number | null
          total_api_calls: number | null
          total_cost_usd: number | null
          total_db_operations: number | null
          total_storage_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          api_cost_usd?: number | null
          created_at?: string | null
          db_cost_usd?: number | null
          gas_cost_usd?: number | null
          id?: string
          period_month: string
          project_id: string
          storage_cost_usd?: number | null
          total_api_calls?: number | null
          total_cost_usd?: number | null
          total_db_operations?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          api_cost_usd?: number | null
          created_at?: string | null
          db_cost_usd?: number | null
          gas_cost_usd?: number | null
          id?: string
          period_month?: string
          project_id?: string
          storage_cost_usd?: number | null
          total_api_calls?: number | null
          total_cost_usd?: number | null
          total_db_operations?: number | null
          total_storage_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_cost_summary_project_id_fkey"
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
          custom_domain: string
          dns_verified: boolean | null
          id: string
          project_id: string
          ssl_provisioned: boolean | null
          subdomain_target: string
          updated_at: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain: string
          dns_verified?: boolean | null
          id?: string
          project_id: string
          ssl_provisioned?: boolean | null
          subdomain_target: string
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string
          dns_verified?: boolean | null
          id?: string
          project_id?: string
          ssl_provisioned?: boolean | null
          subdomain_target?: string
          updated_at?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_domain_mappings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_features: {
        Row: {
          enabled_at: string | null
          enabled_by: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          project_id: string
        }
        Insert: {
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          project_id: string
        }
        Update: {
          enabled_at?: string | null
          enabled_by?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_funding: {
        Row: {
          allocated_credits: number
          available_pot: number | null
          created_at: string | null
          credit_per_user: number
          id: string
          project_id: string
          total_pot: number
          updated_at: string | null
        }
        Insert: {
          allocated_credits?: number
          available_pot?: number | null
          created_at?: string | null
          credit_per_user?: number
          id?: string
          project_id: string
          total_pot?: number
          updated_at?: string | null
        }
        Update: {
          allocated_credits?: number
          available_pot?: number | null
          created_at?: string | null
          credit_per_user?: number
          id?: string
          project_id?: string
          total_pot?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_funding_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_hexisle_mapping: {
        Row: {
          counts_as_real_stakes: boolean | null
          created_at: string | null
          id: string
          primary_island: string
          project_id: string
          required_skills: Json
          secondary_islands: string[] | null
          updated_at: string | null
          verification_required: boolean | null
        }
        Insert: {
          counts_as_real_stakes?: boolean | null
          created_at?: string | null
          id?: string
          primary_island: string
          project_id: string
          required_skills?: Json
          secondary_islands?: string[] | null
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Update: {
          counts_as_real_stakes?: boolean | null
          created_at?: string | null
          id?: string
          primary_island?: string
          project_id?: string
          required_skills?: Json
          secondary_islands?: string[] | null
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_hexisle_mapping_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          project_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          project_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          credits_allocated: number | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          is_medallion_credit: boolean | null
          medallion_grant_date: string | null
          project_id: string
          qr_code_id: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          credits_allocated?: number | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          is_medallion_credit?: boolean | null
          medallion_grant_date?: string | null
          project_id: string
          qr_code_id?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          credits_allocated?: number | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          is_medallion_credit?: boolean | null
          medallion_grant_date?: string | null
          project_id?: string
          qr_code_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      project_landing_pages: {
        Row: {
          call_to_action_text: string | null
          call_to_action_type: string | null
          created_at: string | null
          created_by: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          key_features: Json | null
          mission_statement: string | null
          project_id: string
          segment_description: string | null
          segment_name: string
          segment_slug: string
          testimonials: Json | null
          updated_at: string | null
          value_propositions: Json | null
        }
        Insert: {
          call_to_action_text?: string | null
          call_to_action_type?: string | null
          created_at?: string | null
          created_by?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key_features?: Json | null
          mission_statement?: string | null
          project_id: string
          segment_description?: string | null
          segment_name: string
          segment_slug: string
          testimonials?: Json | null
          updated_at?: string | null
          value_propositions?: Json | null
        }
        Update: {
          call_to_action_text?: string | null
          call_to_action_type?: string | null
          created_at?: string | null
          created_by?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          key_features?: Json | null
          mission_statement?: string | null
          project_id?: string
          segment_description?: string | null
          segment_name?: string
          segment_slug?: string
          testimonials?: Json | null
          updated_at?: string | null
          value_propositions?: Json | null
        }
        Relationships: [
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
          created_at: string
          current_stage: Database["public"]["Enums"]["lifecycle_stage"]
          id: string
          project_id: string
          stage_started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          id?: string
          project_id: string
          stage_started_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          id?: string
          project_id?: string
          stage_started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_lifecycle_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_lifecycle_theme_icons: {
        Row: {
          created_at: string
          icon_url: string
          id: string
          project_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url: string
          id?: string
          project_id: string
          stage: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url?: string
          id?: string
          project_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_lifecycle_theme_icons_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_member_contracts: {
        Row: {
          contract_title: string
          created_at: string
          end_date: string | null
          id: string
          member_id: string
          preferred_language: string | null
          project_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
        }
        Insert: {
          contract_title: string
          created_at?: string
          end_date?: string | null
          id?: string
          member_id: string
          preferred_language?: string | null
          project_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Update: {
          contract_title?: string
          created_at?: string
          end_date?: string | null
          id?: string
          member_id?: string
          preferred_language?: string | null
          project_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_member_contracts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      project_modules: {
        Row: {
          api_calls_count: number | null
          created_at: string | null
          current_hash: string | null
          funding_snapshot: Json
          id: string
          is_verified: boolean | null
          module_version: number
          previous_hash: string | null
          project_id: string
          signed_at: string | null
          storage_bytes: number | null
          tamper_detected: boolean | null
          xml_data: string
        }
        Insert: {
          api_calls_count?: number | null
          created_at?: string | null
          current_hash?: string | null
          funding_snapshot?: Json
          id?: string
          is_verified?: boolean | null
          module_version?: number
          previous_hash?: string | null
          project_id: string
          signed_at?: string | null
          storage_bytes?: number | null
          tamper_detected?: boolean | null
          xml_data: string
        }
        Update: {
          api_calls_count?: number | null
          created_at?: string | null
          current_hash?: string | null
          funding_snapshot?: Json
          id?: string
          is_verified?: boolean | null
          module_version?: number
          previous_hash?: string | null
          project_id?: string
          signed_at?: string | null
          storage_bytes?: number | null
          tamper_detected?: boolean | null
          xml_data?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_modules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resource_usage: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          portal: string
          project_id: string
          resource_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          portal: string
          project_id: string
          resource_type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          portal?: string
          project_id?: string
          resource_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_resource_usage_project_id_fkey"
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
          id: string
          image_url: string
          section_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          section_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          section_id?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      project_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_expanded_by_default: boolean | null
          project_id: string
          sort_order: number | null
          title: string
          video_transcript: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_expanded_by_default?: boolean | null
          project_id: string
          sort_order?: number | null
          title: string
          video_transcript?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_expanded_by_default?: boolean | null
          project_id?: string
          sort_order?: number | null
          title?: string
          video_transcript?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      project_selected_services: {
        Row: {
          assigned_position_id: string | null
          id: string
          project_id: string
          selected_at: string | null
          selection_notes: string | null
          service_provider_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_position_id?: string | null
          id?: string
          project_id: string
          selected_at?: string | null
          selection_notes?: string | null
          service_provider_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_position_id?: string | null
          id?: string
          project_id?: string
          selected_at?: string | null
          selection_notes?: string | null
          service_provider_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_selected_services_assigned_position_id_fkey"
            columns: ["assigned_position_id"]
            isOneToOne: false
            referencedRelation: "contract_position_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_selected_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_selected_services_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stage_task_assignments: {
        Row: {
          assigned_at: string
          assigned_member_id: string
          completed_at: string | null
          created_at: string
          id: string
          member_title: string
          project_id: string
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_member_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          member_title: string
          project_id: string
          stage: Database["public"]["Enums"]["lifecycle_stage"]
          status?: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_member_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          member_title?: string
          project_id?: string
          stage?: Database["public"]["Enums"]["lifecycle_stage"]
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stage_task_assignments_assigned_member_id_fkey"
            columns: ["assigned_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stage_task_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stage_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_stage_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_subdomains: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          project_id: string
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_subdomains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          stage: string
          status: string
          task_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          stage?: string
          status?: string
          task_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          stage?: string
          status?: string
          task_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_test_results: {
        Row: {
          id: string
          message: string | null
          project_id: string
          status: string
          suite_id: string | null
          test_name: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          message?: string | null
          project_id: string
          status: string
          suite_id?: string | null
          test_name: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          message?: string | null
          project_id?: string
          status?: string
          suite_id?: string | null
          test_name?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_test_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_test_results_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "project_test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      project_test_suites: {
        Row: {
          created_at: string | null
          id: string
          last_run: string | null
          last_status: string | null
          name: string
          project_id: string
          test_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_run?: string | null
          last_status?: string | null
          name: string
          project_id: string
          test_config?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_run?: string | null
          last_status?: string | null
          name?: string
          project_id?: string
          test_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_test_suites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_theme_managers: {
        Row: {
          created_at: string | null
          fallback_owner_id: string | null
          fallback_steward_id: string | null
          id: string
          project_id: string | null
          theme_manager_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_owner_id?: string | null
          fallback_steward_id?: string | null
          id?: string
          project_id?: string | null
          theme_manager_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_owner_id?: string | null
          fallback_steward_id?: string | null
          id?: string
          project_id?: string | null
          theme_manager_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_theme_managers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_themes: {
        Row: {
          created_at: string | null
          created_by: string | null
          css_content: string
          id: string
          is_default: boolean | null
          portal_type: string | null
          preview_image_url: string | null
          project_id: string
          theme_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          css_content: string
          id?: string
          is_default?: boolean | null
          portal_type?: string | null
          preview_image_url?: string | null
          project_id: string
          theme_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          css_content?: string
          id?: string
          is_default?: boolean | null
          portal_type?: string | null
          preview_image_url?: string | null
          project_id?: string
          theme_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_themes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_type_weights: {
        Row: {
          collaboration_weight: number
          created_at: string
          id: string
          professionalism_weight: number
          project_type: string
          quality_weight: number
          standards_compliance_weight: number
          timeliness_weight: number
        }
        Insert: {
          collaboration_weight?: number
          created_at?: string
          id?: string
          professionalism_weight?: number
          project_type: string
          quality_weight?: number
          standards_compliance_weight?: number
          timeliness_weight?: number
        }
        Update: {
          collaboration_weight?: number
          created_at?: string
          id?: string
          professionalism_weight?: number
          project_type?: string
          quality_weight?: number
          standards_compliance_weight?: number
          timeliness_weight?: number
        }
        Relationships: []
      }
      project_visual_themes: {
        Row: {
          accent_color: string
          background_pattern: string | null
          created_at: string
          id: string
          primary_color: string
          project_id: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_pattern?: string | null
          created_at?: string
          id?: string
          primary_color?: string
          project_id: string
          secondary_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_pattern?: string | null
          created_at?: string
          id?: string
          primary_color?: string
          project_id?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_visual_themes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_voting_configs: {
        Row: {
          created_at: string | null
          id: string
          max_equity_ratio: number
          min_equity_ratio: number
          product_lead_time_days: number
          project_id: string
          time_commitment_options: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_equity_ratio?: number
          min_equity_ratio?: number
          product_lead_time_days?: number
          project_id: string
          time_commitment_options?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_equity_ratio?: number
          min_equity_ratio?: number
          product_lead_time_days?: number
          project_id?: string
          time_commitment_options?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_voting_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          became_independent_at: string | null
          can_use_external_services: boolean | null
          company_status: string | null
          created_at: string | null
          default_language: string | null
          derivative_status: string | null
          derivative_type: string | null
          description: string | null
          detailed_description: string | null
          governance_link: string | null
          id: string
          independence_equity_bonus: number | null
          ip_compliance_rules: Json | null
          medallion_funded: boolean | null
          name: string
          owner_id: string | null
          parent_project_id: string | null
          primary_domain: string | null
          project_sku: string | null
          project_type: string | null
          royalty_percentage: number | null
          tagline: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          became_independent_at?: string | null
          can_use_external_services?: boolean | null
          company_status?: string | null
          created_at?: string | null
          default_language?: string | null
          derivative_status?: string | null
          derivative_type?: string | null
          description?: string | null
          detailed_description?: string | null
          governance_link?: string | null
          id?: string
          independence_equity_bonus?: number | null
          ip_compliance_rules?: Json | null
          medallion_funded?: boolean | null
          name: string
          owner_id?: string | null
          parent_project_id?: string | null
          primary_domain?: string | null
          project_sku?: string | null
          project_type?: string | null
          royalty_percentage?: number | null
          tagline?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          became_independent_at?: string | null
          can_use_external_services?: boolean | null
          company_status?: string | null
          created_at?: string | null
          default_language?: string | null
          derivative_status?: string | null
          derivative_type?: string | null
          description?: string | null
          detailed_description?: string | null
          governance_link?: string | null
          id?: string
          independence_equity_bonus?: number | null
          ip_compliance_rules?: Json | null
          medallion_funded?: boolean | null
          name?: string
          owner_id?: string | null
          parent_project_id?: string | null
          primary_domain?: string | null
          project_sku?: string | null
          project_type?: string | null
          royalty_percentage?: number | null
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_governance_link_fkey"
            columns: ["governance_link"]
            isOneToOne: false
            referencedRelation: "guild_charters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_scanned_at: string | null
          product_id: string
          scanned_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          product_id: string
          scanned_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          product_id?: string
          scanned_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_landing_pages: {
        Row: {
          created_at: string
          cta_text: string
          cta_url: string | null
          description: string | null
          headline: string
          id: string
          project_id: string
          subheadline: string | null
          updated_at: string
          variant: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          headline: string
          id?: string
          project_id: string
          subheadline?: string | null
          updated_at?: string
          variant?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          headline?: string
          id?: string
          project_id?: string
          subheadline?: string | null
          updated_at?: string
          variant?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_landing_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scans: {
        Row: {
          id: string
          ip_address: string | null
          qr_code_id: string
          scanned_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          qr_code_id: string
          scanned_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          qr_code_id?: string
          scanned_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_tasks: {
        Row: {
          category: string
          completed_date: string | null
          created_at: string
          dependencies: string | null
          description: string
          id: string
          items: Json
          priority: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          completed_date?: string | null
          created_at?: string
          dependencies?: string | null
          description: string
          id?: string
          items?: Json
          priority: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_date?: string | null
          created_at?: string
          dependencies?: string | null
          description?: string
          id?: string
          items?: Json
          priority?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reputation_committee_votes: {
        Row: {
          dispute_id: string
          id: string
          vote_comment: string | null
          vote_decision: string
          vote_weight: number
          voted_at: string
          voter_id: string
          voter_role: string
        }
        Insert: {
          dispute_id: string
          id?: string
          vote_comment?: string | null
          vote_decision: string
          vote_weight?: number
          voted_at?: string
          voter_id: string
          voter_role: string
        }
        Update: {
          dispute_id?: string
          id?: string
          vote_comment?: string | null
          vote_decision?: string
          vote_weight?: number
          voted_at?: string
          voter_id?: string
          voter_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "reputation_committee_votes_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "reputation_disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_disputes: {
        Row: {
          committee_notes: string | null
          created_at: string
          dispute_filed_by: string
          dispute_reason: string
          id: string
          rating_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          supporting_evidence: Json | null
        }
        Insert: {
          committee_notes?: string | null
          created_at?: string
          dispute_filed_by: string
          dispute_reason: string
          id?: string
          rating_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          supporting_evidence?: Json | null
        }
        Update: {
          committee_notes?: string | null
          created_at?: string
          dispute_filed_by?: string
          dispute_reason?: string
          id?: string
          rating_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          supporting_evidence?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_disputes_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: true
            referencedRelation: "reputation_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_ratings: {
        Row: {
          collaboration_rating: number
          comment: string | null
          composite_score: number
          correction_count: number
          created_at: string
          dispute_reason: string | null
          id: string
          interaction_type: string
          is_positive: boolean
          permanent_at: string
          professionalism_rating: number
          project_id: string
          quality_rating: number
          ratee_id: string
          rater_id: string
          rater_reputation_weight: number
          rebuttal_statement: string | null
          standards_compliance_rating: number
          status: Database["public"]["Enums"]["reputation_status"]
          timeliness_rating: number
          updated_at: string
          visible_at: string
          weighted_score: number
        }
        Insert: {
          collaboration_rating?: number
          comment?: string | null
          composite_score?: number
          correction_count?: number
          created_at?: string
          dispute_reason?: string | null
          id?: string
          interaction_type: string
          is_positive?: boolean
          permanent_at?: string
          professionalism_rating?: number
          project_id: string
          quality_rating?: number
          ratee_id: string
          rater_id: string
          rater_reputation_weight?: number
          rebuttal_statement?: string | null
          standards_compliance_rating?: number
          status?: Database["public"]["Enums"]["reputation_status"]
          timeliness_rating?: number
          updated_at?: string
          visible_at?: string
          weighted_score?: number
        }
        Update: {
          collaboration_rating?: number
          comment?: string | null
          composite_score?: number
          correction_count?: number
          created_at?: string
          dispute_reason?: string | null
          id?: string
          interaction_type?: string
          is_positive?: boolean
          permanent_at?: string
          professionalism_rating?: number
          project_id?: string
          quality_rating?: number
          ratee_id?: string
          rater_id?: string
          rater_reputation_weight?: number
          rebuttal_statement?: string | null
          standards_compliance_rating?: number
          status?: Database["public"]["Enums"]["reputation_status"]
          timeliness_rating?: number
          updated_at?: string
          visible_at?: string
          weighted_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "reputation_ratings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_scores: {
        Row: {
          account_type: string
          committee_eligible_since: string | null
          corrected_interactions: number
          criteria_collaboration_score: number
          criteria_professionalism_score: number
          criteria_quality_score: number
          criteria_standards_score: number
          criteria_timeliness_score: number
          eligible_for_committee: boolean
          id: string
          level_1_blocks: number
          level_2_blocks: number
          level_3_blocks: number
          negative_interactions: number
          overall_score: number
          positive_interactions: number
          stars: number
          suns: number
          total_interactions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string
          committee_eligible_since?: string | null
          corrected_interactions?: number
          criteria_collaboration_score?: number
          criteria_professionalism_score?: number
          criteria_quality_score?: number
          criteria_standards_score?: number
          criteria_timeliness_score?: number
          eligible_for_committee?: boolean
          id?: string
          level_1_blocks?: number
          level_2_blocks?: number
          level_3_blocks?: number
          negative_interactions?: number
          overall_score?: number
          positive_interactions?: number
          stars?: number
          suns?: number
          total_interactions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          committee_eligible_since?: string | null
          corrected_interactions?: number
          criteria_collaboration_score?: number
          criteria_professionalism_score?: number
          criteria_quality_score?: number
          criteria_standards_score?: number
          criteria_timeliness_score?: number
          eligible_for_committee?: boolean
          id?: string
          level_1_blocks?: number
          level_2_blocks?: number
          level_3_blocks?: number
          negative_interactions?: number
          overall_score?: number
          positive_interactions?: number
          stars?: number
          suns?: number
          total_interactions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_resources: {
        Row: {
          cost: number
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          resource_type: string
          scheduled_date: string
        }
        Insert: {
          cost: number
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          resource_type: string
          scheduled_date: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          resource_type?: string
          scheduled_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          category_description: string | null
          category_name: string
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at: string | null
          id: string
        }
        Insert: {
          category_description?: string | null
          category_name: string
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          id?: string
        }
        Update: {
          category_description?: string | null
          category_name?: string
          category_type?: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          provider_description: string | null
          provider_name: string
          website_url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider_description?: string | null
          provider_name: string
          website_url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider_description?: string | null
          provider_name?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subdomain_lockbox_configs: {
        Row: {
          cors_origins: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          lockbox_path: string
          project_id: string
          security_policy: Json | null
          updated_at: string | null
          xml_storage_bucket: string | null
        }
        Insert: {
          cors_origins?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lockbox_path: string
          project_id: string
          security_policy?: Json | null
          updated_at?: string | null
          xml_storage_bucket?: string | null
        }
        Update: {
          cors_origins?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lockbox_path?: string
          project_id?: string
          security_policy?: Json | null
          updated_at?: string | null
          xml_storage_bucket?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subdomain_lockbox_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      system_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read?: boolean | null
          title?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          asset_submission_id: string | null
          assigned_at: string | null
          assigned_by: string
          assigned_to: string
          completed_at: string | null
          due_date: string | null
          email_sent: boolean | null
          id: string
          project_id: string
          status: string | null
          task_description: string | null
          task_title: string
          task_type: string | null
          workstation_id: string
        }
        Insert: {
          asset_submission_id?: string | null
          assigned_at?: string | null
          assigned_by: string
          assigned_to: string
          completed_at?: string | null
          due_date?: string | null
          email_sent?: boolean | null
          id?: string
          project_id: string
          status?: string | null
          task_description?: string | null
          task_title: string
          task_type?: string | null
          workstation_id: string
        }
        Update: {
          asset_submission_id?: string | null
          assigned_at?: string | null
          assigned_by?: string
          assigned_to?: string
          completed_at?: string | null
          due_date?: string | null
          email_sent?: boolean | null
          id?: string
          project_id?: string
          status?: string | null
          task_description?: string | null
          task_title?: string
          task_type?: string | null
          workstation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_asset_submission_id_fkey"
            columns: ["asset_submission_id"]
            isOneToOne: false
            referencedRelation: "asset_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_workstation_id_fkey"
            columns: ["workstation_id"]
            isOneToOne: false
            referencedRelation: "workstations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_log: {
        Row: {
          created_at: string
          id: string
          task_details: string | null
          task_summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_details?: string | null
          task_summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_details?: string | null
          task_summary?: string
          user_id?: string
        }
        Relationships: []
      }
      team_skill_profiles: {
        Row: {
          balanced_team: boolean | null
          calculated_at: string | null
          id: string
          skill_coverage: Json
          skill_gaps: string[] | null
          synergy_multiplier: number | null
          team_id: string
          team_type: string
          updated_at: string | null
        }
        Insert: {
          balanced_team?: boolean | null
          calculated_at?: string | null
          id?: string
          skill_coverage?: Json
          skill_gaps?: string[] | null
          synergy_multiplier?: number | null
          team_id: string
          team_type: string
          updated_at?: string | null
        }
        Update: {
          balanced_team?: boolean | null
          calculated_at?: string | null
          id?: string
          skill_coverage?: Json
          skill_gaps?: string[] | null
          synergy_multiplier?: number | null
          team_id?: string
          team_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_flow_executions: {
        Row: {
          duration_minutes: number | null
          environment: string | null
          executed_by: string | null
          execution_date: string | null
          failed_step_id: string | null
          flow_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["test_execution_status"]
        }
        Insert: {
          duration_minutes?: number | null
          environment?: string | null
          executed_by?: string | null
          execution_date?: string | null
          failed_step_id?: string | null
          flow_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["test_execution_status"]
        }
        Update: {
          duration_minutes?: number | null
          environment?: string | null
          executed_by?: string | null
          execution_date?: string | null
          failed_step_id?: string | null
          flow_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["test_execution_status"]
        }
        Relationships: [
          {
            foreignKeyName: "test_flow_executions_failed_step_id_fkey"
            columns: ["failed_step_id"]
            isOneToOne: false
            referencedRelation: "test_flow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_flow_executions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "test_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      test_flow_steps: {
        Row: {
          created_at: string | null
          expected_outcome: string | null
          flow_id: string
          id: string
          notes: string | null
          route_path: string | null
          step_description: string | null
          step_number: number
          step_title: string
        }
        Insert: {
          created_at?: string | null
          expected_outcome?: string | null
          flow_id: string
          id?: string
          notes?: string | null
          route_path?: string | null
          step_description?: string | null
          step_number: number
          step_title: string
        }
        Update: {
          created_at?: string | null
          expected_outcome?: string | null
          flow_id?: string
          id?: string
          notes?: string | null
          route_path?: string | null
          step_description?: string | null
          step_number?: number
          step_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "test_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      test_flows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          flow_name: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["test_user_role"]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flow_name: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_role: Database["public"]["Enums"]["test_user_role"]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flow_name?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["test_user_role"]
        }
        Relationships: []
      }
      test_scenarios: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          scenario_data: Json
          scenario_name: string
          updated_at: string
          user_id: string
          xml_output: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          scenario_data?: Json
          scenario_name: string
          updated_at?: string
          user_id: string
          xml_output?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          scenario_data?: Json
          scenario_name?: string
          updated_at?: string
          user_id?: string
          xml_output?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_scenarios_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_suggestions: {
        Row: {
          assigned_to: string | null
          color_scheme: Json
          created_at: string | null
          id: string
          preview_image_url: string | null
          project_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_by: string | null
          theme_description: string | null
          theme_name: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          color_scheme: Json
          created_at?: string | null
          id?: string
          preview_image_url?: string | null
          project_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
          theme_description?: string | null
          theme_name: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          color_scheme?: Json
          created_at?: string | null
          id?: string
          preview_image_url?: string | null
          project_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_by?: string | null
          theme_description?: string | null
          theme_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_c_invitations: {
        Row: {
          approver_1_approved_at: string | null
          approver_1_id: string | null
          approver_1_role: string | null
          approver_2_approved_at: string | null
          approver_2_id: string | null
          approver_2_role: string | null
          created_at: string | null
          creator_id: string
          estimated_value_usd: number | null
          expires_at: string | null
          final_decision_at: string | null
          final_decision_by: string | null
          id: string
          initiated_by: string
          invitation_reason: string
          ip_asset_id: string | null
          justification_details: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approver_1_approved_at?: string | null
          approver_1_id?: string | null
          approver_1_role?: string | null
          approver_2_approved_at?: string | null
          approver_2_id?: string | null
          approver_2_role?: string | null
          created_at?: string | null
          creator_id: string
          estimated_value_usd?: number | null
          expires_at?: string | null
          final_decision_at?: string | null
          final_decision_by?: string | null
          id?: string
          initiated_by: string
          invitation_reason: string
          ip_asset_id?: string | null
          justification_details: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approver_1_approved_at?: string | null
          approver_1_id?: string | null
          approver_1_role?: string | null
          approver_2_approved_at?: string | null
          approver_2_id?: string | null
          approver_2_role?: string | null
          created_at?: string | null
          creator_id?: string
          estimated_value_usd?: number | null
          expires_at?: string | null
          final_decision_at?: string | null
          final_decision_by?: string | null
          id?: string
          initiated_by?: string
          invitation_reason?: string
          ip_asset_id?: string | null
          justification_details?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tier_c_invitations_ip_asset_id_fkey"
            columns: ["ip_asset_id"]
            isOneToOne: false
            referencedRelation: "ip_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badge_achievements: {
        Row: {
          achievement_category: string
          achievement_icon: string | null
          achievement_level: number | null
          achievement_name: string
          awarded_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          sort_order: number | null
          user_id: string
          visible_on_badge: boolean | null
        }
        Insert: {
          achievement_category: string
          achievement_icon?: string | null
          achievement_level?: number | null
          achievement_name: string
          awarded_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sort_order?: number | null
          user_id: string
          visible_on_badge?: boolean | null
        }
        Update: {
          achievement_category?: string
          achievement_icon?: string | null
          achievement_level?: number | null
          achievement_name?: string
          awarded_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sort_order?: number | null
          user_id?: string
          visible_on_badge?: boolean | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          available_credits: number | null
          bonus_purchases_count: number | null
          contribution_credits: number
          created_at: string | null
          current_bonus_tier: number | null
          earned_credits: number
          eoi_conversion_rate: number | null
          eoi_credits: number | null
          eoi_last_conversion_at: string | null
          eoi_reminder_sent_at: string | null
          eoi_used_credits: number | null
          id: string
          initial_credit_accepted: boolean | null
          initial_medallion_credit: number | null
          initial_medallion_granted_at: string | null
          last_bonus_purchase_at: string | null
          membership_stake_paid: boolean
          membership_stake_paid_at: string | null
          total_credits: number
          updated_at: string | null
          used_credits: number
          user_id: string
        }
        Insert: {
          available_credits?: number | null
          bonus_purchases_count?: number | null
          contribution_credits?: number
          created_at?: string | null
          current_bonus_tier?: number | null
          earned_credits?: number
          eoi_conversion_rate?: number | null
          eoi_credits?: number | null
          eoi_last_conversion_at?: string | null
          eoi_reminder_sent_at?: string | null
          eoi_used_credits?: number | null
          id?: string
          initial_credit_accepted?: boolean | null
          initial_medallion_credit?: number | null
          initial_medallion_granted_at?: string | null
          last_bonus_purchase_at?: string | null
          membership_stake_paid?: boolean
          membership_stake_paid_at?: string | null
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
          user_id: string
        }
        Update: {
          available_credits?: number | null
          bonus_purchases_count?: number | null
          contribution_credits?: number
          created_at?: string | null
          current_bonus_tier?: number | null
          earned_credits?: number
          eoi_conversion_rate?: number | null
          eoi_credits?: number | null
          eoi_last_conversion_at?: string | null
          eoi_reminder_sent_at?: string | null
          eoi_used_credits?: number | null
          id?: string
          initial_credit_accepted?: boolean | null
          initial_medallion_credit?: number | null
          initial_medallion_granted_at?: string | null
          last_bonus_purchase_at?: string | null
          membership_stake_paid?: boolean
          membership_stake_paid_at?: string | null
          total_credits?: number
          updated_at?: string | null
          used_credits?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_guild_progression: {
        Row: {
          completed_contracts: number
          created_at: string
          current_class: number
          current_class_started_at: string
          current_tier: string
          current_tier_started_at: string
          experience_hours: number
          guild_id: string | null
          id: string
          left_guild_at: string | null
          peer_rating_average: number | null
          previous_stake_paid: number | null
          reentry_debt: number | null
          reentry_terms: Json | null
          rejoined_at: string | null
          stakes_paid_by_class: Json
          total_stake_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_contracts?: number
          created_at?: string
          current_class?: number
          current_class_started_at?: string
          current_tier?: string
          current_tier_started_at?: string
          experience_hours?: number
          guild_id?: string | null
          id?: string
          left_guild_at?: string | null
          peer_rating_average?: number | null
          previous_stake_paid?: number | null
          reentry_debt?: number | null
          reentry_terms?: Json | null
          rejoined_at?: string | null
          stakes_paid_by_class?: Json
          total_stake_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_contracts?: number
          created_at?: string
          current_class?: number
          current_class_started_at?: string
          current_tier?: string
          current_tier_started_at?: string
          experience_hours?: number
          guild_id?: string | null
          id?: string
          left_guild_at?: string | null
          peer_rating_average?: number | null
          previous_stake_paid?: number | null
          reentry_debt?: number | null
          reentry_terms?: Json | null
          rejoined_at?: string | null
          stakes_paid_by_class?: Json
          total_stake_paid?: number
          updated_at?: string
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
      user_hexisle_preferences: {
        Row: {
          casual_enabled: boolean | null
          created_at: string | null
          notify_on_level_up: boolean | null
          notify_on_team_achievement: boolean | null
          notify_on_unlock: boolean | null
          preferred_mode: string
          public_profile: boolean | null
          real_stakes_enabled: boolean | null
          require_verification: boolean | null
          show_game_ui: boolean | null
          show_on_leaderboards: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          casual_enabled?: boolean | null
          created_at?: string | null
          notify_on_level_up?: boolean | null
          notify_on_team_achievement?: boolean | null
          notify_on_unlock?: boolean | null
          preferred_mode?: string
          public_profile?: boolean | null
          real_stakes_enabled?: boolean | null
          require_verification?: boolean | null
          show_game_ui?: boolean | null
          show_on_leaderboards?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          casual_enabled?: boolean | null
          created_at?: string | null
          notify_on_level_up?: boolean | null
          notify_on_team_achievement?: boolean | null
          notify_on_unlock?: boolean | null
          preferred_mode?: string
          public_profile?: boolean | null
          real_stakes_enabled?: boolean | null
          require_verification?: boolean | null
          show_game_ui?: boolean | null
          show_on_leaderboards?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_hexisle_skills: {
        Row: {
          completed_at: string | null
          created_at: string | null
          game_mode_progress: number
          id: string
          island_completed: boolean | null
          island_name: string
          island_unlocked: boolean | null
          real_stakes_progress: number
          skill_level: number
          sub_skills: Json | null
          updated_at: string | null
          user_id: string
          xp_earned: number
          xp_to_next_level: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          game_mode_progress?: number
          id?: string
          island_completed?: boolean | null
          island_name: string
          island_unlocked?: boolean | null
          real_stakes_progress?: number
          skill_level?: number
          sub_skills?: Json | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number
          xp_to_next_level?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          game_mode_progress?: number
          id?: string
          island_completed?: boolean | null
          island_name?: string
          island_unlocked?: boolean | null
          real_stakes_progress?: number
          skill_level?: number
          sub_skills?: Json | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number
          xp_to_next_level?: number
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          eoi_daily_reminders: boolean | null
          id: string
          marketplace_investor_track: string | null
          preferred_language: string | null
          preferred_theme: string | null
          queue_position_notifications: boolean | null
          show_eoi_data: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          eoi_daily_reminders?: boolean | null
          id?: string
          marketplace_investor_track?: string | null
          preferred_language?: string | null
          preferred_theme?: string | null
          queue_position_notifications?: boolean | null
          show_eoi_data?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          eoi_daily_reminders?: boolean | null
          id?: string
          marketplace_investor_track?: string | null
          preferred_language?: string | null
          preferred_theme?: string | null
          queue_position_notifications?: boolean | null
          show_eoi_data?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_project_preferences: {
        Row: {
          created_at: string
          default_eoi_conversion_days: number
          id: string
          project_category: string
          project_tags: string[] | null
          ranking: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_eoi_conversion_days?: number
          id?: string
          project_category: string
          project_tags?: string[] | null
          ranking: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_eoi_conversion_days?: number
          id?: string
          project_category?: string
          project_tags?: string[] | null
          ranking?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_project_subscriptions: {
        Row: {
          id: string
          last_sync_at: string | null
          project_id: string
          subscribed_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          last_sync_at?: string | null
          project_id: string
          subscribed_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          last_sync_at?: string | null
          project_id?: string
          subscribed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_project_subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          referee_email: string
          referee_id: string | null
          referrer_id: string
          shared_credit_amount: number
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          referee_email: string
          referee_id?: string | null
          referrer_id: string
          shared_credit_amount: number
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string
          referee_id?: string | null
          referrer_id?: string
          shared_credit_amount?: number
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_theme_preferences: {
        Row: {
          created_at: string | null
          id: string
          portal_type: string
          project_id: string
          theme_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          portal_type?: string
          project_id: string
          theme_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          portal_type?: string
          project_id?: string
          theme_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_theme_preferences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_theme_preferences_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "project_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_votes: {
        Row: {
          cash_ratio: number | null
          commitment_deadline: string | null
          converted_at: string | null
          created_at: string | null
          eoi_conversion_percentage: number | null
          equity_ratio: number | null
          id: string
          is_eoi: boolean | null
          production_level_id: string
          reverted_at: string | null
          source: string | null
          status: string | null
          time_commitment_days: number | null
          user_id: string
          vote_amount: number
        }
        Insert: {
          cash_ratio?: number | null
          commitment_deadline?: string | null
          converted_at?: string | null
          created_at?: string | null
          eoi_conversion_percentage?: number | null
          equity_ratio?: number | null
          id?: string
          is_eoi?: boolean | null
          production_level_id: string
          reverted_at?: string | null
          source?: string | null
          status?: string | null
          time_commitment_days?: number | null
          user_id: string
          vote_amount: number
        }
        Update: {
          cash_ratio?: number | null
          commitment_deadline?: string | null
          converted_at?: string | null
          created_at?: string | null
          eoi_conversion_percentage?: number | null
          equity_ratio?: number | null
          id?: string
          is_eoi?: boolean | null
          production_level_id?: string
          reverted_at?: string | null
          source?: string | null
          status?: string | null
          time_commitment_days?: number | null
          user_id?: string
          vote_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_production_level_id_fkey"
            columns: ["production_level_id"]
            isOneToOne: false
            referencedRelation: "production_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wave_node_assignments: {
        Row: {
          assignment_status: string
          completed_at: string | null
          created_at: string
          id: string
          node_id: string
          started_at: string | null
          units_assigned: number
          updated_at: string
          wave_id: string
        }
        Insert: {
          assignment_status?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id: string
          started_at?: string | null
          units_assigned?: number
          updated_at?: string
          wave_id: string
        }
        Update: {
          assignment_status?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id?: string
          started_at?: string | null
          units_assigned?: number
          updated_at?: string
          wave_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wave_node_assignments_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "production_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wave_node_assignments_wave_id_fkey"
            columns: ["wave_id"]
            isOneToOne: false
            referencedRelation: "production_waves"
            referencedColumns: ["id"]
          },
        ]
      }
      wave_premium_funds: {
        Row: {
          allocated_to_nodes: number
          available_for_expansion: number
          created_at: string
          id: string
          nodes_funded_count: number
          product_id: string
          total_premium_collected: number
          updated_at: string
        }
        Insert: {
          allocated_to_nodes?: number
          available_for_expansion?: number
          created_at?: string
          id?: string
          nodes_funded_count?: number
          product_id: string
          total_premium_collected?: number
          updated_at?: string
        }
        Update: {
          allocated_to_nodes?: number
          available_for_expansion?: number
          created_at?: string
          id?: string
          nodes_funded_count?: number
          product_id?: string
          total_premium_collected?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wave_premium_funds_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wave_preorder_slots: {
        Row: {
          created_at: string
          id: string
          pledge_id: string | null
          premium_paid: number | null
          reservation_date: string
          slot_type: string
          units_reserved: number
          user_id: string | null
          wave_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pledge_id?: string | null
          premium_paid?: number | null
          reservation_date?: string
          slot_type: string
          units_reserved?: number
          user_id?: string | null
          wave_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pledge_id?: string | null
          premium_paid?: number | null
          reservation_date?: string
          slot_type?: string
          units_reserved?: number
          user_id?: string | null
          wave_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wave_preorder_slots_pledge_id_fkey"
            columns: ["pledge_id"]
            isOneToOne: false
            referencedRelation: "pledges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wave_preorder_slots_wave_id_fkey"
            columns: ["wave_id"]
            isOneToOne: false
            referencedRelation: "production_waves"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_configs: {
        Row: {
          contribution_fee_percentage: number
          created_at: string
          earned_instant_fee_percentage: number
          earned_vest_days: number
          id: string
          min_withdrawal_amount: number
          updated_at: string
        }
        Insert: {
          contribution_fee_percentage?: number
          created_at?: string
          earned_instant_fee_percentage?: number
          earned_vest_days?: number
          id?: string
          min_withdrawal_amount?: number
          updated_at?: string
        }
        Update: {
          contribution_fee_percentage?: number
          created_at?: string
          earned_instant_fee_percentage?: number
          earned_vest_days?: number
          id?: string
          min_withdrawal_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      workstations: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          project_id: string
          updated_at: string | null
          workstation_name: string
          workstation_type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          project_id: string
          updated_at?: string | null
          workstation_name: string
          workstation_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          project_id?: string
          updated_at?: string | null
          workstation_name?: string
          workstation_type?: string
        }
        Relationships: [
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
          allowed_origins: string[] | null
          api_key: string
          created_at: string | null
          credential_name: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          project_id: string
          usage_count: number | null
        }
        Insert: {
          allowed_origins?: string[] | null
          api_key: string
          created_at?: string | null
          credential_name: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          project_id: string
          usage_count?: number | null
        }
        Update: {
          allowed_origins?: string[] | null
          api_key?: string
          created_at?: string | null
          credential_name?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          project_id?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xml_access_credentials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xml_access_logs: {
        Row: {
          accessed_at: string | null
          credential_id: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          origin: string | null
          project_id: string
          success: boolean
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          credential_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          origin?: string | null
          project_id: string
          success: boolean
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          credential_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          origin?: string | null
          project_id?: string
          success?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xml_access_logs_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "xml_access_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xml_access_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xml_module_metadata: {
        Row: {
          access_count: number | null
          content_hash: string | null
          created_at: string | null
          file_size_bytes: number | null
          id: string
          includes_pricing_data: boolean | null
          last_pricing_sync: string | null
          lockbox_path: string
          module_id: string
          pricing_data_source: string | null
          project_id: string
        }
        Insert: {
          access_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          id?: string
          includes_pricing_data?: boolean | null
          last_pricing_sync?: string | null
          lockbox_path: string
          module_id: string
          pricing_data_source?: string | null
          project_id: string
        }
        Update: {
          access_count?: number | null
          content_hash?: string | null
          created_at?: string | null
          file_size_bytes?: number | null
          id?: string
          includes_pricing_data?: boolean | null
          last_pricing_sync?: string | null
          lockbox_path?: string
          module_id?: string
          pricing_data_source?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xml_module_metadata_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "project_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xml_module_metadata_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { _invitation_id: string; _qr_scan_email: string }
        Returns: Json
      }
      activate_free_membership: {
        Args: { _user_id: string }
        Returns: undefined
      }
      allocate_gas_from_pool: {
        Args: {
          _gas_cost_usd: number
          _notes?: string
          _project_id: string
          _transaction_type: string
          _tx_hash?: string
        }
        Returns: string
      }
      apply_reputation_penalty: {
        Args: { penalty: number; user_id: string }
        Returns: undefined
      }
      award_hexisle_xp: {
        Args: {
          _is_real_stakes?: boolean
          _island_name: string
          _user_id: string
          _xp_amount: number
        }
        Returns: Json
      }
      calculate_commitment_ratios: {
        Args: { _product_lead_time_days: number; _time_commitment_days: number }
        Returns: {
          cash_ratio: number
          equity_ratio: number
        }[]
      }
      calculate_eoi_conversion_ratios: {
        Args: { _ranking_score: number; _vesting_days: number }
        Returns: {
          cash_ratio: number
          daily_conversion_rate: number
          equity_ratio: number
        }[]
      }
      calculate_guild_sponsorship_terms: {
        Args: {
          _contract_value: number
          _mentee_class: number
          _mentee_tier: string
          _sponsor_class: number
          _sponsor_tier: string
        }
        Returns: Json
      }
      calculate_position_compensation: {
        Args: {
          _organization_id?: string
          _organization_type?: string
          _position_id: string
        }
        Returns: Json
      }
      calculate_project_costs: {
        Args: { _month: string; _project_id: string }
        Returns: Json
      }
      calculate_reentry_cost: {
        Args: { _target_class: number; _target_tier: string; _user_id: string }
        Returns: Json
      }
      calculate_team_skills: {
        Args: { _team_id: string; _team_type: string }
        Returns: Json
      }
      calculate_user_bonus_percentage: {
        Args: { _user_id: string }
        Returns: Json
      }
      calculate_withdrawal: {
        Args: { _amount: number; _user_id: string; _withdrawal_type: string }
        Returns: {
          eligible: boolean
          error_message: string
          fee_amount: number
          fee_percentage: number
          net_amount: number
        }[]
      }
      check_eoi_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversion_amount: number
          email: string
          eoi_credits: number
          user_id: string
        }[]
      }
      check_medallion_funded: {
        Args: { _project_id: string }
        Returns: boolean
      }
      check_wave_surge_pricing: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      contribute_to_lb_pool: {
        Args: { _pledge_amount: number }
        Returns: undefined
      }
      convert_eoi_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      convert_eoi_credits_with_vesting: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_expired_memberships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_user_credits: {
        Args: {
          _amount: number
          _deduct_from_medallion?: boolean
          _user_id: string
        }
        Returns: undefined
      }
      extend_membership: {
        Args: { _confirmation_token: string }
        Returns: Json
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_lockbox_xml: {
        Args: { _project_id: string }
        Returns: string
      }
      generate_module_hash: {
        Args: {
          _module_version: number
          _previous_hash: string
          _project_id: string
          _xml_data: string
        }
        Returns: string
      }
      generate_project_module_xml: {
        Args: { p_project_id: string }
        Returns: string
      }
      get_membership_reminder_candidates: {
        Args: Record<PropertyKey, never>
        Returns: {
          confirmation_token: string
          email: string
          expires_at: string
          user_id: string
        }[]
      }
      get_project_api_logs: {
        Args: { _limit?: number; _project_id: string }
        Returns: {
          bytes_transferred: number
          created_at: string
          credential_id: string
          endpoint: string
          id: string
          ip_address: string
          method: string
          project_id: string
          response_time_ms: number
          status_code: number
          user_agent: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_credential_usage: {
        Args: { credential_id: string }
        Returns: undefined
      }
      increment_violation_count: {
        Args: { link_id: string }
        Returns: undefined
      }
      initialize_project_lockbox: {
        Args: { _project_id: string }
        Returns: string
      }
      log_agent_action: {
        Args: {
          _action_type: string
          _changes: Json
          _ip_address?: string
          _record_id: string
          _table_name: string
          _user_agent?: string
        }
        Returns: string
      }
      log_blockchain_verification: {
        Args: {
          _notes?: string
          _performed_by: string
          _project_id: string
          _verification_result: Json
        }
        Returns: string
      }
      mark_reminder_sent: {
        Args: { _user_id: string }
        Returns: undefined
      }
      public_verify_project_chain: {
        Args: { _project_sku: string }
        Returns: Json
      }
      revert_expired_votes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_industry_pricing_data: {
        Args: {
          _discount_pct: number
          _product_id: string
          _production_run_id: string
          _run_end: string
          _run_start: string
          _unit_price: number
          _units: number
        }
        Returns: string
      }
      track_resource_usage: {
        Args: {
          _cost_usd?: number
          _metadata?: Json
          _portal: string
          _project_id: string
          _resource_type: string
          _usage_count?: number
        }
        Returns: string
      }
      update_pledge_eoi_conversion: {
        Args: { _conversion_percentage: number; _pledge_id: string }
        Returns: undefined
      }
      update_user_credits_withdrawal: {
        Args: { _amount: number; _credit_type: string; _user_id: string }
        Returns: undefined
      }
      validate_derivative_compliance: {
        Args: { _derivative_project_id: string }
        Returns: Json
      }
      validate_xml_access: {
        Args: { _api_key: string; _origin: string }
        Returns: {
          credential_id: string
          is_valid: boolean
          project_id: string
        }[]
      }
      verify_module_chain: {
        Args: { _project_id: string }
        Returns: {
          actual_hash: string
          error_message: string
          expected_hash: string
          is_valid: boolean
          module_id: string
          version: number
        }[]
      }
      xmlescape: {
        Args: { input: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "project_owner" | "user"
      arbitration_ruling: "creator_upheld" | "lb_upheld" | "compromise"
      assignment_status: "pending" | "active" | "completed" | "cancelled"
      assignment_type: "primary" | "secondary" | "backup"
      contract_status: "pending" | "active" | "completed" | "cancelled"
      dispute_status: "pending" | "under_review" | "resolved" | "rejected"
      guild_type: "division" | "industry" | "skill"
      ip_asset_type:
        | "patent"
        | "copyright"
        | "trademark"
        | "trade_secret"
        | "design"
        | "know_how"
      ip_control_tier: "tier_a" | "tier_b" | "tier_c"
      ip_proposal_status:
        | "pending"
        | "auto_approved"
        | "creator_approved"
        | "creator_denied"
        | "arbitration"
        | "approved_by_arbitration"
        | "rejected"
      keirsey_temperament: "guardian" | "artisan" | "idealist" | "rational"
      keirsey_variant:
        | "supervisor"
        | "inspector"
        | "provider"
        | "protector"
        | "promoter"
        | "crafter"
        | "performer"
        | "composer"
        | "teacher"
        | "counselor"
        | "champion"
        | "healer"
        | "fieldmarshal"
        | "mastermind"
        | "inventor"
        | "architect"
      lifecycle_stage:
        | "germination"
        | "seed"
        | "sprout"
        | "seedling"
        | "plant_no_flowers"
        | "plant_with_flowers"
        | "plant_with_fruit"
      position_category:
        | "create_idea"
        | "define_describe_document"
        | "research_development"
        | "prototype"
        | "legal_services"
        | "logistics_blockchain"
        | "steward_owner"
        | "marketing_services"
        | "accounting_services"
        | "hr_staffing"
        | "materials_sourcing"
        | "manufacture_assembly"
        | "kickstarter_campaign"
        | "it_services"
        | "delivery"
      reputation_status:
        | "pending"
        | "active"
        | "disputed"
        | "overturned"
        | "corrected"
      service_category_type:
        | "crowdfunding_launch"
        | "crowdfunding_platform"
        | "equity_crowdfunding"
        | "manufacturing_crowdfunding"
        | "marketing"
        | "legal"
        | "accounting"
        | "design"
        | "manufacturing"
        | "logistics"
        | "customer_service"
        | "technology"
        | "consulting"
        | "other"
      task_status: "pending" | "in_progress" | "completed"
      test_execution_status:
        | "not_started"
        | "in_progress"
        | "passed"
        | "failed"
        | "blocked"
      test_user_role:
        | "new_user"
        | "authenticated_user"
        | "member"
        | "project_owner"
        | "project_manager"
        | "hr"
        | "steward"
        | "applicant"
        | "admin"
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
  public: {
    Enums: {
      app_role: ["admin", "project_owner", "user"],
      arbitration_ruling: ["creator_upheld", "lb_upheld", "compromise"],
      assignment_status: ["pending", "active", "completed", "cancelled"],
      assignment_type: ["primary", "secondary", "backup"],
      contract_status: ["pending", "active", "completed", "cancelled"],
      dispute_status: ["pending", "under_review", "resolved", "rejected"],
      guild_type: ["division", "industry", "skill"],
      ip_asset_type: [
        "patent",
        "copyright",
        "trademark",
        "trade_secret",
        "design",
        "know_how",
      ],
      ip_control_tier: ["tier_a", "tier_b", "tier_c"],
      ip_proposal_status: [
        "pending",
        "auto_approved",
        "creator_approved",
        "creator_denied",
        "arbitration",
        "approved_by_arbitration",
        "rejected",
      ],
      keirsey_temperament: ["guardian", "artisan", "idealist", "rational"],
      keirsey_variant: [
        "supervisor",
        "inspector",
        "provider",
        "protector",
        "promoter",
        "crafter",
        "performer",
        "composer",
        "teacher",
        "counselor",
        "champion",
        "healer",
        "fieldmarshal",
        "mastermind",
        "inventor",
        "architect",
      ],
      lifecycle_stage: [
        "germination",
        "seed",
        "sprout",
        "seedling",
        "plant_no_flowers",
        "plant_with_flowers",
        "plant_with_fruit",
      ],
      position_category: [
        "create_idea",
        "define_describe_document",
        "research_development",
        "prototype",
        "legal_services",
        "logistics_blockchain",
        "steward_owner",
        "marketing_services",
        "accounting_services",
        "hr_staffing",
        "materials_sourcing",
        "manufacture_assembly",
        "kickstarter_campaign",
        "it_services",
        "delivery",
      ],
      reputation_status: [
        "pending",
        "active",
        "disputed",
        "overturned",
        "corrected",
      ],
      service_category_type: [
        "crowdfunding_launch",
        "crowdfunding_platform",
        "equity_crowdfunding",
        "manufacturing_crowdfunding",
        "marketing",
        "legal",
        "accounting",
        "design",
        "manufacturing",
        "logistics",
        "customer_service",
        "technology",
        "consulting",
        "other",
      ],
      task_status: ["pending", "in_progress", "completed"],
      test_execution_status: [
        "not_started",
        "in_progress",
        "passed",
        "failed",
        "blocked",
      ],
      test_user_role: [
        "new_user",
        "authenticated_user",
        "member",
        "project_owner",
        "project_manager",
        "hr",
        "steward",
        "applicant",
        "admin",
      ],
    },
  },
} as const
