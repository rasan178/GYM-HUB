import { Upload } from "lucide-react";

const FileInput = ({ label, name, onChange, multiple = false }) => {
  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text text-black font-medium">{label}</span>
      </label>
      <div className="relative">
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="file-input file-input-bordered border-black bg-white text-black hover:bg-gray-50 focus:border-black focus:ring-0"
          accept="image/jpeg,image/png,image/jpg"
          multiple={multiple}
        />
        <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black pointer-events-none" />
      </div>
    </div>
  );
};

export default FileInput;