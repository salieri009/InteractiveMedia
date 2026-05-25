/**
 * AudioWorklet Duplicate Registration Fix
 *
 * WHY THIS EXISTS:
 * p5.sound registers AudioWorkletProcessors globally in the browser.
 * When the user switches between projects that use p5.sound, the library
 * tries to re-register the same processors, throwing a NotSupportedError.
 * This IIFE patches the registration function before p5.sound runs so that
 * duplicate calls are silently skipped instead of crashing.
 *
 * LOAD ORDER: This file must be included as a plain <script> tag (NOT a
 * module) BEFORE p5.sound.min.js loads. See index.html.
 *
 * @author Interactive Media Assignment — UTS 2025
 * @since v2.0.0
 */
(function (): void {
  'use strict';

  /* ================================================================
     Patch AudioWorkletGlobalScope if available in this browser.
     Some environments (e.g. Firefox private mode) may not expose it.
     ================================================================ */
  type AWGSWindow = { AudioWorkletGlobalScope?: { prototype: { registerProcessor: (...args: unknown[]) => void } } };
  if (typeof window !== 'undefined' && (window as unknown as AWGSWindow).AudioWorkletGlobalScope) {
    const awgs = (window as unknown as Required<AWGSWindow>).AudioWorkletGlobalScope;
    const originalRegisterProcessor = awgs.prototype.registerProcessor;

    /**
     * Tracks processor names that have already been registered.
     * A Set gives O(1) lookup so there is no performance cost on every draw call.
     */
    const registeredProcessors = new Set<string>();

    /**
     * Override registerProcessor to skip names that have been registered before.
     * This allows project switching without accumulating NotSupportedError crashes.
     */
    awgs.prototype.registerProcessor = function (...args: unknown[]): void {
      const [name] = args as [string, unknown];
      if (registeredProcessors.has(name)) {
        // Silently skip — already registered, no action needed
        return;
      }

      try {
        originalRegisterProcessor.call(this, ...args);
        registeredProcessors.add(name);
      } catch (error: unknown) {
        const err = error as DOMException;
        // Only swallow the specific duplicate-registration error from the Web Audio API
        if (err?.name === 'NotSupportedError' && err?.message?.includes('already registered')) {
          registeredProcessors.add(name);
        } else {
          // Re-throw unexpected errors so they are not silently hidden
          throw error;
        }
      }
    };
  }

  /* ================================================================
     Catch AudioWorklet errors that surface at the window level.
     This is a belt-and-suspenders fallback for errors that bypass
     the prototype patch above.
     ================================================================ */
  const originalError = window.onerror;

  window.onerror = function (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): boolean {
    // Suppress only the specific duplicate-registration error; let all others through
    if (
      error?.name === 'NotSupportedError' &&
      typeof message === 'string' &&
      message.includes('AudioWorkletProcessor') &&
      message.includes('already registered')
    ) {
      return true; // Returning true prevents the browser's default error handling
    }

    if (originalError) {
      return originalError.call(window, message, source, lineno, colno, error) as boolean;
    }
    return false;
  };

  /* ================================================================
     Catch the same error when it appears as an unhandled Promise rejection
     (AudioWorklet operations are async and may reject rather than throw).
     ================================================================ */
  window.addEventListener('unhandledrejection', function (event: PromiseRejectionEvent): void {
    const reason = event.reason as DOMException | undefined;
    if (
      reason?.name === 'NotSupportedError' &&
      reason?.message?.includes('AudioWorkletProcessor') &&
      reason?.message?.includes('already registered')
    ) {
      event.preventDefault(); // Prevent the rejection from appearing in the console
    }
  });

  console.log('AudioWorklet duplicate registration fix applied');
})();
