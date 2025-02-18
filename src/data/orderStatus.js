export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_INFO = {
  [ORDER_STATUS.PENDING]: {
    label: 'Chờ xác nhận',
    color: 'yellow',
    description: 'Đơn hàng đang chờ xác nhận'
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: 'Đã xác nhận',
    color: 'blue',
    description: 'Đơn hàng đã được xác nhận'
  },
  [ORDER_STATUS.SHIPPING]: {
    label: 'Đang giao hàng',
    color: 'purple',
    description: 'Đơn hàng đang được giao'
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Đã giao hàng',
    color: 'green',
    description: 'Đơn hàng đã được giao thành công'
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'red',
    description: 'Đơn hàng đã bị hủy'
  }
};

export const getOrderTimeline = (status) => {
  const timeline = [
    {
      status: ORDER_STATUS.PENDING,
      time: null,
      isCompleted: false
    },
    {
      status: ORDER_STATUS.CONFIRMED,
      time: null,
      isCompleted: false
    },
    {
      status: ORDER_STATUS.SHIPPING,
      time: null,
      isCompleted: false
    },
    {
      status: ORDER_STATUS.DELIVERED,
      time: null,
      isCompleted: false
    }
  ];

  const statusIndex = Object.values(ORDER_STATUS).indexOf(status);
  return timeline.map((step, index) => ({
    ...step,
    isCompleted: index <= statusIndex
  }));
}; 