import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/services/api';
import { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext for other files to use
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if user has stored token
        if (apiClient.isAuthenticated()) {
          // Try to get current user info
          const response = await apiClient.getCurrentUser();
          
          if (response.success && response.data) {
            setUser(response.data.user as any);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } else {
          // Check for stored user data
          const storedUser = apiClient.getStoredUser();
          if (storedUser) {
            setUser(storedUser as any);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear storage on error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);

      if (response.success && response.data) {
        setUser(response.data.user);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.name}!`,
        });
        
        return true;
      } else {
        // Handle login errors with better messages
        let errorMessage = response.message || "Invalid email or password. Please try again.";
        let errorTitle = "Login Failed";

        // Provide more specific error messages
        if (errorMessage.toLowerCase().includes('locked')) {
          errorTitle = "Account Locked";
          errorMessage = "Your account has been locked. Please contact support.";
        } else if (errorMessage.toLowerCase().includes('verification') || errorMessage.toLowerCase().includes('verify')) {
          errorTitle = "Email Verification Required";
          errorMessage = "Please verify your email address before logging in.";
        } else if (errorMessage.toLowerCase().includes('credential')) {
          errorMessage = "The email or password you entered is incorrect. Please check and try again.";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      let errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      let errorTitle = "Fail Login";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);

      if (response.success && response.data) {
        setUser(response.data.user);
        
        toast({
          title: "Registration Successful",
          description: `Welcome, ${response.data.user.name}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: response.message || "Registration failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Handle network or server errors for registration
      let errorMessage = "Unable to complete registration. Please check your internet connection and try again.";
      let errorTitle = "Registration Error";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.logout();
      
      setUser(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiClient.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't show error toast for silent refresh
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
