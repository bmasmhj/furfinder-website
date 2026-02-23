import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@subscription_state';
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

const FREE_LIMITS = {
  maxReports: 1,
  maxProfiles: 1,
  maxPhotos: 1,
};

const PREMIUM_LIMITS = {
  maxReports: Infinity,
  maxProfiles: Infinity,
  maxPhotos: 5,
};

export interface SubscriptionContextValue {
  isPremium: boolean;
  isLoading: boolean;
  limits: typeof FREE_LIMITS;
  offerings: any[];
  purchasePackage: (pkg: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  canAddReport: (currentCount: number) => boolean;
  canAddProfile: (currentCount: number) => boolean;
  canUseAIMatching: () => boolean;
  canUseScanPost: () => boolean;
  canUseMultiPhoto: () => boolean;
  canUsePriorityAlerts: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

let Purchases: any = null;

async function loadPurchases() {
  if (Platform.OS !== 'web') {
    try {
      const mod = await import('react-native-purchases');
      Purchases = mod.default;
      return Purchases;
    } catch (e) {
      console.log('RevenueCat not available:', e);
      return null;
    }
  }
  return null;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsPremium(parsed.isPremium || false);
      }

      const rc = await loadPurchases();
      if (rc && Platform.OS !== 'web') {
        try {
          rc.setLogLevel(rc.LOG_LEVEL?.DEBUG ?? 4);
        } catch (_e) {}
        await rc.configure({ apiKey: REVENUECAT_API_KEY });
        setIsConfigured(true);

        const customerInfo = await rc.getCustomerInfo();
        checkPremiumStatus(customerInfo);

        try {
          const offeringsResult = await rc.getOfferings();
          if (offeringsResult.current?.availablePackages) {
            setOfferings(offeringsResult.current.availablePackages);
          }
        } catch (e) {
          console.log('Offerings not available (preview mode)');
        }
      }
    } catch (e) {
      console.log('RevenueCat setup (preview mode):', e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = (customerInfo: any) => {
    const hasActive = customerInfo?.entitlements?.active && Object.keys(customerInfo.entitlements.active).length > 0;
    setIsPremium(hasActive || false);
    AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ isPremium: hasActive || false }));
  };

  const purchasePackage = useCallback(async (pkg: any): Promise<boolean> => {
    try {
      if (!isConfigured || !Purchases) {
        setIsPremium(true);
        await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ isPremium: true }));
        return true;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      checkPremiumStatus(customerInfo);
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (e: any) {
      if (e.userCancelled) return false;
      console.error('Purchase error:', e);
      return false;
    }
  }, [isConfigured]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      if (!isConfigured || !Purchases) return false;
      const customerInfo = await Purchases.restorePurchases();
      checkPremiumStatus(customerInfo);
      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }, [isConfigured]);

  const limits = useMemo(() => isPremium ? PREMIUM_LIMITS : FREE_LIMITS, [isPremium]);

  const canAddReport = useCallback((currentCount: number) => {
    if (isPremium) return true;
    return currentCount < FREE_LIMITS.maxReports;
  }, [isPremium]);

  const canAddProfile = useCallback((currentCount: number) => {
    if (isPremium) return true;
    return currentCount < FREE_LIMITS.maxProfiles;
  }, [isPremium]);

  const canUseAIMatching = useCallback(() => isPremium, [isPremium]);
  const canUseScanPost = useCallback(() => isPremium, [isPremium]);
  const canUseMultiPhoto = useCallback(() => isPremium, [isPremium]);
  const canUsePriorityAlerts = useCallback(() => isPremium, [isPremium]);

  const value = useMemo(() => ({
    isPremium,
    isLoading,
    limits,
    offerings,
    purchasePackage,
    restorePurchases,
    canAddReport,
    canAddProfile,
    canUseAIMatching,
    canUseScanPost,
    canUseMultiPhoto,
    canUsePriorityAlerts,
  }), [isPremium, isLoading, limits, offerings, purchasePackage, restorePurchases, canAddReport, canAddProfile, canUseAIMatching, canUseScanPost, canUseMultiPhoto, canUsePriorityAlerts]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
