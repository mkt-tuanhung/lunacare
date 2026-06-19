import { Redirect } from 'expo-router';
import { useProfileStore } from '../store/useProfileStore';

export default function Index() {
  const profile = useProfileStore((state) => state.profile);

  if (!profile || !profile.isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/home" />;
}
