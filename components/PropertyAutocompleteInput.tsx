'use client';

import React, { useMemo, useState } from 'react';

type PropertyAutocompleteInputProps = {
  id: string;
  name: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
};

export default function PropertyAutocompleteInput({
  id,
  name,
  value,
  options,
  onValueChange,
}: PropertyAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    const matches = query
      ? options.filter(option => option.toLowerCase().includes(query))
      : options;

    return matches.slice(0, 10);
  }, [options, value]);

  const showMenu = isOpen && filteredOptions.length > 0;

  return (
    <div className="position-relative">
      <input
        id={id}
        name={name}
        type="text"
        className="form-control"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
        role="combobox"
        aria-expanded={showMenu}
        aria-controls={`${id}-options`}
      />
      {showMenu && (
        <ul
          id={`${id}-options`}
          className="dropdown-menu show w-100 shadow-sm"
          style={{ maxHeight: '15rem', overflowY: 'auto', zIndex: 1050 }}
        >
          {filteredOptions.map(option => (
            <li key={option}>
              <button
                type="button"
                className="dropdown-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onValueChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
