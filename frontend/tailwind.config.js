/* eslint-env node */
/* eslint-disable-next-line */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    asideScrollbars: {
      light: 'light',
      gray: 'gray',
    },
    extend: {
      zIndex: {
        '-1': '-1',
      },
      flexGrow: {
        5: '5',
      },
      maxHeight: {
        'screen-menu': 'calc(100vh - 3.5rem)',
        modal: 'calc(100vh - 160px)',
      },
      transitionProperty: {
        position: 'right, left, top, bottom, margin, padding',
        textColor: 'color',
      },
      keyframes: {
        'fade-out': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        'fade-out': 'fade-out 250ms ease-in-out',
        'fade-in': 'fade-in 250ms ease-in-out',
      },
      colors: {
        dark: {
          900: '#131618',
          800: '#21242A',
          700: '#2C2F36',
          600: '#9CA3AF',
          500: '#CBD5E1',
        },
        green: {
          text: '#45B26B',
        },
        pavitra: {
          blue: '#0162FD',
          green: '#00B448',
          orange: '#FFAA00',
          red: '#F20041',
          900: '#14142A',
          800: '#4E4B66',
          700: '#6E7191',
          600: '#A0A3BD',
          500: '#D9DBE9',
          400: '#EFF0F6',
          300: '#F7F7FC',
        },

        pastelEmeraldTheme: {
          text: '#515564',
          iconsColor: '#030A0D',
          mainBG: '#DFECF2',
          buttonColor: '#030A0D',
          outsideCardColor: '#D0E1E9',
          cardColor: '#DFECF2',
          webSiteComponentBg: '#030A0D',
          testimonials: '#FFFFFF',
          pricing: '#D0E1E9',
          diversityContact: ',#D0E1E9',
          diversityMain: '#D0E1E9',
          diversityHeader: '#D0E1E9',
          900: '#14142A',
          800: '#D0E1E9',
        },
        primaryText: '#030A0D',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'aside-scrollbars': (value) => {
            const track = value === 'light' ? '100' : '900';
            const thumb = value === 'light' ? '300' : '600';
            const color = value === 'light' ? 'gray' : value;

            return {
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme(`colors.${color}.${thumb}`)} ${theme(
                `colors.${color}.${track}`,
              )}`,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: theme(`colors.${color}.${track}`),
              },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: '0.25rem',
                backgroundColor: theme(`colors.${color}.${thumb}`),
              },
            };
          },
        },
        { values: theme('asideScrollbars') },
      );
    }),
  ],
};
