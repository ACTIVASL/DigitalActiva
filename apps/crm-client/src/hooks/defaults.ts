/** Default constants for strict types — used when creating new patients */

export const DEFAULT_SAFETY_PROFILE = {
    epilepsy: false,
    dysphagia: false,
    flightRisk: false,
    psychomotorAgitation: false,
    hyperacusis: false,
    chokingHazard: false,
    disruptiveBehavior: false,
    alerts: [] as string[],
    mobilityAid: 'none' as const,
    allergies: '',
};

export const DEFAULT_MUSICAL_IDENTITY = {
    likes: [] as string[],
    dislikes: [] as string[],
    biographicalSongs: [] as string[],
    instrumentsOfInterest: [] as string[],
    musicalTraining: false,
    sensitivityLevel: 'medium' as const,
};

export const DEFAULT_SOCIAL_CONTEXT = {
    livingSituation: '',
    caregiverNetwork: '',
    recentLifeEvents: [] as string[],
};
