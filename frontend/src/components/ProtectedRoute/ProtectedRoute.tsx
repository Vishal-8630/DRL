import type { ReactNode } from "react"
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

  return (<>{children}</>);
}

export default ProtectedRoute