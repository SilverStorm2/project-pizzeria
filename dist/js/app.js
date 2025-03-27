  import { settings, select } from './settings.js';
  import Product from './components/Product.js';  
  import Cart from './components/Cart.js';


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

      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });

   
      thisApp.cartProduct = document.querySelector(select.containerOf.cart);
      thisApp.cartProduct.addEventListener('remove-from-cart', function(event){
        app.cart.remove(event.detail.cartProduct);
      });
     
    },

    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
    },
  };
  app.init();

  export default app;
