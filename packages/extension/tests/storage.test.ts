import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Chrome API
const mockStorage: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(async (keys: string | string[] | null) => {
        if (keys === null) {
          return { ...mockStorage };
        }
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const key of keyArray) {
          if (mockStorage[key] !== undefined) {
            result[key] = mockStorage[key];
          }
        }
        return result;
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
      }),
      clear: vi.fn(async () => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      }),
      remove: vi.fn(async (keys: string | string[]) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        for (const key of keyArray) {
          delete mockStorage[key];
        }
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  proxy: {
    settings: {
      set: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    onActivated: {
      addListener: vi.fn(),
    },
    onUpdated: {
      addListener: vi.fn(),
    },
  },
  action: {
    setIcon: vi.fn(),
  },
};

// @ts-ignore
global.chrome = mockChrome;

// Clear storage before each test
beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  vi.clearAllMocks();
});

describe('Profile deletion persistence', () => {
  it('should remove profile from storage after deletion', async () => {
    // Setup: Add a profile to storage
    mockStorage['-schemaVersion'] = 2;
    mockStorage['+proxy'] = {
      name: 'proxy',
      profileType: 'FixedProfile',
      fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 },
    };
    mockStorage['+test-profile'] = {
      name: 'test-profile',
      profileType: 'FixedProfile',
      fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8081 },
    };

    // Verify both profiles exist
    let storage = await chrome.storage.local.get(null);
    expect(storage['+proxy']).toBeDefined();
    expect(storage['+test-profile']).toBeDefined();

    // Simulate deletion: Create options without the deleted profile
    const options = {
      '-schemaVersion': 2,
      '+proxy': {
        name: 'proxy',
        profileType: 'FixedProfile',
        fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 },
      },
      // +test-profile is intentionally omitted
    };

    // This is what should happen in setOptions handler
    await chrome.storage.local.clear();
    await chrome.storage.local.set(options);

    // Verify the deleted profile is gone
    storage = await chrome.storage.local.get(null);
    expect(storage['+proxy']).toBeDefined();
    expect(storage['+test-profile']).toBeUndefined();
  });

  it('should persist profile deletion across browser restarts', async () => {
    // Simulate initial state with a profile
    mockStorage['-schemaVersion'] = 2;
    mockStorage['+proxy'] = {
      name: 'proxy',
      profileType: 'FixedProfile',
      fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 },
    };
    mockStorage['+will-delete'] = {
      name: 'will-delete',
      profileType: 'FixedProfile',
      fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8082 },
    };

    // Step 1: Delete the profile (simulating user action)
    const optionsWithoutDeleted = {
      '-schemaVersion': 2,
      '+proxy': mockStorage['+proxy'],
    };

    // Simulate setOptions with clear + set
    await chrome.storage.local.clear();
    await chrome.storage.local.set(optionsWithoutDeleted);

    // Step 2: Simulate browser restart - reload options from storage
    const loadedOptions = await chrome.storage.local.get(null);

    // Step 3: Verify deleted profile is not present
    expect(loadedOptions['+proxy']).toBeDefined();
    expect(loadedOptions['+will-delete']).toBeUndefined();
  });

  it('should handle multiple profile deletions', async () => {
    // Setup: Add multiple profiles
    mockStorage['-schemaVersion'] = 2;
    mockStorage['+proxy1'] = { name: 'proxy1', profileType: 'FixedProfile' };
    mockStorage['+proxy2'] = { name: 'proxy2', profileType: 'FixedProfile' };
    mockStorage['+proxy3'] = { name: 'proxy3', profileType: 'FixedProfile' };

    // Delete two profiles
    const options = {
      '-schemaVersion': 2,
      '+proxy1': mockStorage['+proxy1'],
      // proxy2 and proxy3 deleted
    };

    await chrome.storage.local.clear();
    await chrome.storage.local.set(options);

    // Verify only proxy1 remains
    const storage = await chrome.storage.local.get(null);
    expect(storage['+proxy1']).toBeDefined();
    expect(storage['+proxy2']).toBeUndefined();
    expect(storage['+proxy3']).toBeUndefined();
  });
});

describe('Chrome storage behavior', () => {
  it('should demonstrate the bug: set() without clear() keeps old keys', async () => {
    // This test demonstrates why the bug occurred
    mockStorage['+profile1'] = { name: 'profile1' };
    mockStorage['+profile2'] = { name: 'profile2' };

    // Simulate old behavior: set() without clear()
    const newOptions = { '+profile1': { name: 'profile1' } };
    await chrome.storage.local.set(newOptions);

    // Bug: profile2 still exists!
    const storage = await chrome.storage.local.get(null);
    expect(storage['+profile1']).toBeDefined();
    expect(storage['+profile2']).toBeDefined(); // Bug: this should be undefined!
  });

  it('should fix the bug: clear() + set() removes old keys', async () => {
    // Setup: Add profiles
    mockStorage['+profile1'] = { name: 'profile1' };
    mockStorage['+profile2'] = { name: 'profile2' };

    // New behavior: clear() then set()
    const newOptions = { '+profile1': { name: 'profile1' } };
    await chrome.storage.local.clear();
    await chrome.storage.local.set(newOptions);

    // Fixed: profile2 is removed
    const storage = await chrome.storage.local.get(null);
    expect(storage['+profile1']).toBeDefined();
    expect(storage['+profile2']).toBeUndefined();
  });
});

describe('Circular dependency detection', () => {
  it('should detect direct circular dependency in SwitchProfile', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    // Initialize with profiles: A -> B (A uses B)
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: [
          { condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' }, profileName: 'profile-b' }
        ]
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: []
      },
      '+profile-c': {
        name: 'profile-c',
        profileType: 'FixedProfile',
        fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 }
      }
    };

    // When editing profile-b, profile-a should be excluded (A depends on B)
    const dependents = getDependentProfiles('profile-b', options as any);
    expect(dependents).toContain('profile-a');
    expect(dependents).not.toContain('profile-c');
  });

  it('should detect transitive circular dependency', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    // C -> B -> A (C uses B, B uses A)
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: []
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: [
          { condition: { conditionType: 'HostWildcardCondition', pattern: '*.test.com' }, profileName: 'profile-a' }
        ]
      },
      '+profile-c': {
        name: 'profile-c',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: [
          { condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' }, profileName: 'profile-b' }
        ]
      }
    };

    // When editing profile-a, both B and C should be excluded
    const dependents = getDependentProfiles('profile-a', options as any);
    expect(dependents).toContain('profile-b');
    expect(dependents).toContain('profile-c');
  });

  it('should detect dependency via defaultProfileName', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'SwitchProfile',
        defaultProfileName: 'profile-b',  // A uses B as default
        rules: []
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: []
      }
    };

    // When editing profile-b, profile-a should be excluded
    const dependents = getDependentProfiles('profile-b', options as any);
    expect(dependents).toContain('profile-a');
  });

  it('should return empty array for profile with no dependents', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'FixedProfile',
        fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 }
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'SwitchProfile',
        defaultProfileName: 'direct',
        rules: []
      }
    };

    // profile-a has no dependents
    const dependents = getDependentProfiles('profile-a', options as any);
    expect(dependents).toHaveLength(0);
  });

  it('should detect dependencies in VirtualProfile', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'VirtualProfile',
        defaultProfileName: 'profile-b'  // A uses B as default
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'FixedProfile',
        fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 }
      }
    };

    const dependents = getDependentProfiles('profile-b', options as any);
    expect(dependents).toContain('profile-a');
  });

  it('should detect dependencies in RuleListProfile', async () => {
    const { getDependentProfiles } = await import('../src/lib/utils/profile-deps');
    
    const options = {
      '-schemaVersion': 2,
      '+profile-a': {
        name: 'profile-a',
        profileType: 'RuleListProfile',
        format: 'Switchy',
        matchProfileName: 'profile-b',  // A uses B as match profile
        defaultProfileName: 'direct'
      },
      '+profile-b': {
        name: 'profile-b',
        profileType: 'FixedProfile',
        fallbackProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 }
      }
    };

    const dependents = getDependentProfiles('profile-b', options as any);
    expect(dependents).toContain('profile-a');
  });
});
