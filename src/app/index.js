var cssStr = require('./index.less')
require('../lib/reveal/reveal.js')
var htmlStr = require('./index.html')

class FreelogAlphaReveal extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    let self = this;
    let shadowRoot = self.attachShadow({mode: 'closed'});
    let node = document.createElement('div')
    node.innerHTML = `<style>${cssStr}</style>` + htmlStr
    self.root = shadowRoot
    shadowRoot.appendChild(node)
    self.$content = shadowRoot.querySelector('.js-reveal-content')
    self.$menu = shadowRoot.querySelector('.js-menu')
    self.$wrapper = shadowRoot.querySelector('.js-wrapper')
    self.loadData()
      .then(function (reveals) {
        self.reveals = reveals
        self.renderMenu()
        self.$menuItems = shadowRoot.querySelectorAll('.js-menu-item')
        self.bindEvent()
        if (self.$menuItems.length) {
          self.$menuItems[0].click()
        }

        if (!localStorage.getItem('SHOWED_FULLSCREEN_TIP')) {
          self.showFullScreenTip()
        }
      })
  }

  showFullScreenTip() {
    var $tip = this.root.querySelector('.js-mode-tip')
    $tip.classList.add('show-tip')

    setTimeout(function () {
      $tip.classList.remove('show-tip')
    }, 4e3)
    localStorage.setItem('SHOWED_FULLSCREEN_TIP', true)
  }

  renderMenu() {
    var html = '';
    var self = this;
    //资源名称为title
    self.reveals.forEach(function (reveal, index) {
      var name = reveal.detail.resourceInfo.resourceName
      html += `<li class="js-menu-item" data-index="${index}" title="${name}"><span class="serial">${index + 1}</span> ${name}</li>`
    })

    this.root.querySelector('.js-menu').innerHTML = html
  }

  loadData() {
    var self = this;
    return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${window.__auth_info__.__auth_node_id__}&resourceType=reveal_slide&tags=show`).then(function (res) {
      return res.json()
    }).then(function (data) {
      var result = []
      var presentableList = data.data || [];
      var promises = presentableList.map(function (resource) {
        return window.FreelogApp.QI.fetchPresentableResourceData(resource.presentableId)
          .then(res => {
            var isError = !res.headers.get('freelog-resource-type')
            if (isError) {
              return res.json()
            } else {
              return res.text()
            }
          })
          .then(data => {
            result.push({detail: resource, content: data})
          })
      });

      return Promise.all(promises).then(function () {
        return result
      })
    })
  }

  renderError(reveal, index) {
    var App = window.FreelogApp
    var name = reveal.detail.resourceInfo.resourceName
    var errInfo = App.getErrorInfo(reveal.content)
    var html = `<div class="error-wrap fadeIn">
<div class="error-content">
                        <div class="article-title"><h3>${name}</h3></div>
                        <div class="article-content"><span class="error-tip">${errInfo.desc}</span>
                         <button class="action-btn js-to-do" data-index="${index}">${errInfo.tip}</button></div>
                         </div>
                    </div>`

    return html
  }

  loadPresentable(presentableId) {
    return window.FreelogApp.QI.fetchPresentableResourceData(presentableId).then(function (res) {
      var isError = !res.headers.get('freelog-resource-type')
      return isError ? res.json() : res.text()
    })
  }

  errorHandler(ev) {
    var self = this;
    var target = ev.target;
    var index = target.dataset.index;
    var App = window.FreelogApp
    var data = self.reveals[index]

    App.trigger('HANDLE_INVALID_RESPONSE', {
      response: data.content,
      callback: function () {
        self.loadPresentable(data.detail.presentableId).then(function (data) {
          self.reveals[index].content = data
          self.setContent(index)
        })
      }
    });
  }

  setContent(index) {
    var self = this;
    var data = self.reveals[index]
    var content = data.content
    if (typeof content === 'string') {
      self.content = content
    } else {
      this.$content.innerHTML = self.renderError(data, index)
    }
  }

  changeContentHandler(ev) {
    var self = this;
    var index = parseInt(ev.target.dataset.index)
    self.setContent(index)
  }

  bindEvent() {
    var self = this;

    self.root.querySelector('.js-wrapper').addEventListener('click', function (ev) {
      var target = ev.target;
      var classList = target.classList
      if (classList.contains('js-menu-item')) {
        self.changeContentHandler(ev)
      } else if (classList.contains('js-to-do')) {
        self.errorHandler(ev)
      }
    }, false);

    ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'].forEach(function (name) {
      document.addEventListener(name, self.screenChangeHandler.bind(self), false);
    })
  }

  renderReveal() {
    if (typeof initReveal === 'undefined') {
      return
    }

    initReveal(this.root)

    setTimeout(function () {
      Reveal.initialize({
        width: 960,
        height: 1000,
        controls: true,
        progress: true,
        history: false,
        center: true,
      });
    })
  }

  static get observedAttributes() {
    return ['content'];
  }

  //直接赋值
  set content(value) {
    this.$content.innerHTML = value;
    this.renderReveal()
  }

  get content() {
    return this.$content.innerHTML
  }

  //setAttribute or dom init
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal
  }

  //press f enter fullscreen mode
  screenChangeHandler() {
    if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== undefined) {
      this.classList.add('fullscreen')
      this.$wrapper.classList.add('fullscreen')
    } else {
      this.classList.remove('fullscreen')
      this.$wrapper.classList.remove('fullscreen')
    }
  }
}

customElements.define('freelog-alpha-reveal', FreelogAlphaReveal);
