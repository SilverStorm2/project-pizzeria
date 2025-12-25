  import { settings, select, classNames } from './settings.js';
  import Product from './components/Product.js';  
  import Cart from './components/Cart.js';
  import Booking from './components/Booking.js';


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
    initPages: function() {
      const thisApp = this;
      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);

      const idFromHash = window.location.hash.replace('#', '');
      let pageMatchingHash = thisApp.pages.length ? thisApp.pages[0].id : null;

      for (let page of thisApp.pages) {
        if (page.id === idFromHash) {
          pageMatchingHash = page.id;
          break;
        }
      }

      thisApp.activatePage = function(pageId) {
        for (let page of thisApp.pages) {
          page.classList.toggle(classNames.pages.active, page.id === pageId);
        }

        for (let link of thisApp.navLinks) {
          link.classList.toggle(
            classNames.nav.active,
            link.getAttribute('href') === '#' + pageId
          );
        }
      };

      thisApp.activatePage(pageMatchingHash);

      for (let link of thisApp.navLinks) {
        link.addEventListener('click', function(event) {
          event.preventDefault();
          const id = link.getAttribute('href').replace('#', '');
          thisApp.activatePage(id);
          window.location.hash = '#' + id;
        });
      }
    },
    initBooking: function(){
      const thisApp = this;
      const bookingElement = document.querySelector(select.containerOf.booking);
      thisApp.booking = new Booking(bookingElement);
    },

    init: function(){
      const thisApp = this;

      thisApp.initPages();
      thisApp.initData();
      thisApp.initCart();
      thisApp.initBooking();
    },
  };
  app.init();

  export default app;
