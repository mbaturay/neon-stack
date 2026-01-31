/**
 * Renders all falling pieces.
 */

import { useGameStore } from '@/state/gameStore';
import { FallingPiece } from './FallingPiece';

export function FallingPieces() {
  const fallingPieces = useGameStore((state) => state.fallingPieces);

  return (
    <group>
      {fallingPieces.map((piece) => (
        <FallingPiece key={piece.id} piece={piece} />
      ))}
    </group>
  );
}
