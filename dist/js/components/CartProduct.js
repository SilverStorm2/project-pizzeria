import app from '../app.js';
import { select } from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';



class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions(); // Initialize actions for edit and remove
    }

    /** 
     * Store references to key DOM elements within the cart item
     * 
     * 
     */
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.price
      );
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.edit
      );
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.remove
      );
    }
    /**
     * Initializes the amount widget for the cart product.
     * - Creates a new AmountWidget instance for quantity control.
     * - Adds an event listener to update the product's amount and price
     *   whenever the widget's value changes, ensuring the displayed price
     *   reflects the current quantity.
     */
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    /**
     * Sets up actions for the cart product's buttons.
     * - Adds an event listener to the remove button to trigger product removal from the cart.
     * - Optionally sets up an edit button for potential future use.
     */
    initActions(){
      const thisCartProduct = this;
  
      // Listener for the remove button
      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
        thisCartProduct.removeFromCart();
      });
  
      // Optionally add functionality for the edit button if needed
      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
        //console.log('Edit button clicked');
      });
    }

    getData() {
      const thisCartProduct = this;

      return {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
    }

    /**
     * Removes the product from the cart by deleting its DOM element, removing it from the cart's products array, and updating the cart totals to reflect the change.
     */
    removeFromCart() {
      const thisCartProduct = this;
  
      // Remove the DOM element of this cart product
      thisCartProduct.dom.wrapper.remove();
  
      // Find and remove the product from the cart's product list
      const index = app.cart.products.indexOf(thisCartProduct);
      if (index !== -1) {
        app.cart.products.splice(index, 1);
      } else {
        console.error('Product not found in cart', thisCartProduct);
      }
  
      // Update the cart totals after removing the product
      //app.cart.update();
      if (typeof app.cart.update === 'function') {
        app.cart.update();
      } else {
        console.error('app.cart.update is not a function');
      }

      const event = new CustomEvent('remove-from-cart', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    
    }

  }

  export default CartProduct;