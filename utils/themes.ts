
export type ColorThemeName = 'nagad' | 'ocean' | 'forest' | 'royal' | 'sunset';
export type DesignStyle = 'default' | 'oceanic' | 'natural' | 'elegant' | 'vibrant';

export interface Theme {
  name: ColorThemeName;
  displayName: string;
  primary: string; // HSL format: "H S% L%"
  preview: string; // Hex for swatch
  designStyle: DesignStyle;
}

export const themes: Record<ColorThemeName, Theme> = {
  nagad: {
    name: 'nagad',
    displayName: 'ডিফল্ট',
    primary: '15 90% 55%',
    preview: '#F55F28',
    designStyle: 'default',
  },
  ocean: {
    name: 'ocean',
    displayName: 'ওশান ব্লু',
    primary: '207 90% 54%',
    preview: '#2196F3',
    designStyle: 'oceanic',
  },
  forest: {
    name: 'forest',
    displayName: 'ফরেস্ট গ্রিন',
    primary: '145 63% 32%',
    preview: '#2A784C',
    designStyle: 'natural',
  },
  royal: {
    name: 'royal',
    displayName: 'রয়্যাল পার্পল',
    primary: '265 80% 55%',
    preview: '#673AB7',
    designStyle: 'elegant',
  },
  sunset: {
    name: 'sunset',
    displayName: 'সানসেট গোল্ড',
    primary: '35 100% 58%',
    preview: '#FFC107',
    designStyle: 'vibrant',
  },
};
