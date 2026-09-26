export {};

declare global {
  interface Window {
    DodoCheckout?: {
      open: (options: {
        productId: string;
        productName?: string;
        amount?: number;
        onError?: (error: { code: string; message: string }) => void;
        onSuccess?: (result: { sessionId: string; message: string }) => void;
      }) => { close: () => void };
    };
  }
}
