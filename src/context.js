import { createContext, useState } from 'react';

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [itemsBought, setItemsBought] = useState([]);
  
    return (
      <ItemsContext.Provider value={{ items, setItems, itemsBought,  setItemsBought}}>
        {children}
      </ItemsContext.Provider>
    );
};

// export {
//   ItemsContext,
//   ItemsProvider
// }
  