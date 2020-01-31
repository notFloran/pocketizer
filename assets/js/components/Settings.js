import * as helpers from '../utils/helpers.js';
import * as globals from '../utils/globals.js';
import { selector, search, item } from './index.js';
import pocket from '../App.js';

class Settings {
    /**
     * @constructor
     */
    constructor() {
        this.selectorChange = this.handleSelectorChange.bind(this);
        this.focusAddInput = this.handleFocusAddInput.bind(this);
        this.resetAddInput = this.handleResetAddInput.bind(this);
        this.submitNewItem = this.handleSubmitNewItem.bind(this);
    }

    /**
     * Initialize settings.
     *
     * @function init
     * @return {void}
     */
    init() {
        this.bindEvents();
        this.loadOrder();
        this.loadUpdateInterval();
        this.loadArchiveAfterOpen();
    }

    /**
     * Bind all events.
     *
     * @function bindEvents
     * @return {void}
     */
    bindEvents() {
        document.addEventListener('select.selector', this.selectorChange, false);
        document.addEventListener('opened.modal', this.focusAddInput, false);
        document.addEventListener('closed.modal', this.resetAddInput, false);
        document.newItemForm.addEventListener('submit', this.submitNewItem, false);
    }

    /**
     * Remove all events.
     *
     * @function removeEvents
     * @return {void}
     */
    removeEvents() {
        document.removeEventListener('select.selector', this.selectorChange, false);
        document.removeEventListener('opened.modal', this.focusAddInput, false);
        document.removeEventListener('closed.modal', this.resetAddInput, false);
        document.newItemForm.removeEventListener('submit', this.submitNewItem, false);
    }

    /**
     * Set default page to load on extension load.
     *
     * @function setDefaultPage
     * @param {String} page - Page to set.
     * @return {void}
     */
    setDefaultPage(page = globals.PAGES.LIST) {
        helpers.setToStorage('defaultPage', page);
    }

    /**
     * Get default page to load on extension load.
     *
     * @function getDefaultPage
     * @return {String | null}
     */
    getDefaultPage() {
        return helpers.getFromStorage('defaultPage') || globals.PAGES.LIST;
    }

    /**
     * Set default theme if none is provided.
     *
     * @function setTheme
     * @param {String} theme - Theme to set.
     * @return {void}
     */
    setTheme(theme = globals.THEMES.LIGHT) {
        helpers.setToStorage('theme', theme);
    }

    /**
     * Get theme to load on extension load.
     *
     * @function getTheme
     * @return {String | null}
     */
    getTheme() {
        return helpers.getFromStorage('theme');
    }

    /**
     * Set items order.
     *
     * @function setOrder
     * @param {String} order - Order to set.
     * @return {void}
     */
    setOrder(order = globals.ORDER.DESCENDING) {
        helpers.setToStorage('order', order);
    }

    /**
     * Get items order to load on extension load.
     *
     * @function getOrder
     * @return {String | null}
     */
    getOrder() {
        return helpers.getFromStorage('order');
    }

    /**
     * Set update interval.
     *
     * @function setUpdateInterval
     * @param {String} interval - Interval to set.
     * @return {void}
     */
    setUpdateInterval(interval = globals.UPDATE_INTERVALS[0]) {
        return helpers.setToStorage('updateInterval', interval);
    }

    /**
     * Get update interval to load on extension load.
     *
     * @function getUpdateInterval
     * @return {String | null}
     */
    getUpdateInterval() {
        return helpers.getFromStorage('updateInterval') || globals.UPDATE_INTERVALS[0];
    }

    /**
     * Load and set theme color on pocket load.
     *
     * @function loadTheme
     * @return {void}
     */
    loadTheme() {
        let theme = this.getTheme();

        if (!theme && !Object.values(globals.THEMES).includes(theme)) {
            this.setTheme();
            theme = this.getTheme();
        }

        if (Object.values(globals.THEMES).includes(theme)) {
            if (theme === globals.THEMES.SYSTEM_PREFERENCE) {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    helpers.addClass(document.body, theme);
                    helpers.addClass(document.body, 'theme-system-preference-dark');
                } else {
                    helpers.addClass(document.body, theme);
                    helpers.removeClass(document.body, 'theme-system-preference-dark');
                }
            } else {
                helpers.addClass(document.body, theme);
            }

            const colorSelector = [...document.querySelectorAll('[name=selector-theme]')];
            for (const selector of colorSelector) {
                if (selector.value === theme) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Set default page on pocket load.
     *
     * @function loadDefaultPage
     * @return {void}
     */
    loadDefaultPage() {
        let defaultPage = this.getDefaultPage();

        if (defaultPage !== globals.PAGES.LIST && !Object.values(globals.PAGES).includes(defaultPage)) {
            defaultPage = globals.PAGES.LIST;
            this.setDefaultPage(defaultPage);
        }

        pocket.changePage(defaultPage, true);

        if (defaultPage) {
            const pageSelector = [...document.querySelectorAll('[name=selector-page]')];
            for (const selector of pageSelector) {
                if (selector.value === defaultPage) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Set order button direction and init selector in settings.
     * This function does not handle real ordering of items, this is done in App.js
     *
     * @function loadOrder
     * @return {void}
     */
    loadOrder() {
        const order = this.getOrder();

        if (order) {
            this.rotateOrderButton(order === globals.ORDER.ASCENDING ? true : false);

            const orderSelector = [...document.querySelectorAll('[name=selector-order]')];
            for (const selector of orderSelector) {
                if (selector.value === order) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Add class and change text in order by button.
     *
     * @function rotateOrderButton
     * @param {Boolean} orderItemsAsc - Order asc or desc.
     * @param {Event} e - Event from button click.
     * @return {void}
     */
    rotateOrderButton(orderItemsAsc, e) {
        const orderButton = document.querySelector('#js-orderButton');
        const target = e && e.target ? e.target : orderButton;

        if (orderItemsAsc) {
            helpers.removeClass(target, 'is-rotated');
            orderButton.setAttribute('title', chrome.i18n.getMessage('SHOW_ITEMS_OLDEST_FIRST'));
        } else {
            helpers.addClass(target, 'is-rotated');
            orderButton.setAttribute('title', chrome.i18n.getMessage('SHOW_ITEMS_NEWEST_FIRST'));
        }
    }

    /**
     * Set update interval and change to right selector.
     *
     * @function loadUpdateInterval
     * @return {void}
     */
    loadUpdateInterval() {
        const updateInterval = this.getUpdateInterval();

        if (updateInterval) {
            const updateIntervalSelector = [...document.querySelectorAll('[name=selector-update-interval]')];
            for (const selector of updateIntervalSelector) {
                if (selector.value === updateInterval) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Set the value of "archive after open"
     *
     * @function setArchiveAfterOpen
     * @param {String} val - ['enabled', 'disabled']
     * @return {void}
     */
    setArchiveAfterOpen(val) {
        helpers.setToStorage('archiveAfterOpen', val);
    }

    /**
     * Get "archive after open" to load on extension load.
     *
     * @function getArchiveAfterOpen
     * @return {String | null}
     */
    getArchiveAfterOpen() {
        return helpers.getFromStorage('archiveAfterOpen');
    }

    /**
     * Load the "archive after open" option
     *
     * @function loadArchiveAfterOpen
     * @return {void}
     */
    loadArchiveAfterOpen() {
        const archiveAfterOpen = this.getArchiveAfterOpen();

        if (archiveAfterOpen) {
            const archiveAfterOpenSelector = [...document.querySelectorAll('[name=selector-archive-after-open]')];
            for (const selector of archiveAfterOpenSelector) {
                if (selector.value === archiveAfterOpen) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Set the value of view type
     *
     * @function setViewType
     * @param {String} type - View type
     * @return {void}
     */
    setViewType(type = globals.VIEW_TYPES.GRID) {
        helpers.setToStorage('viewType', type);
    }

    /**
     * Get "view type" to load on extension load.
     *
     * @function getViewType
     * @return {String | null}
     */
    getViewType() {
        return helpers.getFromStorage('viewType');
    }

    /**
     * Load the "view type" option
     *
     * @function loadViewType
     */
    loadViewType() {
        const viewType = this.getViewType();

        if (viewType) {
            if (viewType === globals.VIEW_TYPES.LIST) {
                helpers.addClass(document.querySelector('main'), 'container--narrow');
            }

            this.showRightViewTypeButton(viewType);

            const viewTypeSelector = [...document.querySelectorAll('[name=selector-view-type]')];
            for (const selector of viewTypeSelector) {
                if (selector.value === viewType) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Add class and change text in view type by button.
     *
     * @function showRightViewTypeButton
     * @param {String} viewType - View type.
     * @param {Event} e - Event from button click.
     * @return {void}
     */
    showRightViewTypeButton(viewType, e) {
        const viewTypeButton = document.querySelector('#js-viewTypeButton');
        const target = e && e.target ? e.target : viewTypeButton;

        if (viewType === globals.VIEW_TYPES.LIST) {
            helpers.addClass(target, 'is-view-type-list');
            viewTypeButton.setAttribute('title', chrome.i18n.getMessage('DISPLAY_IN_GRID'));
        } else {
            helpers.removeClass(target, 'is-view-type-list');
            viewTypeButton.setAttribute('title', chrome.i18n.getMessage('DISPLAY_IN_LIST'));
        }
    }

    /**
     * Handle selector change in settings.
     *
     * @function handleSelectorChange
     * @param {Event} e - Selector change event.
     * @return {void}
     */
    handleSelectorChange(e) {
        switch (e.detail.name) {
            case 'selector-theme':
                const value = e.detail.value.toString();

                if (Object.values(globals.THEMES).includes(value)) {
                    if (value === globals.THEMES.SYSTEM_PREFERENCE) {
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            helpers.removeClass(document.body, this.getTheme());
                            helpers.addClass(document.body, value);
                            helpers.addClass(document.body, 'theme-system-preference-dark');
                            this.setTheme(value);

                            selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                        } else {
                            helpers.removeClass(document.body, this.getTheme());
                            helpers.removeClass(document.body, 'theme-system-preference-dark');
                            this.setTheme(value);

                            selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                        }
                    } else {
                        helpers.removeClass(document.body, this.getTheme());
                        helpers.removeClass(document.body, 'theme-system-preference-dark');
                        helpers.addClass(document.body, value);
                        this.setTheme(value);

                        selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                    }
                }
                break;
            case 'selector-page':
                const page = e.detail.value.toString();

                if (Object.values(globals.PAGES).includes(page)) {
                    this.setDefaultPage(page);

                    selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                }
                break;
            case 'selector-order':
                const order = e.detail.value.toString();

                if (Object.values(globals.ORDER).includes(order)) {
                    this.setOrder(order);
                    selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                }
                break;
            case 'selector-update-interval':
                const interval = e.detail.value.toString();

                if (globals.UPDATE_INTERVALS.includes(interval)) {
                    this.setUpdateInterval(interval);
                    selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                }
                break;
            case 'selector-archive-after-open':
                const archiveAfterOpen = e.detail.value.toString();

                this.setArchiveAfterOpen(archiveAfterOpen);
                selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                break;
            case 'selector-view-type':
                const viewType = e.detail.value.toString();

                if (Object.values(globals.VIEW_TYPES).includes(viewType)) {
                    this.setViewType(viewType);
                    selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
                }
                break;
        }
    }

    /**
     * Focus new item input when opening modal.
     *
     * @function handleFocusAddInput
     * @return {void}
     */
    handleFocusAddInput() {
        document.querySelector('#js-newItemInput').focus();
    }

    /**
     * Reset new item input value when closing modal.
     *
     * @function handleResetAddInput
     * @return {void}
     */
    handleResetAddInput() {
        document.querySelector('#js-newItemInput').value = '';
    }

    /**
     * Handle submitting new item adding form.
     *
     * @function handleSubmitNewItem
     * @param {Event} e - Submit event.
     * @return {void}
     */
    handleSubmitNewItem(e) {
        const form = e.target;

        if (form.checkValidity()) {
            e.preventDefault();
            helpers.showMessage(`${chrome.i18n.getMessage('CREATING_ITEM')}...`, true, false, false);

            if (pocket.getActivePage() === globals.PAGES.LIST) {
                search.reset(true);
            }

            const rawData = new FormData(form);
            let data = {};

            for (const link of rawData.entries()) {
                data[link[0]] = link[1];
            }

            item.add(data);
        }
    }

    /**
     * If update interval difference is bigger than selected.
     *
     * @function isTimeToUpdate
     * @return {Boolean} - If is time to update.
     */
    isTimeToUpdate() {
        let isTime = false;
        const timeDifference = helpers.calcTimeDifference(
            helpers.getCurrentUNIX(),
            helpers.getFromStorage(`${this.getDefaultPage()}Since`) || 0
        );

        if (timeDifference >= this.getUpdateInterval()) {
            isTime = true;
        }

        return isTime;
    }

    /**
     * Destroy settings.
     *
     * @function destroy
     * @return {void}
     */
    destroy() {
        this.removeEvents();
    }
}

const settings = new Settings();
export default settings;
