/**
 * Browser entry point for the project modal. The only public global is
 * `window.PortfolioModal`, exposing the controller API for deep-link or
 * integration code. Card triggers work through event delegation.
 */

import { createModalController } from './modal/index.js';

const controller = createModalController(document, window);
controller.init();

window.PortfolioModal = controller.api;
