import {select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

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
      //const productSummary = thisProduct.prepareCartProduct();
      //app.cart.add(productSummary);

      const event = new CustomEvent('add-to-cart', {
        bubbles: true,
        detail: {
          product: thisProduct.prepareCartProduct(),
        },
      });

      thisProduct.element.dispatchEvent(event);
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

  export default Product;