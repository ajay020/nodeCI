const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("the header has correct text", async () => {
  //   const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  const text = await page.getContentOf("a.brand-logo");

  expect(text).toBe("Blogster");
});

test("clicking login starts auth flow", async () => {
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when sign in, show logout button", async () => {
  await page.login();

  //   const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  const text = await page.getContentOf('a[href="/auth/logout"]');

  expect(text).toEqual("Logout");
});
