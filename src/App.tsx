import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { DndProvider } from 'react-dnd';
import DndHtml5Backend from 'react-dnd-html5-backend';
import { Normalize } from 'styled-normalize';
import AppRoot from 'ui/components/AppRoot';
import { VStack, HStack } from 'ui/components/Stack';
import { HToolbar } from 'ui/components/Toolbar';
import Viewport from 'ui/viewport/Viewport';
import SelectViewportScale from 'ui/viewport/SelectViewportScale';
import CursorLocation from 'ui/viewport/CursorLocation';
import ToolBar from 'ui/ToolBar';
import Information from 'ui/Information';
import PanelBar from 'ui/widget/panel/PanelBar';
import PanelOutlet from 'ui/widget/panel/PanelOutlet';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  html, body {
    font-size: 12px;
  }
`;

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <DndProvider backend={DndHtml5Backend}>
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
              <Information />
            </VStack>
          </HStack>
          <HStack>
            <SelectViewportScale />
            <CursorLocation />
          </HStack>
        </VStack>
      </AppRoot>
    </DndProvider>
  </ThemeProvider>
);

export default App;
