/* Clés Supabase (Project Settings > API Keys).
   Laissées vides, l'app démarre en mode démo (données dans le navigateur). */
window.APP_CONFIG = {
  appName: "La Popote des Copains",
  supabaseUrl: "https://cczgjuhkmpxrzjjjvugw.supabase.co",
  supabaseAnonKey: "sb_publishable_TdmgFRH00T33W2ig9beLbw_5NnwPIrF", // clé publique, sans danger côté navigateur grâce aux règles RLS
  allowSignup: true,      // false = masque « Créer un compte » (membres invités uniquement)
};
