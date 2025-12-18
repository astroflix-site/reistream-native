const tintColorLight = '#E11D48'; // High contrast Red
const tintColorDark = '#FF0000'; // Pure Red for dark mode

export default {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000', // Pure Black
    tint: tintColorDark,
    tabIconDefault: '#999999',
    tabIconSelected: tintColorDark,
  },
};
