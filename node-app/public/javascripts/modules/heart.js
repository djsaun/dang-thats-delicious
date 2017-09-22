import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault(); // make post happen with JS rather than having the browser do it

  axios
    .post(this.action) // this refers to the form tag
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted'); // heart is a subelement of the form. Name attributes can be accessed via this.
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500); // remove float animation class from heart after animation ends (2.5 seconds)
      }
    })
    .catch(console.error)
}

export default ajaxHeart;
