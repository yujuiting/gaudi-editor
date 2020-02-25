import 'styled-components';

const theme = {
  'app.background': '#5e5e5e',
  'viewport.background': '#282828',
  'viewport.hovered.color': 'cyan',
  'viewport.selected.color': '#FF00E4',
  'canvas.grid.color': '#666666',
  'toolbar.background': '#535353',
  'toolbar.divider.color': '#3e3e3e',
  'toolbar.size.small': '16px',
  'toolbar.size.large': '24px',
  'color.primary': '#007bff',
  'color.warning': '#ffc107',
  'color.danger': '#dc3545',
  'color.highlight': '#17a2b8',
  'color.text': '#f8f9fa',
  'color.disable': '#858585',
  'fontSize.small': '0.6rem',
  'fontSize.normal': '1rem',
  'fontSize.large': '1.4rem',
  'information.default-width': '320px',
  'operation-history.active-color': '',
  'operation-history.inactive-color': '#999',
  'component.input.background': '#5e5e5e',
  'component.input.hovered.background': '#1d1d1d',
  'component.input.invalid.border-color': '$color.danger',
  'component.input.invalid.background': '',
};

type Theme = typeof theme;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}

export default theme;
