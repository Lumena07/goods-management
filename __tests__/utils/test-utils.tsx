import { ReactElement } from 'react'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'

const mockRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  forward: jest.fn()
}

export function withRouter(component: ReactElement) {
  return (
    <RouterContext.Provider value={mockRouter}>
      {component}
    </RouterContext.Provider>
  )
} 