import { useState } from 'react';
import ToggleInput from './Inputs/ToggleInput';
import api from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const MembershipRenewalToggle = ({ 
  membership, 
  onUpdate, 
  size = 'md',
  showLabel = true,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async (newValue) => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(
        API_PATHS.MEMBERSHIPS.UPDATE_RENEWAL(membership._id),
        { renewalOption: newValue }
      );

      if (onUpdate) {
        onUpdate(response.data.membership);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update renewal option');
      console.error('Error updating renewal option:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = () => {
    if (membership.status === 'Expired') return 'Expired membership';
    if (!membership.active) return 'Inactive membership';
    return membership.renewalOption ? 'Auto-renewal enabled' : 'Auto-renewal disabled';
  };

  const getDescription = () => {
    if (membership.status === 'Expired') return 'Cannot modify expired membership';
    if (!membership.active) return 'Cannot modify inactive membership';
    return membership.renewalOption 
      ? 'Your membership will automatically renew when it expires'
      : 'Your membership will not auto-renew when it expires';
  };

  const isToggleDisabled = disabled || isLoading || membership.status === 'Expired' || !membership.active;

  return (
    <div className={className}>
      <ToggleInput
        value={membership.renewalOption}
        onChange={handleToggle}
        disabled={isToggleDisabled}
        size={size}
        label={showLabel ? 'Auto Renewal' : ''}
        description={showLabel ? getDescription() : ''}
        onColor="bg-green-500"
        offColor="bg-gray-400"
      />
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span>Updating...</span>
        </div>
      )}
      
      {membership.status === 'Expired' && (
        <div className="mt-2 text-sm text-gray-500">
          Status: {getStatusText()}
        </div>
      )}
    </div>
  );
};

export default MembershipRenewalToggle;
