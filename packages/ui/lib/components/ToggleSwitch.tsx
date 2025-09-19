interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch = ({ label, checked, onChange }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-normal">{label}</span>
    <button
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-500' : 'bg-gray-300'
      }`}
      onClick={() => onChange(!checked)}>
      <span
        className={`absolute inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  </div>
);
