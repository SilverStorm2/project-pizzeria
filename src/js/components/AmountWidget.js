 import { select, settings } from '../settings.js';


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

  export default AmountWidget;