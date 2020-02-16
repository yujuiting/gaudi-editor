import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Normalize } from 'styled-normalize';
import AppRoot from 'ui/components/AppRoot';
import { VStack, HStack } from 'ui/components/Stack';
import { HToolbar } from 'ui/components/Toolbar';
import Viewport from 'ui/viewport/Viewport';
import SelectViewportScale from 'ui/viewport/SelectViewportScale';
import CursorLocation from 'ui/viewport/CursorLocation';
import Tools from 'ui/widget/Tools';
import PanelOutlet from 'ui/widget/PanelOutlet';
import theme from './theme';

import { ToolWidgetGroup } from 'editor/widget/WidgetRegistryService';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Normalize />
    <AppRoot>
      <VStack height="100%">
        <HToolbar>
          <Tools group={ToolWidgetGroup.File} />
          <Tools group={ToolWidgetGroup.Edit} />
        </HToolbar>
        <HStack grow={1}>
          <VStack>
            <Tools group={ToolWidgetGroup.Panel} vertical />
          </VStack>
          <VStack>
            <PanelOutlet />
          </VStack>
          <VStack grow={1}>
            <Viewport />
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
