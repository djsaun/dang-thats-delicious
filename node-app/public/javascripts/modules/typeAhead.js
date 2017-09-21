import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

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
          const html = dompurify.sanitize(searchResultsHTML(res.data));
          searchResults.innerHTML = html;
          return;
        }

        // tell the user nothing came back
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found.</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  });

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up (38), down (40), or enter (13), disregard
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }

    const activeClass = 'search__result--active';

    // find current list item
    const current = search.querySelector(`.${activeClass}`);

    // get list of all of the items
    const items = search.querySelectorAll('.search__result');
    let next;


    if (e.keyCode === 40 && current) { // if press down and one selected, set next to one after it
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) { // if press down and none selected, select the first item
      next = items[0];
    } else if (e.keyCode === 38 && current) { // if press up and one selected, select the one before it or the last item
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) { // if press up and none selected, select the last item
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) { // if enter key pressed and current element with an href, take user to that page
      window.location = current.href;
      return; // stop function from running
    }

    if (current) {
      current.classList.remove(activeClass);
    }

    next.classList.add(activeClass);
  });

}

export default typeAhead;
