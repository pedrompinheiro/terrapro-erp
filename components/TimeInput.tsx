import React, { useRef, useCallback } from 'react';

interface TimeInputProps {
    value: string | null;
    onChange: (value: string) => void;
    onBlurSave?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    tabIndex?: number;
    dark?: boolean;
}

/**
 * TimeInput - Input com máscara HH:MM para lançamento rápido de horários
 *
 * Funcionalidades:
 * - Aceita apenas números
 * - Auto-insere ":" após 2 dígitos
 * - Valida horas (00-23) e minutos (00-59)
 * - Auto-avança para próximo campo ao completar (Tab automático)
 * - Seleciona tudo ao focar (facilita sobrescrever)
 * - Aceita colar "0730" ou "07:30"
 * - Backspace inteligente (remove ":" junto se necessário)
 */
const TimeInput: React.FC<TimeInputProps> = ({
    value,
    onChange,
    onBlurSave,
    placeholder = '--:--',
    disabled = false,
    className = '',
    tabIndex,
    dark = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Formata valor bruto para HH:MM
    const formatTime = useCallback((raw: string): string => {
        // Remove tudo que não é número
        const digits = raw.replace(/\D/g, '').slice(0, 4);

        if (digits.length === 0) return '';
        if (digits.length <= 2) return digits;

        const hh = digits.slice(0, 2);
        const mm = digits.slice(2);
        return `${hh}:${mm}`;
    }, []);

    // Valida e corrige o valor final
    const validateTime = useCallback((formatted: string): string | null => {
        if (!formatted || formatted === ':') return null;

        const parts = formatted.split(':');
        if (parts.length !== 2) return null;

        let hh = parseInt(parts[0], 10);
        let mm = parseInt(parts[1], 10);

        if (isNaN(hh) || isNaN(mm)) return null;

        // Clamp valores
        hh = Math.min(Math.max(hh, 0), 23);
        mm = Math.min(Math.max(mm, 0), 59);

        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }, []);

    // Avança para próximo input focável
    const advanceToNext = useCallback(() => {
        const el = inputRef.current;
        if (!el) return;

        // Busca próximo input tabbable
        const form = el.closest('table') || el.closest('form') || document.body;
        const inputs = Array.from(form.querySelectorAll<HTMLInputElement>(
            'input[type="text"]:not([disabled])'
        ));
        const currentIdx = inputs.indexOf(el);
        if (currentIdx >= 0 && currentIdx < inputs.length - 1) {
            const next = inputs[currentIdx + 1];
            next.focus();
            next.select();
        }
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatTime(raw);

        // Se completou 5 chars (HH:MM), valida e avança
        if (formatted.length === 5) {
            const validated = validateTime(formatted);
            onChange(validated || '');
            // Avança após render
            setTimeout(advanceToNext, 30);
        } else {
            onChange(formatted);
        }
    }, [formatTime, validateTime, onChange, advanceToNext]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const val = input.value;

        // Backspace: se cursor está logo depois do ":", remove o ":" também
        if (e.key === 'Backspace' && val.length === 3 && val[2] === ':') {
            e.preventDefault();
            onChange(val.slice(0, 2));
            return;
        }

        // Enter: valida e avança
        if (e.key === 'Enter') {
            e.preventDefault();
            if (val.length >= 4) {
                const validated = validateTime(formatTime(val));
                if (validated) onChange(validated);
            }
            advanceToNext();
            return;
        }

        // Tab sem valor: limpar
        if (e.key === 'Tab' && val && val.length < 5) {
            const validated = validateTime(formatTime(val));
            onChange(validated || '');
        }

        // Escape: limpar campo
        if (e.key === 'Escape') {
            onChange('');
            input.blur();
        }
    }, [onChange, formatTime, validateTime, advanceToNext]);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim();
        const formatted = formatTime(pasted);
        const validated = validateTime(formatted);
        onChange(validated || formatted);
        if (validated) {
            setTimeout(advanceToNext, 30);
        }
    }, [formatTime, validateTime, onChange, advanceToNext]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        // Seleciona tudo ao focar pra facilitar sobrescrever
        e.target.select();
    }, []);

    const handleBlur = useCallback(() => {
        // Valida ao sair do campo
        const val = inputRef.current?.value || '';
        if (val && val.length >= 3) {
            const validated = validateTime(formatTime(val));
            onChange(validated || '');
        } else if (val && val.length < 3) {
            onChange('');
        }
        // Callback externo (ex: salvar no banco)
        if (onBlurSave) {
            setTimeout(onBlurSave, 50);
        }
    }, [formatTime, validateTime, onChange, onBlurSave]);

    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={5}
            tabIndex={tabIndex}
            className={`w-16 px-1.5 py-1 text-center text-xs font-mono rounded border transition-colors outline-none ${
                dark
                    ? (value
                        ? 'border-slate-600 bg-transparent text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:bg-slate-800'
                        : 'border-transparent bg-transparent text-slate-500 focus:border-slate-600 focus:bg-slate-800 focus:text-white')
                    : (value
                        ? 'border-slate-200 bg-white text-slate-700 focus:border-violet-400 focus:ring-1 focus:ring-violet-200'
                        : 'border-transparent bg-transparent text-slate-300 focus:border-slate-300 focus:bg-white focus:text-slate-700')
            } ${className}`}
        />
    );
};

export default TimeInput;
