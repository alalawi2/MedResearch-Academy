import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  title: string | null;
  primary_site: string | null;
}

interface StudyRole {
  study_id: string;
  study_slug: string;
  role: string;
  site_scope: string | null;
}

export interface ResidentProfile {
  id: string;
  study_id: string;
  study_participant_id: string;
  email: string;
  full_name: string;
  primary_site: string | null;
  pgy_level: number | null;
  program: string | null;
  enrollment_date: string | null;
  auth_user_id: string | null;
  demographics_completed: boolean | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  staff: StaffProfile | null;
  studyRoles: StudyRole[];
  residentProfile: ResidentProfile | null;
  userType: 'staff' | 'resident' | null;
  isResident: boolean;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (studySlug: string, minRole?: string) => boolean;
  getRoleForStudy: (studySlug: string) => string | null;
}

const ROLE_HIERARCHY = ['super_admin', 'research_admin', 'site_coordinator', 'research_assistant', 'statistician'];

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [studyRoles, setStudyRoles] = useState<StudyRole[]>([]);
  const [residentProfile, setResidentProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const userType: 'staff' | 'resident' | null = staff ? 'staff' : residentProfile ? 'resident' : null;
  const isResident = userType === 'resident';

  async function loadResidentProfile(userId: string, userEmail: string | undefined) {
    // First try by auth_user_id
    const { data: byId } = await supabase
      .from('burnout_participants')
      .select('id, study_id, study_participant_id, email, full_name, primary_site, pgy_level, program, enrollment_date, auth_user_id, demographics_completed')
      .eq('auth_user_id', userId)
      .limit(1)
      .single();

    if (byId) {
      setResidentProfile(byId);
      return;
    }

    // If not found by auth_user_id, try matching by email and auto-link
    if (userEmail) {
      const { data: byEmail } = await supabase
        .from('burnout_participants')
        .select('id, study_id, study_participant_id, email, full_name, primary_site, pgy_level, program, enrollment_date, auth_user_id, demographics_completed')
        .eq('email', userEmail.toLowerCase())
        .is('auth_user_id', null)
        .limit(1)
        .single();

      if (byEmail) {
        // Auto-link auth_user_id
        await supabase
          .from('burnout_participants')
          .update({ auth_user_id: userId })
          .eq('id', byEmail.id);

        setResidentProfile({ ...byEmail, auth_user_id: userId });
        return;
      }
    }

    setResidentProfile(null);
  }

  async function loadStaffProfile(userId: string, userEmail: string | undefined) {
    const { data: staffRow } = await supabase
      .from('staff')
      .select('id, email, full_name, title, primary_site')
      .eq('auth_user_id', userId)
      .eq('active', true)
      .limit(1)
      .single();

    if (!staffRow) {
      setStaff(null);
      setStudyRoles([]);
      // Staff not found — try resident profile
      await loadResidentProfile(userId, userEmail);
      return;
    }

    setStaff(staffRow);
    setResidentProfile(null);

    const { data: roles } = await supabase
      .from('staff_study_roles')
      .select('study_id, role, site_scope, studies!inner(slug)')
      .eq('staff_id', staffRow.id)
      .limit(50);

    if (roles) {
      setStudyRoles(
        roles.map((r: any) => ({
          study_id: r.study_id,
          study_slug: r.studies?.slug ?? '',
          role: r.role,
          site_scope: r.site_scope,
        }))
      );
    }
  }

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadStaffProfile(s.user.id, s.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadStaffProfile(s.user.id, s.user.email).finally(() => setLoading(false));
      } else {
        setStaff(null);
        setStudyRoles([]);
        setResidentProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStaff(null);
    setStudyRoles([]);
    setResidentProfile(null);
  }

  function getRoleForStudy(studySlug: string) {
    return studyRoles.find(r => r.study_slug === studySlug)?.role ?? null;
  }

  function hasRole(studySlug: string, minRole?: string) {
    const role = getRoleForStudy(studySlug);
    if (!role) return false;
    if (!minRole) return true;
    return ROLE_HIERARCHY.indexOf(role) <= ROLE_HIERARCHY.indexOf(minRole);
  }

  return (
    <AuthContext.Provider value={{ user, session, staff, studyRoles, residentProfile, userType, isResident, loading, signIn, signOut, hasRole, getRoleForStudy }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
