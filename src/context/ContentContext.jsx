import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminStats as defaultAdminStats,
  brandInfo as defaultBrandInfo,
  categories as defaultCategories,
  collections as defaultCollections,
  homeContent as defaultHomeContent,
  offerMessages as defaultOfferMessages,
  orderTimeline as defaultOrderTimeline,
  products as defaultProducts,
  reviews as defaultReviews,
  topSellerIds as defaultTopSellerIds,
} from '../data/content';
import { api } from '../lib/api';

const CONTENT_STORAGE_KEY = 'twentyfivecarat-admin-content';

const defaultContent = {
  products: defaultProducts,
  categories: defaultCategories,
  collections: defaultCollections,
  reviews: defaultReviews,
  topSellerIds: defaultTopSellerIds,
  brandInfo: defaultBrandInfo,
  adminStats: defaultAdminStats,
  orderTimeline: defaultOrderTimeline,
  offerMessages: defaultOfferMessages,
  homeContent: defaultHomeContent,
};

const ContentContext = createContext(null);

function mergeContentWithDefaults(value = {}) {
  return {
    ...defaultContent,
    ...value,
    brandInfo: {
      ...defaultBrandInfo,
      ...(value.brandInfo || {}),
    },
    homeContent: {
      ...defaultHomeContent,
      ...(value.homeContent || {}),
    },
  };
}

function readContent() {
  if (typeof window === 'undefined') return defaultContent;

  try {
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) return defaultContent;

    return mergeContentWithDefaults(JSON.parse(raw));
  } catch {
    return defaultContent;
  }
}

function hasStoredContent() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(CONTENT_STORAGE_KEY));
}

function uniqueCategorySummary(products) {
  const grouped = products.reduce((accumulator, product) => {
    const current = accumulator.get(product.category) ?? 0;
    accumulator.set(product.category, current + 1);
    return accumulator;
  }, new Map());

  return Array.from(grouped.entries()).map(([name, count], index) => ({
    name,
    count,
    icon: defaultCategories[index % defaultCategories.length]?.icon || 'gem',
  }));
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(readContent);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => Boolean(api.getAdminToken()));
  const [contentStatus, setContentStatus] = useState('Loading storefront content.');
  const [isBackendHydrated, setIsBackendHydrated] = useState(false);
  const hasStoredContentRef = useRef(hasStoredContent());
  const hasUnsavedAdminEditRef = useRef(false);

  const markAdminEdit = () => {
    hasUnsavedAdminEditRef.current = true;
  };

  useEffect(() => {
    let cancelled = false;

    api
      .getContent()
      .then((serverContent) => {
        if (cancelled) return;
        if (hasStoredContentRef.current) {
          setContentStatus('Loaded saved browser edits. Backend sync will keep them permanent after login.');
          return;
        }

        setContent((current) => mergeContentWithDefaults({ ...current, ...serverContent }));
        setContentStatus('Connected to backend content API.');
      })
      .catch(() => {
        if (cancelled) return;
        setContentStatus('Using browser fallback content. Start API server for shared data.');
      })
      .finally(() => {
        if (!cancelled) {
          setIsBackendHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token = api.getAdminToken();
    if (!token) return;

    api
      .validateAdminSession()
      .then(() => {
        setIsAdminAuthenticated(true);
      })
      .catch(() => {
        api.clearAdminToken();
        setIsAdminAuthenticated(false);
        setContentStatus('Admin session expired. Please login again.');
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    if (!isBackendHydrated || !isAdminAuthenticated) return undefined;
    if (!hasUnsavedAdminEditRef.current) return undefined;

    const timeout = window.setTimeout(() => {
      api
        .saveContent(content)
        .then(() => {
          hasUnsavedAdminEditRef.current = false;
          setContentStatus('Saved to backend database.');
        })
        .catch((error) => setContentStatus(error.message || 'Backend save failed.'));
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [content, isAdminAuthenticated, isBackendHydrated]);

  const setBrandInfo = (updater) => {
    markAdminEdit();
    setContent((current) => ({
      ...current,
      brandInfo: typeof updater === 'function' ? updater(current.brandInfo) : updater,
    }));
  };

  const setHomeContent = (updater) => {
    markAdminEdit();
    setContent((current) => ({
      ...current,
      homeContent: typeof updater === 'function' ? updater(current.homeContent) : updater,
    }));
  };

  const setOfferMessages = (messages) => {
    markAdminEdit();
    setContent((current) => ({
      ...current,
      offerMessages: messages,
    }));
  };

  const setProducts = (updater) => {
    markAdminEdit();
    setContent((current) => {
      const nextProducts = typeof updater === 'function' ? updater(current.products) : updater;
      return {
        ...current,
        products: nextProducts,
        categories: uniqueCategorySummary(nextProducts),
      };
    });
  };

  const setCollections = (updater) => {
    markAdminEdit();
    setContent((current) => ({
      ...current,
      collections: typeof updater === 'function' ? updater(current.collections) : updater,
    }));
  };

  const setReviews = (updater) => {
    markAdminEdit();
    setContent((current) => ({
      ...current,
      reviews: typeof updater === 'function' ? updater(current.reviews) : updater,
    }));
  };

  const resetContent = () => {
    markAdminEdit();
    setContent(defaultContent);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CONTENT_STORAGE_KEY);
    }
  };

  const adminLogin = async (email, password) => {
    const result = await api.login(email, password);
    api.saveAdminToken(result.token);
    markAdminEdit();
    setIsAdminAuthenticated(true);
    setContentStatus('Admin login successful. Backend saves enabled.');
    return result;
  };

  const adminLogout = () => {
    api.clearAdminToken();
    setIsAdminAuthenticated(false);
    setContentStatus('Admin logged out. Editing is disabled.');
  };

  const value = useMemo(
    () => ({
      ...content,
      storageKey: CONTENT_STORAGE_KEY,
      contentStatus,
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      setBrandInfo,
      setHomeContent,
      setOfferMessages,
      setProducts,
      setCollections,
      setReviews,
      resetContent,
    }),
    [content, contentStatus, isAdminAuthenticated],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }

  return context;
}
