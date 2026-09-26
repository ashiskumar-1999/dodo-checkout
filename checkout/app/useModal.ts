"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ModalCloseReason = "user" | "escape" | "overlay";

export function useModal(
  onClose: (reason: ModalCloseReason) => void,
  initiallyOpen = true,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const isOpenRef = useRef(initiallyOpen);
  const onCloseRef = useRef(onClose);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const openModal = useCallback(() => {
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((reason: ModalCloseReason = "user") => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setIsOpen(false);
    onCloseRef.current(reason);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialog = dialogRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      dialog?.querySelectorAll<HTMLElement>(focusableSelector);
    (focusableElements?.[0] ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal("escape");
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const elements = dialog.querySelectorAll<HTMLElement>(focusableSelector);
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [closeModal, isOpen]);

  return { isOpen, openModal, closeModal, dialogRef };
}
