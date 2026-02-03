/**
 * Tab listener module for tracking active tabs
 *
 * Listens for tab changes and URL updates to trigger icon updates
 */

/** URLs that should not trigger icon updates */
const NON_MATCHABLE_SCHEMES = [
  'chrome:',
  'chrome-extension:',
  'edge:',
  'about:',
  'moz-extension:',
  'brave:',
  'opera:',
  'vivaldi:',
];

/**
 * Callback type for tab URL changes
 */
export type TabChangeCallback = (tabId: number, url: string) => void;

/**
 * Check if a URL can be matched against proxy rules
 */
export function isMatchableUrl(url: string): boolean {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  // Check against non-matchable schemes
  for (const scheme of NON_MATCHABLE_SCHEMES) {
    if (lowerUrl.startsWith(scheme)) {
      return false;
    }
  }

  return true;
}

/**
 * Get the current active tab info
 */
export async function getCurrentTabInfo(): Promise<{ tabId: number; url: string } | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && tab.url) {
      return { tabId: tab.id, url: tab.url };
    }
  } catch (e) {
    console.error('Failed to get current tab:', e);
  }
  return null;
}

/**
 * Get all tabs with their URLs
 */
export async function getAllTabs(): Promise<Array<{ tabId: number; url: string }>> {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs
      .filter((tab) => tab.id !== undefined && tab.url !== undefined)
      .map((tab) => ({ tabId: tab.id!, url: tab.url! }));
  } catch (e) {
    console.error('Failed to get all tabs:', e);
    return [];
  }
}

/**
 * Initialize tab listeners
 *
 * @param onTabChange - Callback when a tab's URL changes or becomes active
 */
export function initTabsListener(onTabChange: TabChangeCallback): void {
  // Listen for tab updates (URL changes)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only trigger when page load completes and we have a URL
    if (changeInfo.status === 'complete' && tab.url) {
      if (isMatchableUrl(tab.url)) {
        onTabChange(tabId, tab.url);
      }
    }
  });

  // Listen for tab activation (switching tabs)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url && isMatchableUrl(tab.url)) {
        onTabChange(activeInfo.tabId, tab.url);
      }
    } catch (e) {
      // Tab might have been closed
      console.debug('Failed to get activated tab:', e);
    }
  });

  console.log('Tab listeners initialized');
}

/**
 * Initialize tab listeners and trigger initial update
 *
 * @param onTabChange - Callback when a tab's URL changes or becomes active
 */
export async function initTabsListenerWithUpdate(
  onTabChange: TabChangeCallback
): Promise<void> {
  // Set up listeners
  initTabsListener(onTabChange);

  // Trigger initial update for current tab
  const currentTab = await getCurrentTabInfo();
  if (currentTab && isMatchableUrl(currentTab.url)) {
    onTabChange(currentTab.tabId, currentTab.url);
  }
}
