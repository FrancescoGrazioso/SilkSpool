import React from 'react';
import { GameStatus } from '../types';

interface StatusBarProps {
  gameStatus: GameStatus;
  onSelectPath?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  gameStatus,
  onSelectPath
}) => {
  const getGameStatusColor = () => {
    if (gameStatus.found) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getGameStatusText = () => {
    if (gameStatus.found) return 'Game Found';
    return 'Game Not Found';
  };

  const getBepInExStatusColor = () => {
    if (gameStatus.bepinex.present && gameStatus.bepinex.initialized) return 'bg-green-500';
    if (gameStatus.bepinex.present) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBepInExStatusText = () => {
    if (gameStatus.bepinex.present && gameStatus.bepinex.initialized) return 'BepInEx OK';
    if (gameStatus.bepinex.present) return 'BepInEx Present';
    return 'BepInEx Missing';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Game Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getGameStatusColor()}`}></div>
        <span className="text-sm text-gray-300">
          {getGameStatusText()}
        </span>
        {!gameStatus.found && onSelectPath && (
          <button
            onClick={onSelectPath}
            className="text-xs text-primary-400 hover:text-primary-300 underline"
          >
            Select Path
          </button>
        )}
      </div>
      
      {/* BepInEx Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${getBepInExStatusColor()}`}></div>
        <span className="text-sm text-gray-300">
          {getBepInExStatusText()}
        </span>
        {gameStatus.bepinex.present && !gameStatus.bepinex.initialized && (
          <span className="text-xs text-yellow-400">
            (Not initialized)
          </span>
        )}
      </div>

      {/* Game Path (if found) */}
      {gameStatus.found && gameStatus.path && (
        <div className="flex items-center space-x-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
            />
          </svg>
          <span className="text-xs text-gray-400 max-w-xs truncate">
            {gameStatus.path}
          </span>
        </div>
      )}
    </div>
  );
};
