/**
 * AchievementToastProvider Component
 *
 * Global provider that renders achievement unlock toasts.
 * Should be placed in App.tsx alongside PointsAnimationProvider.
 */

import {
  useAchievementDisplayStore,
  selectCurrentAchievement,
} from '@/stores/useAchievementDisplayStore';
import { AchievementToast } from './AchievementToast';

export function AchievementToastProvider() {
  const achievement = useAchievementDisplayStore(selectCurrentAchievement);
  const dismissAchievement = useAchievementDisplayStore(
    (state) => state.dismissAchievement
  );

  if (!achievement) return null;

  return (
    <AchievementToast achievement={achievement} onClose={dismissAchievement} />
  );
}

export default AchievementToastProvider;
