export const ORDER_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  SHIPPING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

export const ORDER_STATUS_MAP = {
  [ORDER_STATUS.PENDING]: "pending",
  [ORDER_STATUS.PROCESSING]: "processing",
  [ORDER_STATUS.SHIPPING]: "shipping",
  [ORDER_STATUS.COMPLETED]: "completed",
  [ORDER_STATUS.CANCELLED]: "cancelled",
};

export const ORDER_STATUS_INFO = {
  [ORDER_STATUS.PENDING]: {
    label: "Chờ xử lý",
    color: "yellow",
    description: "Đơn hàng đang chờ xử lý",
  },
  [ORDER_STATUS.PROCESSING]: {
    label: "Đang xử lý",
    color: "blue",
    description: "Đơn hàng đang được xử lý",
  },
  [ORDER_STATUS.SHIPPING]: {
    label: "Đang vận chuyển",
    color: "purple",
    description: "Đơn hàng đang được vận chuyển",
  },
  [ORDER_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    color: "green",
    description: "Đơn hàng đã được giao thành công",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Đã hủy",
    color: "red",
    description: "Đơn hàng đã bị hủy",
  },
};

export const getOrderTimeline = (status) => {
  const timeline = [
    {
      status: ORDER_STATUS.PENDING,
      time: null,
      isCompleted: false,
    },
    {
      status: ORDER_STATUS.PROCESSING,
      time: null,
      isCompleted: false,
    },
    {
      status: ORDER_STATUS.SHIPPING,
      time: null,
      isCompleted: false,
    },
    {
      status: ORDER_STATUS.COMPLETED,
      time: null,
      isCompleted: false,
    },
  ];

  const statusNumber = Number(status);

  return timeline.map((step, index) => ({
    ...step,
    isCompleted:
      step.status <= statusNumber && statusNumber !== ORDER_STATUS.CANCELLED,
  }));
};
