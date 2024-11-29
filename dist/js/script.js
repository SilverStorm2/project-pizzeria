/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { name } = require("browser-sync");

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED,
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }
    /*
    * Generates HTML for the product based on a template and the product's data, converts it to a DOM element, 
    * locates the main menu container on the page, and appends the product element to the menu, displaying it on the page.
    */
    renderInMenu(){
      const thisProduct = this;

      /** generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /** create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /** find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /** add lement to menu */
      menuContainer.appendChild(thisProduct.element);

    }
    /**
     * Selects and stores key elements within the product component:
     * - `accordionTrigger`: The element that triggers product accordion (toggle) behavior.
     * - `form`: The form element for configuring product options.
     * - `formInputs`: All input elements within the form for capturing user selections.
     * - `cartButton`: Button that adds the product to the cart.
     * - `priceElem`: Element displaying the product's total price.
     * - `imageWrapper`: Wrapper for displaying product images.
     * - `amountWidgetElem`: Element for adjusting product quantity.
     */
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper);
        //nowy 
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget);
    }
    /**
     * `initAccordion` - Initializes accordion functionality for expanding and collapsing product details.
     * Adds an event listener to the product header (`accordionTrigger`) that:
     * - Prevents the default action of the click event.
     * - Finds the currently active product and removes its 'active' class if it's not the clicked product.
     * - Toggles the 'active' class on the clicked product, controlling the visibility of product details.
     */
    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        const activeProduct = document.querySelector('.active');
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove('active');
        }
        thisProduct.element.classList.toggle('active');
      });
    } 
    /**
    * Initializes order form functionality by setting up event listeners:
    * - Prevents form submission default behavior, calling `processOrder()` instead to calculate product configuration.
    * - Adds `change` event listeners to each input in `formInputs`, recalculating order details when options change.
    * - Sets up `click` event listener on `cartButton` to prevent default behavior, calls `processOrder()` to update total, 
    *   and then invokes `addToCart()` to add the configured product to the cart.
    */
    initOrderForm(){
      const thisProduct = this;
      //console.log(thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart(); //nowy
      });
    }
    /**
     * `initAmountWidget` - Initializes the amount widget for managing product quantity.
     * - Creates a new `AmountWidget` instance associated with the product's amount widget element (`amountWidgetElem`).
     * - Adds an event listener to `amountWidgetElem` that triggers `processOrder` each time the widget is updated,
     *   ensuring the displayed price is updated based on the selected quantity.
     */
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }
    /** 
     * `processOrder` - Calculates and displays the updated product price based on selected options and quantity: 
     * Converts form data to `formData` for selected option access, sets `price` to base price, iterates through each parameter category (e.g., toppings), adjusting the `price` based on selected or deselected options by adding or deducting non-default option prices; controls option image visibility by showing selected option images and hiding others; multiplies the final price by the quantity in the amount widget, then updates the product's HTML price element with the calculated total.
     */
    processOrder() {
      const thisProduct = this;
  
      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
  
      // set price to default price
      let price = thisProduct.data.price;
  
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);
  
          // Check if the option was selected by the user
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // The option was selected, check if it is not default
            if (!option.default) {
              // If it is not default, increase the price by the option's price
              price += option.price;
            }
            if (optionImage) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            // The option was not selected, but it might have been default
            if (option.default) {
              // If the option was default and got deselected, reduce the price
              price -= option.price;
            }
            if (optionImage){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    /** 
     * `addToCart` - Prepares product data for the cart and adds it:
     * Uses `prepareCartProduct` to compile product details (like ID, name, amount, price, and selected options) into `productSummary`, then adds this summary to the cart by calling `app.cart.add`.
     */
    addToCart(){
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary);
    }
    /** 
     * `prepareCartProduct` - Compiles and returns a summary of the selected product details:
     * Gathers product-specific data including the product ID, name, selected amount, individual price, and calculated total price. It also fetches any selected options using `prepareCartProductParams` for inclusion in `productSummary`. Finally, `productSummary` is returned to represent the product's current configuration for cart addition.
     */
    prepareCartProduct (){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.data.price,
        //price: thisProduct.amountWidget.value * thisProduct.data.price,
        price: parseFloat(thisProduct.priceElem.innerHTML),
        params: thisProduct.prepareCartProductParams()
      };
      return productSummary;
    }
    /**
     * `prepareCartProductParams` - Assembles the selected options for the product:
     * Converts form data into a structured object, `formData`, representing selected choices. For each product parameter (`paramId`), it creates an entry in `params` with the parameter's label and an empty `options` object.
     * It then iterates over each option, checking if the option is selected by the user. If selected, the option's label is added to `params` under the relevant parameter.
     * This structured `params` object, containing all selected options with labels, is returned to summarize the chosen configuration for the cart.
     */
    prepareCartProductParams(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};

      for(let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {}
        };
        for(let optionId in param.options){
          const option = param.options[optionId];
          if(formData[paramId] && formData[paramId].includes(optionId)){
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  /**
     * `AmountWidget` class - Manages quantity selection for a product:
     * - The constructor accepts a DOM `element` and initializes the widget.
     * - Calls `getElements` to select and store relevant input elements.
     * - Sets the initial value based on `input.value` if provided, or falls back to `settings.amountWidget.defaultValue`.
     * - Uses `setValue` to ensure the initial quantity is correctly set.
     * - Calls `initActions` to attach event listeners, enabling real-time quantity adjustments and updates.
     */
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      /** Listen for the 'updated' event on the amountWidget element */
      const initialValue = thisWidget.input.value ? thisWidget.input.value : settings.amountWidget.defaultValue;
      thisWidget.setValue(initialValue);
      /** Call processOrder when the event is triggered */
      thisWidget.initActions();
    }
    
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease);   
    }
    /**
     * `setValue(value)` - Validates and sets the new widget value:
     * - Converts `value` to an integer (`newValue`) to ensure proper data type for comparison.
     * - Checks if `newValue` is different from the current value, is a valid number, and falls within the allowed range (`defaultMin` to `defaultMax`).
     * - If all conditions are met, updates both `thisWidget.value` and the input field with `newValue`.
     * - Calls `announce()` to notify other components of the change, enabling any necessary updates.
     */
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /* TODO: Add validation*/
      if (thisWidget.value !== newValue && 
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax) {
        /* If the new value is different from the current one, within the allowed range, and is a valid number,
         update the widget's value and the input field with the new value. */  
        thisWidget.value = newValue;
        thisWidget.input.value = thisWidget.value;
        thisWidget.announce();
      }
      // thisWidget.input.value = thisWidget.value; zmiana
    }
    /**
     * `initActions()` - Sets up event listeners for user interactions on the widget:
     * - Adds a `change` event listener to `thisWidget.input`, which updates the widget's value whenever the input field changes.
     * - Adds a `click` event listener to `thisWidget.linkDecrease` that decreases the widget's value by 1, while preventing the default link behavior.
     * - Adds a `click` event listener to `thisWidget.linkIncrease` that increases the widget's value by 1, while also preventing the default link behavior.
     * - These interactions allow users to adjust the widget's value dynamically.
     */
    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      })
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
  
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    /**
     * `announce()` - Triggers an 'updated' custom event on the widget's main element:
     * - Creates a new `CustomEvent` named 'updated' with `bubbles` set to `true`, allowing the event to propagate up the DOM tree.
     * - Dispatches this event on `thisWidget.element`, notifying any listeners that the widget's value has been updated.
     * - This method allows other parts of the application to respond whenever the widget's value changes.
     */
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
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
      }
  
      // Update the cart totals after removing the product
      app.cart.update();
    }

  }

    
  const app = {
      /**
     * 
     * `initData()` - Loads product data from a predefined data source:
     * - Assigns the product data from `dataSource` to `thisApp.data` to make it accessible throughout the app.
     *
     * `initMenu()` - Renders each product on the menu:
     * - Iterates over each product entry in `thisApp.data`.
     * - For each product, creates a new `Product` instance to render and manage its specific details on the page.
     *
     * `init()` - Main initialization function for setting up the app:
     * - Calls `initData()` to load product data.
     * - Calls `initMenu()` to display menu items based on the loaded data.
     * - Calls `initCart()` to prepare the cart functionality and interactions.
     *
     * `initCart()` - Sets up the shopping cart:
     * - Finds the cart element in the DOM using the selector from `select.containerOf.cart`.
     * - Creates a new `Cart` instance, which enables adding, removing, and updating items in the cart.
     */
    initData: function(){
      const thisApp = this;
      //thisApp.data = dataSource;
      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      })
      .catch(function (error) {
        console.error('Error fetching data:', error);
      });
    },
    initMenu: function () {
      const thisApp = this;
    
      for (const [productId, productData] of Object.entries(thisApp.data.products)) {
        new Product(productId, productData);
      }
    },
/** 
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },*/

    initCart: function(){
      const thisApp = this;
      const cartElement = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElement);
    },

    init: function(){
      const thisApp = this;

      //thisApp.initMenu();
      thisApp.initData();
      thisApp.initCart();
    },
  };
  app.init();
}
