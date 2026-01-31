/**
 * Heads-up display overlay.
 */

import { useGameStore } from '@/state/gameStore';
import { formatScore } from '@/core/scoring';
import styles from './styles/HUD.module.css';

export function HUD() {
  const phase = useGameStore((state) => state.phase);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);

  return (
    <div className={styles['container']}>
      {phase === 'idle' && (
        <div className={styles['startScreen']}>
          <h1 className={styles['title']}>NEON STACK</h1>
          <p className={styles['subtitle']}>TAP TO START</p>
          {highScore > 0 && (
            <p className={styles['highScore']}>HIGH SCORE: {formatScore(highScore)}</p>
          )}
        </div>
      )}

      {phase === 'playing' && (
        <div className={styles['score']}>{formatScore(score)}</div>
      )}

      {phase === 'gameover' && (
        <div className={styles['gameOver']}>
          <h2 className={styles['gameOverTitle']}>GAME OVER</h2>
          <p className={styles['finalScore']}>{formatScore(score)}</p>
          {score >= highScore && score > 0 && (
            <p className={styles['newHighScore']}>NEW HIGH SCORE!</p>
          )}
          <p className={styles['restartHint']}>TAP TO RESTART</p>
        </div>
      )}
    </div>
  );
}
