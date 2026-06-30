import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom';
import { GameStateGate } from './components/GameStateGate';
import { QrAccessGuard } from './components/QrAccessGuard';
import { RouteGuard } from './components/RouteGuard';
import { AdminPage } from './pages/AdminPage';
import { AdminLivePage } from './pages/AdminLivePage';
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
    element: (
      <GameStateGate mode="register">
        <TeamRegisterPage />
      </GameStateGate>
    ),
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/admin/live',
    element: <AdminLivePage />,
  },
  {
    element: <RouteGuard />,
    children: [
      {
        path: '/map',
        element: (
          <GameStateGate mode="play">
            <MapPage />
          </GameStateGate>
        ),
      },
      {
        path: '/education/mirror-of-misunderstanding',
        element: (
          <QrAccessGuard qrKey="educationMirror" title="Education World QR Required">
            <GameStateGate mode="play">
              <EducationChallengePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/entrepreneurship/market-of-needs',
        element: (
          <QrAccessGuard qrKey="entrepreneurshipMarket" title="Entrepreneurship World QR Required">
            <GameStateGate mode="play">
              <EntrepreneurshipChallengePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/entertainment/story-loom',
        element: (
          <QrAccessGuard qrKey="entertainmentStory" title="Entertainment World QR Required">
            <GameStateGate mode="play">
              <EntertainmentChallengePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/exploration/listening-compass',
        element: (
          <QrAccessGuard qrKey="explorationCompass" title="Exploration World QR Required">
            <GameStateGate mode="play">
              <ExplorationChallengePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/perfect-answer',
        element: (
          <QrAccessGuard qrKey="fogPerfect" title="Fog Trap QR Required">
            <GameStateGate mode="play">
              <FogPerfectAnswerPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/shiny-idea',
        element: (
          <QrAccessGuard qrKey="fogShiny" title="Fog Trap QR Required">
            <GameStateGate mode="play">
              <FogShinyIdeaPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/empty-performance',
        element: (
          <QrAccessGuard qrKey="fogEmpty" title="Fog Trap QR Required">
            <GameStateGate mode="play">
              <FogEmptyPerformancePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/rush-path',
        element: (
          <QrAccessGuard qrKey="fogRush" title="Fog Trap QR Required">
            <GameStateGate mode="play">
              <FogRushPathPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/fog/lone-hero',
        element: (
          <QrAccessGuard qrKey="fogLone" title="Fog Trap QR Required">
            <GameStateGate mode="play">
              <FogLoneHeroPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/badge-constellation',
        element: (
          <QrAccessGuard qrKey="bonusBadges" title="Bonus Quest QR Required">
            <GameStateGate mode="play">
              <BonusBadgeConstellationPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/wonder-log',
        element: (
          <QrAccessGuard qrKey="bonusWonder" title="Bonus Quest QR Required">
            <GameStateGate mode="play">
              <BonusWonderLogPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/prototype-flame',
        element: (
          <QrAccessGuard qrKey="bonusPrototype" title="Bonus Quest QR Required">
            <GameStateGate mode="play">
              <BonusPrototypeFlamePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/bonus/anti-dimness-oath',
        element: (
          <QrAccessGuard qrKey="bonusOath" title="Bonus Quest QR Required">
            <GameStateGate mode="play">
              <BonusAntiDimnessOathPage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/final-gate',
        element: (
          <QrAccessGuard qrKey="finalGate" title="Final Gate QR Required">
            <GameStateGate mode="final-gate">
              <FinalGatePage />
            </GameStateGate>
          </QrAccessGuard>
        ),
      },
      {
        path: '/reveal',
        element: (
          <GameStateGate mode="play">
            <RevealPage />
          </GameStateGate>
        ),
      },
    ],
  },
];

const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:';

export const router = isFileProtocol
  ? createHashRouter(routes)
  : createBrowserRouter(routes);
