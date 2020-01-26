import React, { Component } from 'react';
import {storeProducts, detailProduct} from './data';

// Using contextAPI to share methods and data between children components
// Place it in the highest place in the component tree => index.js

// Two values: Provider and Consumer
const ProductContext = React.createContext();

class ProductProvider extends Component {

    // "products: storeProducts": objects are passed by reference in JavaScript, 
    //  which means that if we change the state, the actual data 
    //  in the data.js will also change.
     
    state = {
        products: [],
        detailProduct: detailProduct,
        cart: [],
        modalOpen: false,
        modalProduct: detailProduct,
        cartSubTotal: 0,
        cartTax: 0,
        cartTotal: 0
    }

    componentDidMount() {
        this.setProducts();
    }

    // if we want to keep the orginal values as well as changing the current values,
    //  we should copy the data instead of referencing them
    setProducts = () => {
        let products = [];
        storeProducts.forEach(item => {
            const singleItem = {...item}; // we are copying the value by not referencing it
            products = [...products, singleItem];
        })
        this.setState(() => {
            return {products};
        })
    }

    getItem = (id) => {
        // find the item that has the same id passed in
        return this.state.products.find(item => item.id === id);
    }

    handleDetail = (id) =>{
        const product = this.getItem(id);
        this.setState(() => {
            return {
                detailProduct: product
            }
        })
    }

    addToCart = (id) =>{
        // let tempProducts = [...this.state.products];
        // const index = tempProducts.indexOf(this.getItem(id));
        // const product = tempProducts[index];
        const product = this.getItem(id);
        const price = product.price;

        product.inCart = true;
        product.count = 1;
        product.total = price;

        this.setState(() => {
            return {
                products: [...this.state.products], // tempProducts
                cart: [...this.state.cart, product]};
        },
        () => {
            this.addTotals();
        })
    }

    openModal = id => {
        const product = this.getItem(id);
        this.setState(() => {
            return {
                modalProduct: product,
                modalOpen: true
            }
        })
    }

    closeModal = () => {
        this.setState(() => {
            return {modalOpen: false};
        })
    }

    increment = id => {
       let tempCart = [...this.state.cart];
       const selectedProduct = tempCart.find(item => item.id === id);
       const index = tempCart.indexOf(selectedProduct);
       const product = tempCart[index]; // object passed by reference

       product.count = product.count + 1; //changing product will also change the tempCart
       product.total = product.count * product.price;

       this.setState(() => {
           return {
               cart: [...tempCart],

           }
       },
       () => {
           this.addTotals();
       })
    }

    decrement = id => {
        let tempCart = [...this.state.cart];
       const selectedProduct = tempCart.find(item => item.id === id);
       const index = tempCart.indexOf(selectedProduct);
       const product = tempCart[index]; // object passed by reference

       product.count = product.count - 1; //changing product will also change the tempCart
       if (product.count === 0){
            this.removeItem(id);
       }else {
            product.total = product.count * product.price;
            this.setState(() => {
                return {
                    cart: [...tempCart],
     
                }
            },
            () => {
                this.addTotals();
            })
       }
        
    }

    removeItem = (id) => {
        let tempProducts = [...this.state.products];
        let tempCart = [...this.state.cart];

        tempCart = tempCart.filter(item => item.id !== id);

        const index = tempProducts.indexOf(this.getItem(id));
        let removedProduct = tempProducts[index];
        removedProduct.inCart = false;
        removedProduct.count = 0;
        removedProduct.total = 0;

        this.setState(() => {
            return {
                cart: [...tempCart],
                product: [...tempProducts]
            };
        },
        () => {
            this.addTotals();
        })
    }

    clearCart = () => {
        this.setState(() => {
            return {
                cart:[]
            };
        },
        () => {
            this.setProducts();
            this.addTotals();
        })
        
    }

    addTotals = () => {
        let subTotal = 0;
        this.state.cart.map(item => (subTotal += item.total));
        const tax = parseFloat((subTotal * 0.15).toFixed(2));
        const total = subTotal + tax;
        this.setState(() => {
            return {
                cartSubTotal: subTotal,
                cartTax: tax,
                cartTotal: total
            }
        })

    }

    render() {
        return (
            <ProductContext.Provider value={{
                ...this.state,
                handleDetail: this.handleDetail,
                addToCart: this.addToCart,
                openModal: this.openModal,
                closeModal: this.closeModal,
                increment: this.increment,
                decrement: this.decrement,
                removeItem: this.removeItem,
                clearCart: this.clearCart
                }}>
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}


// the ProductConsumer tag can retrieve the data from ProductProvider
const ProductConsumer = ProductContext.Consumer;

export {ProductProvider, ProductConsumer};
