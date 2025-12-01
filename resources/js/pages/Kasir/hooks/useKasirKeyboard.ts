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
        const handleKeyDown = (e: KeyboardEvent) => {
            const blockedKeys = [
                'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10',
            ];

            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' && showSearchResults) {
                e.preventDefault();
                onArrowUp();
            }

            if (e.key === 'ArrowDown' && showSearchResults) {
                e.preventDefault();
                onArrowDown();
            }

            if (e.key === 'Tab' && selectedItems.length > 0 && !showSearchResults && !showQtyModal) {
                e.preventDefault();
                onTab();
            }

            if (e.key === 'Enter' && showSearchResults) {
                e.preventDefault();
                onEnter();
            }

            if (e.key === 'Enter' && showQtyModal) {
                e.preventDefault();
            }

            if (e.key === 'Backspace') {
                if (document.activeElement !== inputRef.current && !showSearchResults && !showQtyModal && !showDiskonModal && !showKomplemenModal && !showPaymentModal) {
                    onBackspace();
                }
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                onEscape();
            }

            if (e.key === 'Delete') {
                e.preventDefault();
                onDelete();
            }

            if (e.key === 'F5') {
                e.preventDefault();
                onF5();
            }

            if (e.key === 'F7') {
                e.preventDefault();
                onF7();
            }

            if (e.key === 'F8') {
                e.preventDefault();
                onF8();
            }

            if (e.key === 'F9') {
                e.preventDefault();
                onF9();
            }

            if (e.key === 'PageUp') {
                e.preventDefault();
                onPageUp();
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
