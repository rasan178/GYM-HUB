const FileInput = ({ label, name, onChange, multiple = false }) => {
  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="file-input file-input-bordered"
        accept="image/jpeg,image/png,image/jpg"
        multiple={multiple}
      />
    </div>
  );
};

export default FileInput;