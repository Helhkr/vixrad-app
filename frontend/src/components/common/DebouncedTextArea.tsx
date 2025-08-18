import React, { useState, useEffect, useRef } from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface DebouncedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  debounceTime?: number;
  style?: React.CSSProperties; // Adicionado a propriedade style
}

export const DebouncedTextArea: React.FC<DebouncedTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  debounceTime = 300,
  style, // Adicionado aos props desestruturados
}) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const initialRender = useRef(true); // To prevent debounce on initial mount

  // Effect to synchronize local state with parent's value
  useEffect(() => {
    // Update local state only when the external 'value' prop changes
    setLocalValue(value);
  }, [value]); // Only depend on the external 'value' prop

  // Effect to debounce updates to the parent
  useEffect(() => {
    // Skip debounce on initial render to avoid immediate parent update
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceTime, onChange]); // Dependencies for debounced update

  return (
    <TextArea
      rows={rows}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      style={style} // Passa a propriedade style para o TextArea
    />
  );
};