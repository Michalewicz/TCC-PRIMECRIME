import { useEffect, useRef, useState } from 'react';

/**
 * Checkbox-based dropdown supporting multiple selections.
 * `options` is an array of { value, label }; `values` is the array of selected values.
 */
function MultiSelectDropdown({ id, label, placeholder, options, values, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleValue = (value) => {
    const stringValue = String(value);
    const next = values.includes(stringValue)
      ? values.filter((v) => v !== stringValue)
      : [...values, stringValue];
    onChange(next);
  };

  const summary =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? options.find((o) => String(o.value) === values[0])?.label ?? `${values.length} selecionado(s)`
        : `${values.length} selecionados`;

  return (
    <div className="multi-select" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <button
        id={id}
        type="button"
        className="multi-select-trigger"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{summary}</span>
        <span className="multi-select-caret">▾</span>
      </button>

      {open && (
        <div className="multi-select-panel" role="listbox">
          {values.length > 0 && (
            <button type="button" className="multi-select-clear" onClick={() => onChange([])}>
              Limpar seleção
            </button>
          )}
          {options.length === 0 && <p className="multi-select-empty">Nenhuma opção disponível</p>}
          {options.map(({ value, label: optionLabel }) => {
            const stringValue = String(value);
            const checked = values.includes(stringValue);
            return (
              <label key={stringValue} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleValue(stringValue)}
                />
                {optionLabel}
              </label>
            );
          })}
          {values.length > 0 && (
            <button type="button" className="multi-select-clear multi-select-clear-bottom" onClick={() => onChange([])}>
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
