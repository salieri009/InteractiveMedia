/**
 * ===============================================
 * AudioWorklet Duplicate Registration Fix
 * ===============================================
 * 
 * Prevents AudioWorkletProcessor duplicate registration errors
 * when switching between projects that use p5.sound.
 * 
 * p5.sound registers AudioWorkletProcessors globally, and when
 * projects switch, it may try to re-register them, causing errors.
 * 
 * @author 20+ Years Software Developer
 * @since 2025
 */

(function() {
  'use strict';
  
  // Store original AudioWorkletGlobalScope if available
  if (typeof window !== 'undefined' && window.AudioWorkletGlobalScope) {
    const originalRegisterProcessor = window.AudioWorkletGlobalScope.prototype.registerProcessor;
    
    // Track registered processors
    const registeredProcessors = new Set();
    
    // Override registerProcessor to prevent duplicate registration
    window.AudioWorkletGlobalScope.prototype.registerProcessor = function(name, processorCtor) {
      if (registeredProcessors.has(name)) {
        // Already registered, silently ignore
        console.log(`🔇 AudioWorkletProcessor "${name}" already registered, skipping duplicate registration`);
        return;
      }
      
      try {
        originalRegisterProcessor.call(this, name, processorCtor);
        registeredProcessors.add(name);
        console.log(`✅ AudioWorkletProcessor "${name}" registered successfully`);
      } catch (error) {
        // If it's a duplicate registration error, ignore it
        if (error.name === 'NotSupportedError' && error.message.includes('already registered')) {
          console.log(`🔇 AudioWorkletProcessor "${name}" already registered (caught error), continuing...`);
          registeredProcessors.add(name);
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    };
  }
  
  // Alternative: Catch errors at window level for AudioWorklet errors
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Check if it's an AudioWorklet duplicate registration error
    if (error && error.name === 'NotSupportedError' && 
        typeof message === 'string' && 
        message.includes('AudioWorkletProcessor') && 
        message.includes('already registered')) {
      // Suppress this specific error
      console.log('🔇 Suppressed AudioWorkletProcessor duplicate registration error');
      return true; // Prevent default error handling
    }
    
    // Call original error handler for other errors
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        event.reason.name === 'NotSupportedError' && 
        event.reason.message && 
        event.reason.message.includes('AudioWorkletProcessor') && 
        event.reason.message.includes('already registered')) {
      console.log('🔇 Suppressed AudioWorkletProcessor duplicate registration promise rejection');
      event.preventDefault(); // Prevent unhandled rejection
    }
  });
  
  console.log('✅ AudioWorklet duplicate registration fix applied');
})();


