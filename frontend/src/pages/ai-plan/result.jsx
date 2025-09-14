import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import MainLayout from '../../components/Layouts/MainLayout';
import { useRouter } from 'next/router';
import { API_PATHS } from '../../utils/apiPaths';
import TextInput from '../../components/Inputs/TextInput';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AIPlanResult = () => {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [note, setNote] = useState('');
  const [noteQuestionId, setNoteQuestionId] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAction, setIsAction] = useState({});

  useEffect(() => {
    if (id) fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const res = await api.get(API_PATHS.SESSION.GET_ONE(id));
      setSession(res.data.session);
      const expRes = await api.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        planType: res.data.session.planType,
        inputs: res.data.session.inputs
      });
      setExplanation(expRes.data.explanation);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch session');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePin = async (questionId) => {
    setIsAction(prev => ({ ...prev, [questionId]: 'pin' }));
    try {
      await api.post(API_PATHS.QUESTION.PIN(questionId));
      fetchSession();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to toggle pin');
    } finally {
      setIsAction(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const updateNote = async (questionId) => {
    setIsAction(prev => ({ ...prev, [questionId]: 'note' }));
    try {
      await api.post(API_PATHS.QUESTION.UPDATE_NOTE(questionId), { note });
      setNote('');
      setNoteQuestionId('');
      fetchSession();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to update note');
    } finally {
      setIsAction(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const deleteSession = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.SESSION.DELETE(id));
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <SpinnerLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">AI Plan Result</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      {session && (
        <div className="card bg-base-100 shadow-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">{session.description}</h2>
          <p>Plan Type: {session.planType}</p>
          <h3 className="text-lg font-semibold mt-4">Inputs</h3>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(session.inputs, null, 2)}</pre>
          {explanation && (
            <>
              <h3 className="text-lg font-semibold mt-4">Explanation</h3>
              <p>{explanation.recommendation}</p>
              <ul className="list-disc pl-5">
                {explanation.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </>
          )}
          <h3 className="text-lg font-semibold mt-4">Questions</h3>
          {session.questions.map(q => (
            <div key={q._id} className="border p-4 mb-2 rounded">
              <p><strong>Question:</strong> {q.question}</p>
              <p><strong>Answer:</strong> {q.answer}</p>
              {q.note && <p><strong>Note:</strong> {q.note}</p>}
              <p><strong>Pinned:</strong> {q.isPinned ? 'Yes' : 'No'}</p>
              <button
                className="btn btn-sm btn-primary mr-2"
                onClick={() => togglePin(q._id)}
                disabled={isAction[q._id] === 'pin'}
              >
                {isAction[q._id] === 'pin' ? <SpinnerLoader /> : q.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setNoteQuestionId(q._id)}>Add/Update Note</button>
              {noteQuestionId === q._id && (
                <>
                  <TextInput
                    label="Note"
                    name="note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-primary mt-2"
                    onClick={() => updateNote(q._id)}
                    disabled={isAction[q._id] === 'note'}
                  >
                    {isAction[q._id] === 'note' ? <SpinnerLoader /> : 'Save Note'}
                  </button>
                </>
              )}
            </div>
          ))}
          <button
            className="btn btn-error mt-4"
            onClick={deleteSession}
            disabled={isSubmitting}
          >
            {isSubmitting ? <SpinnerLoader /> : 'Delete Session'}
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default AIPlanResult;