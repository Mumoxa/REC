import "@testing-library/jest-dom/vitest";

// jsdom lacks ResizeObserver (used for vacancy-list virtualization)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  // jsdom polyfill for tests
  (globalThis as unknown as Record<string, unknown>).ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
}
