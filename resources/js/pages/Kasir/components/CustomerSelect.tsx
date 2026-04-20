import { useRef } from 'react';
import AsyncSelect from 'react-select/async';
import type { StylesConfig, ActionMeta } from 'react-select';
import axios from '@/lib/axios';

export interface CustomerOption {
    value: string;
    label: string;
    is_staff?: number;
}

interface Props {
    value: CustomerOption | null;
    onChange: (option: CustomerOption | null) => void;
    onAddNew: () => void;
}

const selectStyles: StylesConfig<CustomerOption> = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'rgb(51 65 85 / 0.5)',
        borderColor: state.isFocused ? '#3b82f6' : '#475569',
        borderRadius: '0.5rem',
        boxShadow: state.isFocused ? '0 0 0 2px rgb(59 130 246 / 0.5)' : 'none',
        minHeight: '2.25rem',
        cursor: 'pointer',
        '&:hover': { borderColor: '#3b82f6' },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 0.5rem',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#fff',
        fontSize: '0.875rem',
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '0.875rem',
    }),
    input: (base) => ({
        ...base,
        color: '#fff',
        fontSize: '0.875rem',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#1e293b',
        border: '1px solid #475569',
        borderRadius: '0.5rem',
        zIndex: 60,
    }),
    menuList: (base) => ({
        ...base,
        padding: '0.25rem',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#2563eb'
            : state.isFocused
              ? '#334155'
              : 'transparent',
        color: '#fff',
        fontSize: '0.875rem',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        '&:active': { backgroundColor: '#1d4ed8' },
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '0.875rem',
    }),
    loadingMessage: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '0.875rem',
    }),
    clearIndicator: (base) => ({
        ...base,
        color: '#94a3b8',
        '&:hover': { color: '#f87171' },
        padding: '0 4px',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: '#94a3b8',
        '&:hover': { color: '#94a3b8' },
        padding: '0 4px',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
};

async function loadCustomers(inputValue: string): Promise<CustomerOption[]> {
    try {
        const res = await axios.get('/customer-search', { params: { q: inputValue } });
        return (res.data.data ?? []).map((c: { id: string; name: string; is_staff: number }) => ({
            value: c.id,
            label: c.name,
            is_staff: c.is_staff,
        }));
    } catch {
        return [];
    }
}

export default function CustomerSelect({ value, onChange, onAddNew }: Props) {
    const selectRef = useRef<any>(null);

    const handleChange = (option: CustomerOption | null, _meta: ActionMeta<CustomerOption>) => {
        onChange(option);
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex-1 min-w-0">
                <AsyncSelect<CustomerOption>
                    ref={selectRef}
                    value={value}
                    onChange={handleChange}
                    loadOptions={loadCustomers}
                    defaultOptions
                    cacheOptions
                    isClearable
                    placeholder="Pilih customer..."
                    noOptionsMessage={() => 'Customer tidak ditemukan'}
                    loadingMessage={() => 'Mencari...'}
                    styles={selectStyles}
                    classNamePrefix="cs"
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    menuPosition="fixed"
                />
            </div>
            <button
                type="button"
                onClick={onAddNew}
                title="Tambah customer baru"
                className="shrink-0 h-9 w-9 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}
