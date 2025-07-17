import React from 'react';

const models = ['default-model', 'finetuned-1', 'finetuned-2'];

const ModelSwitcher = ({ model, onChange }) => (
  <select
    className="border p-2 rounded"
    style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-color)'
    }}
    value={model}
    onChange={(e) => onChange(e.target.value)}
  >
    {models.map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ))}
  </select>
);

export default ModelSwitcher;