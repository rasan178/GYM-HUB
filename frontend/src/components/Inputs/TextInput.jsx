const TextInput = ({ label, name, value, onChange, type = 'text', required = false }) => {
  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="input input-bordered"
        required={required}
      />
    </div>
  );
};

export default TextInput;