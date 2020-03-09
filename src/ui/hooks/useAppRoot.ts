import { createContext, useContext } from 'react';

export const AppRootContext = createContext<React.RefObject<HTMLElement>>({ current: null });

const useAppRoot = () => useContext(AppRootContext);

export default useAppRoot;
