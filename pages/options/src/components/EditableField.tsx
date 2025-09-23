import { useState, useRef, useEffect } from 'react';
import { FaRegEdit } from 'react-icons/fa';

interface EditableFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  masked?: boolean; // 是否需要脱敏
  placeholder?: string;
  onSave?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const maskValue = (value: string): string => {
  if (!value) {
    return '';
  }
  return '•'.repeat(value.length);
};

const EditableField = ({ label, id, value, onChange, masked = false, placeholder, onSave }: EditableFieldProps) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditing(false);
    }
    onSave?.(e);
  };

  return (
    <div className="flex h-8 items-center space-x-6 text-sm">
      <label className="flex h-full w-24 items-center border-b border-gray-300 font-medium text-gray-700" htmlFor={id}>
        {label}:
      </label>
      <div className="relative flex h-full flex-1 items-center border-b border-gray-300">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={editing || !masked ? value : maskValue(value)}
          placeholder={placeholder}
          readOnly={!editing}
          className={`max-w-[calc(100%-1.5rem)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap border-0 px-0 text-sm focus:outline-none focus:ring-0 ${
            editing ? 'bg-white text-gray-700' : 'cursor-pointer bg-transparent text-gray-400'
          }`}
          onClick={() => !editing && setEditing(true)}
          onKeyDown={handleSave}
          onBlur={() => setEditing(false)}
          onChange={e => onChange(e.target.value)}
        />
        {!editing && (
          <FaRegEdit
            className="absolute right-0 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => setEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default EditableField;
