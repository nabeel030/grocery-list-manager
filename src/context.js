import { createContext, useState } from 'react';

const CounterContext = createContext();

const CounterProvider = ({ children }) => {
    const [items, setItems] = useState([]);
  
    const increment = () => {
      setCount(count + 1);
    };
  
    return (
      <CounterContext.Provider value={{ count, increment }}>
        {children}
      </CounterContext.Provider>
    );
};
  