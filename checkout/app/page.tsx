"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useModal, type ModalCloseReason } from "@/app/useModal";

type CheckoutMessage = {
  source?: unknown;
  type?: unknown;
  productId?: unknown;
  productName?: unknown;
  amount?: unknown;
};

const SUCCESS_CARD = "4242424242424242";
const DECLINED_CARD = "4000000000000002";
const RETRY_CARD = "4000000000000341";
const SUCCESS_MESSAGE = "Payment successful.";

const inputClassName =
  "h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2.5 text-base text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function makeSessionId() {
  return `cs_test_${Date.now().toString(36)}`;
}

export default function Home() {
  const [productId, setProductId] = useState("prod_234");
  const [productName, setProductName] = useState("Studio Camera");
  const [amount, setAmount] = useState<number | null>(189);
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const parentOrigin = useRef("");
  const failedRetryCard = useRef(false);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<number | undefined>(undefined);

  const handleModalClose = (reason: ModalCloseReason) => {
    if (processingTimeoutRef.current !== undefined) {
      window.clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = undefined;
    }
    isProcessingRef.current = false;

    if (window.parent !== window && parentOrigin.current) {
      window.parent.postMessage(
        { source: "dodo-checkout", type: "DODO_CHECKOUT_CLOSE", reason },
        parentOrigin.current,
      );
    }
  };

  const { isOpen, closeModal, dialogRef } = useModal(handleModalClose);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<CheckoutMessage>) => {
      if (
        event.source !== window.parent ||
        !event.data ||
        event.data.source !== "dodo-checkout-sdk" ||
        event.data.type !== "DODO_CHECKOUT_INIT"
      ) {
        return;
      }

      parentOrigin.current = event.origin;
      if (typeof event.data.productId === "string" && event.data.productId) {
        setProductId(event.data.productId);
        if (
          typeof event.data.productName !== "string" ||
          !event.data.productName
        ) {
          setProductName(event.data.productId);
        }
      }
      if (
        typeof event.data.productName === "string" &&
        event.data.productName
      ) {
        setProductName(event.data.productName);
      }
      if (
        typeof event.data.amount === "number" &&
        Number.isFinite(event.data.amount) &&
        event.data.amount >= 0
      ) {
        setAmount(event.data.amount);
      } else {
        setAmount(null);
      }
    };

    window.addEventListener("message", handleMessage);
    if (window.parent !== window) {
      window.parent.postMessage(
        { source: "dodo-checkout", type: "DODO_CHECKOUT_READY" },
        "*",
      );
    }
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const notifyParentError = (code: string, message: string) => {
    if (window.parent !== window && parentOrigin.current) {
      window.parent.postMessage(
        { source: "dodo-checkout", type: "DODO_CHECKOUT_ERROR", code, message },
        parentOrigin.current,
      );
    }
  };

  const notifyParentSuccess = (newSessionId: string) => {
    if (window.parent !== window && parentOrigin.current) {
      window.parent.postMessage(
        {
          source: "dodo-checkout",
          type: "DODO_CHECKOUT_SUCCESS",
          sessionId: newSessionId,
          message: SUCCESS_MESSAGE,
        },
        parentOrigin.current,
      );
    }
  };

  const runProcessing = (complete: () => void, delay = 550) => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setErrorMessage("");
    processingTimeoutRef.current = window.setTimeout(() => {
      processingTimeoutRef.current = undefined;
      isProcessingRef.current = false;
      setIsProcessing(false);
      complete();
    }, delay);
  };

  const handlePay = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isProcessingRef.current) return;

    runProcessing(() => {
      const digits = cardNumber.replace(/\D/g, "");

      if (digits === DECLINED_CARD) {
        const message = "This card was declined. Try another card.";
        setErrorMessage(message);
        notifyParentError("CARD_DECLINED", message);
        return;
      }

      if (digits === RETRY_CARD && !failedRetryCard.current) {
        failedRetryCard.current = true;
        const message = "Payment failed temporarily. Please try again.";
        setErrorMessage(message);
        notifyParentError("PAYMENT_RETRY_REQUIRED", message);
        return;
      }

      if (digits !== SUCCESS_CARD && digits !== RETRY_CARD) {
        const message = "Card number not recognized by the test checkout.";
        setErrorMessage(message);
        notifyParentError("CARD_NOT_SUPPORTED", message);
        return;
      }

      const newSessionId = makeSessionId();
      setSessionId(newSessionId);
      notifyParentSuccess(newSessionId);
    });
  };

  const formattedAmount =
    amount === null
      ? null
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

  return (
    <main
      className="grid min-h-dvh place-items-center bg-slate-300/20 p-3"
      onClick={(event) => {
        if (event.target === event.currentTarget && isOpen) {
          closeModal("overlay");
        }
      }}
    >
      {isOpen && (
        <section
          aria-label="Secure checkout"
          aria-modal="true"
          aria-labelledby="checkout-title"
          className="checkout-dialog flex max-h-[calc(100dvh-24px)] w-[540px] max-w-[calc(100vw-24px)] flex-col overflow-y-auto overscroll-contain rounded-[10px] bg-white p-5 shadow-xl"
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
        >
          <header className="flex shrink-0 items-center justify-between gap-3">
            <h1
              className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl"
              id="checkout-title"
            >
              Complete your purchase
            </h1>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
              Test mode
            </span>
          </header>

          <section
            aria-label="Order summary"
            className="mt-3 flex shrink-0 items-center justify-between gap-3 border-y border-gray-200 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {productName}
              </p>
              <p className="text-xs text-gray-500">{productId}</p>
            </div>
            {formattedAmount && (
              <p className="shrink-0 text-base font-bold text-gray-900">
                {formattedAmount}
              </p>
            )}
          </section>

          {sessionId ? (
            <div className="checkout-state flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Payment complete
              </h2>
              <p className="text-base font-medium text-green-700">
                {SUCCESS_MESSAGE}
              </p>
              <p className="text-base text-gray-600">Session {sessionId}</p>
              <button
                className="mt-1 text-base font-medium text-blue-600 underline underline-offset-2"
                onClick={() => closeModal("user")}
                type="button"
              >
                Close checkout
              </button>
            </div>
          ) : (
            <form className="mt-3 flex flex-col gap-2" onSubmit={handlePay}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <label className="min-w-0 text-xs font-medium text-gray-600">
                  Email
                  <input
                    autoComplete="email"
                    className={`${inputClassName} mt-1`}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </label>
              </div>

              <label className="min-w-0 text-xs font-medium text-gray-600">
                Card number
                <input
                  autoComplete="cc-number"
                  className={`${inputClassName} mt-1 font-bold`}
                  inputMode="numeric"
                  onChange={(event) =>
                    setCardNumber(formatCardNumber(event.target.value))
                  }
                  pattern="[0-9 ]{19}"
                  placeholder="0000 0000 0000 0000"
                  required
                  value={cardNumber}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0 text-xs font-medium text-gray-600">
                  Expiry
                  <input
                    autoComplete="cc-exp"
                    aria-describedby={expiryError ? "expiry-error" : undefined}
                    aria-invalid={Boolean(expiryError)}
                    className={`${inputClassName} mt-1 px-2 text-center font-bold`}
                    inputMode="numeric"
                    maxLength={5}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setExpiry(
                        digits.length > 2
                          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                          : digits,
                      );
                      if (digits) setExpiryError("");
                    }}
                    onBlur={() =>
                      setExpiryError(expiry ? "" : "Enter an expiration date.")
                    }
                    onInvalid={() =>
                      setExpiryError("Enter an expiration date.")
                    }
                    pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                    placeholder="MM/YY"
                    required
                    value={expiry}
                  />
                  <span
                    className="mt-1 block min-h-4 text-red-700"
                    id="expiry-error"
                    role={expiryError ? "alert" : undefined}
                  >
                    {expiryError}
                  </span>
                </label>
                <label className="min-w-0 text-xs font-medium text-gray-600">
                  CVV
                  <input
                    autoComplete="cc-csc"
                    aria-describedby={cvvError ? "cvv-error" : undefined}
                    aria-invalid={Boolean(cvvError)}
                    className={`${inputClassName} mt-1 px-2 text-center font-bold`}
                    inputMode="numeric"
                    maxLength={4}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setCvv(digits);
                      if (digits) setCvvError("");
                    }}
                    onBlur={() =>
                      setCvvError(cvv ? "" : "Enter your security code.")
                    }
                    onInvalid={() => setCvvError("Enter your security code.")}
                    pattern="[0-9]{3,4}"
                    placeholder="CVV"
                    required
                    value={cvv}
                  />
                  <span
                    className="mt-1 block min-h-4 text-red-700"
                    id="cvv-error"
                    role={cvvError ? "alert" : undefined}
                  >
                    {cvvError}
                  </span>
                </label>
              </div>

              <details className="text-xs text-gray-600">
                <summary className="w-fit cursor-pointer font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  Test card scenarios
                </summary>
                <ul className="mt-1 grid gap-1 pl-4">
                  <li>4242 4242 4242 4242: successful payment</li>
                  <li>4000 0000 0000 0002: declined payment</li>
                  <li>4000 0000 0000 0341: fails once, then succeeds</li>
                </ul>
              </details>

              <div
                aria-atomic="true"
                className="min-h-4 text-xs text-red-700"
                role="alert"
              >
                {errorMessage}
              </div>

              <button
                className="h-10 w-full rounded-md bg-blue-600 text-base font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-70"
                disabled={isProcessing}
                type="submit"
              >
                {isProcessing ? "Processing..." : "Pay"}
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
