/**
 * Profile dependency utilities for preventing circular dependencies
 */

import type { Profile, OmegaOptions } from '@dev-zapi/switchyalpha-pac';
import { Profiles } from '@dev-zapi/switchyalpha-pac';

/**
 * Get all custom profiles from options
 */
export function getProfilesFromOptions(options: OmegaOptions): Profile[] {
  const result: Profile[] = [];
  Profiles.each(options as unknown as Record<string, Profile>, (_key, profile) => {
    // Filter out builtin profiles (direct and system)
    if (profile.profileType !== 'DirectProfile' && profile.profileType !== 'SystemProfile') {
      result.push(profile);
    }
  });
  return result;
}

/**
 * Check if a profile directly uses another profile
 */
export function profileUses(p: Profile, targetName: string): boolean {
  if (p.profileType === 'SwitchProfile') {
    const sp = p as any;
    // Check rules
    if (sp.rules) {
      for (const rule of sp.rules) {
        if (rule.profileName === targetName) return true;
      }
    }
    // Check default profile
    if (sp.defaultProfileName === targetName) return true;
  } else if (p.profileType === 'VirtualProfile') {
    const vp = p as any;
    if (vp.defaultProfileName === targetName) return true;
  } else if (p.profileType === 'RuleListProfile' || p.profileType === 'AutoProxyRuleListProfile') {
    const rp = p as any;
    if (rp.matchProfileName === targetName) return true;
    if (rp.defaultProfileName === targetName) return true;
  }
  return false;
}

/**
 * Get all profile names that depend on the given profile (including transitive dependencies)
 * This is used to prevent circular dependencies in SwitchProfile
 * 
 * @param profileName - The profile to check dependencies for
 * @param options - The Omega options containing all profiles
 * @returns Array of profile names that depend on the given profile
 */
export function getDependentProfiles(profileName: string, options: OmegaOptions): string[] {
  const dependentProfiles = new Set<string>();
  const profiles = getProfilesFromOptions(options);

  // Iteratively find all dependent profiles
  let changed = true;
  const toCheck = new Set<string>([profileName]);

  while (changed) {
    changed = false;
    for (const profile of profiles) {
      if (dependentProfiles.has(profile.name)) continue;

      for (const dependency of toCheck) {
        if (profileUses(profile, dependency)) {
          dependentProfiles.add(profile.name);
          toCheck.add(profile.name);
          changed = true;
          break;
        }
      }
    }
  }

  return Array.from(dependentProfiles);
}
