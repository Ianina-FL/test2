import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as styles from '../styles';
import { localStorageDarkModeKey, localStorageStyleKey } from '../config';
import { StyleKey } from '../interfaces';

interface StyleState {
  asideStyle: string;
  asideScrollbarsStyle: string;
  asideBrandStyle: string;
  asideMenuItemStyle: string;
  asideMenuItemActiveStyle: string;
  asideMenuDropdownStyle: string;
  navBarItemLabelStyle: string;
  navBarItemLabelHoverStyle: string;
  navBarItemLabelActiveColorStyle: string;
  overlayStyle: string;
  darkMode: boolean;
  bgLayoutColor: string;
  iconsColor: string;
  activeLinkColor: string;
  cardsColor: string;
  focusRingColor: string;
  corners: string;
  cardsStyle: string;
  linkColor: string;
  websiteHeder: string;
  borders: string;
  shadow: string;
  websiteSectionStyle: string;
  textSecondary: string;
}

const initialState: StyleState = {
  asideStyle: styles.pastelEmeraldTheme.aside,
  asideScrollbarsStyle: styles.white.asideScrollbars,
  asideBrandStyle: styles.white.asideBrand,
  asideMenuItemStyle: styles.pastelEmeraldTheme.asideMenuItem,
  asideMenuItemActiveStyle: styles.pastelEmeraldTheme.asideMenuItemActive,
  activeLinkColor: styles.pastelEmeraldTheme.activeLinkColor,
  asideMenuDropdownStyle: styles.white.asideMenuDropdown,
  navBarItemLabelStyle: styles.pastelEmeraldTheme.navBarItemLabel,
  navBarItemLabelHoverStyle: styles.pastelEmeraldTheme.navBarItemLabelHover,
  navBarItemLabelActiveColorStyle:
    styles.pastelEmeraldTheme.navBarItemLabelActiveColor,
  overlayStyle: styles.pastelEmeraldTheme.overlay,
  darkMode: false,
  bgLayoutColor: styles.pastelEmeraldTheme.bgLayoutColor,
  iconsColor: styles.pastelEmeraldTheme.iconsColor,
  cardsColor: styles.pastelEmeraldTheme.cardsColor,
  focusRingColor: styles.pastelEmeraldTheme.focusRingColor,
  corners: styles.pastelEmeraldTheme.corners,
  cardsStyle: styles.pastelEmeraldTheme.cardsStyle,
  linkColor: styles.pastelEmeraldTheme.linkColor,
  websiteHeder: styles.pastelEmeraldTheme.websiteHeder,
  borders: styles.pastelEmeraldTheme.borders,
  shadow: styles.pastelEmeraldTheme.shadow,
  websiteSectionStyle: styles.pastelEmeraldTheme.websiteSectionStyle,
  textSecondary: styles.pastelEmeraldTheme.textSecondary,
};

export const styleSlice = createSlice({
  name: 'style',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean | null>) => {
      state.darkMode =
        action.payload !== null ? action.payload : !state.darkMode;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          localStorageDarkModeKey,
          state.darkMode ? '1' : '0',
        );
      }

      if (typeof document !== 'undefined') {
        document.body.classList[state.darkMode ? 'add' : 'remove'](
          'dark-scrollbars',
        );

        document.documentElement.classList[state.darkMode ? 'add' : 'remove'](
          'dark-scrollbars-compat',
        );
      }
    },

    setStyle: (state, action: PayloadAction<StyleKey>) => {
      if (!styles[action.payload]) {
        return;
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(localStorageStyleKey, action.payload);
      }

      const style = styles[action.payload];

      for (const key in style) {
        state[`${key}Style`] = style[key];
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode, setStyle } = styleSlice.actions;

export default styleSlice.reducer;
