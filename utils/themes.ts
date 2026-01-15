
export type ColorThemeName = 'bkash' | 'nagad' | 'upay' | 'surecash';
export type DesignStyle = 'bkash-ui' | 'nagad-ui' | 'upay-ui' | 'default';

export interface Theme {
  name: ColorThemeName;
  displayName: string;
  walletName: string;
  logoUrl: string;
  primary: string; // HSL format
  secondary: string; // HSL format
  radius: string; // CSS radius value
  preview: string; // Hex for swatch
  designStyle: DesignStyle;
}

export const themes: Record<ColorThemeName, Theme> = {
  bkash: {
    name: 'bkash',
    displayName: 'bKash',
    walletName: 'bKash',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/10692/10692429.png', // bKash Bird Style
    primary: '333 84% 48%', // #E2136E
    secondary: '333 84% 20%',
    radius: '0.5rem',
    preview: '#E2136E',
    designStyle: 'bkash-ui',
  },
  nagad: {
    name: 'nagad',
    displayName: 'Nagad',
    walletName: 'Nagad',
    logoUrl: 'https://seeklogo.com/images/N/nagad-logo-7A70CCF004-seeklogo.com.png',
    primary: '15 91% 54%',
    secondary: '0 0% 10%',
    radius: '1.2rem',
    preview: '#F55F28',
    designStyle: 'nagad-ui',
  },
  upay: {
    name: 'upay',
    displayName: 'Upay',
    walletName: 'Upay',
    logoUrl: 'https://seeklogo.com/images/U/upay-logo-7F365A49D6-seeklogo.com.png',
    primary: '48 100% 50%',
    secondary: '235 66% 30%',
    radius: '0.4rem',
    preview: '#FFD100',
    designStyle: 'upay-ui',
  },
  surecash: {
    name: 'surecash',
    displayName: 'SureCash',
    walletName: 'SureCash',
    logoUrl: 'https://surecash.net/wp-content/uploads/2019/04/surecash_logo_200.png',
    primary: '28 92% 54%',
    secondary: '238 52% 38%',
    radius: '1rem',
    preview: '#F58220',
    designStyle: 'default',
  }
};
