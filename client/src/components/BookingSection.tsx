import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { 
  CalendarDaysIcon, 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { logger } from '../utils/logger';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: number;
}

const BookingSection = () => {
  const { reportError, reportInfo } = useErrorHandler();
  
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateDates = useCallback(({ checkIn, checkOut }: BookingFormData) => {
    const today = dayjs().startOf('day');
    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);
    
    if (checkIn && checkInDate.isBefore(today)) {
      return 'Check-in date cannot be in the past';
    }
    
    if (checkIn && checkOut && checkOutDate.isBefore(checkInDate)) {
      return 'Check-out date must be after check-in date';
    }
    
    if (checkIn && checkOut && checkOutDate.diff(checkInDate, 'days') > 30) {
      return 'Maximum stay is 30 days';
    }
    
    return null;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Log booking attempt
      logger.info('Booking search initiated', {
        component: 'BookingSection',
        action: 'searchBooking',
        metadata: {
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests,
        },
      });
      
      // Validate dates
      const dateError = validateDates(formData);
      if (dateError) {
        setErrors(prev => ({ ...prev, checkIn: dateError }));
        toast.error(dateError);
        
        logger.warn('Booking validation failed', {
          component: 'BookingSection',
          action: 'validationError',
          metadata: { error: dateError, formData },
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Search completed! Available rooms found.');
      reportInfo('Room search started successfully', {
        component: 'BookingSection',
        action: 'roomSearch',
      }); 
    } catch (error) {
      reportError(error as Error, {
        component: 'BookingSection',
        action: 'handleSubmit',
      });
      toast.error('An error occurred while processing your booking request');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysCount = () => {
    if (formData.checkIn && formData.checkOut) {
      return dayjs(formData.checkOut).diff(dayjs(formData.checkIn), 'days');
    }
    return 0;
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-6 py-4 border-b border-base-300">
        <h2 className="text-xl font-semibold text-base-content flex items-center">
          <CalendarDaysIcon className="h-6 w-6 mr-2 text-accent" />
          Search Available Rooms
        </h2>
        <p className="text-sm text-base-content/70 mt-1">
          Find the perfect room for your stay
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Check-in Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-base-content" htmlFor="checkIn">
              Check-in Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
              <input
                id="checkIn"
                name="checkIn"
                type="date"
                value={formData.checkIn}
                min={dayjs().format('YYYY-MM-DD')}
                className={`w-full pl-10 pr-4 py-3 bg-base-200 border rounded-lg transition-all focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.checkIn ? 'border-error' : 'border-base-300'
                }`}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.checkIn && (
              <div className="flex items-center space-x-1 text-error">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <p className="text-sm">{errors.checkIn}</p>
              </div>
            )}
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-base-content" htmlFor="checkOut">
              Check-out Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
              <input
                id="checkOut"
                name="checkOut"
                type="date"
                value={formData.checkOut}
                min={formData.checkIn || dayjs().format('YYYY-MM-DD')}
                className={`w-full pl-10 pr-4 py-3 bg-base-200 border rounded-lg transition-all focus:ring-2 focus:ring-accent focus:border-transparent ${
                  errors.checkOut ? 'border-error' : 'border-base-300'
                }`}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.checkOut && (
              <div className="flex items-center space-x-1 text-error">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <p className="text-sm">{errors.checkOut}</p>
              </div>
            )}
          </div>
        </div>

        {/* Guests Selection */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-base-content" htmlFor="guests">
            Number of Guests
          </label>
          <div className="relative">
            <UserGroupIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
            <select
              id="guests"
              name="guests"
              className="w-full pl-10 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              value={formData.guests}
              onChange={handleInputChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} Guest{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stay Duration Display */}
        {getDaysCount() > 0 && (
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-base-content">
              <span className="font-medium">Stay Duration:</span> {getDaysCount()} night{getDaysCount() !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Searching...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search Available Rooms
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingSection;
