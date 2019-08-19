import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import { FetchDemoDataMixin } from './vaadin-fetch-demo-data-mixin.js';
import '@vaadin/vaadin-tabs/vaadin-tabs.js';
import '@vaadin/vaadin-tabs/vaadin-tab.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="vaadin-component-demo-shared-styles">
  <template>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Ubuntu, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        -webkit-text-size-adjust: 100%;
        margin: 0 1em 2em;
      }

      :host {
        line-height: 1.6;
        color: #36393d;
      }

      h3 {
        color: #2d3033;
        font-weight: 300;
        font-size: 1.66667rem;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      h4 {
        font-weight: 300;
        text-transform: uppercase;
        letter-spacing: .15em;
        font-size: 1rem;
        margin-bottom: 1rem;
        margin-top: 1.13333rem;
        line-height: 1.4;
      }

      code {
        font-family: "Source Code Pro", "Consolas", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;
        font-size: 0.875em;
      }

      a {
        text-decoration: none;
        color: #00b4f0;
        transition: all .2s ease-in-out;
      }

      a:hover,
      a:focus {
        color: #57d5ff;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
class VaadinComponentDemo extends FetchDemoDataMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        max-width: 60em;
        margin-left: auto;
        margin-right: auto;
      }

      vaadin-tab a {
        text-decoration: none;
        outline: none;
        color: inherit;
      }
    </style>

    <app-location id="appLocation" route="{{route}}" use-hash-as-path="[[devMode]]" url-space-regex="[[urlSpaceRegex]]"></app-location>
    <app-route id="appRoute" route="{{route}}" pattern="[[routePattern]]:page" data="{{routeData}}"></app-route>

    <vaadin-tabs selected="{{selectedPageIndex}}">
      <template is="dom-repeat" items="[[_demoConfig.pages]]" as="page" id="navigationRepeat">
        <vaadin-tab><a href="[[linkBase]][[page.url]]" tabindex="-1">[[page.name]]</a></vaadin-tab>
      </template>
    </vaadin-tabs>

    <div id="demo"></div>
`;
  }

  static get is() {
    return 'vaadin-component-demo';
  }

  static get properties() {
    return {
      configSrc: {
        type: String,
        observer: '_configChanged'
      },
      // Base url for navigation
      baseHref: {
        type: String,
        value: function() {
          return window.location.pathname.replace(/\/([^\/]+\.[^\/]+|)?$/, '');
        }
      },
      // Base url for resolving relative imports
      srcBaseHref: String,
      _demoConfig: Object,
      routeData: Object,
      // Navigation url scope regex
      urlSpaceRegex: String,
      devMode: {
        type: Boolean,
        computed: '_isDevMode(baseHref)'
      },
      linkBase: {
        type: String,
        computed: '_getLinkBase(devMode, baseHref)'
      },
      routePattern: {
        type: String,
        computed: '_getRoutePattern(devMode, linkBase)'
      },
      selectedPageIndex: {
        type: Number,
        observer: '_pageIndexChanged'
      }
    };
  }

  _isDevMode(baseHref) {
    // FIXME: find a better way to detect when demo is running in flow
    return /^cdn|github\.io|appspot\.com$/.test(location.hostname) || /\/components\/(@vaadin\/)?[a-z\-]+\/demo/.test(baseHref);
  }

  // Use hash fragment for navigation if we are using polyserve URL
  _getLinkBase(devMode, baseHref) {
    return !devMode ? baseHref + '/' : '#';
  }

  _getRoutePattern(devMode, linkBase) {
    return !devMode ? linkBase : '';
  }

  ready() {
    super.ready();
    if (!this.srcBaseHref) {
      this.srcBaseHref = this.baseHref;
    }
    if (!this.urlSpaceRegex) {
      this.urlSpaceRegex = this.baseHref.replace(/\//g, '\\/');
    }
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)',
    ];
  }

  _routePageChanged(page) {
    if (this._demoConfig && this._demoConfig.pages && page) {
      this._setSelectedPageIndexFromPages(this._demoConfig.pages, page);
    }
  }

  _configChanged(configSrc) {
    if (configSrc) {
      this.fetchJSON(configSrc)
        .then(json => {
          this._demoConfig = json;
          this.selectedPageIndex = undefined;
          if (json.pages && json.pages.length > 0) {
            if (this.routeData.page) {
              this._setSelectedPageIndexFromPages(json.pages, this.routeData.page);
            } else {
              // Select first page by default
              this.selectedPageIndex = 0;
            }
          }
        })
        .catch(err => {
          console.error(`ERROR: Failed to load demo data for '${configSrc}'`, err);
        });
    }
  }

  _pageIndexChanged(selectedPageIndex) {
    if (selectedPageIndex === undefined || !this._demoConfig) {
      return;
    }

    let page;
    if (selectedPageIndex) {
      page = this._demoConfig.pages[selectedPageIndex];
    } else {
      page = this._demoConfig.pages[0];
    }

    if (!page) {
      console.error(`ERROR: Could not find demo page with index: '${selectedPageIndex}.'`);
      return;
    }

    this.fetchResource(this.srcBaseHref + '/' + page.src)
      .then(() => {
        this._showDemo(page.url);
      })
      .catch(err => {
        console.error(`ERROR: Failed to load demo page for index '${selectedPageIndex}'`, err);
      });

    this.$.appLocation.set('path', (this.devMode ? '' : this.linkBase) + page.url);
  }

  _showDemo(tagName) {
    const element = document.createElement(tagName);
    this.$.demo.innerHTML = '';
    this.$.demo.appendChild(element);
  }

  _setSelectedPageIndexFromPages(pages, selectedPage) {
    let index;
    // Array#findIndex is not supported in IE11
    pages.some((configPage, i) => {
      if (configPage.url == selectedPage) {
        index = i;
        return true;
      }
    });
    this.selectedPageIndex = index || 0;
  }
}
window.customElements.define(VaadinComponentDemo.is, VaadinComponentDemo);