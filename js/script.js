const API_KEY = 'e96dfa2edef24cec93b10ee2b971107e';
const choicesElem = document.querySelector('.js-choice');
const newsList = document.querySelector('.news-list');
const formSearch = document.querySelector('.form-search');
const title = document.querySelector('.title');
// возвращает только слово
const declOfNum = (n, titles) => titles[n % 10 === 1 && n % 100 !== 11 ?
   0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];


const choices = new Choices(choicesElem, {
   searchEnabled: false,
   itemSelectText: '',
});

const getdata = async (error, url) => {
   return fetch(url, {
      headers: {
         'X-Api-Key': API_KEY,
      }
   }).then(response => {
      if (!response.ok) {
         throw error(new Error(response.status))
      }

      return response.json();
   })
      .catch(error)
};

const getDateCorrectFormat = isoDate => {
   const date = new Date(isoDate);
   const fullDate = date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
   });

   const fullTime = date.toLocaleString('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
   });

   return `<span class="news-date">${fullDate}</span> ${fullTime}`
}

const getImage = url => new Promise((resolve) => {
   const image = new Image(270, 200);

   image.addEventListener('load', () => {
      resolve(image);
   });

   image.addEventListener('error', () => {
      image.src = '../img/nophoto.jpg';
      resolve(image);
   });

   image.src = url || '../img/nophoto.jpg';
   image.className = 'news-image';
   return image;
});

const renderCard = (data) => {
   newsList.textContent = '';
   data.forEach(async ({ urlToImage, title, url, description, publishedAt, author }) => {
      const card = document.createElement('li');
      card.className = 'news-item';

      const image = await getImage(urlToImage);
      image.alt = title;
      card.append(image);

      card.innerHTML += `
      <h3 class="news-title">
         <a href="${url}" class="news-link" target="_blank">${title || ''}</a>
      </h3>
      <p class="news-description">${description || ''}</p>
      <div class="news-footer">
         <time class="news-datetime" datetime="${publishedAt}">
            ${getDateCorrectFormat(publishedAt)}
         </time>
         <div class="news-author">
            ${author || ''}
         </div>
      </div>
      `;

      newsList.append(card);
   })
};

const showError = (err) => {
   console.warn(err);
   newsList.textContent = '';
   title.textContent = `Всё сломалось, говнокод не работает:(`;
   title.classList.remove('hide');
};

const loadNews = async () => {

   newsList.innerHTML = '<li class="preload"></li>'
   const country = localStorage.getItem('country') || 'ru';
   choices.setChoiceByValue(country);
   title.classList.add('hide');

   const data = await getdata(showError, `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100`);
   renderCard(data.articles);
};

const loadSearch = async value => {
   newsList.innerHTML = '<li class="preload"></li>'
   const data = await getdata(showError, `https://newsapi.org/v2/everything?q=${value}&pageSize=100`);
   title.classList.remove('hide');
   const arrStr1 = ['найден', 'найдено', 'найдено'];
   const arrStr2 = ['результат', 'результата', 'результатов'];
   const count = data.articles.length;
   title.textContent = `По вашему запросу “${value}” ${declOfNum(count, arrStr1)} ${count} ${declOfNum(count, arrStr2)}`
   choices.setChoiceByValue('');
   renderCard(data.articles);
};

choicesElem.addEventListener('change', (event) => {
   const value = event.detail.value;
   localStorage.setItem('country', value);
   loadNews();
});

formSearch.addEventListener('submit', event => {
   event.preventDefault();
   loadSearch(formSearch.search.value);
   formSearch.reset();
});

loadNews();