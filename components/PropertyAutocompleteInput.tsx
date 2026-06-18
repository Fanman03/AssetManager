'use client';

import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type PropertyAutocompleteInputProps = {
  id: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  wrapperClassName?: string;
  onValueChange: (value: string) => void;
};

export default function PropertyAutocompleteInput({
  id,
  name,
  value,
  options,
  placeholder,
  wrapperClassName = '',
  onValueChange,
}: PropertyAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({});
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    const matches = query
      ? options.filter(option => option.toLowerCase().includes(query))
      : options;

    return matches.slice(0, 10);
  }, [options, value]);

  const showMenu = isOpen && filteredOptions.length > 0;

  React.useEffect(() => {
    if (!showMenu) return;

    const updateMenuPosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;

      const maxHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < maxHeight && spaceAbove > spaceBelow;

      setMenuPosition({
        left: rect.left,
        width: rect.width,
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
        position: 'fixed',
        zIndex: 1050,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top }
          : { top: rect.bottom }),
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [showMenu]);

  return (
    <div className={`position-relative ${wrapperClassName}`.trim()}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
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
      {showMenu && createPortal(
        <ul
          id={`${id}-options`}
          className="dropdown-menu show shadow-sm"
          style={menuPosition}
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
        </ul>,
        document.body
      )}
    </div>
  );
}
