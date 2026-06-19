import { useEffect, useRef, useState } from 'react';
import { SparklesIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { Link } from '@tanstack/react-router';

// Each log step has a status: waiting | active | done | error
type StepStatus = 'waiting' | 'active' | 'done' | 'error';

interface LogStep {
  id: number;
  label: string;
  detail: string;
  status: StepStatus;
  timeMs?: number;  // how long this step took
}

// Initial state of the 5-step log — all waiting
const INITIAL_STEPS: LogStep[] = [
  { id: 1, label: 'HTTP request sent',        detail: 'POST /api/v1/ai/generate-description', status: 'waiting' },
  { id: 2, label: 'Job queued in Redis',       detail: 'BullMQ adds job to "ai-queue"',         status: 'waiting' },
  { id: 3, label: 'Worker picked up the job', detail: 'AI worker dequeues from Redis',          status: 'waiting' },
  { id: 4, label: 'Gemini API called',        detail: 'gemini-1.5-flash generating text…',      status: 'waiting' },
  { id: 5, label: 'Result via Socket.io',     detail: 'Event: ai:description_ready → browser',  status: 'waiting' },
];

export function AiDemoPage() {
  const { isAuthenticated } = useAuth();
  const { on, EVENTS } = useSocket();

  const [name, setName] = useState('Wireless Noise-Cancelling Headphones');
  const [category, setCategory] = useState('Electronics');
  const [features, setFeatures] = useState('40hr battery, Bluetooth 5.3, foldable design');

  const [steps, setSteps] = useState<LogStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean | null>(null);
  const startTimeRef = useRef<number>(0);       // wall-clock when we clicked Generate
  const stepTimeRef = useRef<number>(0);        // wall-clock when last step started

  // Helper: update a single step by id
  function updateStep(id: number, patch: Partial<LogStep>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  // ── Socket.io listener ──────────────────────────────────────────────────────
  // Registered once on mount. When the backend emits 'ai:description_ready',
  // we complete the last two log steps and show the result.
  useEffect(() => {
    const unsubscribe = on(EVENTS.AI_DESCRIPTION_READY, (payload) => {
      const data = payload as { success: boolean; description?: string; error?: string };
      const elapsed = Date.now() - stepTimeRef.current;

      if (data.success && data.description) {
        // Step 4 done (Gemini returned)
        updateStep(4, { status: 'done', detail: 'Gemini returned text', timeMs: elapsed });
        // Step 5 done (socket arrived)
        updateStep(5, { status: 'done', detail: 'Event received in browser', timeMs: 1 });
        setResult(data.description);
      } else {
        updateStep(4, { status: 'error', detail: data.error ?? 'Gemini failed' });
        updateStep(5, { status: 'error', detail: 'Socket delivered error response' });
      }
      setIsRunning(false);
    });

    return () => unsubscribe();
  }, [on, EVENTS.AI_DESCRIPTION_READY]);

  async function handleGenerate() {
    if (!name.trim()) return;

    // Reset everything for a fresh run
    setSteps(INITIAL_STEPS);
    setResult('');
    setIsRunning(true);
    startTimeRef.current = Date.now();

    // ── Step 1: activate (HTTP request about to be sent) ─────────────────────
    updateStep(1, { status: 'active' });
    stepTimeRef.current = Date.now();

    try {
      const res = await api.post('/ai/generate-description', { name, category, features });
      const elapsed1 = Date.now() - stepTimeRef.current;

      // Step 1 done — got jobId back from the API
      const { jobId, isAiConfigured: configured } = res.data as { jobId: string; isAiConfigured: boolean };
      setIsAiConfigured(configured);
      updateStep(1, {
        status: 'done',
        detail: `jobId: ${String(jobId).slice(0, 12)}…`,
        timeMs: elapsed1,
      });

      // ── Step 2: job is now in Redis ────────────────────────────────────────
      // This happens instantly when the API returns — job is already queued
      updateStep(2, { status: 'done', detail: 'Stored in Redis "ai-queue"', timeMs: 0 });

      // ── Step 3: show worker as active ─────────────────────────────────────
      // We can't know exactly when the worker picks it up, but it's near-instant
      stepTimeRef.current = Date.now();
      updateStep(3, { status: 'active', detail: 'Worker polling Redis for jobs…' });

      // Small delay to visualize the worker picking up the job
      await new Promise((r) => setTimeout(r, 300));
      const elapsed3 = Date.now() - stepTimeRef.current;
      updateStep(3, { status: 'done', detail: 'Job dequeued by ai-worker', timeMs: elapsed3 });

      // ── Step 4: Gemini now being called ───────────────────────────────────
      stepTimeRef.current = Date.now();
      updateStep(4, {
        status: 'active',
        detail: configured ? 'Calling gemini-1.5-flash…' : 'No API key → using mock response',
      });

      // ── Step 5: waiting for socket ────────────────────────────────────────
      updateStep(5, { status: 'active', detail: 'Waiting for Socket.io event…' });

      // Steps 4 + 5 complete when the socket event fires (handled in useEffect above)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      updateStep(1, { status: 'error', detail: error.response?.data?.message ?? 'Request failed' });
      setIsRunning(false);
    }
  }

  function handleReset() {
    setSteps(INITIAL_STEPS);
    setResult('');
    setIsRunning(false);
    setIsAiConfigured(null);
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <SparklesIcon className="w-12 h-12 text-primary-500 mx-auto" />
        <h1 className="text-2xl font-bold text-surface-900">AI Demo requires login</h1>
        <p className="text-surface-500 text-sm">
          The Socket.io real-time connection needs an authenticated user. Login with any account to try the demo.
        </p>
        <Link
          to="/login"
          search={{ redirect: '/ai-demo' }}
          className="inline-block px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Login to try
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-wide">
          <SparklesIcon className="w-3.5 h-3.5" />
          AI + Queue + Real-time Demo
        </div>
        <h1 className="text-3xl font-bold text-surface-900">AI Product Description Generator</h1>
        <p className="text-surface-500 text-sm max-w-lg mx-auto">
          Watch the full flow: your request goes through an HTTP API → BullMQ job queue → AI Worker → Gemini API → Socket.io back to your browser.
        </p>
      </div>

      {/* Architecture diagram */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs font-mono text-surface-500">
        {['Browser', '→', 'Express API', '→', 'BullMQ (Redis)', '→', 'AI Worker', '→', 'Gemini', '→', 'Socket.io', '→', 'Browser'].map((part, i) => (
          <span
            key={i}
            className={part === '→' ? 'text-surface-300' : 'px-2 py-0.5 bg-surface-100 rounded text-surface-600 font-semibold'}
          >
            {part}
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Left: Input form */}
        <div className="space-y-4 p-6 border border-surface-200 rounded-2xl bg-white">
          <h2 className="font-semibold text-surface-900">1. Configure the request</h2>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Product Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-surface-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-surface-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1">Key Features (optional)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              disabled={isRunning}
              rows={2}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-surface-50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isRunning || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-primary-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <SparklesIcon className="w-4 h-4" />
            {isRunning ? 'Generating…' : 'Generate with AI'}
          </button>

          {result && (
            <button
              onClick={handleReset}
              className="w-full py-2 border border-surface-200 text-surface-600 rounded-xl text-sm hover:bg-surface-50 transition-colors"
            >
              Reset & Try Again
            </button>
          )}
        </div>

        {/* Right: Live step log */}
        <div className="space-y-4 p-6 border border-surface-200 rounded-2xl bg-white">
          <h2 className="font-semibold text-surface-900">2. Live flow log</h2>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                {/* Status icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {step.status === 'waiting' && (
                    <div className="w-5 h-5 rounded-full border-2 border-surface-200" />
                  )}
                  {step.status === 'active' && (
                    <svg className="animate-spin w-5 h-5 text-primary-500" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {step.status === 'done' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  {step.status === 'error' && (
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${
                      step.status === 'waiting' ? 'text-surface-400' :
                      step.status === 'active'  ? 'text-primary-700' :
                      step.status === 'done'    ? 'text-surface-900' :
                      'text-red-700'
                    }`}>
                      Step {step.id}: {step.label}
                    </span>
                    {step.status === 'done' && step.timeMs !== undefined && (
                      <span className="text-xs text-surface-400 flex-shrink-0 flex items-center gap-0.5">
                        <ClockIcon className="w-3 h-3" />
                        {step.timeMs < 1 ? '<1ms' : `${step.timeMs}ms`}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 font-mono truncate ${
                    step.status === 'waiting' ? 'text-surface-300' :
                    step.status === 'error'   ? 'text-red-500' :
                    'text-surface-500'
                  }`}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* AI mode badge */}
          {isAiConfigured !== null && (
            <div className={`mt-4 px-3 py-2 rounded-lg text-xs font-medium ${
              isAiConfigured
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isAiConfigured
                ? '✓ Real Gemini API — live AI generation'
                : '⚠ No GEMINI_API_KEY — using mock response (queue + socket still real)'}
            </div>
          )}
        </div>
      </div>

      {/* Result box */}
      {result && (
        <div className="p-6 border-2 border-green-200 rounded-2xl bg-green-50 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <h2 className="font-semibold text-green-800">Generated Description</h2>
            <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Arrived via Socket.io
            </span>
          </div>
          <p className="text-surface-700 text-sm leading-relaxed whitespace-pre-line">{result}</p>
        </div>
      )}

      {/* Explanation */}
      <div className="p-6 border border-surface-100 rounded-2xl bg-surface-50 space-y-4">
        <h2 className="font-semibold text-surface-900">Why a queue instead of a direct API call?</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-surface-600">
          <div className="space-y-1">
            <p className="font-medium text-surface-800">Without queue (blocking)</p>
            <p>HTTP request → waits 3–5s for Gemini → response returned</p>
            <p className="text-danger-600 text-xs">× Browser hangs, timeouts risk, no retry on failure</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-surface-800">With queue (non-blocking) ✓</p>
            <p>HTTP request → returns jobId in ~5ms → Worker calls Gemini → Socket pushes result</p>
            <p className="text-green-600 text-xs">✓ Instant response, auto-retry, scales independently</p>
          </div>
        </div>
      </div>

    </div>
  );
}
