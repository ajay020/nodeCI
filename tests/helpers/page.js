const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  constructor(page) {
    this.page = page;
  }

  // launch a chromium broswer instace
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      },
    });
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    // set cookeies to chromium instance
    await this.page.setCookie({
      name: "session",
      value: session,
    });
    await this.page.setCookie({
      name: "session.sig",
      value: sig,
    });

    // go to /blogs page
    await this.page.goto("http://localhost:3000/blogs");

    // browser wait for rendering the element, if we don't wait for it, our test fails.
    // Becasue test runner
    // won't find this element.
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  getContentOf(selector) {
    return this.$eval(selector, (el) => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }

  execActions(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
