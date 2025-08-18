import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until loading is complete before making a decision
    if (isLoading) {
      return; // Do nothing while loading
    }

    if (isAuthenticated) {
      navigate('/app', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Render a loading indicator if profile is being fetched
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return null; // This component doesn't render anything, it just redirects
};

export default HomeRedirect;
