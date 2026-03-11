import { colors, fonts } from './theme'

export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: ${fonts.primary};
  }

  body {
    background-color: ${colors.background};
    color: ${colors.gray[900]};
  }

  #app {
    min-height: 100vh;
  }
`

/* CSS Variables para fácil acceso en componentes */
export const cssVariables = {
  '--primary': colors.primary,
  '--primary-dark': colors.primaryDark,
  '--primary-light': colors.primaryLight,
  '--gray-50': colors.gray[50],
  '--gray-100': colors.gray[100],
  '--gray-200': colors.gray[200],
  '--gray-300': colors.gray[300],
  '--gray-400': colors.gray[400],
  '--gray-500': colors.gray[500],
  '--gray-600': colors.gray[600],
  '--gray-700': colors.gray[700],
  '--gray-800': colors.gray[800],
  '--gray-900': colors.gray[900],
  '--success': colors.success,
  '--warning': colors.warning,
  '--error': colors.error,
  '--info': colors.info
}
