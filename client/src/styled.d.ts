import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    color?: string;
    backgroundColor?: string;
    hoverColor?: string;
    borderColor?: string;
    ringColor?: string;
    hoverBorderColor?: string;
    hoverBgColor?: string;
    minWidth?: number;
    colorScheme?: string;
  }
}
