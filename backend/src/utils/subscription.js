export const isVipActive = (user) => {
  if (!user?.subscription) return false;
  const { plan, expiresAt } = user.subscription;
  return (plan === 'vip' || plan === 'premium') && new Date(expiresAt) > new Date();
};

export const isPremiumActive = (user) => {
  if (!user?.subscription) return false;
  const { plan, expiresAt } = user.subscription;
  return plan === 'premium' && new Date(expiresAt) > new Date();
};