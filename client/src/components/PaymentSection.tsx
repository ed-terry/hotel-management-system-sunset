import { useQuery } from '@apollo/client';
import { GET_PENDING_PAYMENTS_QUERY } from '../graphql/queries';
import { logger } from '../utils/logger';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  booking: {
    id: string;
    guestName: string;
    room: {
      number: string;
    };
  };
}

interface PaymentsData {
  pendingPayments: Payment[];
}

const PaymentSection = () => {
  const { data, loading, error } = useQuery<PaymentsData>(GET_PENDING_PAYMENTS_QUERY, {
    errorPolicy: 'all',
    onError: (error) => {
      logger.error('Failed to fetch pending payments', error, {
        component: 'PaymentSection',
        action: 'fetchPayments',
      });
    },
  });

  const payments = data?.pendingPayments || [];

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProcessPayment = () => {
    logger.info('Process payment clicked', {
      component: 'PaymentSection',
      action: 'processPayment',
      metadata: { pendingPaymentsCount: payments.length },
    });
    // TODO: Implement payment processing
  };

  if (loading) {
    return (
      <div className="bg-base-200 rounded-lg shadow-lg p-6 border border-base-300">
        <h2 className="text-xl text-base-content font-semibold mb-6">Pending Payments</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-300">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-base-300"></div>
                  <div className="h-4 bg-base-300 rounded w-24"></div>
                </div>
                <div className="h-4 bg-base-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-base-200 rounded-lg shadow-lg p-6 border border-base-300">
        <h2 className="text-xl text-base-content font-semibold mb-6">Pending Payments</h2>
        <div className="text-center py-8">
          <div className="text-error mb-2">⚠️</div>
          <p className="text-base-content/70">Unable to load payments</p>
          <p className="text-xs text-base-content/50 mt-1">Using offline mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-base-200 to-base-300/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-primary/20 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-base-content font-bold flex items-center gap-2">
          💳 Pending Payments 
          <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
            {payments.length}
          </span>
        </h2>
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-success text-2xl">✅</div>
          </div>
          <p className="text-base-content/70 font-medium">All payments are up to date!</p>
          <p className="text-base-content/50 text-sm mt-1">Great job managing your finances</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-base-100/80 backdrop-blur-sm rounded-lg hover:bg-base-100 hover:shadow-md transition-all duration-200 border border-primary/10 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform duration-200">
                    {getInitials(payment.booking.guestName)}
                  </div>
                  <div>
                    <span className="text-base-content font-medium">
                      {payment.booking.guestName}
                    </span>
                    <p className="text-xs text-base-content/60">
                      Room {payment.booking.room.number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base-content font-semibold">
                    ${payment.amount.toFixed(2)}
                  </span>
                  <p className="text-xs text-base-content/60">
                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleProcessPayment}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-content font-semibold py-2 px-4 rounded-md transition-colors"
          >
            PROCESS PAYMENTS ({payments.length})
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentSection;
