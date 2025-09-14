const SelectInput = ({ label, name, options, value, onChange }) => {
  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="select select-bordered"
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;