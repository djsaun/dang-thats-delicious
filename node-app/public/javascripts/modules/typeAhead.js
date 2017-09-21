const axios = require('axios');

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    // if there is no value, quit it!
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    // show search results
    searchResults.style.display = 'block';

    // use axios to hit API endpoint
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          console.log('There is something to show');
        }
      })
  });

}

export default typeAhead;
