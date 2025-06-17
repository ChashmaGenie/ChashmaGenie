import React, { createContext, useState, useEffect } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('orders');
    if (stored) setOrders(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    setOrders(prev => [...prev, order]);
  };

  const toggleDelivered = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, delivered: !o.delivered } : o));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, toggleDelivered }}>
      {children}
    </OrderContext.Provider>
  );
};