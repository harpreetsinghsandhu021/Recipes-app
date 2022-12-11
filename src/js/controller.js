import icons from 'url:../img/icons.svg';
import img from '../img/fork.jpg';
import { API_URl } from './config';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

////////////
const recipeContainer = document.querySelector('.one-recipe-board');
const demoText = document.querySelector('.demo-text');
const allRecipesContainer = document.querySelector('.all-recipe-board');
const results = allRecipesContainer.querySelector('.results');

const input = document.querySelector('.input');
const form = document.querySelector('.form');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

///////////////////////////////////////

const fetchApi = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    loadingSpinner(recipeContainer);

    const fetchData = await fetch(`${API_URl}/get?rId=${id}`, {
      method: 'GET',
    });
    const data = await fetchData.json();
    recipeContainer.innerHTML = '';

    if (!fetchData.ok) throw new Error(`${data.error} ${fetchData.status}`);

    let { recipe } = data;

    recipe = {
      id: recipe.recipe_id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      ingredients: recipe.ingredients.splice(2),
    };
    generateOneRecipe(recipe);
  } catch (err) {
    generateError(err, recipeContainer);
  }
};

function loadingSpinner(parentEl) {
  const spinner = `
  <div class="spinner">
  <svg>
    <use href="${icons}#icon-loader"></use>
  </svg>
</div>
  `;
  clear();
  parentEl.insertAdjacentHTML('afterbegin', spinner);
}

function generateError(err, el, color) {
  const errorMarkup = `
   <div class="error">
     <div>
         <svg>
              <use href="${icons}#icon-alert-triangle"></use>
          </svg>
     </div>
     <p style='color:${color}'>${err}</p>
   </div> 
  `;

  clear();
  el.insertAdjacentHTML('afterbegin', errorMarkup);
}

function clear() {
  recipeContainer.innerHTML = '';
}

function generateOneRecipe(recipe) {
  const recipeFull = `
  <div class='recipe'> 
  <div class='svg--icons'>
  <svg class="svg">
    <use href="${icons}#icon-bookmark"></use>
  </svg>
  </div>
  <img src=${recipe.image} alt="Tomato" class="recipe__img" />
  <h1 class="recipe__title">
    <span class='main-span'>Main course</span>
    <span  class='title-span'>${recipe.title}</span>
  </h1>
  <h1 class="publisher__title">
  <span class='main-span'>Publisher</span>
  <span  class='publisher-span'>${recipe.publisher}</span>
</h1>
  <div class="recipe__ingredients">
  <h2 class="heading--2">Recipe ingredients</h2>
  <ul class="recipe__ingredient-list">
  ${recipe.ingredients
    .map(
      ing => `
  <li class="recipe__ingredient">
  <div class="recipe__description">
    <span class="recipe__unit">${ing}</span>
  </div>
</li>
  `
    )
    .join('')}
  </ul>
</div>
<div class='source-wrapper'>
<span class='method-span'>Method</span>
<a class='source' target='_blank' href=${recipe.sourceUrl}>Directions</a>
</div>
</div>
  `;

  recipeContainer.insertAdjacentHTML('afterbegin', recipeFull);
}

['hashchange', 'load'].forEach(ev => window.addEventListener(ev, fetchApi));

function loadingSpinner2(parentEl) {
  const spinner = `
  <div class="spinner--2">
  <svg>
    <use href="${icons}#icon-loader"></use>
  </svg>
</div>
  `;

  parentEl.insertAdjacentHTML('afterbegin', spinner);
}
///
let AllRecipes = [];
async function fetchAllRecipes(query) {
  try {
    loadingSpinner2(results);
    const res = await fetch(`${API_URl}/search?q=${query}`);

    const data = await res.json();

    if (!res.ok)
      throw new Error('cannot find anything with that name,try another one');

    AllRecipes = data.recipes.map(rec => {
      return {
        id: rec.recipe_id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
      };
    });
    console.log(AllRecipes);
    generateAllRecipes(AllRecipes);
  } catch (err) {
    console.log(err);
    generateError(err, results, 'red');
  }
}

function generateAllRecipes(recipes) {
  const allRecipes = recipes.map(rec => {
    return `
  <li class="preview">
     <a class="preview__link" href="#${rec.id}">
   <figure class="preview__fig">
      <img src="${rec.image}" alt="Test" />
   </figure>
   <div class="preview__data">
     <h4 class="preview__name">
      ${rec.title}
     </h4>
    <p class="preview__author">${rec.publisher}</p>
    </div>
    </a>
  </li>
  `;
  });

  results.insertAdjacentHTML('afterbegin', allRecipes);
}

/////
let searchValue;
let currentSearch;
input.addEventListener('input', e => {
  searchValue = e.target.value;
});

form.addEventListener('submit', e => {
  e.preventDefault();

  results.innerHTML = '';
  fetchAllRecipes(searchValue);
});
