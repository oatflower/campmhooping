import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { clearUserCache } from '@/services/constants';

// Extend our internal User interface to map from Supabase
interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    preferredName?: string;
    phone?: string;
    address?: string;
    emergencyContact?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profileId: string | null;  // Profile ID from profiles table
    isAuthenticated: boolean;
    isHost: boolean;  // Whether user has HOST or ADMIN role
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    isLoading: boolean;
    loading: boolean;  // Alias for isLoading (backward compatibility)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch profile ID and role from profiles table
    const fetchProfileData = async (authUserId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('auth_user_id', authUserId)
                .single();

            if (profile && !error) {
                setProfileId(profile.id);
                // Check if user has HOST or ADMIN role
                setIsHost(profile.role === 'HOST' || profile.role === 'ADMIN');
            } else {
                // Profile might not exist yet (trigger might be creating it)
                console.warn('Profile not found for auth user, will retry...');
                setProfileId(null);
                setIsHost(false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileId(null);
            setIsHost(false);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                if (initialSession?.user) {
                    mapSupabaseUser(initialSession.user);
                    await fetchProfileData(initialSession.user.id);
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
                setSession(currentSession);
                if (currentSession?.user) {
                    mapSupabaseUser(currentSession.user);
                    await fetchProfileData(currentSession.user.id);
                } else {
                    setUser(null);
                    setProfileId(null);
                    setIsHost(false);
                    clearUserCache();
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUser = (sbUser: SupabaseUser) => {
        const metadata = sbUser.user_metadata || {};
        const mappedUser: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: metadata.full_name || metadata.name || sbUser.email?.split('@')[0] || 'User',
            avatar: metadata.avatar_url,
            preferredName: metadata.preferred_name,
            phone: sbUser.phone,
            address: metadata.address,
        };
        setUser(mappedUser);
    };

    const login = async () => {
        // For Lovable/Supabase, we usually use the Auth UI component or a direct redirect.
        // For now, this is a placeholder if there's no custom UI.
        // Implementing a simple GitHub login as default for "login()" calls if not using a form.
        // OR better: existing components probably call login(mockData). 
        // We need to see how "login" is used.
        console.warn("Direct login() called. Please use Supabase Auth UI or signInWithPassword.");
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfileId(null);
        setIsHost(false);
        clearUserCache();
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        // Store previous state for rollback
        const previousUser = { ...user };

        // Optimistic update for better UX
        setUser({ ...user, ...updates });

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: updates.name,
                    avatar_url: updates.avatar,
                    preferred_name: updates.preferredName,
                    address: updates.address,
                    // Store other fields in metadata
                    ...updates
                }
            });

            if (error) throw error;
        } catch (error) {
            // Rollback on failure
            setUser(previousUser);
            console.error("Update user error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profileId,
            isAuthenticated: !!user,
            isHost,
            login,
            logout,
            updateUser,
            isLoading,
            loading: isLoading  // Alias for backward compatibility
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
