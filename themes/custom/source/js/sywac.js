'use strict';

window.SywacDocs = {
  scrollTarget() {
    const target = document.querySelector(':target')
    if (target) {
      document.querySelector('body').scrollTo(0, target.offsetTop - 64)
      document.querySelector('html').scrollTo(0, target.offsetTop - 64)
    }
  },
  init() {
    window.addEventListener('load', window.SywacDocs.scrollTarget);
    window.addEventListener('hashchange', window.SywacDocs.scrollTarget);
  }
}
