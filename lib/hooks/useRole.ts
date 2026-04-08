'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getDocument } from '@/lib/firebase/firestore';
import { UserRole, GoldifyUser } from '@/types';

export const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    getDocument<GoldifyUser>('users', user.uid)
      .then((userData) => {
        setRole(userData?.role ?? null);
      })
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return {
    role,
    loading: authLoading || loading,
    isOperator: role === 'operator' || role === 'admin',
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
  };
};
