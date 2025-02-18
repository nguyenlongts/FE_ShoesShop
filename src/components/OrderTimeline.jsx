import React from 'react';
import { ORDER_STATUS_INFO } from '../data/orderStatus';

const OrderTimeline = ({ status, timeline }) => {
  const statusInfo = ORDER_STATUS_INFO[status] || {
    label: 'Không xác định',
    color: 'gray',
    description: 'Trạng thái không xác định'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="relative">
        {timeline.map((step, index) => {
          const stepInfo = ORDER_STATUS_INFO[step.status] || {
            label: 'Không xác định',
            color: 'gray',
            description: 'Trạng thái không xác định'
          };

          return (
            <div key={step.status} className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {step.isCompleted ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-gray-500">{index + 1}</span>
                )}
              </div>
              <div className="ml-4">
                <p className="font-medium">
                  {stepInfo.label}
                </p>
                <p className="text-sm text-gray-500">
                  {stepInfo.description}
                </p>
                {step.time && (
                  <p className="text-sm text-gray-500">
                    {new Date(step.time).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline; 