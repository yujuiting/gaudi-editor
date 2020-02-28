import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { VStack } from 'ui/components/Stack';
import { HToolGroup, Tool } from 'ui/components/Toolbar';
import * as Icon from 'ui/components/icons';
import ViewInfo from './ViewInfo';
import PropsInfo from './PropsInfo';

enum PageType {
  View = 'View',
  Props = 'Props',
  Styles = 'Styles',
}

const iconMap = {
  [PageType.View]: Icon.Target,
  [PageType.Props]: Icon.Info,
  [PageType.Styles]: Icon.Style,
};

interface PageToolProps {
  type: PageType;
  onClick: (type: PageType) => void;
  active?: boolean;
}

const PageTool: React.FC<PageToolProps> = props => {
  const { type, onClick, active } = props;

  const wrappedOnClick = useCallback(() => onClick(type), [type, onClick]);

  const IconType = iconMap[type];

  return (
    <Tool onClick={wrappedOnClick} active={active}>
      <IconType size={16} title={type} />
    </Tool>
  );
};

const Wrapper = styled(VStack)`
  height: 100%;
  width: ${props => props.theme['information.default-width']};
`;

const Page = styled(VStack)`
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const Information: React.FC = () => {
  const [pageType, setPageType] = useState(PageType.View);

  function renderPageTool(type: PageType) {
    return <PageTool type={type} onClick={setPageType} active={pageType === type} />;
  }

  function renderPage() {
    switch (pageType) {
      case PageType.View:
        return <ViewInfo />;
      case PageType.Props:
        return <PropsInfo category="prop" showInfo />;
      case PageType.Styles:
        return <PropsInfo category="style" />;
    }
  }

  return (
    <Wrapper>
      <HToolGroup>
        {renderPageTool(PageType.View)}
        {renderPageTool(PageType.Props)}
        {renderPageTool(PageType.Styles)}
      </HToolGroup>
      <Page grow={1}>{renderPage()}</Page>
    </Wrapper>
  );
};

export default Information;
