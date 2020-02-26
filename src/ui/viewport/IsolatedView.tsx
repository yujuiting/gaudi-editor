import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { createPortal } from 'react-dom';
// import { View, ViewProps } from './components';

interface IframeProps {
  disablePointerEvent?: boolean;
}

const disablePointerEvent = (props: IframeProps) =>
  props.disablePointerEvent &&
  css`
    pointer-events: none;
  `;

const Iframe = styled.iframe`
  border: none;
  background-color: white;
  width: 100%;
  height: 100%;
  ${disablePointerEvent}
`;

type IsolatedViewProps = IframeProps & React.DOMAttributes<HTMLDivElement>;

const IsolatedView: React.FC<IsolatedViewProps> = ({ children, disablePointerEvent, ...props }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function renderChildren() {
    if (!iframeRef.current) return;
    if (!iframeRef.current.contentDocument) return;
    return createPortal(children, iframeRef.current.contentDocument.body);
  }

  return (
    <>
      <Iframe ref={iframeRef} disablePointerEvent={disablePointerEvent} />
      {renderChildren()}
    </>
  );
};

export default IsolatedView;
