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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity: string
          entity_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          id: string
          question: string
          answer: string
          sort_order: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question: string
          answer: string
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      modes_paiement: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
        Relationships: []
      }
      categories_depense: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          value: string
          description: string | null
        }
        Insert: {
          key: string
          value: string
          description?: string | null
        }
        Update: {
          key?: string
          value?: string
          description?: string | null
        }
        Relationships: []
      }
      depenses: {
        Row: {
          categorie: string
          created_at: string | null
          date_depense: string | null
          description: string | null
          id: string
          justificatif_url: string | null
          mode_paiement: string | null
          montant: number
          utilisateur_id: string | null
          vehicule_id: string | null
        }
        Insert: {
          categorie: string
          created_at?: string | null
          date_depense?: string | null
          description?: string | null
          id?: string
          justificatif_url?: string | null
          mode_paiement?: string | null
          montant: number
          utilisateur_id?: string | null
          vehicule_id?: string | null
        }
        Update: {
          categorie?: string
          created_at?: string | null
          date_depense?: string | null
          description?: string | null
          id?: string
          justificatif_url?: string | null
          mode_paiement?: string | null
          montant?: number
          utilisateur_id?: string | null
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depenses_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      eleves: {
        Row: {
          adresse: string | null
          code: string | null
          created_at: string | null
          date_inscription: string | null
          date_naissance: string | null
          dossier_code: string | null
          email: string | null
          est_parraine: boolean | null
          id: string
          inspecteur: string | null
          inspecteur_id: string | null
          lieu_naissance: string | null
          moniteur_id: string | null
          nationalite: string | null
          nom: string
          notes: string | null
          num_piece: string | null
          parrain_nom: string | null
          permis_id: string | null
          photo_cni: string | null
          photo_profil: string | null
          prenom: string
          seances_faites: number | null
          seances_totales: number | null
          sexe: string | null
          statut: string | null
          telephone: string
          type_permis: string | null
          type_piece: string | null
        }
        Insert: {
          adresse?: string | null
          code?: string | null
          created_at?: string | null
          date_inscription?: string | null
          date_naissance?: string | null
          dossier_code?: string | null
          email?: string | null
          est_parraine?: boolean | null
          id?: string
          inspecteur?: string | null
          inspecteur_id?: string | null
          lieu_naissance?: string | null
          moniteur_id?: string | null
          nationalite?: string | null
          nom: string
          notes?: string | null
          num_piece?: string | null
          parrain_nom?: string | null
          permis_id?: string | null
          photo_cni?: string | null
          photo_profil?: string | null
          prenom: string
          seances_faites?: number | null
          seances_totales?: number | null
          sexe?: string | null
          statut?: string | null
          telephone: string
          type_permis?: string | null
          type_piece?: string | null
        }
        Update: {
          adresse?: string | null
          code?: string | null
          created_at?: string | null
          date_inscription?: string | null
          date_naissance?: string | null
          dossier_code?: string | null
          email?: string | null
          est_parraine?: boolean | null
          id?: string
          inspecteur?: string | null
          inspecteur_id?: string | null
          lieu_naissance?: string | null
          moniteur_id?: string | null
          nationalite?: string | null
          nom?: string
          notes?: string | null
          num_piece?: string | null
          parrain_nom?: string | null
          permis_id?: string | null
          photo_cni?: string | null
          photo_profil?: string | null
          prenom?: string
          seances_faites?: number | null
          seances_totales?: number | null
          sexe?: string | null
          statut?: string | null
          telephone?: string
          type_permis?: string | null
          type_piece?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eleves_inspecteur_id_fkey"
            columns: ["inspecteur_id"]
            isOneToOne: false
            referencedRelation: "inspecteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eleves_moniteur_id_fkey"
            columns: ["moniteur_id"]
            isOneToOne: false
            referencedRelation: "moniteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eleves_permis_id_fkey"
            columns: ["permis_id"]
            isOneToOne: false
            referencedRelation: "permis"
            referencedColumns: ["id"]
          },
        ]
      }
      examen_session_eleves: {
        Row: {
          categorie_permis: string
          created_at: string | null
          eleve_id: string
          id: string
          identifiant: string
          nom_complet: string
          note: number | null
          observations: string | null
          resultat: string | null
          session_id: string
          telephone: string
        }
        Insert: {
          categorie_permis: string
          created_at?: string | null
          eleve_id: string
          id?: string
          identifiant: string
          nom_complet: string
          note?: number | null
          observations?: string | null
          resultat?: string | null
          session_id: string
          telephone: string
        }
        Update: {
          categorie_permis?: string
          created_at?: string | null
          eleve_id?: string
          id?: string
          identifiant?: string
          nom_complet?: string
          note?: number | null
          observations?: string | null
          resultat?: string | null
          session_id?: string
          telephone?: string
        }
        Relationships: [
          {
            foreignKeyName: "examen_session_eleves_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examen_session_eleves_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "examen_session_eleves_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "examen_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      examen_sessions: {
        Row: {
          categorie: string
          centre: string
          created_at: string | null
          created_by: string | null
          date_examen: string
          heure_examen: string
          id: string
          inspecteur_id: string | null
          lieu: string
          numero_bordereau: string
          observations: string | null
          statut: string
          titre: string
          type_examen: string
          vehicule_id: string | null
        }
        Insert: {
          categorie: string
          centre: string
          created_at?: string | null
          created_by?: string | null
          date_examen: string
          heure_examen: string
          id?: string
          inspecteur_id?: string | null
          lieu: string
          numero_bordereau: string
          observations?: string | null
          statut?: string
          titre: string
          type_examen: string
          vehicule_id?: string | null
        }
        Update: {
          categorie?: string
          centre?: string
          created_at?: string | null
          created_by?: string | null
          date_examen?: string
          heure_examen?: string
          id?: string
          inspecteur_id?: string | null
          lieu?: string
          numero_bordereau?: string
          observations?: string | null
          statut?: string
          titre?: string
          type_examen?: string
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "examen_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examen_sessions_inspecteur_id_fkey"
            columns: ["inspecteur_id"]
            isOneToOne: false
            referencedRelation: "inspecteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examen_sessions_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      examens: {
        Row: {
          created_at: string | null
          date_examen: string
          eleve_id: string | null
          formation_id: string | null
          id: string
          inspecteur_id: string | null
          notes: string | null
          resultat: string | null
          type_examen: string
          type_permis: string | null
        }
        Insert: {
          created_at?: string | null
          date_examen: string
          eleve_id?: string | null
          formation_id?: string | null
          id?: string
          inspecteur_id?: string | null
          notes?: string | null
          resultat?: string | null
          type_examen: string
          type_permis?: string | null
        }
        Update: {
          created_at?: string | null
          date_examen?: string
          eleve_id?: string | null
          formation_id?: string | null
          id?: string
          inspecteur_id?: string | null
          notes?: string | null
          resultat?: string | null
          type_examen?: string
          type_permis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "examens_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examens_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "examens_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examens_inspecteur_id_fkey"
            columns: ["inspecteur_id"]
            isOneToOne: false
            referencedRelation: "inspecteurs"
            referencedColumns: ["id"]
          },
        ]
      }
      factures: {
        Row: {
          created_at: string | null
          date_emission: string | null
          eleve_id: string | null
          id: string
          inscription_id: string | null
          montant: number
          numero: string
          statut: string | null
        }
        Insert: {
          created_at?: string | null
          date_emission?: string | null
          eleve_id?: string | null
          id?: string
          inscription_id?: string | null
          montant: number
          numero: string
          statut?: string | null
        }
        Update: {
          created_at?: string | null
          date_emission?: string | null
          eleve_id?: string | null
          id?: string
          inscription_id?: string | null
          montant?: number
          numero?: string
          statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "factures_inscription_id_fkey"
            columns: ["inscription_id"]
            isOneToOne: false
            referencedRelation: "inscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          actif: boolean | null
          created_at: string | null
          description: string | null
          id: string
          nom: string
          prix: number | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          prix?: number | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          prix?: number | null
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          created_at: string | null
          date_inscription: string | null
          eleve_id: string | null
          formation_id: string | null
          id: string
          tarif: number
        }
        Insert: {
          created_at?: string | null
          date_inscription?: string | null
          eleve_id?: string | null
          formation_id?: string | null
          id?: string
          tarif: number
        }
        Update: {
          created_at?: string | null
          date_inscription?: string | null
          eleve_id?: string | null
          formation_id?: string | null
          id?: string
          tarif?: number
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "inscriptions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      inspecteurs: {
        Row: {
          actif: boolean | null
          created_at: string | null
          email: string | null
          id: string
          nom: string
          prenom: string
          telephone: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom: string
          prenom: string
          telephone?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          telephone?: string | null
        }
        Relationships: []
      }
      moniteurs: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nom: string
          prenom: string
          specialite: string | null
          statut: string | null
          telephone: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          nom: string
          prenom: string
          specialite?: string | null
          statut?: string | null
          telephone: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          specialite?: string | null
          statut?: string | null
          telephone?: string
        }
        Relationships: []
      }
      paiements: {
        Row: {
          created_at: string | null
          date_paiement: string | null
          eleve_id: string | null
          facture_id: string | null
          id: string
          mode_paiement: string | null
          montant: number
          notes: string | null
          reference: string | null
        }
        Insert: {
          created_at?: string | null
          date_paiement?: string | null
          eleve_id?: string | null
          facture_id?: string | null
          id?: string
          mode_paiement?: string | null
          montant: number
          notes?: string | null
          reference?: string | null
        }
        Update: {
          created_at?: string | null
          date_paiement?: string | null
          eleve_id?: string | null
          facture_id?: string | null
          id?: string
          mode_paiement?: string | null
          montant?: number
          notes?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "paiements_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures"
            referencedColumns: ["id"]
          },
        ]
      }
      permis: {
        Row: {
          code: string
          created_at: string | null
          id: string
          libelle: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          libelle: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          libelle?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          actif: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      seances: {
        Row: {
          created_at: string | null
          date_seance: string | null
          duree_minutes: number | null
          eleve_id: string | null
          heure_debut: string | null
          heure_fin: string | null
          id: string
          lieu: string | null
          moniteur_id: string | null
          notes: string | null
          statut: string | null
          titre: string | null
          type: string | null
          vehicule_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_seance?: string | null
          duree_minutes?: number | null
          eleve_id?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu?: string | null
          moniteur_id?: string | null
          notes?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          vehicule_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_seance?: string | null
          duree_minutes?: number | null
          eleve_id?: string | null
          heure_debut?: string | null
          heure_fin?: string | null
          id?: string
          lieu?: string | null
          moniteur_id?: string | null
          notes?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          vehicule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seances_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seances_eleve_id_fkey"
            columns: ["eleve_id"]
            isOneToOne: false
            referencedRelation: "eleves_solde"
            referencedColumns: ["eleve_id"]
          },
          {
            foreignKeyName: "seances_moniteur_id_fkey"
            columns: ["moniteur_id"]
            isOneToOne: false
            referencedRelation: "moniteurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seances_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicules"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicules: {
        Row: {
          created_at: string | null
          etat: string | null
          id: string
          immatriculation: string
          marque: string | null
          modele: string | null
        }
        Insert: {
          created_at?: string | null
          etat?: string | null
          id?: string
          immatriculation: string
          marque?: string | null
          modele?: string | null
        }
        Update: {
          created_at?: string | null
          etat?: string | null
          id?: string
          immatriculation?: string
          marque?: string | null
          modele?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      eleves_solde: {
        Row: {
          eleve_id: string | null
          solde: number | null
          total_facture: number | null
          total_paye: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_staff_user: {
        Args: {
          p_email: string
          p_password: string
          p_name: string
          p_role: string
        }
        Returns: {
          id: string
          email: string
          name: string
          role: string
        }[]
      }
      delete_eleve: {
        Args: { p_id: string }
        Returns: undefined
      }
      delete_staff_user: {
        Args: { p_id: string }
        Returns: undefined
      }
      enregistrer_paiement: {
        Args: {
          p_facture_id: string
          p_mode_paiement: string
          p_montant: number
          p_notes?: string
          p_reference?: string
        }
        Returns: string
      }
      get_eleve_portail_data: {
        Args: { p_code: string; p_telephone: string }
        Returns: Json
      }
      inscrire_eleve: {
        Args: { p_eleve_id: string; p_formation_id: string; p_tarif?: number }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_comptable_or_admin: { Args: never; Returns: boolean }
      login_eleve_portail: {
        Args: { p_code: string; p_telephone: string }
        Returns: {
          code: string
          email: string
          id: string
          nom: string
          prenom: string
          statut: string
          telephone: string
          type_permis: string
        }[]
      }
      update_staff_user: {
        Args: {
          p_id: string
          p_name: string
          p_role: string
          p_actif: boolean
          p_password?: string
        }
        Returns: {
          id: string
          email: string
          name: string
          role: string
          actif: boolean
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
  public: {
    Enums: {},
  },
} as const
