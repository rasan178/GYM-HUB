import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import Modal from '../../components/Modal';
import TextInput from '../../components/Inputs/TextInput';
import FileInput from '../../components/Inputs/FileInput';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    trainerName: '',
    email: '',
    specialty: '',
    experience: '',
    qualifications: '',
    bio: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    contactInfo: { phone: '', address: '' },
    socialLinks: { facebook: '', instagram: '', linkedin: '' }
  });
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
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
    fd.append('trainerName', formData.trainerName);
    fd.append('email', formData.email);
    fd.append('specialty', formData.specialty);
    fd.append('experience', formData.experience);
    fd.append('qualifications', formData.qualifications);
    fd.append('bio', formData.bio);
    fd.append('schedule', JSON.stringify(formData.schedule));
    fd.append('contactInfo', JSON.stringify(formData.contactInfo));
    fd.append('socialLinks', JSON.stringify(formData.socialLinks));
    if (file) fd.append('image', file);
    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.TRAINERS.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.ADMIN.TRAINERS.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({
        trainerName: '',
        email: '',
        specialty: '',
        experience: '',
        qualifications: '',
        bio: '',
        schedule: [{ day: '', startTime: '', endTime: '' }],
        contactInfo: { phone: '', address: '' },
        socialLinks: { facebook: '', instagram: '', linkedin: '' }
      });
      setFile(null);
      fetchTrainers();
      setLocalError(null);
      alert('Trainer saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTrainer = async (id) => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.TRAINERS.DELETE(id));
      fetchTrainers();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const edit = t => {
    setFormData({
      _id: t._id,
      trainerName: t.trainerName,
      email: t.email,
      specialty: t.specialty.join(', '),
      experience: t.experience,
      qualifications: t.qualifications,
      bio: t.bio,
      schedule: t.schedule || [{ day: '', startTime: '', endTime: '' }],
      contactInfo: t.contactInfo,
      socialLinks: t.socialLinks
    });
    setFile(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Trainers</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <button
        className="btn btn-primary mb-4"
        onClick={() => {
          setFormData({
            trainerName: '',
            email: '',
            specialty: '',
            experience: '',
            qualifications: '',
            bio: '',
            schedule: [{ day: '', startTime: '', endTime: '' }],
            contactInfo: { phone: '', address: '' },
            socialLinks: { facebook: '', instagram: '', linkedin: '' }
          });
          setFile(null);
          setIsModalOpen(true);
        }}
      >
        Create Trainer
      </button>
      <table className="table w-full">
        <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          {trainers.map(t => (
            <tr key={t._id}>
              <td>{t.trainerName}</td>
              <td>{t.email}</td>
              <td>
                <button className="btn btn-sm btn-primary mr-2" onClick={() => edit(t)}>Edit</button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => deleteTrainer(t._id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <SpinnerLoader /> : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TextInput label="Name" name="trainerName" value={formData.trainerName} onChange={handleChange} required />
        <TextInput label="Email" name="email" value={formData.email} onChange={handleChange} required />
        <TextInput label="Specialty (comma separated)" name="specialty" value={formData.specialty} onChange={handleChange} />
        <TextInput label="Experience" name="experience" value={formData.experience} onChange={handleChange} />
        <TextInput label="Qualifications" name="qualifications" value={formData.qualifications} onChange={handleChange} />
        <TextInput label="Bio" name="bio" value={formData.bio} onChange={handleChange} />
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
        <TextInput label="Phone" name="phone" value={formData.contactInfo.phone} onChange={e => handleNestedChange('contactInfo', 'phone', e.target.value)} />
        <TextInput label="Address" name="address" value={formData.contactInfo.address} onChange={e => handleNestedChange('contactInfo', 'address', e.target.value)} />
        <TextInput label="Facebook" name="facebook" value={formData.socialLinks.facebook} onChange={e => handleNestedChange('socialLinks', 'facebook', e.target.value)} />
        <TextInput label="Instagram" name="instagram" value={formData.socialLinks.instagram} onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)} />
        <TextInput label="LinkedIn" name="linkedin" value={formData.socialLinks.linkedin} onChange={e => handleNestedChange('socialLinks', 'linkedin', e.target.value)} />
        <FileInput label="Image" name="image" onChange={e => setFile(e.target.files[0])} />
        <button
          className="btn btn-primary mt-4"
          onClick={createOrUpdate}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Save'}
        </button>
      </Modal>
    </AdminLayout>
  );
};

export default AdminTrainers;