import { useState, useRef, useEffect, useMemo } from 'react';

/**
 * SearchableSelect — lightweight searchable dropdown.
 *
 * Props:
 *  - options: [{ value, label, category? }]
 *  - value: current selected value
 *  - onChange: (value) => void
 *  - placeholder: search placeholder text
 *  - disabled: bool
 *  - grouped: if true, group options by category
 *  - groupLabels: { [category]: label } for grouped mode
 *  - id: for accessibility
 *  - error: bool for error styling
 */
export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Search...',
  disabled = false,
  grouped = false,
  groupLabels = {},
  id,
  error = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter((o) =>
      o.label.toLowerCase().includes(q) ||
      (o.value && o.value.toLowerCase().includes(q))
    );
  }, [options, query]);

  // Group filtered options by category if grouped mode
  const groupedFiltered = useMemo(() => {
    if (!grouped) return null;
    const groups = {};
    const ungrouped = [];
    for (const opt of filtered) {
      const cat = opt.category;
      if (cat && groupLabels[cat]) {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(opt);
      } else {
        ungrouped.push(opt);
      }
    }
    return { groups, ungrouped };
  }, [filtered, grouped, groupLabels]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  const baseClass = 'searchable-select__display';
  const errorClass = error ? `${baseClass}--error` : '';

  return (
    <div className="searchable-select" ref={containerRef}>
      <div
        className={`${baseClass} ${errorClass}`}
        onClick={() => !disabled && setOpen(!open)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        id={id}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setOpen(!open);
          }
        }}
      >
        <span className={selected ? 'searchable-select__value' : 'searchable-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="searchable-select__arrow" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </div>

      {open && (
        <div className="searchable-select__dropdown">
          <input
            ref={inputRef}
            type="text"
            className="searchable-select__search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
          <div className="searchable-select__options">
            {groupedFiltered ? (
              <>
                {Object.entries(groupedFiltered.groups).map(([cat, opts]) => (
                  <div key={cat} className="searchable-select__group">
                    <div className="searchable-select__group-label">
                      {groupLabels[cat] || cat}
                    </div>
                    {opts.map((opt) => (
                      <div
                        key={opt.value}
                        className={`searchable-select__option ${
                          opt.value === value ? 'searchable-select__option--selected' : ''
                        }`}
                        onClick={() => handleSelect(opt.value)}
                        role="option"
                        aria-selected={opt.value === value}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                ))}
                {groupedFiltered.ungrouped.length > 0 && (
                  <div className="searchable-select__group">
                    {groupedFiltered.ungrouped.map((opt) => (
                      <div
                        key={opt.value}
                        className={`searchable-select__option ${
                          opt.value === value ? 'searchable-select__option--selected' : ''
                        }`}
                        onClick={() => handleSelect(opt.value)}
                        role="option"
                        aria-selected={opt.value === value}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`searchable-select__option ${
                    opt.value === value ? 'searchable-select__option--selected' : ''
                  }`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={opt.value === value}
                >
                  {opt.label}
                </div>
              ))
            )}
            {filtered.length === 0 && (
              <div className="searchable-select__no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
