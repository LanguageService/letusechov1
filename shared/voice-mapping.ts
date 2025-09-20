// Voice mapping between user-friendly display names and Gemini voice names
export const voiceMapping = {
  // Calm & Professional
  "Serene": "Zephyr",
  "Harmony": "Aoede", 
  "Gentle": "Vindemiatrix",
  "Smooth": "Algieba",
  "Clear": "Iapetus",
  
  // Warm & Friendly
  "Warmth": "Sulafat",
  "Friendly": "Achird", 
  "Casual": "Zubenelgenubi",
  "Easy": "Callirrhoe",
  "Soft": "Achernar",
  
  // Bright & Energetic
  "Bright": "Autonoe",
  "Upbeat": "Puck",
  "Energetic": "Fenrir",
  "Lively": "Sadachbia",
  "Young": "Leda",
  
  // Confident & Strong
  "Confident": "Kore",
  "Firm": "Orus",
  "Mature": "Gacrux",
  "Forward": "Pulcherrima",
  "Strong": "Alnilam",
  
  // Informative & Clear
  "Teacher": "Charon",
  "Scholar": "Rasalgethi",
  "Wise": "Sadaltager",
  "Narrator": "Schedar",
  "Guide": "Laomedeia",
  
  // Unique & Distinctive
  "Breathy": "Enceladus",
  "Smooth Deep": "Despina",
  "Crystal": "Erinome", 
  "Gravelly": "Algenib",
  "Relaxed": "Umbriel"
} as const;

// Reverse mapping for backend use
export const geminiVoiceMapping = Object.fromEntries(
  Object.entries(voiceMapping).map(([displayName, geminiName]) => [geminiName, displayName])
) as Record<string, string>;

// Get all display names for frontend
export const getDisplayVoiceNames = (): string[] => {
  return Object.keys(voiceMapping);
};

// Get Gemini voice name from display name
export const getGeminiVoiceName = (displayName: string): string => {
  return voiceMapping[displayName as keyof typeof voiceMapping] || displayName;
};

// Get display name from Gemini voice name
export const getDisplayVoiceName = (geminiName: string): string => {
  return geminiVoiceMapping[geminiName] || geminiName;
};

// Voice options for frontend dropdown
export const voiceOptions = Object.entries(voiceMapping).map(([displayName, geminiName]) => ({
  value: displayName,
  label: displayName,
  geminiName
}));