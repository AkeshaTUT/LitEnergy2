import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'
import * as jestDom from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

// register jest-dom matchers with Vitest's expect
expect.extend(jestDom)

// start a shared MSW server for tests
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
