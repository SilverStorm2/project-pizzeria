import { select } from '../settings.js';
import utils from '../utils.js';

class HourPicker {
  constructor(wrapper) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapper;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );

    thisWidget.value = thisWidget.dom.input.value;
    thisWidget.updateUI();
    thisWidget.initActions();
  }

  initActions() {
    const thisWidget = this;
    const handleUpdate = function () {
      thisWidget.value = thisWidget.dom.input.value;
      thisWidget.updateUI();
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.dom.wrapper.dispatchEvent(event);
    };

    thisWidget.dom.input.addEventListener('input', handleUpdate);
    thisWidget.dom.input.addEventListener('change', handleUpdate);
  }

  updateUI() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = utils.numberToHour(thisWidget.value);
  }
}

export default HourPicker;
