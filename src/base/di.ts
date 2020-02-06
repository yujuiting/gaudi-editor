import { Container, ContainerInstance, ObjectType } from 'typedi';
import { createContext, useContext, createElement } from 'react';
import { Gaudi } from 'gaudi';
import { ContextProviderProps } from './Context';

export function createContainer() {
  const container = Container.of(undefined);
  container.set({ id: Gaudi, type: Gaudi });
  return container;
}

const Context = createContext(createContainer());

export const ContainerProvider: React.FC<ContextProviderProps<ContainerInstance>> = props => {
  const { children, value } = props;
  return createElement(Context.Provider, { value }, children);
};

export const useService = <T>(type: ObjectType<T>) => useContext(Context).get(type);
