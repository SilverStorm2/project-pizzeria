import { select, settings } from '../settings.js';
import utils from '../utils.js';

class DatePicker {
  constructor(wrapper) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapper;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );

    const initialDate = new Date();
    thisWidget.minDate = initialDate;
    thisWidget.maxDate = utils.addDays(initialDate, settings.datePicker.maxDaysInFuture);
    thisWidget.dom.input.value = utils.dateToStr(initialDate);

    thisWidget.initFlatpickr();
    thisWidget.initActions();
  }

  initFlatpickr() {
    const thisWidget = this;

    if (typeof flatpickr === 'function') {
      thisWidget.dom.input._flatpickr = flatpickr(thisWidget.dom.input, {
        defaultDate: thisWidget.dom.input.value,
        minDate: thisWidget.minDate,
        maxDate: thisWidget.maxDate,
        locale: {
          firstDayOfWeek: 1,
        },
      });
    }
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.dom.wrapper.dispatchEvent(event);
    });
  }

  get value() {
    return this.dom.input.value;
  }
}

export default DatePicker;
