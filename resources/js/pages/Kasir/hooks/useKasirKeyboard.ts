import { useEffect, RefObject } from 'react';

interface UseKasirKeyboardProps {
    showSearchResults: boolean;
    searchResults: any[];
    selectedResult: any;
    selectedItems: any[];
    searchQuery: string;
    showQtyModal: boolean;
    showDiskonModal: boolean;
    showKomplemenModal: boolean;
    showPaymentModal: boolean;
    grandTotal: number;
    onArrowUp: () => void;
    onArrowDown: () => void;
    onTab: () => void;
    onEnter: () => void;
    onBackspace: () => void;
    onEscape: () => void;
    onDelete: () => void;
    onF5: () => void;
    onF7: () => void;
    onF8: () => void;
    onF9: () => void;
    onPageUp: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

export default function useKasirKeyboard({
    showSearchResults,
    searchResults,
    selectedResult,
    selectedItems,
    searchQuery,
    showQtyModal,
    showDiskonModal,
    showKomplemenModal,
    showPaymentModal,
    grandTotal,
    onArrowUp,
    onArrowDown,
    onTab,
    onEnter,
    onBackspace,
    onEscape,
    onDelete,
    onF5,
    onF7,
    onF8,
    onF9,
    onPageUp,
    inputRef
}: UseKasirKeyboardProps) {
    useEffect(() => {
        // Check if any modal is active (except search which is not a modal)
        const isModalActive = showQtyModal || showDiskonModal || showKomplemenModal || showPaymentModal;
        // Check if search results or input is focused
        const isSearchActive = showSearchResults || document.activeElement === inputRef.current;
        // Check if NO modal is active and NO search is active
        const isKeyboardShortcutsEnabled = !isModalActive && !isSearchActive;

        const handleKeyDown = (e: KeyboardEvent) => {
            // NEVER block keys when search is active or input is focused
            if (isSearchActive) {
                return; // Let all keys pass through for search/input
            }

            // Block default browser behavior only for specific keys when NO modal is active and NO search
            const blockedKeys = [
                'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10',
                'Delete', 'Backspace'
            ];

            // Only prevent default if not in modal and keyboard shortcuts enabled
            if (isKeyboardShortcutsEnabled && blockedKeys.includes(e.key)) {
                e.preventDefault();
            }

            // Always prevent Escape globally
            if (e.key === 'Escape') {
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Allow keys when search is active OR when NO modal is shown
            if (isSearchActive) {
                // Don't block any keys when search/input is active
                return;
            }

            if (isModalActive && !showSearchResults) {
                // Modal is active and it's not search - let modal handle its own keys
                return;
            }

            // If no modal is active, enable keyboard shortcuts
            if (isKeyboardShortcutsEnabled) {
                if (e.key === 'ArrowUp' && showSearchResults) {
                    e.preventDefault();
                    onArrowUp();
                }

                if (e.key === 'ArrowDown' && showSearchResults) {
                    e.preventDefault();
                    onArrowDown();
                }

                if (e.key === 'Tab' && selectedItems.length > 0 && !showSearchResults) {
                    e.preventDefault();
                    onTab();
                }

                if (e.key === 'Enter' && showSearchResults) {
                    e.preventDefault();
                    onEnter();
                }

                if (e.key === 'Backspace') {
                    if (document.activeElement !== inputRef.current && !showSearchResults) {
                        e.preventDefault();
                        onBackspace();
                    }
                }

                if (e.key === 'Escape') {
                    e.preventDefault();
                    onEscape();
                }

                if (e.key === 'Delete' && !showSearchResults) {
                    e.preventDefault();
                    onDelete();
                }

                if (e.key === 'F5' && !showSearchResults) {
                    e.preventDefault();
                    onF5();
                }

                if (e.key === 'F7' && !showSearchResults) {
                    e.preventDefault();
                    onF7();
                }

                if (e.key === 'F8' && !showSearchResults) {
                    e.preventDefault();
                    onF8();
                }

                if (e.key === 'F9' && !showSearchResults) {
                    e.preventDefault();
                    onF9();
                }

                if (e.key === 'PageUp' && !showSearchResults) {
                    e.preventDefault();
                    onPageUp();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [
        showSearchResults, searchResults, selectedResult, selectedItems, searchQuery,
        showQtyModal, showDiskonModal, showKomplemenModal, showPaymentModal, grandTotal,
        onArrowUp, onArrowDown, onTab, onEnter, onBackspace, onEscape, onDelete,
        onF5, onF7, onF8, onF9, onPageUp, inputRef
    ]);
}
