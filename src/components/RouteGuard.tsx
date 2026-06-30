import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentTeamId } from '../lib/teamSession';

export const RouteGuard = () => {
  const teamId = getCurrentTeamId();
  return teamId ? <Outlet /> : <Navigate to="/team-register" replace />;
};
