import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom';
import { QrAccessGuard } from './components/QrAccessGuard';
import { RouteGuard } from './components/RouteGuard';
import { AdminPage } from './pages/AdminPage';
import { BonusAntiDimnessOathPage } from './pages/BonusAntiDimnessOathPage';
import { BonusBadgeConstellationPage } from './pages/BonusBadgeConstellationPage';
import { BonusPrototypeFlamePage } from './pages/BonusPrototypeFlamePage';
import { BonusWonderLogPage } from './pages/BonusWonderLogPage';
import { EducationChallengePage } from './pages/EducationChallengePage';
import { EntertainmentChallengePage } from './pages/EntertainmentChallengePage';
import { EntrepreneurshipChallengePage } from './pages/EntrepreneurshipChallengePage';
import { FogEmptyPerformancePage } from './pages/FogEmptyPerformancePage';
import { FogLoneHeroPage } from './pages/FogLoneHeroPage';
import { FogPerfectAnswerPage } from './pages/FogPerfectAnswerPage';
import { FogRushPathPage } from './pages/FogRushPathPage';
import { FogShinyIdeaPage } from './pages/FogShinyIdeaPage';
import { ExplorationChallengePage } from './pages/ExplorationChallengePage';
import { FinalGatePage } from './pages/FinalGatePage';
import { MapPage } from './pages/MapPage';
import { RevealPage } from './pages/RevealPage';
import { StartPage } from './pages/StartPage';
import { TeamRegisterPage } from './pages/TeamRegisterPage';

const routes = [
  {
    path: '/',
    element: <Navigate to="/start" replace />,
  },
  {
    path: '/start',
    element: <StartPage />,
  },
  {
    path: '/team-register',
    element: <TeamRegisterPage />,
  },
  {
    element: <RouteGuard />,
    children: [
      {
        path: '/map',
        element: <MapPage />,
      },
      {
        path: '/education/mirror-of-misunderstanding',
        element: (
          <QrAccessGuard qrKey="educationMirror" title="Education World QR Required">
            <EducationChallengePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/entrepreneurship/market-of-needs',
        element: (
          <QrAccessGuard qrKey="entrepreneurshipMarket" title="Entrepreneurship World QR Required">
            <EntrepreneurshipChallengePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/entertainment/story-loom',
        element: (
          <QrAccessGuard qrKey="entertainmentStory" title="Entertainment World QR Required">
            <EntertainmentChallengePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/exploration/listening-compass',
        element: (
          <QrAccessGuard qrKey="explorationCompass" title="Exploration World QR Required">
            <ExplorationChallengePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/perfect-answer',
        element: (
          <QrAccessGuard qrKey="fogPerfect" title="Fog Trap QR Required">
            <FogPerfectAnswerPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/shiny-idea',
        element: (
          <QrAccessGuard qrKey="fogShiny" title="Fog Trap QR Required">
            <FogShinyIdeaPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/empty-performance',
        element: (
          <QrAccessGuard qrKey="fogEmpty" title="Fog Trap QR Required">
            <FogEmptyPerformancePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/rush-path',
        element: (
          <QrAccessGuard qrKey="fogRush" title="Fog Trap QR Required">
            <FogRushPathPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/lone-hero',
        element: (
          <QrAccessGuard qrKey="fogLone" title="Fog Trap QR Required">
            <FogLoneHeroPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/badge-constellation',
        element: (
          <QrAccessGuard qrKey="bonusBadges" title="Bonus Quest QR Required">
            <BonusBadgeConstellationPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/wonder-log',
        element: (
          <QrAccessGuard qrKey="bonusWonder" title="Bonus Quest QR Required">
            <BonusWonderLogPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/prototype-flame',
        element: (
          <QrAccessGuard qrKey="bonusPrototype" title="Bonus Quest QR Required">
            <BonusPrototypeFlamePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/anti-dimness-oath',
        element: (
          <QrAccessGuard qrKey="bonusOath" title="Bonus Quest QR Required">
            <BonusAntiDimnessOathPage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/final-gate',
        element: (
          <QrAccessGuard qrKey="finalGate" title="Final Gate QR Required">
            <FinalGatePage />
          </QrAccessGuard>
        ),
      },
      {
        path: '/reveal',
        element: <RevealPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
    ],
  },
];

const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:';

export const router = isFileProtocol
  ? createHashRouter(routes)
  : createBrowserRouter(routes);
