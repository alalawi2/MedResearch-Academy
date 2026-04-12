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

interface AuthState {
  user: User | null;
  session: Session | null;
  staff: StaffProfile | null;
  studyRoles: StudyRole[];
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
  const [loading, setLoading] = useState(true);

  async function loadStaffProfile(userId: string) {
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
      return;
    }

    setStaff(staffRow);

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
        loadStaffProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadStaffProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setStaff(null);
        setStudyRoles([]);
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
    <AuthContext.Provider value={{ user, session, staff, studyRoles, loading, signIn, signOut, hasRole, getRoleForStudy }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
