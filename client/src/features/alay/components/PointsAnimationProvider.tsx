/**
 * PointsAnimationProvider Component
 *
 * Global provider that renders the points animation overlay
 * when user earns Alay Points. Should be placed in App.tsx.
 */

import { usePointsDisplayStore, selectPointsDisplay } from '@/stores/usePointsDisplayStore';
import { PointsAnimation } from './PointsAnimation';

export function PointsAnimationProvider() {
  const display = usePointsDisplayStore(selectPointsDisplay);
  const hideAnimation = usePointsDisplayStore((state) => state.hidePointsAnimation);

  if (!display) return null;

  return (
    <PointsAnimation
      points={display.points}
      isFirstOfDay={display.isFirstOfDay}
      streakBonus={display.streakBonus}
      currentStreak={display.currentStreak}
      onComplete={hideAnimation}
    />
  );
}

export default PointsAnimationProvider;
