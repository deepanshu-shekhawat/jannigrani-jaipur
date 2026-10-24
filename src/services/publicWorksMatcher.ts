import { CivicCategory, PublicWork } from '../types';
import { StorageService } from './storageService';

export interface WorkMatchResult {
  work: PublicWork;
  distanceMeters: number;
  matchScore: number; // 0 to 100
  relevanceReason: string;
  isWithinDlpPeriod: boolean;
}

// Haversine distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const PublicWorksMatcher = {
  findRelatedWorks(
    lat: number,
    lng: number,
    category: CivicCategory,
    maxDistanceMeters: number = 2500
  ): WorkMatchResult[] {
    const allWorks = StorageService.getPublicWorks();
    const results: WorkMatchResult[] = [];

    const simulatedNow = StorageService.getSimulatedNow();

    for (const work of allWorks) {
      const distance = calculateDistanceMeters(lat, lng, work.latitude, work.longitude);

      if (distance <= maxDistanceMeters) {
        let categoryBonus = 0;
        let categoryMatchReason = '';

        // Category mapping
        if (
          (category === 'roads_footpaths' || category === 'accessibility') &&
          (work.title.toLowerCase().includes('damar') ||
            work.title.toLowerCase().includes('road') ||
            work.title.toLowerCase().includes('paver') ||
            work.title.toLowerCase().includes('asphalt'))
        ) {
          categoryBonus = 40;
          categoryMatchReason = 'Direct road/paving engineering scope match.';
        } else if (
          (category === 'drainage_waterlogging' || category === 'water_supply') &&
          (work.title.toLowerCase().includes('drain') ||
            work.title.toLowerCase().includes('water') ||
            work.title.toLowerCase().includes('pipe'))
        ) {
          categoryBonus = 40;
          categoryMatchReason = 'Stormwater drainage or pipeline civil work correlation.';
        } else if (
          category === 'waste_sanitation' &&
          (work.title.toLowerCase().includes('garbage') ||
            work.title.toLowerCase().includes('waste') ||
            work.title.toLowerCase().includes('compactor'))
        ) {
          categoryBonus = 40;
          categoryMatchReason = 'Solid waste depot infrastructure tender match.';
        } else if (
          category === 'streetlights_electrical' &&
          (work.title.toLowerCase().includes('light') || work.title.toLowerCase().includes('illumination'))
        ) {
          categoryBonus = 40;
          categoryMatchReason = 'Public street lighting electrification scope match.';
        }

        // Distance scoring (0 to 60 pts)
        const distanceScore = Math.max(0, Math.round(60 * (1 - distance / maxDistanceMeters)));
        const totalScore = Math.min(100, distanceScore + categoryBonus);

        // Check DLP
        const isWithinDlp =
          !!work.dlpWarrantyExpiry && new Date(work.dlpWarrantyExpiry).getTime() > simulatedNow.getTime();

        const distanceText =
          distance < 1000 ? `${distance} meters away` : `${(distance / 1000).toFixed(1)} km away`;

        results.push({
          work,
          distanceMeters: distance,
          matchScore: totalScore,
          relevanceReason: `Geographic proximity (${distanceText}). ${categoryMatchReason} Notice: Nearby project does not confirm legal contractor culpability.`,
          isWithinDlpPeriod: isWithinDlp,
        });
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
};
