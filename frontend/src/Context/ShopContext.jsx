import React, { createContext, useEffect, useState } from "react";
export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};
const ShopContextProvider = (props) => {
  const [allProducts, setallProducts] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetch("http://localhost:4000/getallproducts")
      .then((res) => res.json())
      .then((data) => {
        setallProducts(data);
      });
      if(localStorage.getItem("auth-token")){
        fetch("http://localhost:4000/getcart",{
          method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: ""
        })
        .then((res)=>res.json()).then((data)=>{
          setCartItems(data);
        })          
    }
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({"itemId":itemId}),
      })
      .then((res)=>res.json()).then((data)=>{
        console.log("aaaaaa");
      })
    }
  };
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if(localStorage.getItem("auth-token")){
      fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({"itemId":itemId}),
      })
      .then((res)=>res.json()).then((data)=>{
        console.log(data);
      })
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = allProducts.find(
          (product) => product.id === Number(item)
        );
        totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    allProducts,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
export default ShopContextProvider;
