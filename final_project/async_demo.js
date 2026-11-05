// Demonstrates Task 11: all 4 operations use Axios and async/await or Promises.
// First start the API with `node index.js`, then run `node async_demo.js`.
const {
  getAllBooksAsync,
  getBooksByISBNAsync,
  getBooksByAuthorAsync,
  getBooksByTitleAsync
} = require('./router/general.js');

(async () => {
  try {
    const results = await Promise.all([
      getAllBooksAsync(),
      getBooksByISBNAsync('1'),
      getBooksByAuthorAsync('Chinua Achebe'),
      getBooksByTitleAsync('Things Fall Apart')
    ]);
    for (const [index, result] of results.entries()) {
      console.log(['All books', 'ISBN 1', 'Author', 'Title'][index]);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Axios demo failed:', error.response?.data || error.message);
    process.exitCode = 1;
  }
})();
