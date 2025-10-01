import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import Modal from '../../components/Modal';
import TextInput from '../../components/Inputs/TextInput';
import SelectInput from '../../components/Inputs/SelectInput';
import FileInput from '../../components/Inputs/FileInput';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';

const AdminClasses = () => {
  const { error } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelDate, setCancelDate] = useState('');
  const [cancelClassId, setCancelClassId] = useState('');
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    trainerID: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    capacity: '',
    location: '',
    price: '',
    category: '',
    level: 'Beginner'
  });
  const [files, setFiles] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_ALL);
      setClasses(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data.map(t => ({ value: t._id, label: t.trainerName })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      return { ...prev, schedule: newSchedule };
    });
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: '', startTime: '', endTime: '' }]
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const createOrUpdate = async () => {
    setIsSubmitting(true);
    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'schedule') {
        fd.append(key, JSON.stringify(formData[key]));
      } else {
        fd.append(key, formData[key]);
      }
    });
    if (files.length > 0) {
      files.forEach(file => fd.append('images', file));
    }
    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.CLASSES.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.ADMIN.CLASSES.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({ className: '', description: '', trainerID: '', schedule: [{ day: '', startTime: '', endTime: '' }], capacity: '', location: '', price: '', category: '', level: 'Beginner' });
      setFiles([]);
      fetchClasses();
      setLocalError(null);
      alert('Class saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteClass = async id => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.CLASSES.DELETE(id));
      fetchClasses();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelClass = async () => {
    setIsSubmitting(true);
    try {
      await api.post(API_PATHS.ADMIN.CLASSES.CANCEL_DATE(cancelClassId), { date: cancelDate });
      setIsCancelModalOpen(false);
      setCancelDate('');
      setCancelClassId('');
      fetchClasses();
      setLocalError(null);
      alert('Class cancelled successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to cancel class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateClass = async (id, date) => {
    setIsSubmitting(true);
    try {
      await api.post(API_PATHS.ADMIN.CLASSES.ACTIVATE_DATE(id), { date });
      fetchClasses();
      setLocalError(null);
      alert('Class activated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to activate class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const edit = c => {
    setFormData({
      _id: c._id,
      className: c.className,
      description: c.description,
      trainerID: c.trainerID?._id || '',
      schedule: c.schedule || [{ day: '', startTime: '', endTime: '' }],
      capacity: c.capacity,
      location: c.location,
      price: c.price,
      category: c.category,
      level: c.level || 'Beginner'
    });
    setFiles([]);
    setIsModalOpen(true);
  };

  if (isLoading) return <BlackSkeletonLoader lines={12} />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Classes</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <button
        className="btn btn-primary mb-4"
        onClick={() => { setFormData({ className: '', description: '', trainerID: '', schedule: [{ day: '', startTime: '', endTime: '' }], capacity: '', location: '', price: '', category: '', level: 'Beginner' }); setFiles([]); setIsModalOpen(true); }}
      >
        Create Class
      </button>
      <table className="table w-full">
        <thead><tr><th>Name</th><th>Trainer</th><th>Actions</th></tr></thead>
        <tbody>
          {classes.map(c => (
            <tr key={c._id}>
              <td>{c.className}</td>
              <td>{c.trainer.trainerName || 'N/A'}</td>
              <td>
                <button className="btn btn-sm btn-primary mr-2" onClick={() => edit(c)}>Edit</button>
                <button className="btn btn-sm btn-error mr-2" onClick={() => deleteClass(c._id)}>Delete</button>
                <button className="btn btn-sm btn-warning" onClick={() => { setCancelClassId(c._id); setIsCancelModalOpen(true); }}>Cancel Date</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TextInput label="Name" name="className" value={formData.className} onChange={handleChange} required />
        <TextInput label="Description" name="description" value={formData.description} onChange={handleChange} />
        <SelectInput label="Trainer" name="trainerID" options={trainers} value={formData.trainerID} onChange={handleChange} required />
        <div className="form-control mb-4">
          <label className="label"><span className="label-text">Schedule</span></label>
          {formData.schedule.map((slot, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <TextInput
                label="Day"
                name={`day-${index}`}
                value={slot.day}
                onChange={e => handleScheduleChange(index, 'day', e.target.value)}
              />
              <TextInput
                label="Start Time"
                type="time"
                name={`startTime-${index}`}
                value={slot.startTime}
                onChange={e => handleScheduleChange(index, 'startTime', e.target.value)}
              />
              <TextInput
                label="End Time"
                type="time"
                name={`endTime-${index}`}
                value={slot.endTime}
                onChange={e => handleScheduleChange(index, 'endTime', e.target.value)}
              />
              {formData.schedule.length > 1 && (
                <button className="btn btn-sm btn-error mt-8" onClick={() => removeScheduleSlot(index)}>Remove</button>
              )}
            </div>
          ))}
          <button className="btn btn-sm btn-secondary mt-2" onClick={addScheduleSlot}>Add Schedule</button>
        </div>
        <TextInput label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} required />
        <TextInput label="Location" name="location" value={formData.location} onChange={handleChange} />
        <TextInput label="Price" name="price" value={formData.price} onChange={handleChange} required />
        <TextInput label="Category" name="category" value={formData.category} onChange={handleChange} />
        <SelectInput
          label="Level"
          name="level"
          options={[{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]}
          value={formData.level}
          onChange={handleChange}
        />
        <FileInput label="Images" name="images" onChange={e => setFiles(Array.from(e.target.files))} multiple />
        <button
          className="btn btn-primary mt-4"
          onClick={createOrUpdate}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Save'}
        </button>
      </Modal>
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
        <TextInput
          label="Cancel Date"
          type="date"
          name="cancelDate"
          value={cancelDate}
          onChange={e => setCancelDate(e.target.value)}
          required
        />
        <button
          className="btn btn-warning mt-4"
          onClick={cancelClass}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Cancel Class'}
        </button>
      </Modal>
    </AdminLayout>
  );
};

export default AdminClasses;