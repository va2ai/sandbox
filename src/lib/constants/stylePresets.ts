export interface StylePreset {
  id: string;
  name: string;
  keywords: string;
  category: StyleCategory;
  mode: "generation" | "editing" | "both";
}

export type StyleCategory =
  | "photography"
  | "cinematic"
  | "anime"
  | "illustration"
  | "art"
  | "3d"
  | "transform"
  | "enhance"
  | "artistic";

export const styleCategories: Record<StyleCategory, { label: string; icon: string }> = {
  // Generation categories
  photography: { label: "Photo", icon: "camera" },
  cinematic: { label: "Cinema", icon: "film" },
  anime: { label: "Anime", icon: "sparkles" },
  illustration: { label: "Illustration", icon: "pencil" },
  art: { label: "Art", icon: "palette" },
  "3d": { label: "3D", icon: "box" },
  // Editing categories
  transform: { label: "Transform", icon: "wand" },
  enhance: { label: "Enhance", icon: "sliders" },
  artistic: { label: "Artistic", icon: "brush" },
};

export const stylePresets: StylePreset[] = [
  // ==========================================
  // GENERATION PRESETS (T2I)
  // ==========================================

  // Photography Styles
  {
    id: "photo-portrait",
    name: "Portrait",
    keywords: "professional portrait photography, shallow depth of field, soft natural lighting, 85mm lens, bokeh background",
    category: "photography",
    mode: "generation",
  },
  {
    id: "photo-street",
    name: "Street",
    keywords: "street photography, candid moment, urban environment, high contrast, documentary style, 35mm film grain",
    category: "photography",
    mode: "generation",
  },
  {
    id: "photo-studio",
    name: "Studio",
    keywords: "professional studio photography, controlled lighting, seamless backdrop, commercial quality, high-end retouching",
    category: "photography",
    mode: "generation",
  },
  {
    id: "photo-landscape",
    name: "Landscape",
    keywords: "landscape photography, golden hour lighting, wide angle lens, dramatic sky, national geographic style",
    category: "photography",
    mode: "generation",
  },
  {
    id: "photo-macro",
    name: "Macro",
    keywords: "macro photography, extreme close-up, shallow depth of field, intricate details, professional lighting",
    category: "photography",
    mode: "generation",
  },
  {
    id: "photo-vintage",
    name: "Vintage",
    keywords: "vintage film photography, 35mm Kodak Portra 400, film grain, muted colors, nostalgic aesthetic",
    category: "photography",
    mode: "generation",
  },

  // Cinematic Styles
  {
    id: "cinema-blockbuster",
    name: "Blockbuster",
    keywords: "cinematic shot, anamorphic lens, dramatic lighting, movie scene, Hollywood production, IMAX quality",
    category: "cinematic",
    mode: "generation",
  },
  {
    id: "cinema-noir",
    name: "Film Noir",
    keywords: "film noir style, high contrast black and white, dramatic shadows, 1940s aesthetic, venetian blind lighting",
    category: "cinematic",
    mode: "generation",
  },
  {
    id: "cinema-scifi",
    name: "Sci-Fi",
    keywords: "science fiction movie scene, futuristic, neon lighting, Blade Runner aesthetic, cyberpunk atmosphere",
    category: "cinematic",
    mode: "generation",
  },
  {
    id: "cinema-horror",
    name: "Horror",
    keywords: "horror movie scene, eerie atmosphere, low key lighting, unsettling mood, suspenseful composition",
    category: "cinematic",
    mode: "generation",
  },
  {
    id: "cinema-wes",
    name: "Wes Anderson",
    keywords: "Wes Anderson style, symmetrical composition, pastel color palette, whimsical, meticulous production design",
    category: "cinematic",
    mode: "generation",
  },

  // Anime Styles
  {
    id: "anime-ghibli",
    name: "Ghibli",
    keywords: "Studio Ghibli style, hand-drawn animation, soft watercolor backgrounds, whimsical, Hayao Miyazaki inspired",
    category: "anime",
    mode: "generation",
  },
  {
    id: "anime-cyberpunk",
    name: "Cyberpunk",
    keywords: "cyberpunk anime, neon-lit cityscape, high-tech low-life, Ghost in the Shell aesthetic, detailed mecha",
    category: "anime",
    mode: "generation",
  },
  {
    id: "anime-shonen",
    name: "Shonen",
    keywords: "shonen anime style, dynamic action pose, speed lines, intense expression, vibrant colors, bold linework",
    category: "anime",
    mode: "generation",
  },
  {
    id: "anime-chibi",
    name: "Chibi",
    keywords: "chibi style, super deformed proportions, cute kawaii aesthetic, big expressive eyes, adorable",
    category: "anime",
    mode: "generation",
  },
  {
    id: "anime-90s",
    name: "90s Retro",
    keywords: "90s anime aesthetic, cel shading, VHS quality, nostalgic, Sailor Moon inspired color palette",
    category: "anime",
    mode: "generation",
  },

  // Illustration Styles
  {
    id: "illust-watercolor",
    name: "Watercolor",
    keywords: "watercolor illustration, soft washes, organic textures, delicate brushwork, traditional media aesthetic",
    category: "illustration",
    mode: "generation",
  },
  {
    id: "illust-digital",
    name: "Digital Art",
    keywords: "digital illustration, clean linework, vibrant colors, professional concept art, artstation trending",
    category: "illustration",
    mode: "generation",
  },
  {
    id: "illust-comic",
    name: "Comic Book",
    keywords: "comic book illustration, bold ink outlines, halftone dots, dynamic composition, Marvel/DC style",
    category: "illustration",
    mode: "generation",
  },
  {
    id: "illust-storybook",
    name: "Storybook",
    keywords: "children's book illustration, whimsical, soft textures, warm colors, charming characters",
    category: "illustration",
    mode: "generation",
  },
  {
    id: "illust-lineart",
    name: "Line Art",
    keywords: "detailed line art, intricate pen drawing, black and white, fine linework, stippling technique",
    category: "illustration",
    mode: "generation",
  },

  // Art Styles
  {
    id: "art-impressionist",
    name: "Impressionist",
    keywords: "impressionist painting, visible brushstrokes, light and color, Monet inspired, plein air aesthetic",
    category: "art",
    mode: "generation",
  },
  {
    id: "art-surreal",
    name: "Surrealist",
    keywords: "surrealist art, dreamlike imagery, impossible scenes, Salvador Dali inspired, subconscious exploration",
    category: "art",
    mode: "generation",
  },
  {
    id: "art-popart",
    name: "Pop Art",
    keywords: "pop art style, bold colors, Ben-Day dots, Andy Warhol inspired, commercial aesthetic",
    category: "art",
    mode: "generation",
  },
  {
    id: "art-minimal",
    name: "Minimalist",
    keywords: "minimalist art, simple geometric shapes, limited color palette, negative space, clean design",
    category: "art",
    mode: "generation",
  },
  {
    id: "art-psychedelic",
    name: "Psychedelic",
    keywords: "psychedelic art, vivid colors, flowing patterns, trippy visuals, 1960s aesthetic, kaleidoscopic",
    category: "art",
    mode: "generation",
  },

  // 3D Styles
  {
    id: "3d-pixar",
    name: "Pixar",
    keywords: "Pixar 3D animation style, subsurface scattering, expressive characters, high quality rendering",
    category: "3d",
    mode: "generation",
  },
  {
    id: "3d-lowpoly",
    name: "Low Poly",
    keywords: "low poly 3D art, geometric facets, stylized, vibrant flat colors, modern minimalist 3D",
    category: "3d",
    mode: "generation",
  },
  {
    id: "3d-isometric",
    name: "Isometric",
    keywords: "isometric 3D illustration, diorama style, clean geometry, soft shadows, miniature scene",
    category: "3d",
    mode: "generation",
  },
  {
    id: "3d-realistic",
    name: "Photorealistic",
    keywords: "photorealistic 3D render, ray tracing, global illumination, Octane render, hyperrealistic textures",
    category: "3d",
    mode: "generation",
  },
  {
    id: "3d-clay",
    name: "Clay Render",
    keywords: "clay render style, matte material, soft ambient occlusion, sculptural, no textures, monochrome 3D",
    category: "3d",
    mode: "generation",
  },

  // ==========================================
  // EDITING PRESETS (I2I)
  // ==========================================

  // Transform Styles
  {
    id: "edit-sketch-to-photo",
    name: "Sketch to Photo",
    keywords: "transform this sketch into a photorealistic image, maintain the composition and subject, add realistic textures, lighting, and details",
    category: "transform",
    mode: "editing",
  },
  {
    id: "edit-photo-to-sketch",
    name: "Photo to Sketch",
    keywords: "convert to a detailed pencil sketch, hand-drawn appearance, graphite shading, artistic linework, paper texture",
    category: "transform",
    mode: "editing",
  },
  {
    id: "edit-day-to-night",
    name: "Day to Night",
    keywords: "transform to nighttime scene, add moonlight and artificial lighting, starry sky, evening atmosphere, shadows and highlights",
    category: "transform",
    mode: "editing",
  },
  {
    id: "edit-night-to-day",
    name: "Night to Day",
    keywords: "transform to daytime scene, bright natural sunlight, clear blue sky, daylight colors, remove artificial lighting",
    category: "transform",
    mode: "editing",
  },
  {
    id: "edit-season-change",
    name: "Season Change",
    keywords: "change the season, adjust foliage colors, weather conditions, atmospheric lighting appropriate to the new season",
    category: "transform",
    mode: "editing",
  },
  {
    id: "edit-age-progression",
    name: "Age Transform",
    keywords: "realistically age or de-age the subject, maintain facial features and identity, natural aging effects",
    category: "transform",
    mode: "editing",
  },

  // Enhance Styles
  {
    id: "edit-hdr-enhance",
    name: "HDR Enhance",
    keywords: "enhance with HDR processing, increased dynamic range, vivid colors, balanced highlights and shadows, dramatic contrast",
    category: "enhance",
    mode: "editing",
  },
  {
    id: "edit-sharpen",
    name: "Sharpen & Detail",
    keywords: "enhance sharpness and fine details, increase clarity, crisp edges, improved texture definition, professional quality",
    category: "enhance",
    mode: "editing",
  },
  {
    id: "edit-color-pop",
    name: "Color Pop",
    keywords: "make colors more vibrant and saturated, enhanced color contrast, vivid tones, eye-catching palette",
    category: "enhance",
    mode: "editing",
  },
  {
    id: "edit-cinematic-grade",
    name: "Cinematic Grade",
    keywords: "apply cinematic color grading, teal and orange tones, film-like contrast, movie poster quality, dramatic mood",
    category: "enhance",
    mode: "editing",
  },
  {
    id: "edit-vintage-filter",
    name: "Vintage Filter",
    keywords: "apply vintage photo filter, faded colors, light leaks, film grain, nostalgic warm tones, retro aesthetic",
    category: "enhance",
    mode: "editing",
  },
  {
    id: "edit-black-white",
    name: "B&W Conversion",
    keywords: "convert to artistic black and white, high contrast monochrome, dramatic tonal range, Ansel Adams inspired",
    category: "enhance",
    mode: "editing",
  },

  // Artistic Styles (for editing)
  {
    id: "edit-oil-painting",
    name: "Oil Painting",
    keywords: "transform into an oil painting, visible brushstrokes, rich color palette, classical painting technique, canvas texture",
    category: "artistic",
    mode: "editing",
  },
  {
    id: "edit-watercolor",
    name: "Watercolor",
    keywords: "transform into watercolor painting, soft washes of color, paper texture, flowing pigments, artistic interpretation",
    category: "artistic",
    mode: "editing",
  },
  {
    id: "edit-anime-style",
    name: "Anime Style",
    keywords: "transform into anime art style, cel shading, large expressive eyes, clean linework, vibrant anime colors",
    category: "artistic",
    mode: "editing",
  },
  {
    id: "edit-comic-style",
    name: "Comic Style",
    keywords: "transform into comic book art, bold outlines, halftone shading, dynamic composition, graphic novel aesthetic",
    category: "artistic",
    mode: "editing",
  },
  {
    id: "edit-pixel-art",
    name: "Pixel Art",
    keywords: "convert to pixel art style, retro 8-bit or 16-bit aesthetic, limited color palette, nostalgic video game look",
    category: "artistic",
    mode: "editing",
  },
  {
    id: "edit-stained-glass",
    name: "Stained Glass",
    keywords: "transform into stained glass artwork, bold black outlines, vibrant translucent colors, mosaic pattern, cathedral style",
    category: "artistic",
    mode: "editing",
  },
];

export function getPresetsByCategory(category: StyleCategory, mode?: "generation" | "editing"): StylePreset[] {
  return stylePresets.filter((preset) =>
    preset.category === category &&
    (!mode || preset.mode === mode || preset.mode === "both")
  );
}

export function getPresetById(id: string): StylePreset | undefined {
  return stylePresets.find((preset) => preset.id === id);
}

export function getPresetsByMode(mode: "generation" | "editing"): StylePreset[] {
  return stylePresets.filter((preset) => preset.mode === mode || preset.mode === "both");
}

export function getCategoriesForMode(mode: "generation" | "editing"): StyleCategory[] {
  const presets = getPresetsByMode(mode);
  const categories = new Set(presets.map((p) => p.category));
  return Array.from(categories);
}
