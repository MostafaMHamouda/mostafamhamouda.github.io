import { Navigate, Outlet } from 'react-router-dom';
import { getTeamState } from '../lib/team-state';

export const RouteGuard = () => {
  const team = getTeamState();
  return team ? <Outlet /> : <Navigate to="/team-register" replace />;
};
