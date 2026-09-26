type CheckoutCloseReason = "user" | "escape" | "overlay" | "programmatic";

type CheckoutError = {
  code: string;
  message: string;
};

type CheckoutOptions = {
  productId: string;
  productName?: string;
  amount?: number;
  checkoutUrl?: string;
  onSuccess?: (result: { sessionId: string; message: string }) => void;
  onClose?: (result: { reason: CheckoutCloseReason }) => void;
  onError?: (error: CheckoutError) => void;
};

type CheckoutHandle = {
  close: () => void;
};

type CheckoutApi = {
  open: (options: CheckoutOptions) => CheckoutHandle;
};

type CheckoutMessage = {
  source: "dodo-checkout";
  type: string;
  sessionId?: unknown;
  reason?: unknown;
  code?: unknown;
  message?: unknown;
  ready?: unknown;
};

interface Window {
  DodoCheckout: CheckoutApi;
}

declare const DodoCheckout: CheckoutApi;

const DEFAULT_CHECKOUT_URL = "http://localhost:3000";
const CLOSE_REASONS: CheckoutCloseReason[] = [
  "user",
  "escape",
  "overlay",
  "programmatic",
];
const READY_TIMEOUT_MS = 15000;

const api: CheckoutApi = {
  open(options) {
    const reportError = (code: string, message: string) => {
      options.onError?.({ code, message });
    };

    if (!options.productId?.trim()) {
      reportError(
        "INVALID_PRODUCT_ID",
        "A productId is required to open checkout.",
      );
      return { close: () => undefined };
    }

    let checkoutUrl: URL;
    try {
      checkoutUrl = new URL(
        options.checkoutUrl ??
          document.currentScript?.getAttribute("data-checkout-url") ??
          DEFAULT_CHECKOUT_URL,
        window.location.href,
      );
    } catch {
      reportError(
        "INVALID_CHECKOUT_URL",
        "The checkout URL is not a valid URL.",
      );
      return { close: () => undefined };
    }

    if (
      checkoutUrl.protocol !== "https:" &&
      !(
        checkoutUrl.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(checkoutUrl.hostname)
      )
    ) {
      reportError(
        "INSECURE_CHECKOUT_URL",
        "Checkout must be served over HTTPS.",
      );
      return { close: () => undefined };
    }

    checkoutUrl.searchParams.set("productId", options.productId.trim());

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const overlay = document.createElement("div");
    const frame = document.createElement("iframe");
    let isOpen = true;
    let isReady = false;
    let readyTimeout: number | undefined;

    overlay.setAttribute("aria-label", "Checkout");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      display: "grid",
      placeItems: "center",
      padding: "16px",
      background: "rgba(0, 0, 0, 0.55)",
    });

    frame.title = "Secure checkout";
    frame.src = checkoutUrl.toString();
    frame.setAttribute("allow", "payment");
    frame.setAttribute(
      "sandbox",
      "allow-forms allow-scripts allow-same-origin",
    );
    Object.assign(frame.style, {
      width: "min(100%, 480px)",
      height: "min(720px, 100%)",
      border: "0",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
    });
    overlay.append(frame);

    const cleanup = () => {
      if (!isOpen) return false;
      isOpen = false;
      if (readyTimeout !== undefined) {
        window.clearTimeout(readyTimeout);
        readyTimeout = undefined;
      }
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("keydown", handleKeydown);
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      return true;
    };

    const close = (reason: CheckoutCloseReason) => {
      if (cleanup()) options.onClose?.({ reason });
    };

    const handleMessage = (event: MessageEvent<CheckoutMessage>) => {
      if (
        event.origin !== checkoutUrl.origin ||
        event.source !== frame.contentWindow
      )
        return;
      const message = event.data;
      if (!message || message.source !== "dodo-checkout") return;

      if (message.type === "DODO_CHECKOUT_READY") {
        if (isReady) return;
        isReady = true;
        if (readyTimeout !== undefined) {
          window.clearTimeout(readyTimeout);
          readyTimeout = undefined;
        }
        frame.contentWindow?.postMessage(
          {
            source: "dodo-checkout-sdk",
            type: "DODO_CHECKOUT_INIT",
            productId: options.productId.trim(),
            productName: options.productName,
            amount: options.amount,
          },
          checkoutUrl.origin,
        );
      } else if (
        message.type === "DODO_CHECKOUT_SUCCESS" &&
        typeof message.sessionId === "string"
      ) {
        if (cleanup()) {
          options.onSuccess?.({
            sessionId: message.sessionId,
            message:
              typeof message.message === "string"
                ? message.message
                : "Payment successful.",
          });
        }
      } else if (message.type === "DODO_CHECKOUT_CLOSE") {
        const reason = CLOSE_REASONS.includes(
          message.reason as CheckoutCloseReason,
        )
          ? (message.reason as CheckoutCloseReason)
          : "user";
        close(reason);
      } else if (message.type === "DODO_CHECKOUT_ERROR") {
        reportError(
          typeof message.code === "string" ? message.code : "CHECKOUT_ERROR",
          typeof message.message === "string"
            ? message.message
            : "Checkout could not be completed.",
        );
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close("escape");
      if (event.key === "Tab" && !overlay.contains(document.activeElement)) {
        event.preventDefault();
        frame.focus();
      }
    };

    frame.addEventListener("error", () => {
      if (cleanup()) {
        reportError(
          "CHECKOUT_LOAD_FAILED",
          "The checkout could not be loaded.",
        );
      }
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close("overlay");
    });
    window.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";
    document.body.append(overlay);
    frame.focus();
    readyTimeout = window.setTimeout(() => {
      if (cleanup()) {
        reportError(
          "CHECKOUT_READY_TIMEOUT",
          "The checkout took too long to become ready. Please try again.",
        );
      }
    }, READY_TIMEOUT_MS);

    return { close: () => close("programmatic") };
  },
};

window.DodoCheckout = api;
