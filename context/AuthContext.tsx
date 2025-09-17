import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, UserRole, Seller } from '../types';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          await handleNewSession(session);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleNewSession = async (session: Session) => {
    try {
      const authUser = session.user;
      if (!authUser) return;

      // Fetch user record
      let { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user record:', userError);
        return;
      }

      // Create user if not exists
      if (!userRecord) {
        const role = (localStorage.getItem('role') as UserRole) || UserRole.BUYER;
        localStorage.removeItem('role');

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          role,
        };

        const { data, error } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          return;
        }
        userRecord = data;
      }

      const finalRole =
        (localStorage.getItem('role') as UserRole) ||
        userRecord?.role ||
        UserRole.BUYER;

      // Ensure seller record exists if role is SELLER
      if (finalRole === UserRole.SELLER) {
        const { data: existingSeller } = await supabase
          .from('sellers')
          .select('id')
          .eq('id', authUser.id)
          .single();

        if (!existingSeller) {
          // Fallback to email if name not provided
          const newSeller: Omit<Seller, 'id'> & { id: string } = {
            id: authUser.id,
            name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email!,
            email: authUser.email!,
            avatar: authUser.user_metadata?.avatar_url || '',
            specialty: authUser.user_metadata?.specialty || 'General Consultation',
          };

          const { error: sellerError } = await supabase
            .from('sellers')
            .insert([newSeller]);

          if (sellerError) console.error('Error creating seller record:', sellerError);
        }
      }

      // Set current user
      const finalUser: User = {
        id: authUser.id,
        name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email!,
        email: authUser.email!,
        avatar: authUser.user_metadata?.avatar_url || '',
        role: finalRole,
      };

      setCurrentUser(finalUser);
    } catch (err) {
      console.error('Unexpected error in handleNewSession:', err);
    }
  };

  const login = async (role: UserRole) => {
    localStorage.setItem('role', role);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { queryParams: { prompt: 'select_account' } },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const value = { currentUser, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};
