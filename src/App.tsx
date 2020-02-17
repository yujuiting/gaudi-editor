import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Normalize } from 'styled-normalize';
import AppRoot from 'ui/components/AppRoot';
import { VStack, HStack } from 'ui/components/Stack';
import { HToolbar } from 'ui/components/Toolbar';
import Viewport from 'ui/viewport/Viewport';
import SelectViewportScale from 'ui/viewport/SelectViewportScale';
import CursorLocation from 'ui/viewport/CursorLocation';
import ToolBar from 'ui/widget/ToolBar';
import PanelBar from 'ui/widget/PanelBar';
import PanelOutlet from 'ui/widget/PanelOutlet';
import InfoPanel from 'ui/widget/InfoPanel';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  html, body {
    font-size: 12px;
  }
`;

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Normalize />
    <GlobalStyle />
    <AppRoot>
      <VStack height="100%">
        <HToolbar>
          <ToolBar group="topbar.file" />
          <ToolBar group="topbar.edit" />
        </HToolbar>
        <HStack grow={1}>
          <VStack>
            <PanelBar />
          </VStack>
          <VStack>
            <PanelOutlet />
          </VStack>
          <VStack grow={1}>
            <Viewport />
          </VStack>
          <VStack>
            <InfoPanel />
          </VStack>
        </HStack>
        <HStack>
          <SelectViewportScale />
          <CursorLocation />
        </HStack>
      </VStack>
    </AppRoot>
  </ThemeProvider>
);

export default App;
