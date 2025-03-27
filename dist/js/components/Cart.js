import {select, classNames, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from '../components/CartProduct.js';


class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      //console.log('new Cart', thisCart)
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      /** new elements for displaying totals */
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    }
    initActions(){
      const thisCart = this;
      //thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      /** */
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      })
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
        });
    }
    
    /**
     * Generate HTML for the new product in the cart using the cart product template
     * Create a DOM element from the generated HTML
     * Append the generated DOM element to the cart's product list
     * Create a new CartProduct instance and add it to the products array
     */
    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      const cartProduct = new CartProduct(menuProduct, generatedDOM);
      thisCart.products.push(cartProduct);

      thisCart.update();
    }
    remove(cartProduct) {
      const thisCart = this;
      cartProduct.dom.wrapper.remove();
      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
      }
      thisCart.update();
    }

    /**
     * Recalculates cart totals whenever a product is added.
     * - Sets delivery fee from settings.
     * - Initializes `totalNumber` for item count and `subtotalPrice` for price sum.
     * - Loops through products to update `totalNumber` and `subtotalPrice`.
     * - Calculates `totalPrice` including delivery fee, if there are items in the cart.
     * - Optionally logs values for debugging or verification.
     */
    update(){
    
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
 
      for (let product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      thisCart.totalPrice = totalNumber > 0 ? subtotalPrice + deliveryFee : 0;

      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = totalNumber > 0 ? deliveryFee : 0;
        for (let totalElem of thisCart.dom.totalPrice){
          totalElem.innerHTML = thisCart.totalPrice;
        }
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {
        address: thisCart.dom.wrapper.querySelector(select.cart.address).value,
        phone: thisCart.dom.wrapper.querySelector(select.cart.phone).value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: settings.cart.defaultDeliveryFee,
        products: [],
      };
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
    .then(function (response) {
      return response.json();
    })
    .then(function (parsedResponse) {
      console.log('Order sent:', parsedResponse);
    })
    .catch(function (error) {
      console.error('Error sending order:', error);
    })
    .then(function(parsedResponse) {
      alert('Zamówienie wysłane !');
      console.log('Order sent:',parsedResponse)
    });
  }
}

export default Cart;