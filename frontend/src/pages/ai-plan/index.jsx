import { useState } from 'react';
import api from '../../utils/axiosInstance';
import MainLayout from '../../components/Layouts/MainLayout';
import { useRouter } from 'next/router';
import TextInput from '../../components/Inputs/TextInput';
import SelectInput from '../../components/Inputs/SelectInput';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AIPlan = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    planType: 'Workout',
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: '',
    experienceLevel: '',
    healthConditions: '',
    workoutAvailability: '',
    numberOfDays: '',
    eatingHabits: '',
    activityLevel: '',
    caloriePreference: '',
    supplementUse: '',
    budgetLifestyle: '',
    title: ''
  });
  const [questions, setQuestions] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: '', answer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const submitPlan = async () => {
    setIsSubmitting(true);
    try {
      const inputs = formData.planType === 'Workout'
        ? {
            age: formData.age,
            gender: formData.gender,
            height: formData.height,
            weight: formData.weight,
            fitnessGoal: formData.fitnessGoal,
            experienceLevel: formData.experienceLevel,
            healthConditions: formData.healthConditions,
            workoutAvailability: formData.workoutAvailability,
            numberOfDays: formData.numberOfDays
          }
        : {
            eatingHabits: formData.eatingHabits,
            activityLevel: formData.activityLevel,
            caloriePreference: formData.caloriePreference,
            supplementUse: formData.supplementUse,
            budgetLifestyle: formData.budgetLifestyle
          };
      const res = await api.post(formData.planType === 'Workout' ? API_PATHS.AI.GENERATE_WORKOUT : API_PATHS.AI.GENERATE_DIET, inputs);
      const sessionRes = await api.post(API_PATHS.SESSION.CREATE, {
        planType: formData.planType,
        title: formData.title,
        inputs,
        questions
      });
      router.push(`/ai-plan/result/${sessionRes.data.session._id}`);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Generate AI Plan</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <div className="card bg-base-100 shadow-xl p-6 max-w-2xl mx-auto">
        <SelectInput
          label="Plan Type"
          name="planType"
          options={[{ value: 'Workout', label: 'Workout' }, { value: 'Diet', label: 'Diet' }]}
          value={formData.planType}
          onChange={handleChange}
        />
        <TextInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        {formData.planType === 'Workout' ? (
          <>
            <TextInput label="Age" name="age" value={formData.age} onChange={handleChange} required />
            <SelectInput
              label="Gender"
              name="gender"
              options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
              value={formData.gender}
              onChange={handleChange}
              required
            />
            <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} required />
            <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} required />
            <TextInput label="Fitness Goal" name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} required />
            <SelectInput
              label="Experience Level"
              name="experienceLevel"
              options={[{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]}
              value={formData.experienceLevel}
              onChange={handleChange}
              required
            />
            <TextInput label="Health Conditions" name="healthConditions" value={formData.healthConditions} onChange={handleChange} />
            <TextInput label="Workout Availability" name="workoutAvailability" value={formData.workoutAvailability} onChange={handleChange} required />
            <TextInput label="Number of Days" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} required />
          </>
        ) : (
          <>
            <TextInput label="Eating Habits" name="eatingHabits" value={formData.eatingHabits} onChange={handleChange} required />
            <TextInput label="Activity Level" name="activityLevel" value={formData.activityLevel} onChange={handleChange} required />
            <TextInput label="Calorie Preference" name="caloriePreference" value={formData.caloriePreference} onChange={handleChange} required />
            <TextInput label="Supplement Use" name="supplementUse" value={formData.supplementUse} onChange={handleChange} />
            <TextInput label="Budget & Lifestyle" name="budgetLifestyle" value={formData.budgetLifestyle} onChange={handleChange} required />
          </>
        )}
        <div className="form-control mb-4">
          <label className="label"><span className="label-text">Questions</span></label>
          {questions.map((q, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <TextInput
                label="Question"
                name={`question-${index}`}
                value={q.question}
                onChange={e => handleQuestionChange(index, 'question', e.target.value)}
              />
              <TextInput
                label="Answer"
                name={`answer-${index}`}
                value={q.answer}
                onChange={e => handleQuestionChange(index, 'answer', e.target.value)}
              />
              <button className="btn btn-sm btn-error mt-8" onClick={() => removeQuestion(index)}>Remove</button>
            </div>
          ))}
          <button className="btn btn-sm btn-secondary mt-2" onClick={addQuestion}>Add Question</button>
        </div>
        <button
          className="btn btn-primary w-full mt-4"
          onClick={submitPlan}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Generate Plan'}
        </button>
      </div>
    </MainLayout>
  );
};

export default AIPlan;