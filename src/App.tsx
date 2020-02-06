import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { Normalize } from 'styled-normalize';
import { useService } from 'base/di';
import { ServiceInitializerService } from 'base/LifeCycle';
import { KeyboardService } from 'base/KeyboardService';
import { EditorPlugin } from 'editor/EditorPlugin';
import AppRoot from 'editor/components/AppRoot';
import { VStack, HStack } from 'editor/components/Stack';
import { HToolbar } from 'editor/components/Toolbar';
import Viewport from 'editor/viewport/Viewport';
import SelectViewportScale from 'editor/viewport/SelectViewportScale';
import CursorLocation from 'editor/viewport/CursorLocation';
import Tools from 'editor/widget/Tools';
import PanelOutlet from 'editor/widget/PanelOutlet';
import theme from './theme';
import widgets from './widgets';

import { WidgetRegistryService, ToolWidgetGroup } from 'editor/widget/WidgetRegistryService';

const App: React.FC = () => {
  useService(EditorPlugin);

  const serviceInitializer = useService(ServiceInitializerService);

  const keyboardService = useService(KeyboardService);

  const widgetRegistry = useService(WidgetRegistryService);

  useEffect(() => {
    serviceInitializer.initializeAll();
  }, [serviceInitializer]);

  useEffect(() => {
    keyboardService.bind(window);
    return () => keyboardService.unbind();
  }, [keyboardService]);

  widgetRegistry.register(...widgets);

  return (
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
};

export default App;
