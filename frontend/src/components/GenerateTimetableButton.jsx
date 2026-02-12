import React from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import { timetableApi } from '../services/api';

/**
 * Generate Timetable Button Component
 * Reusable button with loading state for generating timetables
 */
function GenerateTimetableButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const response = await timetableApi.generate();
      
      if (response.data.success) {
        onSuccess && onSuccess(response.data);
      } else {
        onError && onError(response.data.message || 'Failed to generate timetable');
      }
    } catch (error) {
      onError && onError(
        error.response?.data?.message || 'Error generating timetable'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={`btn btn-primary ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="lds-spinner lds-spinner-sm"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></span>
          Generating...
        </>
      ) : (
        <><HiOutlineCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Generate Timetable</>
      )}
    </button>
  );
}

export default GenerateTimetableButton;
