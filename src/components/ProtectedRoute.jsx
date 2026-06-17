import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({children, role}) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
   }

   if(!user){
      return <Navigate to="/login" state={{from: location}}></Navigate>
   }

   if (role && user.role !== role) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
   }

   return children;

}

export default ProtectedRoute;