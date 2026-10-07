import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { validateQuoteInput } from "@shared/schema.js";
import { Button, Stepper, useToast } from "@/components/ui/index.js";
import { Seo } from "@/components/layout/Seo.jsx";
import { ApiError, postQuote } from "@/lib/api.js";
import { useBasket } from "@/lib/basket.jsx";
import { useCatalog } from "@/lib/catalog.jsx";
import { useSettings } from "@/lib/settings.jsx";
import { waLink } from "@/lib/whatsapp.js";
import { ContactStep } from "@/components/quote/ContactStep.jsx";
import { FrameStep } from "@/components/quote/FrameStep.jsx";
import { LensStep } from "@/components/quote/LensStep.jsx";
import { ReviewStep } from "@/components/quote/ReviewStep.jsx";
import { RxStep } from "@/components/quote/RxStep.jsx";
import { DesktopSummary, MobileSummary } from "@/components/quote/Summary.jsx";
import { UsageStep } from "@/components/quote/UsageStep.jsx";
import { buildMailto, buildQuoteMessage } from "@/components/quote/quoteMessage.js";
import {
  STEP, STEP_LABELS, buildPayload, describeSelection, eligibleLenses, estimatePrice, firstInvalidStep, isFrameProduct,
  lensProductOf, resolveFrames, rxRecommendation, stepForErrorPath, validateStep, buildSummary,
} from "@/components/quote/quoteRules.js";
import { useQuoteForm } from "@/components/quote/useQuoteForm.js";
import { scrollBehavior } from "@/components/product/motion.js";
import { trackPixel } from "@/lib/pixel.js";

const RETRY_COOLDOWN_MS = 3000;
const NETWORK_FAILURE_MESSAGE =
  "We could not send your request right now. Your answers are saved on this device, and you can send them on WhatsApp or by email instead.";

const IDLE = { status: "idle", problem: null };

const minutesFromSeconds = (seconds) => Math.max(1, Math.ceil((seconds || 60) / 60));

const problemFromError = (error) => {
  if (error instanceof ApiError && error.status === 429) {
    return { message: `Too many requests from this connection. Please try again in about ${minutesFromSeconds(error.retryAfter)} minutes.`, offerFallback: true };
  }
  if (error instanceof ApiError && error.status === 422) {
    return { message: Object.values(error.fields)[0] ?? "Some details need fixing.", offerFallback: false };
  }
  return { message: NETWORK_FAILURE_MESSAGE, offerFallback: true };
};

const focusFirstProblem = () => {
  requestAnimationFrame(() => {
    const form = document.getElementById("quote-form");
    const invalid = form?.querySelector('[aria-invalid="true"]');
    const alert = form?.querySelector('[role="alert"]');
    const target = invalid ?? alert?.closest("fieldset")?.querySelector("input") ?? alert;
    target?.scrollIntoView?.({ block: "center", behavior: scrollBehavior() });
    target?.focus?.({ preventScroll: true });
  });
};

function QuoteWizard({ slug }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const basket = useBasket();
  const settings = useSettings();
  const { products, status, bySlug } = useCatalog();
  const { state, dispatch, discardDraft } = useQuoteForm({
    slug,
    color: searchParams.get("color"),
    size: searchParams.get("size"),
    lens: searchParams.get("lens"),
  });
  const [showErrors, setShowErrors] = useState(false);
  const [submission, setSubmission] = useState(IDLE);
  const headingRef = useRef(null);
  const cooldownTimer = useRef(null);
  const isFirstRender = useRef(true);

  const catalogReady = status !== "loading";
  const ctx = useMemo(() => ({ bySlug, catalogReady }), [bySlug, catalogReady]);
  const lenses = useMemo(() => products.filter((product) => !isFrameProduct(product)), [products]);
  const catalog = useMemo(
    () => ({ status, bySlug, lenses, frames: products.filter(isFrameProduct) }),
    [status, bySlug, lenses, products],
  );

  const frames = resolveFrames(state, bySlug);
  const lens = lensProductOf(state, bySlug);
  const eligibility = eligibleLenses(lenses, frames);
  const estimate = estimatePrice(state, frames, lens, eligibility.eligible);
  const recommendation = rxRecommendation(state, frames, lens);
  const selection = describeSelection(state, bySlug);
  const errors = showErrors ? validateStep(state.step, state, ctx) : {};
  const isReview = state.step === STEP.review;
  const isSending = submission.status === "sending" || submission.status === "cooldown";

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById("quote-form")?.scrollIntoView({ block: "start", behavior: scrollBehavior() });
  }, [state.step]);

  useEffect(() => () => clearTimeout(cooldownTimer.current), []);

  const goTo = (step) => {
    setShowErrors(false);
    dispatch({ type: "goto", step });
  };

  const showProblems = () => {
    setShowErrors(true);
    focusFirstProblem();
  };

  const goNext = () => {
    if (Object.keys(validateStep(state.step, state, ctx)).length > 0) return showProblems();
    return goTo(state.step + 1);
  };

  const failWithCooldown = (problem) => {
    setSubmission({ status: "cooldown", problem });
    cooldownTimer.current = setTimeout(() => setSubmission({ status: "failed", problem }), RETRY_COOLDOWN_MS);
  };

  const completeSubmission = (created) => {
    const summary = buildSummary(state, bySlug, created.id);
    trackPixel("Lead", { content_ids: frames.map(({ product }) => product.id) });
    discardDraft();
    basket.clear();
    navigate(`/quote/done/${created.id}`, { replace: true, state: { summary } });
  };

  const sendQuote = async () => {
    const invalidStep = firstInvalidStep(state, ctx);
    if (invalidStep !== null) {
      goTo(invalidStep);
      setShowErrors(true);
      toast.error("Please complete the highlighted fields.");
      return;
    }
    const payload = buildPayload(state, bySlug);
    const check = validateQuoteInput(payload);
    if (!check.ok) {
      goTo(stepForErrorPath(Object.keys(check.errors)[0]));
      toast.error(Object.values(check.errors)[0]);
      return;
    }
    setSubmission({ status: "sending", problem: null });
    try {
      completeSubmission(await postQuote(payload));
    } catch (error) {
      const problem = problemFromError(error);
      failWithCooldown(problem);
      if (error instanceof ApiError && error.status === 422) {
        goTo(stepForErrorPath(Object.keys(error.fields)[0] ?? ""));
        toast.error(problem.message);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSending) return;
    return isReview ? sendQuote() : goNext();
  };

  const offersFallback = Boolean(submission.problem?.offerFallback);
  const fallback = useMemo(() => {
    if (!offersFallback) return null;
    const summary = buildSummary(state, bySlug, null);
    return {
      whatsappHref: settings.whatsappNumber ? waLink(settings.whatsappNumber, buildQuoteMessage(summary)) : "",
      mailtoHref: buildMailto(summary, settings.businessEmail),
    };
  }, [offersFallback, state, bySlug, settings.whatsappNumber, settings.businessEmail]);

  const stepProps = { state, dispatch, errors, ref: headingRef };

  return (
    <div className="container-page pb-40 pt-6 md:pb-16 md:pt-10">
      <Seo title="Get a quote" description="Choose your frame and lenses, add your prescription and get a quote from the ChashmaGenie owner." noindex={Boolean(slug)} />
      <h1 className="text-3xl md:text-4xl">Get a quote</h1>
      <p className="mb-6 mt-2 text-ink-600">Free, no obligation. We reply with a price you can approve before anything is ordered.</p>
      <Stepper steps={STEP_LABELS} current={state.step} onSelect={goTo} />
      <MobileSummary selection={selection} estimate={estimate} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form id="quote-form" noValidate onSubmit={handleSubmit} className="min-w-0 scroll-mt-32">
          {state.step === STEP.frame ? <FrameStep {...stepProps} catalog={catalog} /> : null}
          {state.step === STEP.usage ? <UsageStep {...stepProps} /> : null}
          {state.step === STEP.lens ? (
            <LensStep {...stepProps} catalog={catalog} lens={lens} recommendation={recommendation} eligibility={eligibility} />
          ) : null}
          {state.step === STEP.rx ? <RxStep {...stepProps} lens={lens} /> : null}
          {state.step === STEP.contact ? <ContactStep {...stepProps} /> : null}
          {isReview ? (
            <ReviewStep ref={headingRef} state={state} selection={selection} estimate={estimate} onEdit={goTo} problem={submission.problem} fallback={fallback} />
          ) : null}
          <div className="fixed inset-x-0 bottom-14 z-30 border-t border-ink-200 bg-cream-50 p-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:pt-8">
            <div className="mx-auto flex max-w-page gap-3 md:justify-between">
              <Button variant="secondary" onClick={() => goTo(state.step - 1)} disabled={state.step === 0 || isSending} className="flex-1 md:flex-none">
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back
              </Button>
              <Button type="submit" loading={submission.status === "sending"} disabled={isSending} className="flex-[2] md:flex-none">
                {isReview ? "Send my quote request" : "Continue"}
                {isReview ? null : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
              </Button>
            </div>
          </div>
        </form>
        <DesktopSummary selection={selection} estimate={estimate} />
      </div>
    </div>
  );
}

export default function Quote() {
  const { slug } = useParams();
  return <QuoteWizard key={slug ?? "none"} slug={slug} />;
}
