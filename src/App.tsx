import React, { useRef, useEffect, useState } from 'react';
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
import useDrag from 'ui/hooks/dnd/useDrag';
import useDrop from 'ui/hooks/dnd/useDrop';
import { Vector } from 'base/math';

const GlobalStyle = createGlobalStyle`
  html, body {
    font-size: 12px;
    user-select: none;
  }
`;

const Box: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, { current, offset }] = useDrag(ref, 'box');
  const [location, setLocation] = useState(Vector.zero);
  useEffect(() => setLocation(current.add(offset)), [current, offset]);
  return (
    <div
      ref={ref}
      style={{
        width: 50,
        height: 50,
        background: dragging ? 'yellow' : 'red',
        position: 'absolute',
        top: location.y,
        left: location.x,
      }}
    />
  );
};

const accepts = ['box'];

const Box2: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  useDrop(ref, { accepts, onDrop: console.log, onHover: () => setHovered(true) });
  return (
    <div
      ref={ref}
      style={{
        width: 100,
        height: 100,
        background: hovered ? 'pink' : 'cyan',
        position: 'absolute',
        top: 0,
        right: 0,
      }}
    />
  );
};

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
      <Box2 />
      <Box />
    </DndProvider>
  </ThemeProvider>
);

export default App;
