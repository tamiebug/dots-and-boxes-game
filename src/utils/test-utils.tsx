import { setUpStore } from '../app/store';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

export function renderWithProviders( element: React.ReactElement ) {
  const store = setUpStore();
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...render(element, { wrapper: Wrapper })}
}