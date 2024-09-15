import { act, render } from '@testing-library/react';
import { Mock, vi } from 'vitest';
import RestFull from './page';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import '@testing-library/jest-dom';
import { createStore } from 'redux';
import { useRouter } from 'next/navigation';

vi.mock('@/methods/graphql/urlConverter', () => {
  const actual = vi.importActual('@/methods/graphql/urlConverter');
  return {
    ...actual,
    makeNewUrl: vi.fn(),
    urlConverter: vi.fn(),
  };
});

vi.mock('graphql', () => {
  const actual = vi.importActual('graphql');
  return {
    ...actual,
    getIntrospectionQuery: vi.fn(),
    buildClientSchema: vi.fn(),
    printSchema: vi.fn(),
  };
});

vi.mock('graphql-request', () => ({
  request: vi.fn(),
}));

vi.mock('next/navigation', () => {
  const actual = vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: vi.fn(),
    })),
    usePathname: vi.fn(),
  };
});

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('react-redux', () => {
  const actual = vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
    Provider: vi.fn(),
  };
});

vi.mock('@/firebase', () => ({
  auth: vi.fn(),
}));

vi.mock('react', async () => {
  const actualReact = await import('react');
  return {
    ...actualReact,
    useEffect: vi.fn(),
  };
});

vi.mock('@/components/Loader/Loader', () => {
  return {
    default: () => <div>Loading...</div>,
  };
});
vi.mock('@/components/Header/Header', () => {
  return {
    default: () => <div>Header</div>,
  };
});

const mockStore = (initialState: unknown) => {
  return createStore((state = initialState) => state);
};

const MockRestFull = () => {
  return (
    <Provider store={store}>
      <RestFull />
    </Provider>
  );
};

let initialState = {
  main: {
    endpointUrlInput: '',
    sdlUrlInput: '',
    headersKeys: '',
    queryInput: '',
    variablesInput: '',
    error: '',
    documentation: '',
    languageData: {},
  },
};
let store = mockStore(initialState);

describe('RestFull Component', () => {
  let dispatchMock: Mock;
  let routerMock: Mock;
  let mockRouterPush: Mock;
  beforeEach(async () => {
    mockRouterPush = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: mockRouterPush });
    (onAuthStateChanged as Mock).mockImplementation((auth, callback) => {
      const mockUser = { uid: '123' };
      callback(mockUser);
      return vi.fn();
    });
    vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);

    dispatchMock = vi.fn();
    routerMock = vi.fn();
    vi.mocked(useDispatch).mockReturnValue(dispatchMock);
    (useRouter as Mock).mockReturnValue({ push: routerMock });
    vi.mocked(useSelector).mockImplementation((selectorFn) => selectorFn(initialState));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<MockRestFull />);
    });
  });
});